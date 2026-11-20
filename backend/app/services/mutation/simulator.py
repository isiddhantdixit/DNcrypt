import random
from typing import Dict, Any, List
import copy

class MutationSimulator:
    BASES = ['A', 'C', 'G', 'T']

    @classmethod
    def mutate_package(
        cls,
        package: Dict[str, Any],
        substitution_rate: float = 0.01,
        insertion_rate: float = 0.0,
        deletion_rate: float = 0.0,
        missing_chunks_count: int = 0,
        seed: int = 42
    ) -> Dict[str, Any]:
        """
        Simulates environmental/sequencing damage on a DNA package:
        - Substitutions: base replacement
        - Insertions: random base inserted
        - Deletions: base excised
        - Missing fragments: dropped chunk packets
        Preserves original package; returns mutated copy with diff records.
        """
        rng = random.Random(seed)
        mutated_pkg = copy.deepcopy(package)
        chunks = mutated_pkg["sequence_data"]["chunks"]
        
        diff_records = []
        total_substitutions = 0
        total_insertions = 0
        total_deletions = 0
        
        # 1. Missing fragments simulation
        dropped_indices = set()
        if missing_chunks_count > 0 and len(chunks) > 0:
            count_to_drop = min(missing_chunks_count, len(chunks))
            dropped_indices = set(rng.sample(range(len(chunks)), count_to_drop))
            for idx in dropped_indices:
                diff_records.append({
                    "type": "missing_chunk",
                    "chunk_index": idx,
                    "description": f"Chunk {chunks[idx]['chunk_id']} dropped (physical loss/dropout)"
                })

        new_chunks = []
        for idx, chunk in enumerate(chunks):
            if idx in dropped_indices:
                # Mark as corrupted/empty or omit
                continue

            orig_dna = chunk["dna_sequence"]
            mutated_chars = []
            chunk_diffs = []

            i = 0
            while i < len(orig_dna):
                orig_base = orig_dna[i]
                r_val = rng.random()

                # Check for Deletion
                if deletion_rate > 0 and r_val < deletion_rate:
                    total_deletions += 1
                    chunk_diffs.append({
                        "type": "deletion",
                        "position": i,
                        "original_base": orig_base,
                        "mutated_base": "-",
                        "chunk_index": idx
                    })
                    i += 1
                    continue

                # Check for Insertion
                if insertion_rate > 0 and (r_val - deletion_rate) < insertion_rate:
                    inserted_base = rng.choice(cls.BASES)
                    total_insertions += 1
                    mutated_chars.append(inserted_base)
                    chunk_diffs.append({
                        "type": "insertion",
                        "position": i,
                        "original_base": "-",
                        "mutated_base": inserted_base,
                        "chunk_index": idx
                    })
                    # Do not skip original base; it stays

                # Check for Substitution
                sub_threshold = deletion_rate + insertion_rate + substitution_rate
                if substitution_rate > 0 and r_val < sub_threshold:
                    other_bases = [b for b in cls.BASES if b != orig_base]
                    sub_base = rng.choice(other_bases)
                    total_substitutions += 1
                    mutated_chars.append(sub_base)
                    chunk_diffs.append({
                        "type": "substitution",
                        "position": i,
                        "original_base": orig_base,
                        "mutated_base": sub_base,
                        "chunk_index": idx
                    })
                else:
                    mutated_chars.append(orig_base)

                i += 1

            mutated_dna = "".join(mutated_chars)
            chunk["dna_sequence"] = mutated_dna
            chunk["dna_len"] = len(mutated_dna)
            new_chunks.append(chunk)
            diff_records.extend(chunk_diffs)

        mutated_pkg["sequence_data"]["chunks"] = new_chunks
        mutated_pkg["sequence_data"]["full_sequence"] = "".join(c["dna_sequence"] for c in new_chunks)
        mutated_pkg["sequence_data"]["total_nucleotides"] = len(mutated_pkg["sequence_data"]["full_sequence"])
        
        # Mutation metadata
        total_mutations = total_substitutions + total_insertions + total_deletions + len(dropped_indices)
        orig_len = package["sequence_data"]["total_nucleotides"]
        error_rate_effective = round(total_mutations / orig_len, 5) if orig_len > 0 else 0.0

        return {
            "mutated_package": mutated_pkg,
            "simulation_params": {
                "substitution_rate": substitution_rate,
                "insertion_rate": insertion_rate,
                "deletion_rate": deletion_rate,
                "missing_chunks_count": missing_chunks_count,
                "seed": seed
            },
            "mutation_stats": {
                "total_mutations": total_mutations,
                "substitutions": total_substitutions,
                "insertions": total_insertions,
                "deletions": total_deletions,
                "missing_chunks": len(dropped_indices),
                "effective_error_rate": error_rate_effective
            },
            "diff_records": diff_records[:150] # Sample top 150 diffs for UI
        }
