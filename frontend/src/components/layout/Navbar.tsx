import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Dna,
  Binary,
  FlaskConical,
  RotateCcw,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', shortName: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Encode File', shortName: 'Encode File', path: '/encode', icon: Binary },
  { name: 'Sequence Explorer', shortName: 'Sequence Explorer', path: '/explorer', icon: Dna },
  { name: 'MutationLab', shortName: 'MutationLab', path: '/mutation-lab', icon: FlaskConical },
  { name: 'Recovery Centre', shortName: 'Recovery Centre', path: '/recovery', icon: RotateCcw },
  { name: 'Benchmark Lab', shortName: 'Benchmark Lab', path: '/benchmarks', icon: BarChart3 },
  { name: 'Documentation', shortName: 'Documentation', path: '/about', icon: BookOpen },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#FCFBF7]/95 backdrop-blur-md border-b border-[#DCE8D9] transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Left: Brand Logo & Title (Moved to the left) */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#173F35] flex items-center justify-center text-[#F5F1E7] shadow-xs group-hover:bg-[#102F28] transition-colors">
                <Dna className="w-4.5 h-4.5 text-[#8FAE91] group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-lg lg:text-xl tracking-tight text-[#173F35]">
                  DNcrypt
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#DCE8D9] text-[#173F35] font-bold tracking-wider">
                  In-Silico
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Desktop Navigation Links (Spacious, clean, single row) */}
          <nav className="hidden lg:flex items-center justify-end space-x-1 xl:space-x-2 flex-1 pl-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-[#173F35] text-[#FCFBF7] shadow-xs'
                      : 'text-[#202B25] hover:text-[#173F35] hover:bg-[#F5F1E7]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#8FAE91]' : 'text-[#777C76]'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center ml-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#202B25] hover:bg-[#F5F1E7] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#DCE8D9] bg-[#FCFBF7] px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#173F35] text-[#FCFBF7]'
                    : 'text-[#202B25] hover:bg-[#F5F1E7]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8FAE91]' : 'text-[#777C76]'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
