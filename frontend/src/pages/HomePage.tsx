import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Dna,
  Binary,
  FlaskConical,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileCode,
  Layers,
  Cpu,
  Microscope,
  Sparkles
} from 'lucide-react';
import { DnaCanvas } from '../components/dna/DnaCanvas';
import { InteractiveDnaSimulation } from '../components/dna/InteractiveDnaSimulation';

export const HomePage: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* 1. Split Hero Section: Left Text + Right 3D DNA Canvas Stage */}
      <section className="relative min-h-[85vh] flex items-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#DCE8D9]/70">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: 100% Crisp Typography & Clear Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6 z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EAF0E9] border border-[#BFD4BD] text-[#173F35] text-xs font-semibold tracking-wide shadow-2xs"
            >
              <Dna className="w-3.5 h-3.5 text-[#2A6F5E] flex-shrink-0" />
              <span>DNA-Inspired Secure Data Encoding & Recovery Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[64px] tracking-tight text-[#102F28] leading-[1.08]">
                Secure. Encode. <br />
                Preserve. Recover.
              </h1>
              <p className="text-base sm:text-lg text-[#202B25]/85 font-normal leading-relaxed pt-2 max-w-xl">
                Transform arbitrary digital files into DNA nucleotide sequences with AES-256-GCM authenticated encryption, Reed-Solomon error correction, and in-silico mutation simulation.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            >
              <Link
                to="/encode"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#173F35] text-[#FCFBF7] text-sm font-semibold hover:bg-[#102F28] transition-all shadow-md hover:shadow-lg active:scale-98 whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4 text-[#8FAE91]" />
                <span>Start Encoding</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                to="/simulations"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#F5F1E7] text-[#173F35] border border-[#DCE8D9] text-sm font-semibold hover:bg-[#EAE3D2] transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-[#2A6F5E]" />
                <span>3D Interactive Simulation</span>
              </Link>
            </motion.div>

            {/* Pillar Cards Under Headline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 max-w-xl"
            >
              <div className="p-2.5 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs">
                <div className="flex items-center space-x-1.5 text-[#173F35] font-semibold text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#2A6F5E] flex-shrink-0" />
                  <span className="truncate">AES-256-GCM</span>
                </div>
                <p className="text-[10px] text-[#777C76] mt-0.5 leading-tight">Authenticated encryption</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs">
                <div className="flex items-center space-x-1.5 text-[#173F35] font-semibold text-xs">
                  <Dna className="w-3.5 h-3.5 text-[#2A6F5E] flex-shrink-0" />
                  <span className="truncate">4-Base Codec</span>
                </div>
                <p className="text-[10px] text-[#777C76] mt-0.5 leading-tight">Baseline & Constrained</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs">
                <div className="flex items-center space-x-1.5 text-[#173F35] font-semibold text-xs">
                  <Layers className="w-3.5 h-3.5 text-[#2A6F5E] flex-shrink-0" />
                  <span className="truncate">Reed-Solomon</span>
                </div>
                <p className="text-[10px] text-[#777C76] mt-0.5 leading-tight">GF(256) parity check</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs">
                <div className="flex items-center space-x-1.5 text-[#173F35] font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6F5E] flex-shrink-0" />
                  <span className="truncate">SHA-256 Exact</span>
                </div>
                <p className="text-[10px] text-[#777C76] mt-0.5 leading-tight">Integrity confirmed</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dedicated 3D Double-Helix Stage (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] rounded-3xl bg-gradient-to-b from-[#EAF0E9]/60 via-[#FCFBF7] to-[#F5F1E7]/50 border border-[#DCE8D9] shadow-sm overflow-hidden flex items-center justify-center">
              
              {/* Subtle radial glow inside the 3D frame */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,232,217,0.45)_0%,transparent_70%)] pointer-events-none" />

              {/* 3D DNA Canvas Dedicated Stage */}
              <DnaCanvas variant="side-stage" opacity={0.95} />

              {/* Technical Overlay Pill */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FCFBF7]/90 backdrop-blur-md border border-[#DCE8D9] text-[11px] text-[#173F35] shadow-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#8FAE91] animate-pulse" />
                  <span className="font-mono font-medium">3D Double-Helix Live Simulation</span>
                </div>
                <span className="text-[10px] font-mono text-[#777C76]">Three.js • R3F</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand New: Complete Interactive 3D Simulation Section */}
      <section className="py-20 bg-[#FCFBF7] border-b border-[#DCE8D9] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF0E9] border border-[#BFD4BD] text-[#173F35] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#2A6F5E]" />
                <span>Real-Time 3D Biophysical Simulation</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#102F28]">
                Interactive 3D Simulation: How DNA Encoding Works
              </h2>
              <p className="text-xs sm:text-sm text-[#777C76] max-w-2xl leading-relaxed">
                Interact with a live 3D double helix model. Type any text to observe bit-to-base translation, rotate with your mouse, simulate environmental UV damage, and execute Reed-Solomon recovery directly in the canvas.
              </p>
            </div>

            <Link
              to="/simulations"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28] transition-all shadow-xs flex-shrink-0"
            >
              <span>Open Full 3D Simulation Studio</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {/* Embedded Interactive 3D Simulation */}
          <InteractiveDnaSimulation initialText="DNA" />
        </div>
      </section>

      {/* 3. End-to-End Workflow Section */}
      <section className="py-20 bg-[#F5F1E7]/70 border-b border-[#DCE8D9] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#102F28]">
              The File-to-DNA Preservation Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-[#777C76]">
              A deterministic multi-stage computational pipeline mapping standard digital binaries into error-tolerant biological sequence packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                step: '01',
                title: 'File Intake',
                desc: 'Reads input stream, captures MIME headers, and computes baseline SHA-256 digest.',
                icon: FileCode,
              },
              {
                step: '02',
                title: 'Compression',
                desc: 'Optional zlib deflate pre-compression to reduce entropy and sequence overhead.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'BioCrypt Encryption',
                desc: 'AES-256-GCM cipher with Argon2id/scrypt derived key, unique 16B salt and 12B nonce.',
                icon: Lock,
              },
              {
                step: '04',
                title: 'RS Protection',
                desc: 'Splits payload into indexed chunks, appends CRC32 and Reed-Solomon parity symbols.',
                icon: Cpu,
              },
              {
                step: '05',
                title: 'Nucleotide Mapping',
                desc: 'Translates bytes into A, C, G, T bases with baseline or constrained rotation algorithms.',
                icon: Dna,
              },
              {
                step: '06',
                title: 'Package Export',
                desc: 'Generates structured DNcrypt JSON package with FASTA sequence headers.',
                icon: ShieldCheck,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-4 rounded-xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-2xs relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#8FAE91]">{st.step}</span>
                      <Icon className="w-4 h-4 text-[#173F35]" />
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-[#102F28]">{st.title}</h3>
                    <p className="text-xs text-[#777C76] leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#102F28]">
            Built for Verification and Experimentation
          </h2>
          <p className="text-xs sm:text-sm text-[#777C76]">
            Every module in DNcrypt provides measurable computational outputs, rigorous error models, and transparent diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-sm hover:border-[#8FAE91] transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#102F28]">MutationLab Simulator</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Inject synthetic environmental damage into nucleotide sequences: point substitutions, frame-shifting insertions and deletions, or full chunk dropouts. Repeat experiments deterministically with fixed random seeds.
            </p>
            <Link
              to="/mutation-lab"
              className="inline-flex items-center text-xs font-semibold text-[#173F35] hover:text-[#2A6F5E]"
            >
              <span>Explore MutationLab</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-sm hover:border-[#8FAE91] transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#102F28]">Recovery & Integrity Centre</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Reverses the biological pipeline. Reed-Solomon corrects corrupted chunk bytes, AES-GCM verifies cryptographic authenticity, and SHA-256 guarantees exact byte-for-byte reconstruction.
            </p>
            <Link
              to="/recovery"
              className="inline-flex items-center text-xs font-semibold text-[#173F35] hover:text-[#2A6F5E]"
            >
              <span>Launch Recovery Centre</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-sm hover:border-[#8FAE91] transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAF0E9] flex items-center justify-center text-[#173F35]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#102F28]">Benchmark Lab</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Benchmark compression efficiency, cryptographic overhead, nucleotide expansion ratios, and recovery success thresholds across various error rates with SQLite-backed telemetry.
            </p>
            <Link
              to="/benchmarks"
              className="inline-flex items-center text-xs font-semibold text-[#173F35] hover:text-[#2A6F5E]"
            >
              <span>View Benchmarks</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Biology Syllabus & In-Silico Notice */}
      <section className="py-16 bg-[#173F35] text-[#FCFBF7] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#102F28] text-[#8FAE91] text-xs font-medium">
              <Microscope className="w-3.5 h-3.5" />
              <span>Biology for Engineers Syllabus Integration</span>
            </div>
            <h3 className="font-heading font-bold text-2xl text-[#FCFBF7]">
              Bridging Molecular Biology and Cryptographic Engineering
            </h3>
            <p className="text-xs text-[#DCE8D9] leading-relaxed">
              DNcrypt aligns directly with Module 1 (Biomolecular Engineering) exploring DNA as an ultra-dense information storage medium, Module 3 (Biomimicry architectures), Module 4 (Bioinformatics & Sequence Analysis), and Module 5 (Frontier Bioengineering in-silico simulation).
            </p>
          </div>

          <Link
            to="/about"
            className="flex-shrink-0 inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#8FAE91] text-[#102F28] font-semibold text-xs hover:bg-[#A4C0A2] transition-colors"
          >
            <span>Read Academic Specification</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
