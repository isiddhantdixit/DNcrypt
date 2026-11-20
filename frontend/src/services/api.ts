import {
  DNcryptPackage,
  SessionSummary,
  MutationResult,
  RecoveryResult,
  ValidationReport,
  BenchmarkResult,
  BenchmarkRecord
} from '../types';

const API_BASE = '/api';

export const api = {
  async health(): Promise<{ status: string; service: string; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async encodeFile(
    file: File,
    password: string,
    compression: boolean,
    strategy: string,
    rsParity: number,
    chunkSize: number = 192
  ): Promise<DNcryptPackage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('compression', String(compression));
    formData.append('strategy', strategy);
    formData.append('rs_parity', String(rsParity));
    formData.append('chunk_size', String(chunkSize));

    const res = await fetch(`${API_BASE}/encode`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Encoding failed' }));
      throw new Error(err.detail || 'Encoding failed');
    }

    return res.json();
  },

  async validateSequence(payload: { sequence?: string; package?: any }): Promise<ValidationReport> {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Validation failed' }));
      throw new Error(err.detail || 'Validation failed');
    }

    return res.json();
  },

  async mutatePackage(
    pkg: DNcryptPackage,
    substitutionRate: number,
    insertionRate: number,
    deletionRate: number,
    missingChunksCount: number,
    seed: number
  ): Promise<MutationResult> {
    const res = await fetch(`${API_BASE}/mutate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: pkg,
        substitution_rate: substitutionRate,
        insertion_rate: insertionRate,
        deletion_rate: deletionRate,
        missing_chunks_count: missingChunksCount,
        seed,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Mutation simulation failed' }));
      throw new Error(err.detail || 'Mutation simulation failed');
    }

    return res.json();
  },

  async recoverFile(pkg: DNcryptPackage, password: string): Promise<RecoveryResult> {
    const res = await fetch(`${API_BASE}/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: pkg,
        password,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Recovery failed' }));
      throw new Error(err.detail || 'Recovery failed');
    }

    return res.json();
  },

  async runBenchmark(params: {
    file_size_bytes: number;
    strategy: string;
    compression: boolean;
    rs_parity: number;
    test_error_rate: number;
  }): Promise<BenchmarkResult> {
    const res = await fetch(`${API_BASE}/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Benchmark execution failed' }));
      throw new Error(err.detail || 'Benchmark execution failed');
    }

    return res.json();
  },

  async getSessions(limit: number = 15): Promise<SessionSummary[]> {
    const res = await fetch(`${API_BASE}/sessions?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async getSession(sessionId: string): Promise<DNcryptPackage> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
    if (!res.ok) throw new Error('Session not found');
    return res.json();
  },

  async getBenchmarks(limit: number = 20): Promise<BenchmarkRecord[]> {
    const res = await fetch(`${API_BASE}/benchmarks?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch benchmarks');
    return res.json();
  },

  getFastaDownloadUrl(sessionId: string): string {
    return `${API_BASE}/export-fasta/${sessionId}`;
  },
};
