import React, { useState } from 'react';
import { KNOWN_MATERIALS } from '../../constants/materials';
import { ItemIcon } from '../common/ItemIcon';
import { Copy, Check, Users, Plus, Minus, RotateCcw } from 'lucide-react';

interface WallTierDef {
  tier: number;
  name: string;
  durability: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGrad: string;
  costs: Record<string, number>;
}

const WALL_TIERS: WallTierDef[] = [
  {
    tier: 1,
    name: 'Pared de Pino / Madera',
    durability: '150 HP',
    icon: '🪵',
    color: 'text-amber-300',
    borderColor: 'border-amber-900/40',
    bgGrad: 'from-amber-950/20 to-nordic-card',
    costs: {
      pine_log: 20,
      rope: 5
    }
  },
  {
    tier: 2,
    name: 'Pared de Piedra Caliza',
    durability: '500 HP',
    icon: '🧱',
    color: 'text-stone-300',
    borderColor: 'border-stone-700/40',
    bgGrad: 'from-stone-900/40 to-nordic-card',
    costs: {
      stone_blocks: 20,
      planks: 10,
      nails: 10
    }
  },
  {
    tier: 3,
    name: 'Pared de Hierro Reforzado',
    durability: '1,500 HP',
    icon: '⛓️',
    color: 'text-blue-300',
    borderColor: 'border-blue-900/40',
    bgGrad: 'from-blue-950/30 to-nordic-card',
    costs: {
      iron_plate: 10,
      forged_fasteners: 10,
      stone_blocks: 30
    }
  },
  {
    tier: 4,
    name: 'Pared de Acero Blindado',
    durability: '4,000 HP',
    icon: '🛡️',
    color: 'text-purple-300',
    borderColor: 'border-purple-900/40',
    bgGrad: 'from-purple-950/30 to-nordic-card',
    costs: {
      steel_plate: 10,
      gears: 10,
      varnish: 5,
      forged_fasteners: 10
    }
  }
];

