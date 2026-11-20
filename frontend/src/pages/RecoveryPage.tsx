import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Download,
  FileText,
  Upload,
  RefreshCw,
  Hash,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { DNcryptPackage, RecoveryResult } from '../types';

export const RecoveryPage: React.FC = () => {
  const [packageData, setPackageData] = useState<DNcryptPackage | null>(null);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if MutationLab sent a damaged package via session storage
    const stored = sessionStorage.getItem('dncrypt_recovery_package');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPackageData(parsed);
        sessionStorage.removeItem('dncrypt_recovery_package');
      } catch {
        // ignore
      }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!parsed.sequence_data || !parsed.pipeline_parameters) {
            throw new Error('Invalid DNcrypt package structure.');
          }
          setPackageData(parsed);
          setError(null);
          setRecoveryResult(null);
        } catch (err: any) {
          setError('Failed to parse DNcrypt JSON package: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRunRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageData) {
      setError('Please load a DNcrypt package first.');
      return;
    }
    if (!password) {
      setError('Password is required to decrypt the authenticated AES-256-GCM payload.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.recoverFile(packageData, password);
      setRecoveryResult(res);
    } catch (err: any) {
      setError(err.message || 'Recovery pipeline failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRecoveredFile = () => {
    if (!recoveryResult || !recoveryResult.recovered_file_base64) return;
    const byteCharacters = atob(recoveryResult.recovered_file_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: recoveryResult.media_type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = recoveryResult.filename || 'recovered_file';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102F28]">
          Recovery & Integrity Centre
        </h1>
        <p className="text-xs text-[#777C76] mt-1">
          Reverse DNA translation, execute Reed-Solomon GF(256) error correction, authenticate AES-GCM ciphertext, and verify SHA-256 integrity.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Package Input & Recovery Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Selector / Uploader */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center transition-all ${
              packageData
                ? 'border-[#8FAE91] bg-[#EAF0E9]/40'
                : 'border-[#BFD4BD] hover:border-[#173F35] bg-[#FCFBF7]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-10 h-10 rounded-xl bg-[#F5F1E7] border border-[#DCE8D9] flex items-center justify-center text-[#173F35] mx-auto mb-2">
              <Upload className="w-5 h-5 text-[#173F35]" />
            </div>

            {packageData ? (
              <div className="space-y-1">
                <p className="font-heading font-bold text-sm text-[#102F28]">
                  Package Loaded: {packageData.file_metadata.original_filename}
                </p>
                <p className="font-mono text-xs text-[#777C76]">
                  Session: {packageData.session_id} • {packageData.sequence_data.total_nucleotides.toLocaleString()} bp •{' '}
                  {packageData.sequence_data.chunks.length} Chunks
                </p>
                <span className="inline-block mt-1 text-[11px] text-[#2A6F5E] underline">
                  Click to load another .dncrypt.json package
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-heading font-semibold text-sm text-[#102F28]">
                  Upload a DNcrypt Sequence Package (.json)
                </p>
                <p className="text-xs text-[#777C76]">
                  Or send a package directly from MutationLab after applying simulated sequence damage.
                </p>
              </div>
            )}
          </div>

          {/* Decryption Password & Submit */}
          {packageData && (
            <form onSubmit={handleRunRecovery} className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#DCE8D9]">
                <Lock className="w-4 h-4 text-[#173F35]" />
                <h3 className="font-heading font-bold text-sm text-[#102F28]">Decryption & Verification</h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#102F28]">
                  Encryption Password (AES-256-GCM)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password used during encoding..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#FCFBF7] border border-[#BFD4BD] focus:outline-none focus:border-[#173F35] text-xs font-mono text-[#202B25]"
                />
                <p className="text-[11px] text-[#777C76]">
                  The recovery pipeline will attempt Reed-Solomon correction first, then authenticate and decrypt the payload.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#173F35] text-[#FCFBF7] font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-[#102F28] transition-all shadow-md active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FCFBF7]" />
                    <span>Executing Error Correction & Decryption...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 text-[#8FAE91]" />
                    <span>Execute Recovery Pipeline</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right 1 Col: Diagnostics & Verification Results */}
        <div className="space-y-6">
          {recoveryResult ? (
            <div
              className={`p-6 rounded-2xl border space-y-5 ${
                recoveryResult.status === 'SUCCESS'
                  ? 'bg-[#EAF0E9] border-[#BFD4BD]'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {recoveryResult.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#2A6F5E]" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600" />
                )}
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#102F28]">
                    {recoveryResult.status === 'SUCCESS' ? 'Recovery Successful' : 'Recovery Incomplete / Failed'}
                  </h3>
                  <p className="text-[11px] text-[#777C76] capitalize">Stage: {recoveryResult.recovery_stage}</p>
                </div>
              </div>

              <p className="text-xs text-[#202B25] leading-relaxed">
                {recoveryResult.message}
              </p>

              {/* Recovery Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#BFD4BD]/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777C76]">Corrected Chunks:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {recoveryResult.corrected_chunks_count} chunk(s) ({recoveryResult.total_corrected_bytes} bytes repaired)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777C76]">Missing / Lost Chunks:</span>
                  <span className="font-mono font-bold text-[#102F28]">
                    {recoveryResult.missing_chunks_count}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777C76]">Cryptographic Authenticity:</span>
                  <span
                    className={`font-semibold ${
                      recoveryResult.authentication_verified ? 'text-[#2A6F5E]' : 'text-rose-600'
                    }`}
                  >
                    {recoveryResult.authentication_verified ? 'Verified (AES-GCM Tag Match)' : 'Authentication Failed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777C76]">SHA-256 Digest Integrity:</span>
                  <span
                    className={`font-semibold ${
                      recoveryResult.integrity_verified ? 'text-[#2A6F5E]' : 'text-rose-600'
                    }`}
                  >
                    {recoveryResult.integrity_verified ? 'Exact 100% Match' : 'Mismatch / Incomplete'}
                  </span>
                </div>
              </div>

              {/* Download Recovered File */}
              {recoveryResult.status === 'SUCCESS' && recoveryResult.recovered_file_base64 && (
                <div className="pt-2">
                  <button
                    onClick={handleDownloadRecoveredFile}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#173F35] text-[#FCFBF7] text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-[#102F28] transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4 text-[#8FAE91]" />
                    <span>Download Recovered File ({recoveryResult.filename})</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#102F28]">Recovery Pipeline Checklist</h3>
              <ul className="space-y-2 text-xs text-[#777C76]">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>Nucleotide translation to byte stream</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>Reed-Solomon GF(256) per-chunk parity check</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>Packet sequence and CRC32 verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>AES-256-GCM authentication tag check</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>SHA-256 exact byte equality verification</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
