import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Dna,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileCode
} from 'lucide-react';
import { api } from '../services/api';
import { DNcryptPackage } from '../types';

export const ExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const [packageData, setPackageData] = useState<DNcryptPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Pagination for sequence viewer
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const basesPerPage = 600;

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
      setError(err.message || 'Failed to load session sequence.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySequence = () => {
    if (!packageData) return;
    const fullSeq = packageData.sequence_data.full_sequence;
    navigator.clipboard.writeText(fullSeq);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color mapping helper for nucleotides
  const renderColoredBase = (base: string, idx: number) => {
    let colorClass = 'text-[#2A6F5E] bg-[#EAF0E9]'; // Adenine
    if (base === 'C') colorClass = 'text-[#1F5447] bg-[#DCE8D9]'; // Cytosine
    if (base === 'G') colorClass = 'text-[#759477] bg-[#BFD4BD]/60'; // Guanine
    if (base === 'T') colorClass = 'text-[#A07855] bg-[#F5F1E7]'; // Thymine

    return (
      <span
        key={idx}
        className={`inline-block px-1 py-0.5 rounded text-xs font-mono font-bold mx-0.5 my-0.5 ${colorClass}`}
        title={`Position ${idx + 1}: ${base}`}
      >
        {base}
      </span>
    );
  };

  const selectedChunk = packageData?.sequence_data.chunks[selectedChunkIndex];
  const chunkSeq = selectedChunk ? selectedChunk.dna_sequence : packageData?.sequence_data.full_sequence || '';

  const totalPages = Math.ceil(chunkSeq.length / basesPerPage) || 1;
  const pageBases = chunkSeq.slice((currentPage - 1) * basesPerPage, currentPage * basesPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DCE8D9]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102F28]">
              DNA Sequence Explorer
            </h1>
            {packageData && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EAF0E9] text-[#173F35] font-semibold border border-[#BFD4BD]">
                {packageData.session_id}
              </span>
            )}
          </div>
          <p className="text-xs text-[#777C76] mt-1">
            High-density nucleotide visualizer with color-coded base identification, chunk boundaries, and GC content telemetry.
          </p>
        </div>

        {packageData && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySequence}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] text-xs font-medium text-[#173F35] hover:bg-[#F5F1E7]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Full Sequence' : 'Copy Sequence'}</span>
            </button>
            <a
              href={api.getFastaDownloadUrl(packageData.session_id)}
              download
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28]"
            >
              <Download className="w-3.5 h-3.5 text-[#8FAE91]" />
              <span>Export FASTA</span>
            </a>
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
          <Dna className="w-10 h-10 text-[#8FAE91] mx-auto" />
          <h3 className="font-heading font-bold text-base text-[#102F28]">No Sequence Loaded</h3>
          <p className="text-xs text-[#777C76] max-w-md mx-auto">
            Select a session from the Dashboard or encode a new file to inspect its nucleotide representation.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28]"
            >
              <span>Go to Dashboard Sessions</span>
            </Link>
          </div>
        </div>
      )}

      {packageData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Metadata & Statistics */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#102F28]">Sequence Metrics</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F5F1E7]">
                  <span className="text-[#777C76]">Total Length:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {packageData.sequence_data.total_nucleotides.toLocaleString()} bp
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F1E7]">
                  <span className="text-[#777C76]">GC Content:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {packageData.sequence_data.gc_content_pct}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F1E7]">
                  <span className="text-[#777C76]">Max Homopolymer Run:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {packageData.sequence_data.max_homopolymer_run} bp
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F1E7]">
                  <span className="text-[#777C76]">Strategy:</span>
                  <span className="font-mono font-bold text-[#102F28] uppercase text-[10px]">
                    {packageData.pipeline_parameters.encoding.strategy}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#777C76]">RS Parity per Chunk:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {packageData.pipeline_parameters.error_correction.parity_bytes_per_chunk} B
                  </span>
                </div>
              </div>
            </div>

            {/* Chunk Navigator */}
            <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-[#102F28]">Chunk Navigator</h3>
                <span className="text-[11px] text-[#777C76]">
                  {packageData.sequence_data.chunks.length} chunks
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {packageData.sequence_data.chunks.map((chk, idx) => (
                  <button
                    key={chk.chunk_id}
                    onClick={() => {
                      setSelectedChunkIndex(idx);
                      setCurrentPage(1);
                    }}
                    className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-colors ${
                      selectedChunkIndex === idx
                        ? 'bg-[#173F35] text-[#FCFBF7]'
                        : 'bg-[#F5F1E7] text-[#202B25] hover:bg-[#EAE3D2]'
                    }`}
                  >
                    <span>{chk.chunk_id}</span>
                    <span className="text-[10px] opacity-80">{chk.dna_len} bp</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nucleotide Color Legend */}
            <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-2">
              <span className="font-heading font-semibold text-xs text-[#102F28]">Color Key</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#EAF0E9] text-[#2A6F5E] font-bold flex items-center justify-center text-xs">A</span>
                  <span className="text-[11px] text-[#777C76]">Adenine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#DCE8D9] text-[#1F5447] font-bold flex items-center justify-center text-xs">C</span>
                  <span className="text-[11px] text-[#777C76]">Cytosine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#BFD4BD]/60 text-[#759477] font-bold flex items-center justify-center text-xs">G</span>
                  <span className="text-[11px] text-[#777C76]">Guanine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#F5F1E7] text-[#A07855] font-bold flex items-center justify-center text-xs">T</span>
                  <span className="text-[11px] text-[#777C76]">Thymine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 3 Columns: High-Density Sequence Canvas */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE8D9] gap-2">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#102F28]">
                    {selectedChunk ? `Chunk ${selectedChunk.chunk_id}` : 'Full Sequence'} View
                  </h3>
                  <p className="text-[11px] text-[#777C76] font-mono">
                    Showing bases {(currentPage - 1) * basesPerPage + 1} to{' '}
                    {Math.min(currentPage * basesPerPage, chunkSeq.length)} of {chunkSeq.length} bp
                  </p>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#DCE8D9] disabled:opacity-30 hover:bg-[#F5F1E7]"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#173F35]" />
                  </button>
                  <span className="font-mono text-xs text-[#102F28]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#DCE8D9] disabled:opacity-30 hover:bg-[#F5F1E7]"
                  >
                    <ChevronRight className="w-4 h-4 text-[#173F35]" />
                  </button>
                </div>
              </div>

              {/* Paginated Nucleotide Stream Display */}
              <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#BFD4BD] leading-relaxed break-all select-all font-mono text-xs">
                {pageBases.split('').map((base, idx) => {
                  const globalPos = (currentPage - 1) * basesPerPage + idx;
                  return renderColoredBase(base, globalPos);
                })}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#777C76]">
                <span>Chunk CRC32: <code className="font-mono font-bold text-[#173F35]">{selectedChunk?.crc32}</code></span>
                <span>Protected Payload: {selectedChunk?.protected_size} bytes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
