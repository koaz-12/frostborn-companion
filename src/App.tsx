import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DistrictCalculator } from './components/district/DistrictCalculator';
import { AltarCalculator } from './components/altar/AltarCalculator';
import { FamilyView } from './components/family/FamilyView';
import { GuidesHub } from './components/guides/GuidesHub';
import { ToolsView } from './components/tools/ToolsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('district');

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#f3f4f6] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {activeTab === 'district' && <DistrictCalculator />}
        {activeTab === 'altar' && <AltarCalculator />}
        {activeTab === 'family' && <FamilyView />}
        {activeTab === 'guides' && <GuidesHub />}
        {activeTab === 'tools' && <ToolsView />}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Footer (Desktop) */}
      <footer className="hidden md:block border-t border-nordic-border/70 py-6 bg-[#0a0e17] text-center text-xs text-nordic-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            ⚔️ <strong>Frostborn Companion</strong> — Herramienta comunitaria independiente para <span className="text-nordic-gold">Frostborn: Action RPG</span> (Kefir Games).
          </p>
          <p className="text-[11px]">
            Diseñado para guerreros y familias de Nuevo Heim. Funcional 100% Offline.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
