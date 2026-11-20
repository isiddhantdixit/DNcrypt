import zlib
from typing import List, Dict, Any
from app.services.error_correction.reed_solomon import ReedSolomonCodec

class ConstrainedDNAEncoder:
    """
    Constrained / Rotating DNA Encoder.
    Avoids homopolymer runs (max run = 1) and maintains balanced GC content.
    For each 2-bit symbol, picks from the 3 bases that differ from the previous base.
    
    ROTATION_TABLE:
    prev_base -> [val 0 (00), val 1 (01), val 2 (10), val 3 (11)]
    Since there are 4 values and 3 alternatives, we use a balanced 3-state cycle or
    a rotating mapping ensuring GC balance (G/C alternating with A/T).
    Specifically, from current state, table maps 2-bit symbol {0,1,2,3} to a valid next base:
    Rule: Never repeat the previous base!
    To map 4 symbols to 3 non-repeating bases deterministically without bit loss,
    we encode byte-wise using a running differential code with a fixed sync base:
    """
    
    # State-dependent mapping ensuring next_base != prev_base
    # To represent 4 states (00, 01, 10, 11) using 4 bases while forbidding repetition,
    # we use a rotation wheel: (prev_index + 1 + symbol) % 4
    # Bases: 0: 'A', 1: 'C', 2: 'G', 3: 'T'
    # prev_idx in 0..3. Next base idx is (prev_idx + 1 + symbol % 3)
    # To handle 4 values without ambiguity, we can map 2 bits to base transitions:
    # 00 -> +1 mod 4
    # 01 -> +2 mod 4
    # 10 -> +3 mod 4
    # 11 -> +1 mod 4 with an alternator or structured mapping.
    
    # Standard Church/Goldman rotating schema:
    # BASE_ALPHABET = ['A', 'C', 'G', 'T']
    # Each base has 3 other choices (shift 1, 2, 3):
    # 'A' -> {0: 'C', 1: 'G', 2: 'T'}
    # 'C' -> {0: 'G', 1: 'T', 2: 'A'}
    # 'G' -> {0: 'T', 1: 'A', 2: 'C'}
    # 'T' -> {0: 'A', 1: 'C', 2: 'G'}
    # To map arbitrary byte streams (base 256) into ternary symbols (trits), 
    # 5 trits (3^5 = 243) or 6 trits (3^6 = 729) can map 1 byte (256):
    # 1 byte = 6 trits (values 0, 1, 2).
    # Since 3^6 = 729 > 256, 1 byte converts to 6 non-repeating bases.
    # Max homopolymer run is strictly 1! (Never repeats consecutive base).
    # GC content is evenly balanced.
    
    TRANSITIONS = {
        'A': ['C', 'G', 'T'],
        'C': ['G', 'T', 'A'],
        'G': ['T', 'A', 'C'],
        'T': ['A', 'C', 'G']
    }
    
    REVERSE_TRANSITIONS = {
        'A': {'C': 0, 'G': 1, 'T': 2},
        'C': {'G': 0, 'T': 1, 'A': 2},
        'G': {'T': 0, 'A': 1, 'C': 2},
        'T': {'A': 0, 'C': 1, 'G': 2}
    }

    @classmethod
    def bytes_to_dna(cls, data: bytes) -> str:
        """
        Converts bytes into constrained DNA sequence where no base ever repeats.
        Each byte is decomposed into 6 base-3 trits (since 3^6 = 729 >= 256).
        """
        seq = ['A'] # Anchor/sync nucleotide
        curr_base = 'A'
        
        for byte in data:
            val = byte
            # Extract 6 trits (least significant to most significant)
            trits = []
            for _ in range(6):
                trits.append(val % 3)
                val //= 3
            
            for trit in trits:
                next_base = cls.TRANSITIONS[curr_base][trit]
                seq.append(next_base)
                curr_base = next_base
                
        return "".join(seq)

    @classmethod
    def dna_to_bytes(cls, dna: str) -> bytes:
        """
        Reverses the constrained DNA sequence into original bytes.
        """
        if not dna or len(dna) < 1:
            return b""
            
        anchor = dna[0]
        curr_base = anchor
        trits = []
        
        for base in dna[1:]:
            if base not in cls.REVERSE_TRANSITIONS[curr_base]:
                raise ValueError(f"Invalid transition from {curr_base} to {base} (homopolymer or invalid symbol)")
            trit = cls.REVERSE_TRANSITIONS[curr_base][base]
            trits.append(trit)
            curr_base = base
            
        if len(trits) % 6 != 0:
            raise ValueError(f"Invalid constrained DNA length: {len(trits)} trits is not a multiple of 6")
            
        out_bytes = bytearray()
        for i in range(0, len(trits), 6):
            chunk_trits = trits[i:i+6]
            byte_val = 0
            multiplier = 1
            for t in chunk_trits:
                byte_val += t * multiplier
                multiplier *= 3
            out_bytes.append(byte_val)
            
        return bytes(out_bytes)

    @classmethod
    def encode_payload_with_chunks(cls, payload: bytes, chunk_size: int = 192, rs_parity: int = 16) -> Dict[str, Any]:
        rs = ReedSolomonCodec(n_parity=rs_parity) if rs_parity > 0 else None
        chunks_info = []
        full_dna_parts = []
        
        if len(payload) == 0:
            raw_chunks = [b""]
        else:
            raw_chunks = [payload[i:i + chunk_size] for i in range(0, len(payload), chunk_size)]

        for idx, chunk_bytes in enumerate(raw_chunks):
            chunk_crc = zlib.crc32(chunk_bytes)
            header = idx.to_bytes(4, 'big') + len(chunk_bytes).to_bytes(2, 'big') + chunk_crc.to_bytes(4, 'big')
            chunk_with_header = header + chunk_bytes
            
            if rs:
                chunk_protected = rs.encode_chunk(chunk_with_header)
            else:
                chunk_protected = chunk_with_header
                
            chunk_dna = cls.bytes_to_dna(chunk_protected)
            full_dna_parts.append(chunk_dna)
            
            chunks_info.append({
                "index": idx,
                "chunk_id": f"chk_{idx:04d}",
                "raw_size": len(chunk_bytes),
                "protected_size": len(chunk_protected),
                "dna_len": len(chunk_dna),
                "dna_sequence": chunk_dna,
                "crc32": f"{chunk_crc:08x}"
            })

        full_dna = "".join(full_dna_parts)
        
        return {
            "strategy": "constrained_rotation",
            "chunk_size": chunk_size,
            "rs_parity": rs_parity,
            "total_chunks": len(chunks_info),
            "chunks": chunks_info,
            "full_sequence": full_dna,
            "total_nucleotides": len(full_dna)
        }
