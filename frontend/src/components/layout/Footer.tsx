import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, ShieldCheck, ExternalLink, Info, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102F28] text-[#DCE8D9] border-t border-[#173F35] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#173F35] flex items-center justify-center">
                <Dna className="w-5 h-5 text-[#8FAE91]" />
              </div>
              <span className="font-heading font-extrabold text-xl text-[#FCFBF7] tracking-tight">DNcrypt</span>
            </div>
            <p className="text-xs text-[#8FAE91] leading-relaxed max-w-md">
              DNA-Inspired Secure Data Encoding & Recovery Platform. An in-silico computational biology and cybersecurity platform simulating cryptographic file protection, nucleotide sequence encoding, damage simulation, and error-corrected reconstruction.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#A4C0A2] bg-[#0C231E]/60 px-3 py-2 rounded-lg border border-[#173F35] max-w-md">
              <Info className="w-4 h-4 flex-shrink-0 text-[#8FAE91]" />
              <span>
                <strong>In-Silico Disclaimer:</strong> This platform is a software simulation. It does not perform physical DNA synthesis, wet-lab molecular storage, or biological sequencing.
              </span>
            </div>
          </div>

          {/* Quick Workflows */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#FCFBF7] mb-3">
              Workflows & Simulations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/simulations" className="hover:text-[#FCFBF7] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8FAE91]" />
                  <span>3D Interactive Simulation</span>
                </Link>
              </li>
              <li>
                <Link to="/encode" className="hover:text-[#FCFBF7] transition-colors">Encode & Encrypt File</Link>
              </li>
              <li>
                <Link to="/explorer" className="hover:text-[#FCFBF7] transition-colors">Sequence Explorer</Link>
              </li>
              <li>
                <Link to="/mutation-lab" className="hover:text-[#FCFBF7] transition-colors">MutationLab Simulation</Link>
              </li>
              <li>
                <Link to="/recovery" className="hover:text-[#FCFBF7] transition-colors">Recovery & Integrity Centre</Link>
              </li>
              <li>
                <Link to="/benchmarks" className="hover:text-[#FCFBF7] transition-colors">Performance Benchmarks</Link>
              </li>
            </ul>
          </div>

          {/* Syllabus & Standards */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#FCFBF7] mb-3">
              Biology Syllabus Alignment
            </h4>
            <ul className="space-y-2 text-xs text-[#8FAE91]">
              <li>Module 1: Biomolecular Engineering</li>
              <li>Module 2: Biological Information Context</li>
              <li>Module 3: Biomimicry Architecture</li>
              <li>Module 4: Bioinformatics & Sequence Analysis</li>
              <li>Module 5: Frontier Bioengineering & In-Silico</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[#173F35]">
              <Link to="/about" className="inline-flex items-center space-x-1 text-xs text-[#FCFBF7] hover:text-[#8FAE91] font-medium">
                <span>View Full Architecture Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#173F35] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777C76]">
          <p>© 2026 DNcrypt Platform. Secure. Encode. Preserve. Recover.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            AES-256-GCM + Reed-Solomon GF(256) + 4-Nucleotide In-Silico Codec
          </p>
        </div>
      </div>
    </footer>
  );
};
