import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'district', label: 'Distrito', icon: '🏛️' },
    { id: 'altar', label: 'Altar de Odín', icon: '⚔️' },
    { id: 'family', label: 'Familia', icon: '🏰' },
    { id: 'guides', label: 'Guías & Meta', icon: '📖' },
    { id: 'tools', label: 'Utilidades', icon: '⏱️' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0e17]/95 backdrop-blur-md border-b border-nordic-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('district')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nordic-surface to-nordic-card border border-nordic-gold/50 flex items-center justify-center shadow-lg shadow-black/40">
              <Shield className="w-5 h-5 text-nordic-gold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-runic font-bold text-lg text-nordic-text tracking-wide">
                  FROSTBORN
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-nordic-gold/20 text-nordic-gold border border-nordic-gold/30 font-mono font-semibold">
                  COMPANION
                </span>
              </div>
              <p className="text-[11px] text-nordic-muted hidden sm:block">
                Hub del Guerrero Nórdico • V1.35
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-nordic-gold/15 text-nordic-gold border border-nordic-gold/40 shadow-sm'
                      : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-surface/80'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-700/50 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready</span>
            </div>
            <div className="p-2 rounded-lg bg-nordic-surface border border-nordic-border text-nordic-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