export const WallCostCalculator: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });

  const [splitByFour, setSplitByFour] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleQuantityChange = (tier: number, value: number) => {
    const val = Math.max(0, Math.min(999, isNaN(value) ? 0 : value));
    setQuantities(prev => ({ ...prev, [tier]: val }));
  };

  const handleAdd = (tier: number, amount: number) => {
    setQuantities(prev => ({
      ...prev,
      [tier]: Math.max(0, Math.min(999, (prev[tier] || 0) + amount))
    }));
  };

  const handleReset = () => {
    setQuantities({ 1: 0, 2: 0, 3: 0, 4: 0 });
  };

  // Calcular materiales agregados
  const totalMaterials: Record<string, number> = {};
  let totalWallsCount = 0;

  WALL_TIERS.forEach(tierDef => {
    const qty = quantities[tierDef.tier] || 0;
    totalWallsCount += qty;
    if (qty > 0) {
      Object.entries(tierDef.costs).forEach(([matKey, costPerWall]) => {
        totalMaterials[matKey] = (totalMaterials[matKey] || 0) + costPerWall * qty;
      });
    }
  });

  const materialEntries = Object.entries(totalMaterials).filter(([_, amount]) => amount > 0);

  const handleCopyClanPlan = () => {
    if (materialEntries.length === 0) return;

    const memberDivisor = splitByFour ? 4 : 1;
    let text = `🧱 *PLAN DE FORTIFICACIÓN DE BASE - FROSTBORN*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Total Paredes a Construir: ${totalWallsCount}\n`;
    WALL_TIERS.forEach(t => {
      const q = quantities[t.tier] || 0;
      if (q > 0) {
        text += `• ${t.name}: ${q} un.\n`;
      }
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += splitByFour
      ? `📦 *CUOTA POR CADA MIEMBRO (1/4 - 4 Integrantes):*\n`
      : `📦 *MATERIALES TOTALES REQUERIDOS:*\n`;

    materialEntries.forEach(([matKey, totalAmt]) => {
      const meta = KNOWN_MATERIALS[matKey];
      const name = meta ? meta.name : matKey;
      const emoji = meta ? meta.icon : '📦';
      const quotaAmt = Math.ceil(totalAmt / memberDivisor);
      if (splitByFour) {
        text += `${emoji} ${name}: ${quotaAmt} (Total Familia: ${totalAmt})\n`;
      } else {
        text += `${emoji} ${name}: ${totalAmt}\n`;
      }
    });

    text += `\n⚔️ ¡A farmear por la gloria de la familia!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Panel Superior: Selección de Paredes */}
      <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-runic font-bold text-nordic-text flex items-center gap-2">
              <span>🧱</span> Calculadora de Coste de Paredes
            </h2>
            <p className="text-xs text-nordic-muted mt-1">
              Calcula los recursos exactos necesarios para fortificar tu base y distribuye la cuota equitativamente entre los 4 integrantes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSplitByFour(!splitByFour)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                splitByFour
                  ? 'bg-nordic-gold/15 text-nordic-gold border-nordic-gold/50 shadow-sm'
                  : 'bg-nordic-card text-nordic-muted border-nordic-border hover:text-nordic-text'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dividir entre 4 ({splitByFour ? 'Activado' : 'Desactivado'})</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-nordic-card border border-nordic-border text-nordic-muted hover:text-nordic-blood hover:border-nordic-blood/40 transition-colors"
              title="Reiniciar cantidades a 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WALL_TIERS.map(tierDef => {
            const qty = quantities[tierDef.tier] || 0;

            return (
              <div
                key={tierDef.tier}
                className={`rounded-2xl border p-4 bg-gradient-to-b ${tierDef.bgGrad} ${tierDef.borderColor} flex flex-col justify-between gap-3 shadow-md hover:border-nordic-gold/40 transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xl">{tierDef.icon}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/40 text-nordic-muted font-bold">
                      {tierDef.durability}
                    </span>
                  </div>
                  <h3 className={`font-runic font-bold text-sm ${tierDef.color}`}>
                    {tierDef.name}
                  </h3>
                  <div className="text-[11px] text-nordic-muted mt-2 space-y-0.5">
                    {Object.entries(tierDef.costs).map(([matKey, cost]) => {
                      const meta = KNOWN_MATERIALS[matKey];
                      return (
                        <div key={matKey} className="flex justify-between">
                          <span>{meta ? meta.name : matKey}:</span>
                          <span className="font-mono text-nordic-text font-semibold">x{cost}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input y Botones de Incremento */}
                <div className="space-y-2 pt-2 border-t border-nordic-border/50">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdd(tierDef.tier, -1)}
                      className="w-8 h-8 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-center text-nordic-muted hover:text-nordic-text hover:bg-nordic-surface transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={qty === 0 ? '' : qty}
                      placeholder="0"
                      onFocus={e => e.target.select()}
                      onChange={e => handleQuantityChange(tierDef.tier, parseInt(e.target.value, 10))}
                      className="flex-1 min-w-0 bg-nordic-surface border border-nordic-border rounded-lg text-center font-mono font-bold text-sm py-1 text-nordic-text focus:outline-none focus:border-nordic-gold"
                    />
                    <button
                      onClick={() => handleAdd(tierDef.tier, 1)}
                      className="w-8 h-8 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-center text-nordic-muted hover:text-nordic-text hover:bg-nordic-surface transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Botones de atajo rápido */}
                  <div className="flex gap-1 justify-center">
                    {[5, 10, 20].map(amt => (
                      <button
                        key={amt}
                        onClick={() => handleAdd(tierDef.tier, amt)}
                        className="flex-1 text-[10px] font-mono py-1 rounded-md bg-nordic-card/80 border border-nordic-border hover:bg-nordic-gold/20 hover:text-nordic-gold transition-colors font-semibold"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen de Materiales Calculados */}
      <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <h3 className="text-lg font-runic font-bold text-nordic-text">
                Materiales Requeridos {totalWallsCount > 0 && `(${totalWallsCount} paredes)`}
              </h3>
            </div>
            <p className="text-xs text-nordic-muted mt-0.5">
              {splitByFour
                ? 'Dividido entre 4 integrantes. Cada miembro aporta la cuota indicada.'
                : 'Costo total para el almacén de la familia.'}
            </p>
          </div>

          {materialEntries.length > 0 && (
            <button
              onClick={handleCopyClanPlan}
              className="px-4 py-2 rounded-xl bg-nordic-gold text-black font-runic font-bold text-xs flex items-center gap-2 hover:bg-nordic-gold/90 transition-all shadow-md active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado para Clan!' : 'Copiar Cuota para Clan'}</span>
            </button>
          )}
        </div>

        {materialEntries.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-nordic-border rounded-xl">
            <span className="text-3xl block mb-2">🧱</span>
            <p className="text-sm text-nordic-muted">
              Selecciona la cantidad de paredes arriba para calcular los materiales y cuotas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materialEntries.map(([matKey, totalAmt]) => {
              const meta = KNOWN_MATERIALS[matKey];
              const quotaAmt = Math.ceil(totalAmt / (splitByFour ? 4 : 1));

              return (
                <div
                  key={matKey}
                  className="bg-nordic-card/70 border border-nordic-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:border-nordic-gold/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ItemIcon
                      id={matKey}
                      fallbackEmoji={meta ? meta.icon : '📦'}
                      name={meta ? meta.name : matKey}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-nordic-text truncate">
                        {meta ? meta.name : matKey}
                      </div>
                      {meta?.source && (
                        <div className="text-[10px] text-nordic-muted truncate max-w-[170px]" title={meta.source}>
                          📍 {meta.source}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-base text-nordic-gold">
                      {quotaAmt.toLocaleString()}
                    </div>
                    {splitByFour && (
                      <div className="text-[10px] font-mono text-nordic-muted">
                        Total: {totalAmt.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
