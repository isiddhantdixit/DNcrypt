import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Dna,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { BenchmarkResult, BenchmarkRecord } from '../types';

export const BenchmarkPage: React.FC = () => {
  const [history, setHistory] = useState<BenchmarkRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Runner controls
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(4096); // 4 KB
  const [strategy, setStrategy] = useState<string>('baseline_2bit');
  const [compression, setCompression] = useState<boolean>(true);
  const [rsParity, setRsParity] = useState<number>(16);
  const [testErrorRate, setTestErrorRate] = useState<number>(0.01); // 1%

  const [latestBenchmark, setLatestBenchmark] = useState<BenchmarkResult | null>(null);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getBenchmarks(20);
      setHistory(data);
    } catch (err: any) {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRunning(true);
      setError(null);
      const res = await api.runBenchmark({
        file_size_bytes: fileSizeBytes,
        strategy,
        compression,
        rs_parity: rsParity,
        test_error_rate: testErrorRate
      });
      setLatestBenchmark(res);
      await fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Benchmark execution failed.');
    } finally {
      setRunning(false);
    }
  };

  // Prepare chart data from latest benchmark timings
  const timingChartData = latestBenchmark
    ? [
        { name: 'Compression', ms: latestBenchmark.timings_ms.compression },
        { name: 'AES-256 Encryption', ms: latestBenchmark.timings_ms.encryption },
        { name: 'DNA Encoding', ms: latestBenchmark.timings_ms.dna_encoding },
        { name: 'Clean Recovery', ms: latestBenchmark.timings_ms.clean_recovery },
        { name: 'Damaged Recovery', ms: latestBenchmark.timings_ms.damaged_recovery },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DCE8D9]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102F28]">
              Experimental Benchmark Lab
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EAF0E9] text-[#173F35] font-semibold border border-[#BFD4BD]">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-[#777C76] mt-1">
            Empirical measurements of cryptographic latency, nucleotide overhead, Reed-Solomon correction efficiency, and error thresholds.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] text-xs font-medium text-[#173F35] hover:bg-[#F5F1E7]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Benchmark Execution Form */}
      <form onSubmit={handleRunBenchmark} className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#DCE8D9]">
          <BarChart3 className="w-4 h-4 text-[#173F35]" />
          <h3 className="font-heading font-bold text-sm text-[#102F28]">Configure New Benchmark Experiment</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* File Size */}
          <div className="space-y-1">
            <label className="text-[#102F28] font-semibold">Sample File Size</label>
            <select
              value={fileSizeBytes}
              onChange={(e) => setFileSizeBytes(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] font-mono"
            >
              <option value={1024}>1 KB (1,024 B)</option>
              <option value={4096}>4 KB (4,096 B)</option>
              <option value={16384}>16 KB (16,384 B)</option>
              <option value={65536}>64 KB (65,536 B)</option>
            </select>
          </div>

          {/* Strategy */}
          <div className="space-y-1">
            <label className="text-[#102F28] font-semibold">DNA Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] font-mono"
            >
              <option value="baseline_2bit">Baseline 2-bit</option>
              <option value="constrained_rotation">Constrained Rotation</option>
            </select>
          </div>

          {/* RS Parity */}
          <div className="space-y-1">
            <label className="text-[#102F28] font-semibold">RS Parity (Bytes/Chunk)</label>
            <select
              value={rsParity}
              onChange={(e) => setRsParity(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] font-mono"
            >
              <option value={8}>8 Bytes (Corrects up to 4)</option>
              <option value={16}>16 Bytes (Corrects up to 8)</option>
              <option value={24}>24 Bytes (Corrects up to 12)</option>
              <option value={32}>32 Bytes (Corrects up to 16)</option>
            </select>
          </div>

          {/* Error Rate */}
          <div className="space-y-1">
            <label className="text-[#102F28] font-semibold">Simulated Error Rate</label>
            <select
              value={testErrorRate}
              onChange={(e) => setTestErrorRate(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] font-mono"
            >
              <option value={0.0}>0% (Clean Pipeline)</option>
              <option value={0.005}>0.5% (Low Damage)</option>
              <option value={0.01}>1.0% (Medium Damage)</option>
              <option value={0.03}>3.0% (High Stress)</option>
              <option value={0.06}>6.0% (Near/Above Limit)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={running}
              className="w-full py-2 px-4 rounded-lg bg-[#173F35] text-[#FCFBF7] font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-[#102F28] transition-all shadow-sm"
            >
              {running ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Measuring...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>Run Benchmark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Latest Benchmark Results Cards & Charts */}
      {latestBenchmark && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9]">
              <span className="text-[11px] text-[#777C76]">Sequence Overhead</span>
              <p className="font-heading font-bold text-xl text-[#102F28]">
                {latestBenchmark.sequence_metrics.overhead_ratio}x
              </p>
              <span className="text-[10px] text-[#777C76]">
                {latestBenchmark.sequence_metrics.total_nucleotides.toLocaleString()} bp total
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9]">
              <span className="text-[11px] text-[#777C76]">GC Content</span>
              <p className="font-heading font-bold text-xl text-[#102F28]">
                {latestBenchmark.sequence_metrics.gc_content_pct}%
              </p>
              <span className="text-[10px] text-[#777C76]">
                Target biological range: 45-55%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9]">
              <span className="text-[11px] text-[#777C76]">Max Homopolymer Run</span>
              <p className="font-heading font-bold text-xl text-[#102F28]">
                {latestBenchmark.sequence_metrics.max_homopolymer_run} bp
              </p>
              <span className="text-[10px] text-[#777C76]">
                {latestBenchmark.strategy === 'constrained_rotation' ? 'Strictly 1 (Zero runs)' : 'Unconstrained'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9]">
              <span className="text-[11px] text-[#777C76]">Damaged Recovery Result</span>
              <p className="font-heading font-bold text-xl flex items-center space-x-1.5 mt-1">
                {latestBenchmark.recovery_results.damaged_recovery_success ? (
                  <span className="text-[#2A6F5E] flex items-center space-x-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>SUCCESS</span>
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center space-x-1">
                    <XCircle className="w-5 h-5" />
                    <span>FAILED</span>
                  </span>
                )}
              </p>
              <span className="text-[10px] text-[#777C76]">
                Tested @ {(latestBenchmark.recovery_results.tested_error_rate * 100).toFixed(1)}% error rate
              </span>
            </div>
          </div>

          {/* Recharts Timing Bar Chart */}
          <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#102F28]">
              Pipeline Latency Breakdown (milliseconds)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE8D9" />
                  <XAxis dataKey="name" stroke="#777C76" fontSize={11} />
                  <YAxis stroke="#777C76" fontSize={11} unit=" ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FCFBF7',
                      borderColor: '#DCE8D9',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="ms" fill="#173F35" radius={[4, 4, 0, 0]} name="Latency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historical Benchmarks Table */}
      <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D9]">
          <h3 className="font-heading font-bold text-sm text-[#102F28]">Historical Experiment Runs</h3>
          <span className="text-xs text-[#777C76]">
            {history.length} logged record{history.length === 1 ? '' : 's'}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#777C76] italic">
            No benchmark runs recorded in SQLite yet. Use the control panel above to execute your first real experiment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#DCE8D9] text-[#777C76]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Encode (ms)</th>
                  <th className="py-2.5 px-3">Decode (ms)</th>
                  <th className="py-2.5 px-3">Error Rate</th>
                  <th className="py-2.5 px-3">Recovery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F1E7]">
                {history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F5F1E7]/50 transition-colors">
                    <td className="py-2.5 px-3 text-[#777C76]">
                      {new Date(rec.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#102F28]">
                      {(rec.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-2.5 px-3 text-[#202B25]">
                      {rec.strategy === 'constrained_rotation' ? 'Constrained' : 'Baseline 2-bit'}
                    </td>
                    <td className="py-2.5 px-3 text-[#173F35]">{rec.encoding_time_ms} ms</td>
                    <td className="py-2.5 px-3 text-[#173F35]">{rec.decoding_time_ms} ms</td>
                    <td className="py-2.5 px-3 font-semibold">
                      {(rec.error_rate * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      {rec.recovery_success === 1 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                          FAILED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
