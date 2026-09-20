import React, { useState, useRef, useEffect } from 'react';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { calculateDistrictCost, calculateInventoryProgress } from '../../lib/calculations';
import districtsDataRaw from '../../data/districts.json';
import { KNOWN_MATERIALS } from '../../constants/materials';
import { DistrictLevel } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Layers,
  CheckCircle,
  HelpCircle,
  X,
  Ticket
} from 'lucide-react';

const districtsData = (districtsDataRaw.levels as unknown) as DistrictLevel[];

export const DistrictCalculator: React.FC = () => {
  const {
    districtCurrentLevel,
    districtTargetLevel,
    inventory,
    skippedLevels,
    setDistrictLevels,
    setMaterialCount,
    bulkSetMaterials,
    resetInventory,
    toggleSkipLevel,
    clearSkippedLevels
  } = useInventoryStore();

  const [activeSubTab, setActiveSubTab] = useState<'shopping' | 'stepByStep' | 'inventory' | 'unlocks'>('stepByStep');
  const [copied, setCopied] = useState(false);
  const [unlockFilter, setUnlockFilter] = useState<'all' | 'milestones' | 'doors'>('milestones');
  const [inspectedLevel, setInspectedLevel] = useState<number>(districtCurrentLevel + 1);
  const [showInfluenceModal, setShowInfluenceModal] = useState(false);
  const inspectorRef = useRef<HTMLDivElement>(null);

  const maxAvailableLevel = 184;

  // Estados locales en formato texto para permitir borrar el número sin bloqueos
  const [currentInputStr, setCurrentInputStr] = useState<string>(String(districtCurrentLevel));
  const [targetInputStr, setTargetInputStr] = useState<string>(String(districtTargetLevel));

  // Sincronizar inputs si el estado de Zustand cambia externamente
  useEffect(() => {
    setCurrentInputStr(String(districtCurrentLevel));
  }, [districtCurrentLevel]);

  useEffect(() => {
    setTargetInputStr(String(districtTargetLevel));
  }, [districtTargetLevel]);

  // Debounce suave (450ms) para nivel actual
  useEffect(() => {
    if (currentInputStr === '') return;
    const timer = setTimeout(() => {
      const val = parseInt(currentInputStr, 10);
      if (!isNaN(val) && val >= 1 && val < maxAvailableLevel) {
        handleCurrentChange(val);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [currentInputStr]);

  // Debounce suave (450ms) para nivel objetivo
  useEffect(() => {
    if (targetInputStr === '') return;
    const timer = setTimeout(() => {
      const val = parseInt(targetInputStr, 10);
      if (!isNaN(val) && val > districtCurrentLevel && val <= maxAvailableLevel) {
        handleTargetChange(val);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [targetInputStr, districtCurrentLevel]);

  // Calculate costs taking into account skipped/ticketed levels
  const costResult = calculateDistrictCost(
    districtCurrentLevel,
    districtTargetLevel,
    districtsData,
    skippedLevels
  );
  const progressResult = calculateInventoryProgress(costResult.totalMaterials, inventory);

  const handleInspectLevel = (lvl: number) => {
    setInspectedLevel(lvl);
    setActiveSubTab('stepByStep');
    setTimeout(() => {
      inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  // Handle Level Changes with bounding
  const handleCurrentChange = (val: number) => {
    const clamped = Math.max(1, Math.min(maxAvailableLevel - 1, val));
    const newTarget = Math.max(clamped + 1, districtTargetLevel);
    setDistrictLevels(clamped, newTarget);
    if (inspectedLevel <= clamped) {
      setInspectedLevel(clamped + 1);
    }
  };

  const handleTargetChange = (val: number) => {
    const clamped = Math.max(districtCurrentLevel + 1, Math.min(maxAvailableLevel, val));
    setDistrictLevels(districtCurrentLevel, clamped);
  };

  // Handle Quick Presets
  const applyPreset = (target: number) => {
    if (target > districtCurrentLevel) {
      setDistrictLevels(districtCurrentLevel, target);
      setInspectedLevel(districtCurrentLevel + 1);
    }
  };

  // Copy missing list
  const copyMissingList = () => {
    const lines = progressResult.breakdown
      .filter(item => item.missing > 0)
      .map(item => {
        const meta = KNOWN_MATERIALS[item.materialId];
        const name = meta ? meta.name : item.materialId;
        return `• ${name}: faltan ${item.missing.toLocaleString()} (tienes ${item.owned} / pide ${item.required})`;
      });

    const text = `📋 Frostborn: Materiales para Distrito Nivel ${districtCurrentLevel} ➔ ${districtTargetLevel}\n` +
      `Progreso: ${progressResult.overallPercent}%\n\n` +
      (lines.length > 0 ? lines.join('\n') : '¡Todos los materiales están completos!');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fill inventory to complete all requirements
  const fillInventoryToTarget = () => {
    const updates: Record<string, number> = {};
    for (const [matId, req] of Object.entries(costResult.totalMaterials)) {
      updates[matId] = req;
    }
    bulkSetMaterials(updates);
  };

  // Check if user has all materials for a single specific level
  const checkSingleLevelReadiness = (lvlData: DistrictLevel) => {
    const mats = lvlData.requirements.materials || {};
    let allReady = true;
    let missingCount = 0;

    for (const [mId, qty] of Object.entries(mats)) {
      const owned = inventory[mId] || 0;
      if (owned < qty) {
        allReady = false;
        missingCount++;
      }
    }

    const influenceNeeded = lvlData.requirements.influencePoints || 0;
    const ownedInfluence = inventory['influencePoints'] || 0;
    if (influenceNeeded > 0 && ownedInfluence < influenceNeeded) {
      allReady = false;
      missingCount++;
    }

    return { allReady, missingCount };
  };

  // Authentic Wiki Milestone list for quick navigation
  const presets = [
    { lvl: 4, label: 'Taberna 1', tag: 'Nvl 4', color: 'text-nordic-gold' },
    { lvl: 7, label: 'Artesano 1', tag: 'Nvl 7', color: 'text-nordic-gold' },
    { lvl: 11, label: 'Recaudador', tag: 'Nvl 11', color: 'text-nordic-gold' },
    { lvl: 15, label: 'Banco 1', tag: 'Nvl 15', color: 'text-nordic-ice' },
    { lvl: 23, label: 'Chamán 1', tag: 'Nvl 23', color: 'text-purple-400' },
    { lvl: 26, label: 'Arquitecto 1', tag: 'Nvl 26', color: 'text-amber-400' },
    { lvl: 30, label: 'Arquitecto 2', tag: 'Nvl 30', color: 'text-emerald-400' },
    { lvl: 50, label: 'Chamán 2', tag: 'Nvl 50', color: 'text-blue-400' },
    { lvl: 100, label: 'Distrito 100', tag: 'Nvl 100', color: 'text-pink-400' },
    { lvl: 178, label: 'Odín x2 Pts', tag: 'Nvl 178', color: 'text-amber-300' },
    { lvl: 183, label: 'Mesa Reparar', tag: 'Nvl 183', color: 'text-emerald-300' },
    { lvl: 184, label: 'Abrir Distrito', tag: 'Nvl 184', color: 'text-nordic-gold' }
  ];

  const currentInspectedData = districtsData.find(d => d.level === inspectedLevel) || districtsData[0];
  const inspectedReadiness = checkSingleLevelReadiness(currentInspectedData);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-nordic-surface via-nordic-card to-nordic-surface border border-nordic-border p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-nordic-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏛️</span>
              <h1 className="text-2xl sm:text-3xl font-runic font-bold text-nordic-text">
                Calculadora del Distrito de Nuevo Heim
              </h1>
            </div>
            <p className="text-sm text-nordic-muted max-w-2xl">
              Datos verificados de la Wiki Oficial de Frostborn: niveles 1 a 184 con materiales exactos del Carro del Transportista y tasa de impuestos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setShowInfluenceModal(true)}
              className="px-3 py-1.5 rounded-xl bg-nordic-card hover:bg-nordic-surface border border-nordic-ice/40 text-nordic-ice hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Aprende cómo conseguir Puntos de Influencia en Frostborn"
            >
              <HelpCircle className="w-3.5 h-3.5 text-nordic-ice" />
              ¿Cómo conseguir Influencia?
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-nordic-surface border border-nordic-gold/40 text-nordic-gold text-xs font-mono font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              184 Niveles Oficiales
            </span>
          </div>
        </div>
      </div>

      {/* Selectores de Nivel y Metas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Nivel Actual */}
        <div className="lg:col-span-4 bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-nordic-muted">
              Nivel Actual del Distrito
            </label>
            <span className="text-xs font-mono text-nordic-gold">1 - 183</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="183"
              value={currentInputStr}
              placeholder="1"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setCurrentInputStr(e.target.value)}
              onBlur={() => {
                const val = parseInt(currentInputStr, 10);
                if (isNaN(val) || val < 1) {
                  setCurrentInputStr(String(districtCurrentLevel));
                } else {
                  handleCurrentChange(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(currentInputStr, 10);
                  if (!isNaN(val)) handleCurrentChange(val);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              aria-label="Nivel actual del distrito"
              className="w-24 bg-nordic-card border border-nordic-gold/40 rounded-xl px-3 py-2.5 font-runic font-bold text-2xl text-nordic-gold text-center focus:outline-none focus:border-nordic-gold transition-colors"
            />
            <div className="flex-1 flex gap-1.5">
              <button
                onClick={() => handleCurrentChange(districtCurrentLevel - 1)}
                disabled={districtCurrentLevel <= 1}
                className="flex-1 py-2 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-text disabled:opacity-30"
              >
                -1
              </button>
              <button
                onClick={() => handleCurrentChange(districtCurrentLevel + 1)}
                disabled={districtCurrentLevel >= maxAvailableLevel - 1}
                className="flex-1 py-2 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold disabled:opacity-30"
              >
                +1
              </button>
              <button
                onClick={() => handleCurrentChange(districtCurrentLevel + 5)}
                disabled={districtCurrentLevel >= maxAvailableLevel - 5}
                className="flex-1 py-2 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold disabled:opacity-30"
              >
                +5
              </button>
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="183"
            value={districtCurrentLevel}
            onChange={(e) => handleCurrentChange(Number(e.target.value))}
            aria-label="Deslizador de nivel actual"
            className="w-full accent-nordic-gold h-1.5 bg-nordic-card rounded cursor-pointer"
          />
        </div>

        {/* Nivel Objetivo */}
        <div className="lg:col-span-4 bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-nordic-muted">
              Nivel Objetivo a Alcanzar
            </label>
            <span className="text-xs font-mono text-nordic-gold-light">{districtCurrentLevel + 1} - 184</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={districtCurrentLevel + 1}
              max="184"
              value={targetInputStr}
              placeholder={String(districtCurrentLevel + 1)}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTargetInputStr(e.target.value)}
              onBlur={() => {
                const val = parseInt(targetInputStr, 10);
                if (isNaN(val) || val <= districtCurrentLevel) {
                  setTargetInputStr(String(districtTargetLevel));
                } else {
                  handleTargetChange(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(targetInputStr, 10);
                  if (!isNaN(val)) handleTargetChange(val);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              aria-label="Nivel objetivo a alcanzar"
              className="w-24 bg-nordic-card border border-nordic-gold rounded-xl px-3 py-2.5 font-runic font-bold text-2xl text-nordic-gold-light text-center focus:outline-none focus:border-nordic-gold transition-colors"
            />
            <div className="flex-1 flex gap-1.5">
              <button
                onClick={() => handleTargetChange(districtTargetLevel - 1)}
                disabled={districtTargetLevel <= districtCurrentLevel + 1}
                className="flex-1 py-2 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-text disabled:opacity-30"
              >
                -1
              </button>
              <button
                onClick={() => handleTargetChange(districtTargetLevel + 1)}
                disabled={districtTargetLevel >= maxAvailableLevel}
                className="flex-1 py-2 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold disabled:opacity-30"
              >
                +1
              </button>
              <button
                onClick={() => handleTargetChange(districtTargetLevel + 10)}
                disabled={districtTargetLevel >= maxAvailableLevel}
                className="flex-1 py-2 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold disabled:opacity-30"
              >
                +10
              </button>
            </div>
          </div>

          <input
            type="range"
            min={districtCurrentLevel + 1}
            max="184"
            value={districtTargetLevel}
            onChange={(e) => handleTargetChange(Number(e.target.value))}
            aria-label="Deslizador de nivel objetivo"
            className="w-full accent-nordic-gold h-1.5 bg-nordic-card rounded cursor-pointer"
          />
        </div>

        {/* Metas Clave Rápidas */}
        <div className="lg:col-span-4 bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg flex flex-col justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-nordic-muted mb-2">
            Metas y Hitos Clave (1 a 184)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {presets.map((p) => {
              const isCurrentOrPassed = districtCurrentLevel >= p.lvl;
              const isSelected = districtTargetLevel === p.lvl;

              return (
                <button
                  key={p.lvl}
                  onClick={() => applyPreset(p.lvl)}
                  disabled={isCurrentOrPassed}
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-nordic-gold/20 border-nordic-gold text-nordic-gold shadow-sm'
                      : isCurrentOrPassed
                      ? 'bg-nordic-card/30 border-nordic-border/40 text-nordic-muted opacity-40 cursor-not-allowed'
                      : 'bg-nordic-card hover:bg-nordic-card/80 border-nordic-border text-nordic-text'
                  }`}
                >
                  <span className={`block font-bold text-xs ${p.color}`}>{p.tag}</span>
                  <span className="text-[9px] text-nordic-muted block truncate">{p.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen de Progreso General */}
      <div className="rounded-2xl bg-nordic-surface border border-nordic-border p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-nordic-card border border-nordic-border flex items-center justify-center text-nordic-gold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-nordic-text">
                  Distrito {districtCurrentLevel} ➔ {districtTargetLevel}
                </span>
                {progressResult.isComplete ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-600 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ¡Listo para construir!
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-nordic-card text-nordic-muted font-mono">
                    {progressResult.totalOwnedUnits.toLocaleString()} / {progressResult.totalRequiredUnits.toLocaleString()} unidades
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs text-nordic-muted">
                  Requiere subir <strong>{costResult.levelsIncluded.length} niveles</strong> de construcción
                </p>
                {costResult.skippedLevelsIncluded.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-300 font-mono flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-amber-400" />
                      {costResult.skippedLevelsIncluded.length} omitidos con ticket
                    </span>
                    <button
                      onClick={clearSkippedLevels}
                      className="text-[11px] text-nordic-gold hover:underline font-mono"
                      title="Restaurar todos los niveles omitidos para que vuelvan a contarse"
                    >
                      (Restaurar todos)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-3xl font-bold font-mono text-nordic-gold">
                {progressResult.overallPercent}%
              </span>
              <span className="text-xs text-nordic-muted block">progreso total</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className="w-full bg-nordic-card rounded-full h-3.5 p-0.5 border border-nordic-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressResult.isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-nordic-gold-dark via-nordic-gold to-nordic-gold-light'
            }`}
            style={{ width: `${progressResult.overallPercent}%` }}
          />
        </div>
      </div>

      {/* Tabs de Submódulos: 4 Vistas */}
      <div className="flex border-b border-nordic-border gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('stepByStep')}
          className={`pb-3 px-4 text-sm font-medium transition-all whitespace-nowrap relative ${
            activeSubTab === 'stepByStep'
              ? 'text-nordic-gold font-semibold'
              : 'text-nordic-muted hover:text-nordic-text'
          }`}
        >
          <span>📜 Donaciones Nivel por Nivel</span>
          {activeSubTab === 'stepByStep' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nordic-gold rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('shopping')}
          className={`pb-3 px-4 text-sm font-medium transition-all whitespace-nowrap relative ${
            activeSubTab === 'shopping'
              ? 'text-nordic-gold font-semibold'
              : 'text-nordic-muted hover:text-nordic-text'
          }`}
        >
          <span>📋 Materiales Acumulados ({progressResult.breakdown.length})</span>
          {activeSubTab === 'shopping' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nordic-gold rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-3 px-4 text-sm font-medium transition-all whitespace-nowrap relative ${
            activeSubTab === 'inventory'
              ? 'text-nordic-gold font-semibold'
              : 'text-nordic-muted hover:text-nordic-text'
          }`}
        >
          <span>📦 Mi Inventario en Cofres</span>
          {activeSubTab === 'inventory' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nordic-gold rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('unlocks')}
          className={`pb-3 px-4 text-sm font-medium transition-all whitespace-nowrap relative ${
            activeSubTab === 'unlocks'
              ? 'text-nordic-gold font-semibold'
              : 'text-nordic-muted hover:text-nordic-text'
          }`}
        >
          <span>🔓 Desbloqueos ({costResult.unlocks.length})</span>
          {activeSubTab === 'unlocks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nordic-gold rounded-full" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 0: DONACIONES NIVEL POR NIVEL (EL PEDIDO DEL USUARIO)               */}
      {/* ========================================================================= */}
      {activeSubTab === 'stepByStep' && (
        <div className="space-y-6">
          {/* INSPECTOR DE NIVEL INDIVIDUAL ESPECÍFICO */}
          <div ref={inspectorRef} className="bg-gradient-to-r from-nordic-surface via-nordic-card to-nordic-surface rounded-2xl border-2 border-nordic-gold/60 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-xl bg-nordic-card border border-nordic-border">
                  🔍
                </span>
                <div>
                  <h3 className="font-runic font-bold text-lg text-nordic-text flex items-center gap-2">
                    ¿Qué tengo que donar para subir al Nivel {inspectedLevel}?
                  </h3>
                  <p className="text-xs text-nordic-muted">
                    Consulta el coste exacto de entrega que te pedirá el Carro del Transportista para este nivel específico.
                  </p>
                </div>
              </div>

              {/* Selector de Nivel a Inspeccionar y Botón de Ticket */}
              <div className="flex flex-wrap items-center gap-2 bg-nordic-surface px-3 py-1.5 rounded-xl border border-nordic-border">
                <span className="text-xs text-nordic-muted">Ver Nivel:</span>
                <input
                  type="number"
                  min="1"
                  max="184"
                  value={inspectedLevel}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setInspectedLevel(Math.max(1, Math.min(184, Number(e.target.value))))}
                  aria-label="Inspeccionar nivel específico"
                  className="w-20 bg-nordic-card border border-nordic-gold rounded-lg px-2.5 py-1 text-sm font-bold font-mono text-nordic-gold text-center focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setInspectedLevel(districtCurrentLevel + 1)}
                  className="px-2 py-1 bg-nordic-card hover:bg-nordic-border rounded text-[10px] font-medium text-nordic-muted hover:text-nordic-gold"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => toggleSkipLevel(inspectedLevel)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                    skippedLevels.includes(inspectedLevel)
                      ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                      : 'bg-nordic-card hover:bg-nordic-border border-nordic-border text-nordic-muted hover:text-nordic-gold'
                  }`}
                  title="Omitir los materiales de este nivel si usas ticket de autollenado en el juego"
                >
                  <Ticket className={`w-3.5 h-3.5 ${skippedLevels.includes(inspectedLevel) ? 'text-amber-400' : 'text-nordic-muted'}`} />
                  <span>{skippedLevels.includes(inspectedLevel) ? 'Ticket Activo (Omitido)' : 'Omitir con Ticket'}</span>
                </button>
              </div>
            </div>

            {/* Banner si el nivel inspeccionado está saltado con ticket */}
            {skippedLevels.includes(inspectedLevel) && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <strong className="block font-semibold text-amber-300">Nivel {inspectedLevel} completado con Ticket de Carro</strong>
                    <span className="text-[11px] text-amber-200/80">Los recursos de este nivel están excluidos del cálculo total de compras y farmeo.</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleSkipLevel(inspectedLevel)}
                  className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-100 text-[11px] font-medium border border-amber-500/50 transition-colors whitespace-nowrap"
                >
                  Restaurar Nivel
                </button>
              </div>
            )}

            {/* Tarjeta Detallada de Requisitos del Nivel Inspeccionado */}
            <div className="bg-nordic-card/80 rounded-xl p-4 border border-nordic-border/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-nordic-border/60">
                <div className="flex items-center gap-2">
                  <span className="font-runic font-bold text-base text-nordic-gold">
                    Materiales a Entregar para Nivel {inspectedLevel}
                  </span>
                  {currentInspectedData.unlocks && currentInspectedData.unlocks.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-nordic-gold/15 text-nordic-gold border border-nordic-gold/30 font-semibold">
                      {currentInspectedData.unlocks[0]}
                    </span>
                  )}
                </div>

                {inspectedReadiness.allReady ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center">
                    <CheckCircle className="w-4 h-4" /> ¡Tienes todo para este nivel!
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 font-mono font-medium">
                    Faltan {inspectedReadiness.missingCount} materiales en tus cofres
                  </span>
                )}
              </div>

              {/* Grid de Materiales requeridos (Contenedores Rediseñados) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(currentInspectedData.requirements.materials || {}).map(([mId, qty]) => {
                  const meta = KNOWN_MATERIALS[mId];
                  const name = meta ? meta.name : mId;
                  const icon = meta ? meta.icon : '📦';
                  const owned = inventory[mId] || 0;
                  const isReady = owned >= qty;
                  const percent = Math.min(100, Math.round((owned / qty) * 100));

                  return (
                    <div
                      key={mId}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all relative overflow-hidden shadow-sm ${
                        isReady
                          ? 'bg-gradient-to-br from-emerald-950/30 via-nordic-surface to-nordic-card border-emerald-700/60'
                          : 'bg-gradient-to-br from-nordic-surface via-nordic-card to-nordic-surface border-nordic-border hover:border-nordic-gold/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 rounded-lg bg-nordic-card/90 border border-nordic-border/60">{icon}</span>
                          <div>
                            <span className="text-xs font-bold text-nordic-text block tracking-wide">{name}</span>
                            <span className="text-[11px] text-nordic-muted">
                              Pide: <strong className="text-nordic-gold font-mono">{qty.toLocaleString()}</strong> un.
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {isReady ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-600/70 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> Listo
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-rose-400">
                              Faltan {(qty - owned).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Barra de progreso de inventario por material */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-nordic-muted">
                          <span>Tengo: <strong className="text-nordic-text">{owned.toLocaleString()}</strong></span>
                          <span className={isReady ? 'text-emerald-400 font-bold' : 'text-nordic-gold'}>{percent}%</span>
                        </div>
                        <div className="w-full bg-nordic-card/90 rounded-full h-1.5 border border-nordic-border/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isReady ? 'bg-emerald-400' : 'bg-nordic-gold'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Control interactivo para ajustar existencias de este material */}
                      <div className="pt-2 border-t border-nordic-border/50 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-nordic-muted">Tengo:</span>
                          <input
                            type="number"
                            min="0"
                            value={owned === 0 ? '' : owned}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                              setMaterialCount(mId, val);
                            }}
                            className="w-16 bg-nordic-card border border-nordic-border focus:border-nordic-gold rounded px-1.5 py-0.5 text-xs font-mono font-bold text-nordic-text text-center focus:outline-none transition-colors"
                            aria-label={`Existencias de ${name}`}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setMaterialCount(mId, owned + 10)}
                            className="px-1.5 py-0.5 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded text-[10px] font-mono text-nordic-muted hover:text-nordic-gold transition-colors"
                            title="Sumar +10"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => setMaterialCount(mId, owned + 50)}
                            className="px-1.5 py-0.5 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded text-[10px] font-mono text-nordic-muted hover:text-nordic-gold transition-colors"
                            title="Sumar +50"
                          >
                            +50
                          </button>
                          <button
                            onClick={() => setMaterialCount(mId, qty)}
                            className={`px-1.5 py-0.5 border rounded text-[10px] font-mono font-bold transition-all ${
                              isReady
                                ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300'
                                : 'bg-nordic-gold/15 border-nordic-gold/40 text-nordic-gold'
                            }`}
                            title="Llenar cantidad exacta para este nivel"
                          >
                            Nivel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Puntos de influencia si aplica */}
                {(currentInspectedData.requirements.influencePoints || 0) > 0 && (
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                    (inventory['influencePoints'] || 0) >= currentInspectedData.requirements.influencePoints
                      ? 'bg-gradient-to-br from-emerald-950/30 via-nordic-surface to-nordic-card border-emerald-700/60'
                      : 'bg-gradient-to-br from-nordic-surface via-nordic-card to-nordic-surface border-nordic-border hover:border-nordic-gold/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-lg bg-nordic-card/90 border border-nordic-border/60">🎖️</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-nordic-text block">Puntos de Influencia</span>
                            <button
                              onClick={() => setShowInfluenceModal(true)}
                              className="text-nordic-ice hover:text-white transition-colors"
                              title="¿Cómo conseguir influencia?"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-nordic-muted">
                            Pide: <strong className="text-nordic-ice font-mono">{currentInspectedData.requirements.influencePoints.toLocaleString()}</strong> pts
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-nordic-muted font-mono block">
                          Tengo: {inventory['influencePoints'] || 0}
                        </span>
                        <button
                          onClick={() => setShowInfluenceModal(true)}
                          className="text-[10px] text-nordic-ice hover:underline font-medium"
                        >
                          ¿Cómo obtenerlos?
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-nordic-muted">
                        <span>Progreso Influencia</span>
                        <span>{Math.min(100, Math.round(((inventory['influencePoints'] || 0) / currentInspectedData.requirements.influencePoints) * 100))}%</span>
                      </div>
                      <div className="w-full bg-nordic-card/90 rounded-full h-1.5 border border-nordic-border/50 overflow-hidden">
                        <div
                          className="h-full bg-nordic-ice rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, ((inventory['influencePoints'] || 0) / currentInspectedData.requirements.influencePoints) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Control interactivo para ajustar influencia */}
                    <div className="pt-2 border-t border-nordic-border/50 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-nordic-muted">Tengo:</span>
                        <input
                          type="number"
                          min="0"
                          value={(inventory['influencePoints'] || 0) === 0 ? '' : inventory['influencePoints']}
                          placeholder="0"
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                            setMaterialCount('influencePoints', val);
                          }}
                          className="w-20 bg-nordic-card border border-nordic-border focus:border-nordic-gold rounded px-1.5 py-0.5 text-xs font-mono font-bold text-nordic-text text-center focus:outline-none transition-colors"
                          aria-label="Puntos de influencia"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setMaterialCount('influencePoints', (inventory['influencePoints'] || 0) + 100)}
                          className="px-1.5 py-0.5 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded text-[10px] font-mono text-nordic-muted hover:text-nordic-ice transition-colors"
                          title="Sumar +100 pts"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => setMaterialCount('influencePoints', currentInspectedData.requirements.influencePoints)}
                          className="px-1.5 py-0.5 bg-nordic-card hover:bg-nordic-border border border-nordic-border rounded text-[10px] font-mono text-nordic-ice font-bold transition-colors"
                          title="Llenar cantidad exacta para este nivel"
                        >
                          Nivel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón rápido para subir el nivel actual tras donar */}
              <div className="mt-4 pt-3 border-t border-nordic-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-nordic-muted">
                  ¿Ya completaste este nivel en tu juego?
                </span>
                <button
                  onClick={() => {
                    handleCurrentChange(inspectedLevel);
                    setInspectedLevel(inspectedLevel + 1);
                  }}
                  className="px-3 py-1.5 bg-nordic-gold/15 hover:bg-nordic-gold/25 text-nordic-gold border border-nordic-gold/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marcar nivel {inspectedLevel} como completado (Avanzar)</span>
                </button>
              </div>
            </div>
          </div>

          {/* LISTA COMPLETA DE NIVELES DENTRO DEL RANGO SELECCIONADO */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs uppercase font-semibold text-nordic-muted tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-nordic-gold" />
                Entrega Nivel por Nivel ({districtCurrentLevel} ➔ {districtTargetLevel})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-nordic-gold font-mono">
                  {districtTargetLevel - districtCurrentLevel} niveles en total
                </span>
                {costResult.skippedLevelsIncluded.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/50 text-amber-300 font-mono">
                    🎟️ {costResult.skippedLevelsIncluded.length} con ticket
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {Array.from(
                { length: districtTargetLevel - districtCurrentLevel },
                (_, i) => districtCurrentLevel + 1 + i
              ).map((lvlNumber) => {
                const lvlData = districtsData.find(d => d.level === lvlNumber);
                if (!lvlData) return null;

                const isSkipped = skippedLevels.includes(lvlNumber);
                const readiness = checkSingleLevelReadiness(lvlData);
                const mats = lvlData.requirements.materials || {};

                return (
                  <div
                    key={lvlNumber}
                    className={`rounded-xl border p-4 transition-all ${
                      isSkipped
                        ? 'bg-amber-950/15 border-dashed border-amber-500/60 opacity-90'
                        : readiness.allReady
                        ? 'bg-nordic-surface border-emerald-700/50'
                        : 'bg-nordic-surface border-nordic-border hover:border-nordic-gold/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-nordic-border/50">
                      <div className="flex items-center gap-2">
                        <span className={`font-runic font-bold text-sm ${isSkipped ? 'text-amber-400' : 'text-nordic-gold'}`}>
                          Nivel {lvlNumber}
                        </span>
                        {isSkipped ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/60 font-medium flex items-center gap-1">
                            <Ticket className="w-3 h-3 text-amber-400" />
                            Omitido por Ticket
                          </span>
                        ) : lvlData.unlocks && lvlData.unlocks.length > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-nordic-card text-nordic-text border border-nordic-border font-medium">
                            {lvlData.unlocks[0]}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botón de Ticket de Autollenado */}
                        <button
                          onClick={() => toggleSkipLevel(lvlNumber)}
                          className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                            isSkipped
                              ? 'bg-amber-900/50 hover:bg-amber-900/70 text-amber-200 border border-amber-500/50'
                              : 'bg-nordic-card hover:bg-nordic-border border border-nordic-border text-nordic-muted hover:text-nordic-gold'
                          }`}
                          title="Marcar si vas a saltar este nivel usando un ticket de autollenado"
                        >
                          <Ticket className="w-3 h-3 text-amber-400" />
                          <span>{isSkipped ? 'Desmarcar Ticket' : '🎟️ Ticket'}</span>
                        </button>

                        {!isSkipped && (
                          readiness.allReady ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-700">
                              Listo
                            </span>
                          ) : (
                            <span className="text-[11px] text-nordic-muted font-mono">
                              Faltan {readiness.missingCount}
                            </span>
                          )
                        )}

                        {/* Botón Inspeccionar funcional con scroll */}
                        <button
                          onClick={() => handleInspectLevel(lvlNumber)}
                          className="px-2.5 py-1 rounded bg-nordic-card hover:bg-nordic-border border border-nordic-border text-xs text-nordic-gold hover:text-white font-medium flex items-center gap-1 transition-colors shadow-sm"
                          title="Inspeccionar requisitos detallados de este nivel"
                        >
                          <span>🔍</span>
                          <span>Inspeccionar</span>
                        </button>
                      </div>
                    </div>

                    {/* Chips de materiales */}
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(mats).map(([mId, qty]) => {
                        const meta = KNOWN_MATERIALS[mId];
                        const icon = meta ? meta.icon : '📦';
                        const name = meta ? meta.name : mId;
                        const owned = inventory[mId] || 0;
                        const isEnough = owned >= qty;

                        return (
                          <span
                            key={mId}
                            className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 border transition-all ${
                              isSkipped
                                ? 'bg-nordic-card/40 text-nordic-muted line-through border-nordic-border/30 opacity-70'
                                : isEnough
                                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                                : 'bg-nordic-card text-nordic-text border-nordic-border'
                            }`}
                          >
                            <span>{icon}</span>
                            <span>{name}:</span>
                            <strong className={isSkipped ? 'text-nordic-muted' : isEnough ? 'text-emerald-400' : 'text-nordic-gold'}>
                              {qty.toLocaleString()}
                            </strong>
                          </span>
                        );
                      })}

                      {lvlData.requirements.influencePoints > 0 && (
                        <span className={`px-2 py-1 rounded-md text-xs font-mono border flex items-center gap-1.5 ${
                          isSkipped
                            ? 'bg-nordic-card/40 text-nordic-muted line-through border-nordic-border/30 opacity-70'
                            : 'bg-nordic-card text-nordic-ice border-nordic-border'
                        }`}>
                          <span>🎖️</span>
                          <span>Influencia: {lvlData.requirements.influencePoints.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 1: SHOPPING & FARMING LIST (TOTAL ACUMULADO CON ENTRADA DIRECTA)    */}
      {/* ========================================================================= */}
      {activeSubTab === 'shopping' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-nordic-muted font-semibold block">
                Desglose Total Acumulado ({costResult.levelsIncluded.length} Niveles de Construcción)
              </span>
              <p className="text-xs text-nordic-muted">
                Ingresa aquí mismo las cantidades que tienes en tus cofres para ver lo que te falta en tiempo real.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyMissingList}
                className="px-3 py-1.5 rounded-lg bg-nordic-card hover:bg-nordic-border/60 border border-nordic-border text-xs font-medium text-nordic-text flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-nordic-gold" />}
                <span>{copied ? '¡Copiado!' : 'Copiar lista de compras'}</span>
              </button>
              <button
                onClick={fillInventoryToTarget}
                className="px-3 py-1.5 rounded-lg bg-nordic-gold/15 hover:bg-nordic-gold/25 border border-nordic-gold/40 text-xs font-medium text-nordic-gold transition-colors shadow-sm"
              >
                Marcar todo como obtenido
              </button>
              <button
                onClick={resetInventory}
                className="px-3 py-1.5 rounded-lg bg-nordic-card hover:bg-nordic-border border border-nordic-border text-xs text-nordic-muted hover:text-rose-400 flex items-center gap-1.5 transition-colors shadow-sm"
                title="Vaciar todo el inventario a 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Vaciar todo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {progressResult.breakdown.map((item) => {
              const meta = KNOWN_MATERIALS[item.materialId];
              const name = meta ? meta.name : (item.materialId === 'influencePoints' ? 'Puntos de Influencia' : item.materialId);
              const icon = meta ? meta.icon : (item.materialId === 'influencePoints' ? '🎖️' : '📦');
              const isDone = item.missing === 0;
              const stepBig = item.required >= 500 ? 200 : 100;

              return (
                <div
                  key={item.materialId}
                  className={`rounded-xl border p-4 transition-all space-y-3 shadow-sm ${
                    isDone
                      ? 'bg-gradient-to-br from-emerald-950/30 via-nordic-surface to-nordic-card border-emerald-700/60'
                      : 'bg-gradient-to-br from-nordic-surface via-nordic-card to-nordic-surface border-nordic-border hover:border-nordic-gold/50'
                  }`}
                >
                  {/* Cabecera del material con icono y estado */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-nordic-card/90 border border-nordic-border/60 shadow-sm">
                        {icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-nordic-text block">
                            {name}
                          </span>
                          {meta?.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-nordic-card text-nordic-muted border border-nordic-border uppercase font-mono">
                              {meta.category}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-nordic-muted">
                          Pide: <strong className="text-nordic-gold font-mono font-bold">{item.required.toLocaleString()}</strong> un.
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {isDone ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold text-xs border border-emerald-600/70 flex items-center gap-1 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> ¡Completo!
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-rose-400">
                          Faltan -{item.missing.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-bold text-nordic-gold mt-0.5">
                        {item.percent}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="w-full bg-nordic-card/90 rounded-full h-2 overflow-hidden border border-nordic-border/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-nordic-gold-dark to-nordic-gold-light'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>

                  {/* Fila interactiva para ingresar lo que tengo en cofres */}
                  <div className="bg-nordic-card/70 p-2.5 rounded-xl border border-nordic-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-nordic-muted whitespace-nowrap">
                        Tengo en cofres:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.owned === 0 ? '' : item.owned}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                          setMaterialCount(item.materialId, val);
                        }}
                        aria-label={`Cantidad que tengo de ${name}`}
                        className="w-24 bg-nordic-surface border border-nordic-border focus:border-nordic-gold rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-nordic-text text-center focus:outline-none transition-colors placeholder-nordic-muted/40"
                      />
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        onClick={() => setMaterialCount(item.materialId, item.owned + 10)}
                        className="px-2 py-1 bg-nordic-surface hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold transition-colors"
                        title="Sumar +10"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => setMaterialCount(item.materialId, item.owned + 50)}
                        className="px-2 py-1 bg-nordic-surface hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold transition-colors"
                        title="Sumar +50"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => setMaterialCount(item.materialId, item.owned + stepBig)}
                        className="px-2 py-1 bg-nordic-surface hover:bg-nordic-border border border-nordic-border rounded-lg text-xs font-mono text-nordic-muted hover:text-nordic-gold transition-colors"
                        title={`Sumar +${stepBig}`}
                      >
                        +{stepBig}
                      </button>
                      <button
                        onClick={() => setMaterialCount(item.materialId, item.required)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                          isDone
                            ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300'
                            : 'bg-nordic-gold/15 hover:bg-nordic-gold/30 border-nordic-gold/40 text-nordic-gold'
                        }`}
                        title="Completar todo lo requerido"
                      >
                        Max
                      </button>
                      {item.owned > 0 && (
                        <button
                          onClick={() => setMaterialCount(item.materialId, 0)}
                          className="p-1 hover:bg-nordic-border text-nordic-muted hover:text-rose-400 rounded-lg text-xs transition-colors"
                          title="Vaciar este material a 0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: INVENTARIO EN COFRES                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-nordic-text">
                Gestión Rápida de tus Existencias
              </h3>
              <p className="text-xs text-nordic-muted">
                Ingresa lo que tienes en tus cofres para actualizar tu porcentaje de progreso.
              </p>
            </div>
            <button
              onClick={resetInventory}
              className="px-3 py-1.5 rounded-lg bg-nordic-card hover:bg-nordic-border/60 border border-nordic-border text-xs text-nordic-muted hover:text-nordic-blood flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar inventario</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.keys(costResult.totalMaterials).map((matId) => {
              const meta = KNOWN_MATERIALS[matId];
              const name = meta ? meta.name : matId;
              const icon = meta ? meta.icon : '📦';
              const owned = inventory[matId] || 0;
              const required = costResult.totalMaterials[matId];

              return (
                <div
                  key={matId}
                  className="bg-nordic-surface rounded-xl border border-nordic-border p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="text-xs font-semibold text-nordic-text">{name}</span>
                    </div>
                    <span className="text-[10px] text-nordic-muted font-mono">
                      Meta: {required.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={owned === 0 ? '' : owned}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                        setMaterialCount(matId, val);
                      }}
                      aria-label={`Cantidad de ${name}`}
                      className="w-full bg-nordic-card border border-nordic-border rounded-lg px-2.5 py-1.5 text-sm font-mono text-nordic-text focus:outline-none focus:border-nordic-gold placeholder-nordic-muted/40 transition-colors"
                    />
                    <button
                      onClick={() => setMaterialCount(matId, owned + 50)}
                      className="px-2 py-1.5 bg-nordic-card hover:bg-nordic-border rounded text-[11px] font-mono text-nordic-muted hover:text-nordic-gold border border-nordic-border"
                    >
                      +50
                    </button>
                    <button
                      onClick={() => setMaterialCount(matId, required)}
                      className="px-2 py-1.5 bg-nordic-card hover:bg-nordic-border rounded text-[11px] font-mono text-nordic-muted hover:text-emerald-400 border border-nordic-border"
                    >
                      Max
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SUBTAB 3: DESBLOQUEOS POR NIVEL & ARQUITECTO                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'unlocks' && (
        <div className="space-y-4">
          {/* DESTACADO: PUERTAS Y ALMACÉN DE LA BASE (ARQUITECTO) */}
          <div className="bg-gradient-to-r from-nordic-surface via-nordic-card to-nordic-surface border-2 border-nordic-gold/60 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-nordic-border/60">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl p-2 rounded-xl bg-nordic-card border border-nordic-border">🚪</span>
                <div>
                  <h3 className="font-runic font-bold text-base sm:text-lg text-nordic-text flex items-center gap-2">
                    Límites de Puertas y Cofres en tu Base (Arquitecto)
                  </h3>
                  <p className="text-xs text-nordic-muted">
                    Todos los niveles del Distrito donde el Arquitecto expande el número máximo de puertas y cofres de tu campamento.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-nordic-gold/15 text-nordic-gold font-mono font-bold text-xs border border-nordic-gold/30 self-start sm:self-auto">
                Total Máximo: +22 Puertas • +13 Cofres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                districtCurrentLevel >= 26
                  ? 'bg-emerald-950/20 border-emerald-700/50'
                  : 'bg-nordic-card border-nordic-border'
              }`}>
                <div className="flex items-center justify-between font-bold text-nordic-gold">
                  <span>Nivel 26</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-nordic-surface font-mono">Arquitecto I</span>
                </div>
                <p className="text-[11px] text-nordic-text">Habilita el oficio de Arquitecto.</p>
                <span className="text-[10px] text-nordic-muted block">Permite expandir puertas y cofres (PJ Nvl 36)</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                districtCurrentLevel >= 30
                  ? 'bg-emerald-950/20 border-emerald-700/50'
                  : 'bg-nordic-card border-nordic-gold/40'
              }`}>
                <div className="flex items-center justify-between font-bold text-nordic-gold">
                  <span>Nivel 30</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-nordic-surface font-mono">Arquitecto II</span>
                </div>
                <p className="text-xs text-emerald-400 font-bold">🚪 +4 Puertas • 📦 +3 Cofres</p>
                <span className="text-[10px] text-nordic-ice block">+1 Ranura Runa de Clase</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                districtCurrentLevel >= 54
                  ? 'bg-emerald-950/20 border-emerald-700/50'
                  : 'bg-nordic-card border-nordic-gold/40'
              }`}>
                <div className="flex items-center justify-between font-bold text-nordic-gold">
                  <span>Nivel 54</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-nordic-surface font-mono">Arquitecto III</span>
                </div>
                <p className="text-xs text-emerald-400 font-bold">🚪 +5 Puertas • 📦 +3 Cofres</p>
                <span className="text-[10px] text-nordic-muted block">Acumulado: +9 Puertas • +6 Cofres</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                districtCurrentLevel >= 60
                  ? 'bg-emerald-950/20 border-emerald-700/50'
                  : 'bg-nordic-card border-nordic-gold/40'
              }`}>
                <div className="flex items-center justify-between font-bold text-nordic-gold">
                  <span>Nivel 60</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-nordic-surface font-mono">Arquitecto IV</span>
                </div>
                <p className="text-xs text-emerald-400 font-bold">🚪 +6 Puertas • 📦 +3 Cofres</p>
                <span className="text-[10px] text-nordic-ice block">+1 Ranura Runa de Clase</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                districtCurrentLevel >= 69
                  ? 'bg-emerald-950/20 border-emerald-700/50'
                  : 'bg-nordic-card border-nordic-gold/60'
              }`}>
                <div className="flex items-center justify-between font-bold text-nordic-gold">
                  <span>Nivel 69</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-nordic-surface font-mono">Arquitecto V</span>
                </div>
                <p className="text-xs text-nordic-gold font-bold">🚪 +7 Puertas • 📦 +4 Cofres</p>
                <span className="text-[10px] text-amber-300 block font-semibold">Máximo de Arquitecto</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-nordic-surface border border-nordic-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-nordic-text flex items-center gap-2">
                  <Award className="w-4 h-4 text-nordic-gold" />
                  Desbloqueos entre Nivel {districtCurrentLevel} y {districtTargetLevel}
                </h3>
                <p className="text-xs text-nordic-muted">
                  Servicios de Nuevo Heim, estaciones de trabajo, recetas y capacidades de cofres.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-nordic-card p-1 rounded-lg border border-nordic-border text-xs">
                <button
                  onClick={() => setUnlockFilter('milestones')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    unlockFilter === 'milestones'
                      ? 'bg-nordic-gold text-black font-semibold'
                      : 'text-nordic-muted hover:text-nordic-text'
                  }`}
                >
                  Hitos Clave
                </button>
                <button
                  onClick={() => setUnlockFilter('doors')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    unlockFilter === 'doors'
                      ? 'bg-nordic-gold text-black font-semibold'
                      : 'text-nordic-muted hover:text-nordic-text'
                  }`}
                >
                  🚪 Puertas & Base
                </button>
                <button
                  onClick={() => setUnlockFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    unlockFilter === 'all'
                      ? 'bg-nordic-gold text-black font-semibold'
                      : 'text-nordic-muted hover:text-nordic-text'
                  }`}
                >
                  Todos los Niveles ({costResult.levelsIncluded.length})
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {Array.from(
                { length: districtTargetLevel - districtCurrentLevel },
                (_, i) => districtCurrentLevel + 1 + i
              )
                .filter(lvlNum => {
                  if (unlockFilter === 'all') return true;
                  if (unlockFilter === 'doors') {
                    return [26, 30, 54, 60, 69].includes(lvlNum) || lvlNum <= 10;
                  }
                  return lvlNum <= 20 || lvlNum % 5 === 0 || [26, 30, 54, 60, 69].includes(lvlNum);
                })
                .map((lvlNumber) => {
                  const lvlData = districtsData.find(d => d.level === lvlNumber);
                  if (!lvlData) return null;

                  return (
                    <div
                      key={lvlNumber}
                      className="bg-nordic-card/60 rounded-xl border border-nordic-border/70 p-3.5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-runic font-bold text-sm text-nordic-gold flex items-center gap-1.5">
                          Nivel {lvlNumber}
                          <ArrowRight className="w-3.5 h-3.5 text-nordic-muted" />
                        </span>
                        {lvlData.maxChests && (
                          <span className="text-[11px] text-nordic-muted font-mono">
                            📦 Límite: {lvlData.maxChests} cofres • 🚪 {lvlData.maxDoors} puertas
                          </span>
                        )}
                      </div>

                      <ul className="space-y-1">
                        {lvlData.unlocks.map((unlock, idx) => (
                          <li key={idx} className="text-xs text-nordic-text flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-nordic-gold flex-shrink-0" />
                            <span>{unlock}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFORMATIVO: CÓMO CONSEGUIR PUNTOS DE INFLUENCIA */}
      {showInfluenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-nordic-surface border-2 border-nordic-gold/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-nordic-border">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎖️</span>
                <div>
                  <h3 className="text-lg font-runic font-bold text-nordic-text">
                    ¿Cómo Conseguir Puntos de Influencia?
                  </h3>
                  <p className="text-xs text-nordic-muted">Guía de Reputación Cívica para Nuevo Heim</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfluenceModal(false)}
                className="p-1.5 rounded-lg bg-nordic-card hover:bg-nordic-border text-nordic-muted hover:text-nordic-text transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-nordic-text leading-relaxed">
              <div className="p-3.5 rounded-xl bg-nordic-card/60 border border-nordic-border space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-nordic-gold text-sm">
                  <span>🍺 1. Misiones Diarias de la Taberna</span>
                </div>
                <p className="text-nordic-muted">
                  Se desbloquea al alcanzar el <strong>Nivel 4 del Distrito</strong>. Dentro de la taberna de Nuevo Heim, habla con los PNJ y el Tabernero. Ofrecen encargos diarios de entrega de alimentos cocinados, pociones o cacería de monstruos en zonas salvajes.
                </p>
                <span className="inline-block px-2 py-0.5 rounded bg-nordic-gold/10 text-nordic-gold text-[10px] font-semibold border border-nordic-gold/20">
                  Recompensa: Puntos de Influencia + Monedas de Plata
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-nordic-card/60 border border-nordic-border space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-nordic-gold text-sm">
                  <span>🏆 2. Torneos Diarios (24 Horas)</span>
                </div>
                <p className="text-nordic-muted">
                  Compite en la tabla de clasificación diaria realizando acciones del evento (talar árboles, picar rocas, derrotar no-muertos). Al alcanzar los hitos de puntos y quedar en los puestos más altos (Top 5% o Top 15%), ganas cofres de torneo cargados de Influencia.
                </p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 text-[10px] font-semibold border border-emerald-800/40">
                  Consejo: Farmea madera o piedra cuando coincida con el torneo
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-nordic-card/60 border border-nordic-border space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-nordic-gold text-sm">
                  <span>📜 3. Pases y Tareas de Temporada</span>
                </div>
                <p className="text-nordic-muted">
                  Los eventos y pases de temporada de Frostborn incluyen desafíos semanales que entregan grandes paquetes de Puntos de Influencia y cofres de suministros de la capital.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-nordic-card/60 border border-nordic-border space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-nordic-gold text-sm">
                  <span>🛡️ 4. Actividades de Familia y Expediciones</span>
                </div>
                <p className="text-nordic-muted">
                  Ciertas expediciones de clan, asedios y cofres de mazmorras de alto nivel contienen sellos e insignias de reputación cívica para Nuevo Heim.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-nordic-gold/10 border border-nordic-gold/30 text-nordic-gold-light text-[11px]">
                <strong>💡 Regla de Oro:</strong> A partir del nivel 22, los niveles del distrito van alternando: unos te piden materiales + Influencia (ej. nivel 22 pide 10 pts, nivel 32 pide 20 pts), y otros materiales + Monedas de Plata. ¡Nunca gastes toda tu plata en compras impulsivas ni descuides los encargos de taberna!
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfluenceModal(false)}
                className="px-4 py-2 bg-nordic-gold text-black font-bold text-xs rounded-xl hover:bg-nordic-gold-light transition-colors shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
