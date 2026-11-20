import React from 'react';
import {
  BookOpen,
  Dna,
  ShieldCheck,
  Lock,
  Layers,
  Cpu,
  Microscope,
  AlertTriangle,
  CheckCircle2,
  Binary
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-3 pb-6 border-b border-[#DCE8D9]">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF0E9] border border-[#BFD4BD] text-[#173F35] text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5 text-[#2A6F5E]" />
          <span>Product Specification & Architectural Standards</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102F28]">
          About DNcrypt
        </h1>
        <p className="text-sm text-[#777C76] leading-relaxed max-w-3xl">
          DNcrypt is an in-silico computational biology and cybersecurity platform simulating secure file encoding into DNA-like nucleotide sequences (A, C, G, T), sequence damage simulation, error-corrected recovery, and cryptographic integrity verification.
        </p>
      </div>

      {/* Critical In-Silico Software Disclaimer */}
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>Mandatory In-Silico Disclaimer</span>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed">
          DNcrypt is a <strong>software prototype</strong>. It models DNA-inspired data storage mathematically and computationally. It does not synthesize physical oligonucleotides, store data in organic molecular structures, sequence wet-lab samples, or interface with automated liquid handling instrumentation. All benchmark latency, overhead, and error-tolerance metrics reflect algorithm execution on host silicon hardware.
        </p>
      </div>

      {/* Section 1: DNA Encoding vs Cryptographic Encryption */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-[#102F28] flex items-center space-x-2">
          <Lock className="w-5 h-5 text-[#173F35]" />
          <span>Encoding vs. Encryption: The Crucial Distinction</span>
        </h2>
        <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-3 text-xs text-[#202B25] leading-relaxed">
          <p>
            A common misconception in bio-inspired computing is mistaking <strong>encoding</strong> for <strong>encryption</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#777C76]">
            <li>
              <strong className="text-[#102F28]">Encoding (Representation):</strong> Translating data from bits to nucleotide characters (e.g. <code>00 → A, 01 → C</code>) changes only the alphabet used to represent the information. It provides zero confidentiality; anyone who knows the mapping can trivially read the data.
            </li>
            <li>
              <strong className="text-[#102F28]">Encryption (Security & Authenticity):</strong> DNcrypt applies vetted cryptographic primitives (AES-256-GCM) with Argon2id key derivation <em>before</em> any nucleotide translation occurs. This guarantees confidentiality and tamper detection regardless of where the sequence is stored or transmitted.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: Biology for Engineers Syllabus Alignment */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-[#102F28] flex items-center space-x-2">
          <Microscope className="w-5 h-5 text-[#173F35]" />
          <span>Biology for Engineers Syllabus Alignment</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#8FAE91]">Module 1</span>
            <h3 className="font-heading font-bold text-sm text-[#102F28]">Biomolecular Engineering</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Explores DNA as an information-storage molecule. Demonstrates how the 4 nitrogenous bases (A, C, G, T) can serve as an ultra-high-density storage medium with a theoretical information capacity exceeding 200 petabytes per gram.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#8FAE91]">Module 3</span>
            <h3 className="font-heading font-bold text-sm text-[#102F28]">Biomimicry & Nature-Inspired Design</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Applies principles learned from biological information preservation (half-life, redundancy, physical stability) to solve modern archival data storage degradation challenges.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#8FAE91]">Module 4</span>
            <h3 className="font-heading font-bold text-sm text-[#102F28]">Bioinformatics & Sequence Analysis</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Sequence property analysis implemented via HelixGuard: GC content calculations, homopolymer run detection to avoid polymerase slippage, and FASTA sequence structure compliance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#8FAE91]">Module 5</span>
            <h3 className="font-heading font-bold text-sm text-[#102F28]">Frontier Bioengineering</h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              In-silico simulation of mutational forces (point substitutions, insertions, deletions, chunk dropouts) paired with Reed-Solomon algebraic error-correction codes over GF(256).
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Technical Limitations & Future Work */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-[#102F28] flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#173F35]" />
          <span>Technical Limitations & Scientific Boundaries</span>
        </h2>
        <div className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#DCE8D9] space-y-3 text-xs text-[#777C76] leading-relaxed">
          <p>
            1. <strong>Insertion & Deletion (Indel) Recovery:</strong> While byte-level Reed-Solomon GF(256) easily corrects substitutions within aligned chunks, insertions and deletions shift the nucleotide reading frame. Full indel-tolerant reconstruction requires sequence alignment algorithms (e.g. Needleman-Wunsch or watermark synchronization), which are active areas of research.
          </p>
          <p>
            2. <strong>Hardware Acceleration:</strong> Current Reed-Solomon operations run via pure-Python Galois field routines. Production implementations would leverage SIMD vectorization (AVX-512) for gigabyte-scale throughput.
          </p>
        </div>
      </section>
    </div>
  );
};
