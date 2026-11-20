export interface FileMetadata {
  original_filename: string;
  media_type: string;
  original_size: number;
  original_sha256: string;
}

export interface EncryptionParams {
  algorithm: string;
  salt: string;
  nonce: string;
  kdf: {
    kdf: string;
    [key: string]: any;
  };
}

export interface EncodingParams {
  strategy: string;
  chunk_size: number;
}

export interface ErrorCorrectionParams {
  scheme: string;
  parity_bytes_per_chunk: number;
  total_chunks: number;
}

export interface PipelineParameters {
  compression: string;
  compressed_size?: number;
  encryption: EncryptionParams;
  encoding: EncodingParams;
  error_correction: ErrorCorrectionParams;
}

export interface ChunkItem {
  index: number;
  chunk_id: string;
  raw_size: number;
  protected_size: number;
  dna_len: number;
  dna_sequence: string;
  crc32: string;
}

export interface SequenceData {
  total_nucleotides: number;
  gc_content_pct?: number;
  max_homopolymer_run?: number;
  chunks: ChunkItem[];
  full_sequence: string;
}

export interface ValidationReport {
  valid_alphabet: boolean;
  total_nucleotides: number;
  counts: { A: number; C: number; G: number; T: number };
  gc_content_pct: number;
  max_homopolymer_run: number;
  homopolymer_runs_ge_3: Array<{
    base: string;
    length: number;
    start_pos: number;
    end_pos: number;
  }>;
  total_homopolymer_runs_ge_3: number;
  invalid_characters: Array<{ char: string; position: number }>;
  warnings: string[];
}

export interface DNcryptPackage {
  format_version: string;
  session_id: string;
  created_at: string;
  file_metadata: FileMetadata;
  pipeline_parameters: PipelineParameters;
  sequence_data: SequenceData;
  validation_report?: ValidationReport;
}

export interface SessionSummary {
  id: string;
  filename: string;
  media_type: string;
  original_size: number;
  original_sha256: string;
  compression: string;
  encoding_strategy: string;
  rs_parity: number;
  total_nucleotides: number;
  gc_content: number;
  status: string;
  created_at: string;
}

export interface MutationResult {
  mutated_package: DNcryptPackage;
  simulation_params: {
    substitution_rate: number;
    insertion_rate: number;
    deletion_rate: number;
    missing_chunks_count: number;
    seed: number;
  };
  mutation_stats: {
    total_mutations: number;
    substitutions: number;
    insertions: number;
    deletions: number;
    missing_chunks: number;
    effective_error_rate: number;
  };
  diff_records: Array<{
    type: string;
    position?: number;
    original_base?: string;
    mutated_base?: string;
    chunk_index?: number;
    description?: string;
  }>;
}

export interface RecoveryResult {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  recovery_stage: string;
  message: string;
  filename?: string;
  media_type?: string;
  recovered_size?: number;
  corrected_chunks_count: number;
  total_corrected_bytes: number;
  missing_chunks_count: number;
  authentication_verified: boolean;
  integrity_verified: boolean;
  sha256?: string;
  expected_sha256?: string;
  actual_sha256?: string;
  recovered_file_base64?: string | null;
}

export interface BenchmarkResult {
  benchmark_id: string;
  filename: string;
  file_size: number;
  strategy: string;
  compression_enabled: boolean;
  compression_ratio: number;
  timings_ms: {
    compression: number;
    encryption: number;
    dna_encoding: number;
    clean_recovery: number;
    damaged_recovery: number;
  };
  sequence_metrics: {
    total_nucleotides: number;
    overhead_ratio: number;
    gc_content_pct: number;
    max_homopolymer_run: number;
  };
  recovery_results: {
    clean_recovery_success: boolean;
    damaged_recovery_success: boolean;
    tested_error_rate: number;
  };
}

export interface BenchmarkRecord {
  id: string;
  session_id: string;
  filename: string;
  file_size: number;
  strategy: string;
  compression_ratio: number;
  encoding_time_ms: number;
  decoding_time_ms: number;
  encryption_time_ms: number;
  decryption_time_ms: number;
  error_rate: number;
  recovery_success: number;
  created_at: string;
}
