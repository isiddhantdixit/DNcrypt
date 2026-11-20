import {
  DNcryptPackage,
  SessionSummary,
  MutationResult,
  RecoveryResult,
  ValidationReport,
  BenchmarkResult,
  BenchmarkRecord
} from '../types';

const envBase = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/+$/, '');
const API_BASE = envBase ? `${envBase}/api` : '/api';

async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'Backend API endpoint not found (HTTP 404). If hosting on Vercel, please connect your deployed backend URL via VITE_API_BASE_URL or ensure the backend server is running.'
      );
    }
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}: ${res.statusText || fallbackError}` }));
    throw new Error(err.detail || fallbackError);
  }
  return res.json();
}

export const api = {
  async health(): Promise<{ status: string; service: string; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res, 'Backend health check failed');
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

    try {
      const res = await fetch(`${API_BASE}/encode`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<DNcryptPackage>(res, 'Encoding failed');
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error(
          'Cannot reach backend server. If hosted on Vercel, ensure VITE_API_BASE_URL points to your running backend (e.g. on Render).'
        );
      }
      throw err;
    }
  },

  async validateSequence(payload: { sequence?: string; package?: any }): Promise<ValidationReport> {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ValidationReport>(res, 'Validation failed');
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
    return handleResponse<MutationResult>(res, 'Mutation simulation failed');
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
    return handleResponse<RecoveryResult>(res, 'Recovery failed');
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
    return handleResponse<BenchmarkResult>(res, 'Benchmark execution failed');
  },

  async getSessions(limit: number = 15): Promise<SessionSummary[]> {
    const res = await fetch(`${API_BASE}/sessions?limit=${limit}`);
    return handleResponse<SessionSummary[]>(res, 'Failed to fetch sessions');
  },

  async getSession(sessionId: string): Promise<DNcryptPackage> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
    return handleResponse<DNcryptPackage>(res, 'Session not found');
  },

  async getBenchmarks(limit: number = 20): Promise<BenchmarkRecord[]> {
    const res = await fetch(`${API_BASE}/benchmarks?limit=${limit}`);
    return handleResponse<BenchmarkRecord[]>(res, 'Failed to fetch benchmarks');
  },

  getFastaDownloadUrl(sessionId: string): string {
    return `${API_BASE}/export-fasta/${sessionId}`;
  },
};
