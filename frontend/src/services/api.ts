import {
  DNcryptPackage,
  SessionSummary,
  MutationResult,
  RecoveryResult,
  ValidationReport,
  BenchmarkResult,
  BenchmarkRecord
} from '../types';

// Dynamic API URL resolution:
// In production on Vercel or any standard host without an external API domain set,
// use relative '/api' so requests route directly to the backend service.
const rawEnv = (
  ((import.meta as any).env?.VITE_API_BASE_URL as string) ||
  ((import.meta as any).env?.VITE_API_URL as string) ||
  ''
).trim().replace(/\/+$/, '');

const API_BASE = rawEnv
  ? (rawEnv.endsWith('/api') ? rawEnv : `${rawEnv}/api`)
  : '/api';

/**
 * Parses response errors and extracts the actual detail message returned by FastAPI
 * or the HTTP status code, preventing silent generic "Encoding failed" messages.
 */
async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    let errorDetail = '';

    try {
      const errJson = await res.json();
      if (typeof errJson.detail === 'string') {
        errorDetail = errJson.detail;
      } else if (Array.isArray(errJson.detail)) {
        // FastAPI / Pydantic validation errors
        errorDetail = errJson.detail
          .map((item: any) => {
            const loc = Array.isArray(item.loc) ? item.loc.join('.') : '';
            return loc ? `${loc}: ${item.msg}` : item.msg;
          })
          .join('; ');
      } else if (errJson.message) {
        errorDetail = errJson.message;
      } else if (errJson.error) {
        errorDetail = typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson.error);
      } else {
        errorDetail = JSON.stringify(errJson);
      }
    } catch {
      try {
        const text = await res.text();
        if (text && text.length < 300) {
          errorDetail = text;
        }
      } catch {
        // ignore text parsing failure
      }
    }

    const statusMsg = `HTTP ${res.status}${res.statusText ? ` (${res.statusText})` : ''}`;
    const fullMessage = errorDetail
      ? `${statusMsg}: ${errorDetail}`
      : `${statusMsg}: ${fallbackError}`;

    throw new Error(fullMessage);
  }

  return res.json();
}

export const api = {
  async health(): Promise<{ status: string; service: string; version: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await handleResponse(res, 'Backend health check failed');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(
          `Cannot reach backend health endpoint at ${API_BASE}/health. Please verify backend service deployment.`
        );
      }
      throw err;
    }
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
      return await handleResponse<DNcryptPackage>(res, 'Encoding pipeline execution failed');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(
          `Cannot reach backend API at ${API_BASE}/encode. Check network connection or Vercel service routing.`
        );
      }
      throw err;
    }
  },

  async validateSequence(payload: { sequence?: string; package?: any }): Promise<ValidationReport> {
    try {
      const res = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<ValidationReport>(res, 'Validation failed');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/validate.`);
      }
      throw err;
    }
  },

  async mutatePackage(
    pkg: DNcryptPackage,
    substitutionRate: number,
    insertionRate: number,
    deletionRate: number,
    missingChunksCount: number,
    seed: number
  ): Promise<MutationResult> {
    try {
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
      return await handleResponse<MutationResult>(res, 'Mutation simulation failed');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/mutate.`);
      }
      throw err;
    }
  },

  async recoverFile(pkg: DNcryptPackage, password: string): Promise<RecoveryResult> {
    try {
      const res = await fetch(`${API_BASE}/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: pkg,
          password,
        }),
      });
      return await handleResponse<RecoveryResult>(res, 'Recovery failed');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/recover.`);
      }
      throw err;
    }
  },

  async runBenchmark(params: {
    file_size_bytes: number;
    strategy: string;
    compression: boolean;
    rs_parity: number;
    test_error_rate: number;
  }): Promise<BenchmarkResult> {
    try {
      const res = await fetch(`${API_BASE}/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await handleResponse<BenchmarkResult>(res, 'Benchmark execution failed');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/benchmark.`);
      }
      throw err;
    }
  },

  async getSessions(limit: number = 15): Promise<SessionSummary[]> {
    try {
      const res = await fetch(`${API_BASE}/sessions?limit=${limit}`);
      return await handleResponse<SessionSummary[]>(res, 'Failed to fetch sessions');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/sessions.`);
      }
      throw err;
    }
  },

  async getSession(sessionId: string): Promise<DNcryptPackage> {
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
      return await handleResponse<DNcryptPackage>(res, 'Session not found');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/sessions/${sessionId}.`);
      }
      throw err;
    }
  },

  async getBenchmarks(limit: number = 20): Promise<BenchmarkRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/benchmarks?limit=${limit}`);
      return await handleResponse<BenchmarkRecord[]>(res, 'Failed to fetch benchmarks');
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(`Cannot reach backend API at ${API_BASE}/benchmarks.`);
      }
      throw err;
    }
  },

  getFastaDownloadUrl(sessionId: string): string {
    return `${API_BASE}/export-fasta/${sessionId}`;
  },
};
