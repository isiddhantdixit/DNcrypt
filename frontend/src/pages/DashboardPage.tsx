import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Binary,
  RotateCcw,
  FlaskConical,
  BarChart3,
  Dna,
  ArrowRight,
  Clock,
  HardDrive,
  FileText,
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { SessionSummary } from '../types';

export const DashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSessions(15);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenExplorer = (sessionId: string) => {
    navigate(`/explorer?session=${sessionId}`);
  };

  const handleOpenMutation = (sessionId: string) => {
    navigate(`/mutation-lab?session=${sessionId}`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Welcome & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DCE8D9]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102F28]">
              Application Workspace
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#EAF0E9] text-[#173F35] border border-[#BFD4BD]">
              SQLite Active
            </span>
          </div>
          <p className="text-xs text-[#777C76] mt-1">
            Manage live encoding sessions, inspect DNA nucleotide sequences, and launch in-silico experiments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSessions}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#F5F1E7] border border-[#DCE8D9] text-xs font-medium text-[#173F35] hover:bg-[#EAE3D2] transition-colors"
            title="Refresh session list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/encode"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28] transition-all shadow-sm"
          >
            <Binary className="w-4 h-4 text-[#8FAE91]" />
            <span>New Encoding Session</span>
          </Link>
        </div>
      </div>

      {/* 2. Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/encode"
          className="p-5 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] hover:border-[#8FAE91] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EAF0E9] flex items-center justify-center text-[#173F35] mb-3 group-hover:scale-105 transition-transform">
            <Binary className="w-5 h-5 text-[#173F35]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28] flex items-center justify-between">
            <span>Encode a File</span>
            <ArrowRight className="w-4 h-4 text-[#8FAE91] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#777C76] mt-1 leading-relaxed">
            Encrypt and translate files into A, C, G, T nucleotide sequences.
          </p>
        </Link>

        <Link
          to="/recovery"
          className="p-5 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] hover:border-[#8FAE91] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EAF0E9] flex items-center justify-center text-[#173F35] mb-3 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-5 h-5 text-[#173F35]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28] flex items-center justify-between">
            <span>Decode a Sequence</span>
            <ArrowRight className="w-4 h-4 text-[#8FAE91] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#777C76] mt-1 leading-relaxed">
            Recover damaged or clean DNA packages with Reed-Solomon correction.
          </p>
        </Link>

        <Link
          to="/mutation-lab"
          className="p-5 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] hover:border-[#8FAE91] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EAF0E9] flex items-center justify-center text-[#173F35] mb-3 group-hover:scale-105 transition-transform">
            <FlaskConical className="w-5 h-5 text-[#173F35]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28] flex items-center justify-between">
            <span>Open MutationLab</span>
            <ArrowRight className="w-4 h-4 text-[#8FAE91] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#777C76] mt-1 leading-relaxed">
            Simulate nucleotide mutations, insertions, deletions and chunk dropouts.
          </p>
        </Link>

        <Link
          to="/benchmarks"
          className="p-5 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] hover:border-[#8FAE91] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EAF0E9] flex items-center justify-center text-[#173F35] mb-3 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-5 h-5 text-[#173F35]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28] flex items-center justify-between">
            <span>View Benchmarks</span>
            <ArrowRight className="w-4 h-4 text-[#8FAE91] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#777C76] mt-1 leading-relaxed">
            Compare latency, overhead ratios, and recovery success across algorithms.
          </p>
        </Link>
      </div>

      {/* 3. Stored Sessions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dna className="w-4 h-4 text-[#173F35]" />
            <h2 className="font-heading font-bold text-lg text-[#102F28]">Recent Encoding Sessions</h2>
          </div>
          <span className="text-xs text-[#777C76]">
            {sessions.length} recorded session{sessions.length === 1 ? '' : 's'}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center rounded-xl bg-[#FCFBF7] border border-[#DCE8D9]">
            <RefreshCw className="w-6 h-6 text-[#173F35] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#777C76]">Querying local database...</p>
          </div>
        ) : sessions.length === 0 ? (
          /* Well-designed empty state */
          <div className="p-12 text-center rounded-2xl bg-[#FCFBF7] border border-dashed border-[#BFD4BD] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35] mx-auto">
              <Dna className="w-6 h-6 text-[#8FAE91]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#102F28]">No Encoding Sessions Recorded Yet</h3>
              <p className="text-xs text-[#777C76] max-w-md mx-auto">
                No files have been encoded in this workspace yet. Upload a file to generate your first DNA nucleotide sequence package.
              </p>
            </div>
            <div>
              <Link
                to="/encode"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28] transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#8FAE91]" />
                <span>Start Your First Encoding Session</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] hover:border-[#8FAE91] shadow-xs flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#777C76] px-2 py-0.5 rounded bg-[#F5F1E7]">
                      {sess.id}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#DCE8D9] text-[#173F35]">
                      {sess.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#102F28] truncate" title={sess.filename}>
                      {sess.filename}
                    </h4>
                    <p className="text-[11px] text-[#777C76]">{sess.media_type}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#DCE8D9]">
                    <div>
                      <span className="text-[#777C76]">Original Size:</span>
                      <p className="font-mono font-medium text-[#202B25]">{formatBytes(sess.original_size)}</p>
                    </div>
                    <div>
                      <span className="text-[#777C76]">Nucleotides:</span>
                      <p className="font-mono font-medium text-[#202B25]">{sess.total_nucleotides.toLocaleString()} bp</p>
                    </div>
                    <div>
                      <span className="text-[#777C76]">Strategy:</span>
                      <p className="font-mono font-medium text-[#202B25] truncate">
                        {sess.encoding_strategy === 'constrained_rotation' ? 'Constrained' : 'Baseline 2-bit'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#777C76]">GC Content:</span>
                      <p className="font-mono font-medium text-[#202B25]">{sess.gc_content}%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCE8D9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenExplorer(sess.id)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#F5F1E7] text-[#173F35] text-xs font-medium hover:bg-[#EAE3D2] transition-colors text-center"
                  >
                    View Sequence
                  </button>
                  <button
                    onClick={() => handleOpenMutation(sess.id)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#EAF0E9] text-[#102F28] text-xs font-medium hover:bg-[#BFD4BD] transition-colors text-center"
                  >
                    Mutate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
