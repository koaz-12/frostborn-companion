import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'district', label: 'Distrito', icon: '🏛️' },
    { id: 'altar', label: 'Altar Odín', icon: '⚔️' },
    { id: 'family', label: 'Familia', icon: '🏰' },
    { id: 'guides', label: 'Guías', icon: '📖' },
    { id: 'tools', label: 'Utilidades', icon: '⏱️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0e17]/95 backdrop-blur-lg border-t border-nordic-border/80 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-nordic-gold font-semibold'
                  : 'text-nordic-muted hover:text-nordic-text'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 bg-nordic-gold rounded-full shadow-sm shadow-nordic-gold/80" />
              )}
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
