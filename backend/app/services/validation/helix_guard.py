from typing import Dict, Any, List

class HelixGuardValidator:
    ALLOWED_BASES = {'A', 'C', 'G', 'T'}

    @classmethod
    def validate_sequence(cls, sequence: str) -> Dict[str, Any]:
        """
        Validates nucleotide sequence properties:
        - Alphabet check (forbidden symbols)
        - GC content percentage
        - Homopolymer run lengths and locations
        - Structural warnings
        """
        seq_upper = sequence.upper()
        total_len = len(seq_upper)
        
        if total_len == 0:
            return {
                "valid_alphabet": True,
                "total_nucleotides": 0,
                "counts": {"A": 0, "C": 0, "G": 0, "T": 0},
                "gc_content_pct": 0.0,
                "max_homopolymer_run": 0,
                "homopolymer_runs_ge_3": [],
                "invalid_characters": [],
                "warnings": ["Sequence is empty"]
            }

        counts = {"A": 0, "C": 0, "G": 0, "T": 0}
        invalid_chars = []
        
        for idx, char in enumerate(seq_upper):
            if char in cls.ALLOWED_BASES:
                counts[char] += 1
            else:
                if len(invalid_chars) < 20: # Cap reporting to avoid huge payloads
                    invalid_chars.append({"char": char, "position": idx})

        gc_count = counts["G"] + counts["C"]
        gc_pct = round((gc_count / total_len) * 100.0, 2)

        # Homopolymer runs detection
        max_run = 1
        curr_run = 1
        runs_ge_3 = []
        
        for i in range(1, total_len):
            if seq_upper[i] == seq_upper[i - 1]:
                curr_run += 1
            else:
                if curr_run >= 3:
                    runs_ge_3.append({
                        "base": seq_upper[i - 1],
                        "length": curr_run,
                        "start_pos": i - curr_run,
                        "end_pos": i - 1
                    })
                if curr_run > max_run:
                    max_run = curr_run
                curr_run = 1
                
        if curr_run >= 3:
            runs_ge_3.append({
                "base": seq_upper[-1],
                "length": curr_run,
                "start_pos": total_len - curr_run,
                "end_pos": total_len - 1
            })
        if curr_run > max_run:
            max_run = curr_run

        warnings = []
        if invalid_chars:
            warnings.append(f"Contains {len(invalid_chars)} invalid non-nucleotide character(s).")
        if gc_pct < 40.0:
            warnings.append(f"Low GC content ({gc_pct}%). Preferred biological synthesis range is 45-55%.")
        elif gc_pct > 60.0:
            warnings.append(f"High GC content ({gc_pct}%). Potential secondary structure / hairpin risk.")
        if max_run >= 4:
            warnings.append(f"Contains homopolymer run of length {max_run}. May cause polymerase slippage / sequencing errors.")

        return {
            "valid_alphabet": len(invalid_chars) == 0,
            "total_nucleotides": total_len,
            "counts": counts,
            "gc_content_pct": gc_pct,
            "max_homopolymer_run": max_run,
            "homopolymer_runs_ge_3": runs_ge_3[:50], # Sample for display
            "total_homopolymer_runs_ge_3": len(runs_ge_3),
            "invalid_characters": invalid_chars,
            "warnings": warnings
        }
