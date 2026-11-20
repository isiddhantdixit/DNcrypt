import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DnaCanvas } from '../dna/DnaCanvas';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FCFBF7] text-[#202B25]">
      {/* Subtle background canvas on subpages; Home has its own dedicated stage */}
      {!isHome && (
        <DnaCanvas variant="background" opacity={0.16} />
      )}

      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
