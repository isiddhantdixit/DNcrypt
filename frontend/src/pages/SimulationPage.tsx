import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Dna,
  Binary,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Info,
  BookOpen,
  ArrowRight,
  Split,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveDnaSimulation } from '../components/dna/InteractiveDnaSimulation';

export const SimulationPage: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('DNcrypt');

  const presets = [
    { label: 'DNcrypt', value: 'DNcrypt', desc: 'Standard ASCII word (7 bytes, 28 bp)' },
    { label: 'Binary Stream', value: '10110010', desc: 'Raw binary stream (8 bytes)' },
    { label: 'High GC Sequence', value: 'GCGCGC', desc: 'Stress-test GC-content threshold' },
    { label: 'Alpha Helix', value: 'GENE', desc: 'Compact 4-character synthetic sequence' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DCE8D9] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF0E9] border border-[#BFD4BD] text-[#173F35] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#2A6F5E]" />
            <span>Interactive 3D Biophysical Simulation Studio</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102F28] tracking-tight">
            3D DNA Architecture & Encoding Simulation
          </h1>
          <p className="text-sm text-[#777C76] max-w-2xl leading-relaxed">
            Interact directly with a real-time 3D double-helix model. Observe how raw binary digital data is synthesized into physical nucleotide pairs, inspect chemical base-pairing rules, simulate point mutations, and test in-silico error correction.
          </p>
        </div>

        {/* Quick Presets Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#777C76]">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedPreset(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedPreset === p.value
                  ? 'bg-[#173F35] text-[#FCFBF7] shadow-xs'
                  : 'bg-[#FCFBF7] border border-[#DCE8D9] text-[#202B25] hover:bg-[#EAF0E9]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive 3D Canvas Studio */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InteractiveDnaSimulation
          key={selectedPreset}
          initialText={selectedPreset}
          standalone={true}
        />
      </motion.div>

      {/* 3. Deep Dive Educational Panels: Biology & Cybersecurity Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {/* Panel 1 */}
        <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
            <Binary className="w-5 h-5 text-[#2A6F5E]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28]">
            2-Bit Base Mapping
          </h3>
          <p className="text-xs text-[#777C76] leading-relaxed">
            In DNA information storage, quaternary alphabet bases (A, C, G, T) map to binary bit-pairs (00, 01, 10, 11). One byte (8 bits) requires exactly 4 nucleotide pairs, yielding an ultra-dense storage medium with up to 2 bits per base.
          </p>
          <div className="pt-2 font-mono text-[10px] text-[#173F35] bg-[#F5F1E7] p-2 rounded-lg">
            <code>00=A | 01=C | 10=G | 11=T</code>
          </div>
        </div>

        {/* Panel 2 */}
        <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
            <Dna className="w-5 h-5 text-[#2A6F5E]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28]">
            Watson-Crick Base Pairing
          </h3>
          <p className="text-xs text-[#777C76] leading-relaxed">
            Complementarity guarantees double-strand fidelity: Adenine (Purine) pairs strictly with Thymine (Pyrimidine) via 2 hydrogen bonds. Cytosine pairs with Guanine via 3 hydrogen bonds, providing thermodynamic stability.
          </p>
          <div className="pt-2 font-mono text-[10px] text-[#173F35] bg-[#F5F1E7] p-2 rounded-lg">
            <code>A ⮀ T (2 H-Bonds) | C ⮀ G (3 H-Bonds)</code>
          </div>
        </div>

        {/* Panel 3 */}
        <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
            <Zap className="w-5 h-5 text-[#2A6F5E]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28]">
            Environmental Damage Simulation
          </h3>
          <p className="text-xs text-[#777C76] leading-relaxed">
            Real DNA degrades over time due to UV radiation, hydrolytic deamination, and thermal decay. DNcrypt simulates these lesions via stochastic point substitutions, deletions, and whole chunk dropouts.
          </p>
          <div className="pt-2 font-mono text-[10px] text-rose-700 bg-rose-50 p-2 rounded-lg">
            <code>Cytosine ➔ Uracil/Thymine Transition</code>
          </div>
        </div>

        {/* Panel 4 */}
        <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
            <ShieldCheck className="w-5 h-5 text-[#2A6F5E]" />
          </div>
          <h3 className="font-heading font-bold text-sm text-[#102F28]">
            Reed-Solomon GF(256) Correction
          </h3>
          <p className="text-xs text-[#777C76] leading-relaxed">
            Every payload chunk appends 2t parity symbols calculated over Galois Field GF(256). Even when multiple nucleotides are corrupted or missing, the decoding polynomials calculate error locators and restore the original payload byte-for-byte.
          </p>
          <div className="pt-2 font-mono text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg">
            <code>Berlekamp-Massey & Chien Search</code>
          </div>
        </div>
      </div>

      {/* 4. Cross-Navigation CTA */}
      <div className="p-6 rounded-2xl bg-[#173F35] text-[#FCFBF7] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-base">
            Ready to test encoding with your own files?
          </h4>
          <p className="text-xs text-[#DCE8D9]">
            Upload any arbitrary image, document, or archive and run the full authenticated AES-256-GCM pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            to="/encode"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#8FAE91] text-[#102F28] font-semibold text-xs hover:bg-[#A4C0A2] transition-colors"
          >
            <span>Launch File Encoder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/mutation-lab"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#102F28] text-[#FCFBF7] border border-[#2A6F5E] font-semibold text-xs hover:bg-[#0C231E] transition-colors"
          >
            <span>MutationLab</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
