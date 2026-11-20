import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Dna,
  Shuffle,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
  Hash
} from 'lucide-react';
import { api } from '../services/api';
import { DNcryptPackage, MutationResult } from '../types';

export const MutationLabPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState<DNcryptPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mutation parameters
  const [subRate, setSubRate] = useState<number>(0.01); // 1%
  const [insRate, setInsRate] = useState<number>(0.0);
  const [delRate, setDelRate] = useState<number>(0.0);
  const [missingChunks, setMissingChunks] = useState<number>(0);
  const [seed, setSeed] = useState<number>(42);

  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const pkg = await api.getSession(id);
      setPackageData(pkg);
    } catch (err: any) {
      setError(err.message || 'Failed to load session package.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!packageData) return;

    try {
      setSimulating(true);
      setError(null);
      const res = await api.mutatePackage(
        packageData,
        subRate,
        insRate,
        delRate,
        missingChunks,
        seed
      );
      setMutationResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed.');
    } finally {
      setSimulating(false);
    }
  };

  const handleSendToRecovery = () => {
    if (!mutationResult) return;
    // Store mutated package in session storage so Recovery Centre can pick it up
    sessionStorage.setItem('dncrypt_recovery_package', JSON.stringify(mutationResult.mutated_package));
    navigate('/recovery');
  };

  const handleDownloadDamagedPackage = () => {
    if (!mutationResult) return;
    const jsonStr = JSON.stringify(mutationResult.mutated_package, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `damaged_${mutationResult.mutated_package.file_metadata.original_filename}.dncrypt.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DCE8D9]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102F28]">
              MutationLab Damage Simulator
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EAF0E9] text-[#173F35] font-semibold border border-[#BFD4BD]">
              In-Silico Error Modeling
            </span>
          </div>
          <p className="text-xs text-[#777C76] mt-1">
            Simulate environmental degradation, base substitutions, insertions, deletions, and packet dropouts under controlled PRNG seeds.
          </p>
        </div>

        {mutationResult && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadDamagedPackage}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] text-xs font-medium text-[#173F35] hover:bg-[#F5F1E7]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Damaged Package</span>
            </button>
            <button
              onClick={handleSendToRecovery}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28] shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8FAE91]" />
              <span>Send to Recovery Centre</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {!sessionId && !packageData && (
        <div className="p-12 text-center rounded-2xl bg-[#FCFBF7] border border-dashed border-[#BFD4BD] space-y-3">
          <FlaskConical className="w-10 h-10 text-[#8FAE91] mx-auto" />
          <h3 className="font-heading font-bold text-base text-[#102F28]">No Package Selected for Simulation</h3>
          <p className="text-xs text-[#777C76] max-w-md mx-auto">
            Select an existing encoding session to introduce synthetic damage or encode a new file first.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28]"
            >
              <span>Select from Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {packageData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Parameter Sliders */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#DCE8D9]">
                <FlaskConical className="w-4 h-4 text-[#173F35]" />
                <h3 className="font-heading font-bold text-sm text-[#102F28]">Damage Parameters</h3>
              </div>

              {/* Substitution Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#102F28] font-medium">Substitution Rate:</span>
                  <span className="font-mono font-bold text-[#173F35]">{(subRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.10"
                  step="0.005"
                  value={subRate}
                  onChange={(e) => setSubRate(Number(e.target.value))}
                  className="w-full accent-[#173F35]"
                />
                <p className="text-[10px] text-[#777C76]">
                  Replaces random bases with an alternative nucleotide (models polymerase synthesis errors).
                </p>
              </div>

              {/* Insertion Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#102F28] font-medium">Insertion Rate:</span>
                  <span className="font-mono font-bold text-[#173F35]">{(insRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.03"
                  step="0.002"
                  value={insRate}
                  onChange={(e) => setInsRate(Number(e.target.value))}
                  className="w-full accent-[#173F35]"
                />
                <p className="text-[10px] text-[#777C76]">
                  Inserts extra bases causing frame-shifts in baseline encoding.
                </p>
              </div>

              {/* Deletion Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#102F28] font-medium">Deletion Rate:</span>
                  <span className="font-mono font-bold text-[#173F35]">{(delRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.03"
                  step="0.002"
                  value={delRate}
                  onChange={(e) => setDelRate(Number(e.target.value))}
                  className="w-full accent-[#173F35]"
                />
                <p className="text-[10px] text-[#777C76]">
                  Deletes nucleotide bases at random positions.
                </p>
              </div>

              {/* Missing Chunks (Fragment Loss) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#102F28] font-medium">Drop Complete Chunks:</span>
                  <span className="font-mono font-bold text-[#173F35]">{missingChunks} chunks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(1, packageData.sequence_data.chunks.length - 1)}
                  step="1"
                  value={missingChunks}
                  onChange={(e) => setMissingChunks(Number(e.target.value))}
                  className="w-full accent-[#173F35]"
                />
                <p className="text-[10px] text-[#777C76]">
                  Simulates physical fragment loss or dropout during DNA amplification.
                </p>
              </div>

              {/* Random Seed for Reproducibility */}
              <div className="space-y-1.5 pt-2 border-t border-[#DCE8D9]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#102F28] font-medium">Random Seed (Reproducibility):</span>
                  <span className="font-mono font-bold text-[#173F35]">{seed}</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] font-mono text-xs text-[#202B25]"
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                    className="p-2 rounded-lg bg-[#F5F1E7] border border-[#DCE8D9] text-[#173F35] hover:bg-[#EAE3D2]"
                    title="Randomize Seed"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="w-full py-3 px-4 rounded-xl bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28] transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-98"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FCFBF7]" />
                    <span>Executing Simulation...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4 text-[#8FAE91]" />
                    <span>Run In-Silico Damage Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right 2 Columns: Mutation Telemetry & Sequence Diff */}
          <div className="lg:col-span-2 space-y-6">
            {mutationResult ? (
              <div className="space-y-6">
                {/* Stats Summary */}
                <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-4">
                  <h3 className="font-heading font-bold text-sm text-[#102F28]">Damage Simulation Report</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#F5F1E7] border border-[#DCE8D9]">
                      <span className="text-[11px] text-[#777C76]">Total Mutations</span>
                      <p className="font-heading font-bold text-lg text-[#102F28]">
                        {mutationResult.mutation_stats.total_mutations}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F1E7] border border-[#DCE8D9]">
                      <span className="text-[11px] text-[#777C76]">Substitutions</span>
                      <p className="font-heading font-bold text-lg text-[#102F28]">
                        {mutationResult.mutation_stats.substitutions}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F1E7] border border-[#DCE8D9]">
                      <span className="text-[11px] text-[#777C76]">Indels (Ins/Del)</span>
                      <p className="font-heading font-bold text-lg text-[#102F28]">
                        {mutationResult.mutation_stats.insertions + mutationResult.mutation_stats.deletions}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F1E7] border border-[#DCE8D9]">
                      <span className="text-[11px] text-[#777C76]">Effective Error Rate</span>
                      <p className="font-heading font-bold text-lg text-[#102F28]">
                        {(mutationResult.mutation_stats.effective_error_rate * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mutation Event Log */}
                <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D9]">
                    <h3 className="font-heading font-bold text-sm text-[#102F28]">
                      Mutation Events Log (First 150 Events)
                    </h3>
                    <span className="text-xs font-mono text-[#777C76]">
                      Seed: {mutationResult.simulation_params.seed}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                    {mutationResult.diff_records.length === 0 ? (
                      <p className="text-xs text-[#777C76] italic">No mutations occurred under current rates.</p>
                    ) : (
                      mutationResult.diff_records.map((diff, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-[#F5F1E7] border border-[#DCE8D9] flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                diff.type === 'substitution'
                                  ? 'bg-amber-100 text-amber-800'
                                  : diff.type === 'missing_chunk'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {diff.type}
                            </span>
                            <span>{diff.description || `Chunk ${diff.chunk_index} @ Pos ${diff.position}`}</span>
                          </div>
                          {diff.original_base && (
                            <div className="space-x-1">
                              <span className="text-[#777C76]">{diff.original_base}</span>
                              <span className="text-[#173F35]">→</span>
                              <span className="font-bold text-[#102F28]">{diff.mutated_base}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#FCFBF7] border border-dashed border-[#BFD4BD] space-y-3">
                <Dna className="w-10 h-10 text-[#8FAE91] mx-auto" />
                <h3 className="font-heading font-bold text-base text-[#102F28]">Awaiting Damage Simulation</h3>
                <p className="text-xs text-[#777C76] max-w-sm mx-auto">
                  Configure error rates and click &quot;Run In-Silico Damage Simulation&quot; to inspect mutated nucleotides.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
