import pytest
from app.services.encoding.baseline import BaselineDNAEncoder
from app.services.encoding.constrained import ConstrainedDNAEncoder
from app.services.decoding.decoder import DNADecoder

def test_baseline_dna_roundtrip():
    data = b"Hello, DNA World! 2026 In-Silico Storage Platform."
    dna = BaselineDNAEncoder.bytes_to_dna(data)
    
    # 1 byte = 4 bases
    assert len(dna) == len(data) * 4
    assert set(dna).issubset({'A', 'C', 'G', 'T'})
    
    recovered = DNADecoder.baseline_dna_to_bytes(dna)
    assert recovered == data

def test_constrained_dna_roundtrip():
    data = b"Testing constrained rotating DNA encoder with zero homopolymers!"
    dna = ConstrainedDNAEncoder.bytes_to_dna(data)
    
    assert set(dna).issubset({'A', 'C', 'G', 'T'})
    
    # Verify no base repeats consecutively
    for i in range(1, len(dna)):
        assert dna[i] != dna[i - 1], f"Homopolymer detected at pos {i}: {dna[i-1]}{dna[i]}"
        
    recovered = ConstrainedDNAEncoder.dna_to_bytes(dna)
    assert recovered == data

def test_chunk_encoding_and_decoding():
    payload = b"Large chunk payload test " * 25 # ~625 bytes
    res = BaselineDNAEncoder.encode_payload_with_chunks(payload, chunk_size=128, rs_parity=16)
    
    assert res["total_chunks"] > 1
    chunks = res["chunks"]
    
    # Decode individual chunks
    reassembled = bytearray()
    for chk in chunks:
        dec = DNADecoder.decode_chunk_dna(chk["dna_sequence"], strategy="baseline_2bit", rs_parity=16)
        assert dec["success"] is True
        reassembled.extend(dec["payload"])
        
    assert bytes(reassembled) == payload
