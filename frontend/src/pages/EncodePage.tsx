import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Binary,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Dna,
  ArrowRight,
  Layers,
  Settings2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DNcryptPackage } from '../types';

export const EncodePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [compression, setCompression] = useState<boolean>(true);
  const [strategy, setStrategy] = useState<string>('baseline_2bit');
  const [rsParity, setRsParity] = useState<number>(16);
  const [chunkSize, setChunkSize] = useState<number>(192);

  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [encodedPackage, setEncodedPackage] = useState<DNcryptPackage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleStartEncoding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to encode.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please provide a password of at least 6 characters for AES-256-GCM encryption.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentStep(1); // Intake & compression
      await new Promise(r => setTimeout(r, 200));

      setCurrentStep(2); // Encryption
      await new Promise(r => setTimeout(r, 200));

      setCurrentStep(3); // RS protection & DNA mapping
      const result = await api.encodeFile(file, password, compression, strategy, rsParity, chunkSize);

      setCurrentStep(4); // Package complete
      setEncodedPackage(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during encoding.');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPackage = () => {
    if (!encodedPackage) return;
    const jsonStr = JSON.stringify(encodedPackage, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${encodedPackage.file_metadata.original_filename}.dncrypt.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFasta = () => {
    if (!encodedPackage) return;
    const fastaUrl = api.getFastaDownloadUrl(encodedPackage.session_id);
    const a = document.createElement('a');
    a.href = fastaUrl;
    a.download = `${encodedPackage.file_metadata.original_filename}.fasta`;
    a.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102F28]">
          Encode Digital File to DNA
        </h1>
        <p className="text-xs text-[#777C76] mt-1">
          Execute the multi-stage pipeline: compression, AES-256-GCM encryption, Reed-Solomon parity encoding, and nucleotide mapping.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Settings & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleStartEncoding} className="space-y-6">
            {/* File Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl cursor-pointer text-center transition-all ${
                file
                  ? 'border-[#8FAE91] bg-[#EAF0E9]/40'
                  : 'border-[#BFD4BD] hover:border-[#173F35] bg-[#FCFBF7]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-12 h-12 rounded-xl bg-[#F5F1E7] border border-[#DCE8D9] flex items-center justify-center text-[#173F35] mx-auto mb-3">
                {file ? <FileText className="w-6 h-6 text-[#173F35]" /> : <Upload className="w-6 h-6 text-[#777C76]" />}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="font-heading font-bold text-sm text-[#102F28]">{file.name}</p>
                  <p className="font-mono text-xs text-[#777C76]">
                    {formatBytes(file.size)} • {file.type || 'Binary Stream'}
                  </p>
                  <span className="inline-block mt-2 text-[11px] text-[#2A6F5E] underline">
                    Click or drag another file to replace
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-heading font-semibold text-sm text-[#102F28]">
                    Click to select or drag and drop a file
                  </p>
                  <p className="text-xs text-[#777C76]">
                    Supports all digital formats: TXT, PDF, PNG, JPG, CSV, DOCX, ZIP (Up to 50MB)
                  </p>
                </div>
              )}
            </div>

            {/* Pipeline Configuration Card */}
            <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#DCE8D9]">
                <Settings2 className="w-4 h-4 text-[#173F35]" />
                <h3 className="font-heading font-bold text-sm text-[#102F28]">Encoding & Security Parameters</h3>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#102F28]">
                  Encryption Password (AES-256-GCM)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[#777C76]" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong encryption password..."
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] focus:outline-none focus:border-[#173F35] text-xs font-mono text-[#202B25]"
                  />
                </div>
                <p className="text-[11px] text-[#777C76]">
                  A fresh 16-byte random salt and 12-byte nonce will be generated. The password is never stored or logged.
                </p>
              </div>

              {/* Strategy Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#102F28]">
                  DNA Sequence Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      strategy === 'baseline_2bit'
                        ? 'border-[#173F35] bg-[#EAF0E9]/50'
                        : 'border-[#DCE8D9] hover:bg-[#F5F1E7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-[#102F28]">Baseline 2-bit</span>
                      <input
                        type="radio"
                        name="strategy"
                        checked={strategy === 'baseline_2bit'}
                        onChange={() => setStrategy('baseline_2bit')}
                        className="text-[#173F35] focus:ring-[#173F35]"
                      />
                    </div>
                    <p className="text-[11px] text-[#777C76] mt-1">
                      Direct mapping (00:A, 01:C, 10:G, 11:T). 4 nucleotides per byte.
                    </p>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      strategy === 'constrained_rotation'
                        ? 'border-[#173F35] bg-[#EAF0E9]/50'
                        : 'border-[#DCE8D9] hover:bg-[#F5F1E7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-[#102F28]">Constrained Rotation</span>
                      <input
                        type="radio"
                        name="strategy"
                        checked={strategy === 'constrained_rotation'}
                        onChange={() => setStrategy('constrained_rotation')}
                        className="text-[#173F35] focus:ring-[#173F35]"
                      />
                    </div>
                    <p className="text-[11px] text-[#777C76] mt-1">
                      Eliminates homopolymers (max run=1) and balances GC ratio via differential wheel.
                    </p>
                  </label>
                </div>
              </div>

              {/* Advanced Parameters: Compression & Parity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="compToggle"
                    checked={compression}
                    onChange={(e) => setCompression(e.target.checked)}
                    className="w-4 h-4 rounded text-[#173F35] focus:ring-[#173F35]"
                  />
                  <label htmlFor="compToggle" className="text-xs text-[#202B25] select-none cursor-pointer">
                    Enable zlib pre-compression
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777C76]">RS Parity per Chunk:</span>
                    <span className="font-mono font-bold text-[#173F35]">{rsParity} bytes</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="2"
                    value={rsParity}
                    onChange={(e) => setRsParity(Number(e.target.value))}
                    className="w-full accent-[#173F35]"
                  />
                  <span className="text-[10px] text-[#777C76]">
                    Can correct up to {rsParity / 2} corrupted bytes per chunk.
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
                loading || !file
                  ? 'bg-[#DCE8D9] text-[#777C76] cursor-not-allowed'
                  : 'bg-[#173F35] text-[#FCFBF7] hover:bg-[#102F28] shadow-md active:scale-98'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FCFBF7]" />
                  <span>Processing Encoding Pipeline...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#8FAE91]" />
                  <span>Execute Encoding Pipeline</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Pipeline Status Tracker */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#102F28]">Pipeline Execution Stages</h3>
            
            <div className="space-y-3">
              {[
                { idx: 1, name: 'File Intake & Digest', desc: 'SHA-256 hash & pre-compression' },
                { idx: 2, name: 'AES-256-GCM Encryption', desc: 'Argon2id KDF + 16B salt + 12B nonce' },
                { idx: 3, name: 'Reed-Solomon & DNA Codec', desc: 'Parity symbols & nucleotide translation' },
                { idx: 4, name: 'HelixGuard Validation', desc: 'GC% and homopolymer analysis' },
              ].map((step) => {
                const isDone = currentStep > step.idx || (currentStep === 4 && encodedPackage);
                const isCurrent = currentStep === step.idx;
                return (
                  <div key={step.idx} className="flex items-start space-x-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        isDone
                          ? 'bg-[#173F35] text-[#FCFBF7]'
                          : isCurrent
                          ? 'bg-[#8FAE91] text-[#102F28] animate-pulse'
                          : 'bg-[#F5F1E7] text-[#777C76]'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.idx}
                    </div>
                    <div>
                      <p className={`font-semibold ${isDone || isCurrent ? 'text-[#102F28]' : 'text-[#777C76]'}`}>
                        {step.name}
                      </p>
                      <p className="text-[11px] text-[#777C76]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Package Card */}
          {encodedPackage && (
            <div className="p-6 rounded-2xl bg-[#EAF0E9] border border-[#BFD4BD] space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-[#173F35]">
                <CheckCircle2 className="w-5 h-5 text-[#2A6F5E]" />
                <h3 className="font-heading font-bold text-sm">Encoding Completed Successfully</h3>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#777C76]">Total Nucleotides:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {encodedPackage.sequence_data.total_nucleotides.toLocaleString()} bp
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777C76]">GC Content:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {encodedPackage.sequence_data.gc_content_pct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777C76]">Max Homopolymer Run:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {encodedPackage.sequence_data.max_homopolymer_run} bp
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777C76]">Chunks Created:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {encodedPackage.sequence_data.chunks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#BFD4BD]">
                <button
                  onClick={handleDownloadPackage}
                  className="w-full py-2 px-3 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-[#102F28] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Package (.json)</span>
                </button>

                <button
                  onClick={handleDownloadFasta}
                  className="w-full py-2 px-3 rounded-lg bg-[#FCFBF7] text-[#173F35] border border-[#BFD4BD] text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-[#F5F1E7] transition-colors"
                >
                  <Dna className="w-4 h-4 text-[#2A6F5E]" />
                  <span>Export FASTA (.fasta)</span>
                </button>

                <button
                  onClick={() => navigate(`/explorer?session=${encodedPackage.session_id}`)}
                  className="w-full py-2 px-3 rounded-lg bg-[#DCE8D9] text-[#173F35] text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-[#BFD4BD] transition-colors"
                >
                  <span>Open in Sequence Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
