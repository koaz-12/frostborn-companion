import React, { useState } from 'react';
import { KNOWN_MATERIALS } from '../../constants/materials';
import { ItemIcon } from '../common/ItemIcon';
import { Bomb, Copy, Check, Users, Plus, Minus, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';

interface RaidTargetDef {
  id: string;
  name: string;
  category: 'wall' | 'chest';
  hp: string;
  icon: string;
  bombsNeeded: number;
  lockpicksNeeded: number;
  masterLockpicksNeeded: number;
  desc: string;
}

const RAID_TARGETS: RaidTargetDef[] = [
  {
    id: 'wall_t2',
    name: 'Pared / Puerta T2 (Piedra)',
    category: 'wall',
    hp: '500 HP',
    icon: '🧱',
    bombsNeeded: 1,
    lockpicksNeeded: 0,
    masterLockpicksNeeded: 0,
    desc: '1 Bomba de Pólvora o 1 Hacha de Hierro'
  },
  {
    id: 'wall_t3',
    name: 'Pared / Puerta T3 (Hierro)',
    category: 'wall',
    hp: '1,500 HP',
    icon: '⛓️',
    bombsNeeded: 2,
    lockpicksNeeded: 0,
    masterLockpicksNeeded: 0,
    desc: '2 Bombas de Pólvora'
  },
  {
    id: 'wall_t4',
    name: 'Pared / Puerta T4 (Acero)',
    category: 'wall',
    hp: '4,000 HP',
    icon: '🛡️',
    bombsNeeded: 4,
    lockpicksNeeded: 0,
    masterLockpicksNeeded: 0,
    desc: '4 Bombas de Pólvora de alto impacto'
  },
  {
    id: 'chest_locked',
    name: 'Cofre con Cerradura Reforzada',
    category: 'chest',
    hp: 'Cerradura T1',
    icon: '🔐',
    bombsNeeded: 0,
    lockpicksNeeded: 1,
    masterLockpicksNeeded: 0,
    desc: '1 Ganzúa Simple por cofre'
  },
  {
    id: 'chest_vault',
    name: 'Baúl Blindado / Caja Fuerte',
    category: 'chest',
    hp: 'Cerradura T2',
    icon: '🧰',
    bombsNeeded: 0,
    lockpicksNeeded: 0,
    masterLockpicksNeeded: 1,
    desc: '1 Ganzúa Maestra de Odín'
  }
];

// Coste por cada Bomba de Pólvora
const BOMB_CRAFT_COST: Record<string, number> = {
  gunpowder: 5,
  iron_plate: 5,
  rope: 5,
  forged_fasteners: 1
};

export const RaidCalculator: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    wall_t2: 0,
    wall_t3: 0,
    wall_t4: 0,
    chest_locked: 0,
    chest_vault: 0
  });

  const [splitByFour, setSplitByFour] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleQuantityChange = (id: string, val: number) => {
    const safeVal = Math.max(0, Math.min(99, isNaN(val) ? 0 : val));
    setQuantities(prev => ({ ...prev, [id]: safeVal }));
  };

  const handleAdd = (id: string, amount: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, Math.min(99, (prev[id] || 0) + amount))
    }));
  };

  const handleReset = () => {
    setQuantities({
      wall_t2: 0,
      wall_t3: 0,
      wall_t4: 0,
      chest_locked: 0,
      chest_vault: 0
    });
  };

  // Totales
  let totalBombs = 0;
  let totalLockpicks = 0;
  let totalMasterLockpicks = 0;

  RAID_TARGETS.forEach(target => {
    const count = quantities[target.id] || 0;
    totalBombs += count * target.bombsNeeded;
    totalLockpicks += count * target.lockpicksNeeded;
    totalMasterLockpicks += count * target.masterLockpicksNeeded;
  });

  // Materiales para bombas
  const bombCraftMaterials: Record<string, number> = {};
  if (totalBombs > 0) {
    Object.entries(BOMB_CRAFT_COST).forEach(([matKey, costPerBomb]) => {
      bombCraftMaterials[matKey] = costPerBomb * totalBombs;
    });
  }

  const handleCopyRaidPlan = () => {
    const divisor = splitByFour ? 4 : 1;
    let text = `💣 *PLAN TÁCTICO DE INCURSIÓN / ASESIO - FROSTBORN*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎯 *OBJETIVOS DE BRECHA:*\n`;
    RAID_TARGETS.forEach(t => {
      const q = quantities[t.id] || 0;
      if (q > 0) {
        text += `• ${t.name}: ${q} un.\n`;
      }
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🧨 *EXPLOSIVOS & HERRAMIENTAS TOTALES:*\n`;
    if (totalBombs > 0) text += `💣 Bombas de Pólvora: ${totalBombs} un.\n`;
    if (totalLockpicks > 0) text += `🗝️ Ganzúas Simples: ${totalLockpicks} un.\n`;
    if (totalMasterLockpicks > 0) text += `🔑 Ganzúas Maestras: ${totalMasterLockpicks} un.\n`;

    if (totalBombs > 0) {
      text += `\n📦 *MATERIALES DE CRAFTEO DE BOMBAS ${splitByFour ? '(CUOTA POR MIEMBRO 1/4)' : '(TOTAL)'}:*\n`;
      Object.entries(bombCraftMaterials).forEach(([matKey, totalAmt]) => {
        const meta = KNOWN_MATERIALS[matKey];
        const name = meta ? meta.name : matKey;
        const quota = Math.ceil(totalAmt / divisor);
        if (splitByFour) {
          text += `• ${meta?.icon || '📦'} ${name}: ${quota} (Total: ${totalAmt})\n`;
        } else {
          text += `• ${meta?.icon || '📦'} ${name}: ${totalAmt}\n`;
        }
      });
    }

    text += `\n⚡ *Recordatorio:* 20 min de temporizador una vez abierta la brecha. ¡Lleven comida, pociones y espacio en inventario!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const hasAnyTarget = Object.values(quantities).some(v => v > 0);

  return (
    <div className="space-y-6">
      {/* Panel Superior: Objetivos a Destruir */}
      <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-runic font-bold text-nordic-text flex items-center gap-2">
              <Bomb className="w-5 h-5 text-nordic-blood" />
              <span>Calculadora de Bombas de Asedio (Raid)</span>
            </h2>
            <p className="text-xs text-nordic-muted mt-1">
              Calcula los explosivos y ganzúas necesarios para penetrar las defensas enemigas y los costes de crafteo.
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
              <span>Dividir entre 4 atacantes ({splitByFour ? 'Activado' : 'Desactivado'})</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-nordic-card border border-nordic-border text-nordic-muted hover:text-nordic-blood hover:border-nordic-blood/40 transition-colors"
              title="Reiniciar a 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid de Objetivos de Incursión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RAID_TARGETS.map(target => {
            const qty = quantities[target.id] || 0;

            return (
              <div
                key={target.id}
                className="bg-nordic-card/60 border border-nordic-border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md hover:border-nordic-gold/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-2xl">{target.icon}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 text-nordic-muted font-bold">
                      {target.hp}
                    </span>
                  </div>
                  <h3 className="font-runic font-bold text-sm text-nordic-text">
                    {target.name}
                  </h3>
                  <p className="text-[11px] text-nordic-gold/90 mt-1">
                    {target.desc}
                  </p>
                </div>

                {/* Input & Botones de Cantidad */}
                <div className="pt-2 border-t border-nordic-border/50 flex items-center gap-2">
                  <button
                    onClick={() => handleAdd(target.id, -1)}
                    className="w-8 h-8 rounded-lg bg-nordic-surface border border-nordic-border flex items-center justify-center text-nordic-muted hover:text-nordic-text hover:bg-nordic-card transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={qty === 0 ? '' : qty}
                    placeholder="0"
                    onFocus={e => e.target.select()}
                    onChange={e => handleQuantityChange(target.id, parseInt(e.target.value, 10))}
                    className="flex-1 min-w-0 bg-nordic-surface border border-nordic-border rounded-lg text-center font-mono font-bold text-sm py-1 text-nordic-text focus:outline-none focus:border-nordic-gold"
                  />
                  <button
                    onClick={() => handleAdd(target.id, 1)}
                    className="w-8 h-8 rounded-lg bg-nordic-surface border border-nordic-border flex items-center justify-center text-nordic-muted hover:text-nordic-text hover:bg-nordic-card transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAdd(target.id, 5)}
                    className="px-2 text-[10px] font-mono py-1 rounded-md bg-nordic-surface border border-nordic-border text-nordic-muted hover:text-nordic-gold font-semibold"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen de Explosivos y Crafteo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Arsenal Requerido */}
        <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-runic font-bold text-base text-nordic-text flex items-center gap-2">
              <span>🧨</span> Arsenal de Asedio Requerido
            </h3>
          </div>

          <div className="space-y-3">
            <div className="bg-nordic-card/80 border border-nordic-blood/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ItemIcon id="bomb" fallbackEmoji="💣" name="Bomba de Pólvora" size="md" />
                <div>
                  <div className="font-semibold text-xs text-nordic-text">Bombas de Pólvora</div>
                  <div className="text-[10px] text-nordic-muted">Para romper paredes de T2 a T4</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-lg text-nordic-blood">{totalBombs}</div>
                {splitByFour && totalBombs > 0 && (
                  <div className="text-[10px] font-mono text-nordic-muted">
                    {Math.ceil(totalBombs / 4)} c/u
                  </div>
                )}
              </div>
            </div>

            <div className="bg-nordic-card/80 border border-nordic-border rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ItemIcon id="lockpick" fallbackEmoji="🗝️" name="Ganzúa Simple" size="md" />
                <div>
                  <div className="font-semibold text-xs text-nordic-text">Ganzúas Simples</div>
                  <div className="text-[10px] text-nordic-muted">Para cofres con cerradura básica</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-lg text-nordic-gold">{totalLockpicks}</div>
                {splitByFour && totalLockpicks > 0 && (
                  <div className="text-[10px] font-mono text-nordic-muted">
                    {Math.ceil(totalLockpicks / 4)} c/u
                  </div>
                )}
              </div>
            </div>

            <div className="bg-nordic-card/80 border border-nordic-border rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ItemIcon id="master_lockpick" fallbackEmoji="🔑" name="Ganzúa Maestra" size="md" />
                <div>
                  <div className="font-semibold text-xs text-nordic-text">Ganzúas Maestras</div>
                  <div className="text-[10px] text-nordic-muted">Para baúles de cámara acorazada</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-lg text-purple-400">{totalMasterLockpicks}</div>
                {splitByFour && totalMasterLockpicks > 0 && (
                  <div className="text-[10px] font-mono text-nordic-muted">
                    {Math.ceil(totalMasterLockpicks / 4)} c/u
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasAnyTarget && (
            <button
              onClick={handleCopyRaidPlan}
              className="w-full py-2.5 rounded-xl bg-nordic-gold text-black font-runic font-bold text-xs flex items-center justify-center gap-2 hover:bg-nordic-gold/90 transition-all shadow-md active:scale-95 mt-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Plan Copiado al Portapapeles!' : 'Copiar Plan de Asedio'}</span>
            </button>
          )}
        </div>

        {/* Columna Central y Derecha: Materiales de Crafteo y Consejos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materiales para Craftear las Bombas */}
          <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-xl space-y-4">
            <h3 className="font-runic font-bold text-base text-nordic-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-nordic-gold" />
              <span>Materiales Necesarios para Fabricar las Bombas</span>
            </h3>

            {totalBombs === 0 ? (
              <p className="text-xs text-nordic-muted italic">
                Indica paredes o puertas a derribar arriba para ver los ingredientes de fabricación de las bombas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(bombCraftMaterials).map(([matKey, totalAmt]) => {
                  const meta = KNOWN_MATERIALS[matKey];
                  const quotaAmt = Math.ceil(totalAmt / (splitByFour ? 4 : 1));

                  return (
                    <div
                      key={matKey}
                      className="bg-nordic-card/60 border border-nordic-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm"
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
                            <div className="text-[10px] text-nordic-muted truncate max-w-[150px]">
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

          {/* Consejos Tácticos de Asedio */}
          <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-nordic-gold">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-runic font-bold text-sm uppercase tracking-wider">
                Consejos Tácticos para el Asalto
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-nordic-muted">
              <div className="bg-nordic-card/50 rounded-xl p-3 border border-nordic-border/60">
                <strong className="text-nordic-text block mb-1">⏱️ Temporizador de 20 min:</strong>
                Una vez colocada la primera bomba o dañada una pared, comienza la cuenta regresiva. Vayan directo al núcleo.
              </div>
              <div className="bg-nordic-card/50 rounded-xl p-3 border border-nordic-border/60">
                <strong className="text-nordic-text block mb-1">🎒 Bolsas de Saqueo:</strong>
                Llevar mochilas moradas/azules con espacios libres. No lleven objetos valiosos que puedan perder si mueren.
              </div>
              <div className="bg-nordic-card/50 rounded-xl p-3 border border-nordic-border/60">
                <strong className="text-nordic-text block mb-1">🛡️ Distracción y Emboscada:</strong>
                Un tanque con Protector debe llamar la atención de defensores/trampas mientras el pícaro o mago rompe los cofres.
              </div>
              <div className="bg-nordic-card/50 rounded-xl p-3 border border-nordic-border/60">
                <strong className="text-nordic-text block mb-1">🏃‍♂️ Retirada Segura:</strong>
                Aseguren el botín primero en su montura o carro antes de regresar a buscar más objetos secundarios.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
