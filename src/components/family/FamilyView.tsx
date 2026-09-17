import React, { useState, useEffect } from 'react';
import { useFamilyStore } from '../../stores/useFamilyStore';
import familyLayoutsDataRaw from '../../data/familyLayouts.json';
import {
  Shield,
  CheckCircle2,
  ChevronRight,
  Check,
  Edit2
} from 'lucide-react';

export const FamilyView: React.FC = () => {
  const {
    familyName,
    activeLayoutId,
    shieldEndTime,
    members,
    setFamilyName,
    setActiveLayoutId,
    updateMember,
    toggleMemberGear,
    setShieldDurationHours,
    clearShield
  } = useFamilyStore();

  const [activeTab, setActiveTab] = useState<'layouts' | 'roles' | 'chests' | 'shield'>('layouts');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(familyName);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  const blueprints = familyLayoutsDataRaw.blueprints;
  const wallTiers = familyLayoutsDataRaw.wallTiers;
  const chestCategories = familyLayoutsDataRaw.chestCategories;

  const currentLayout = blueprints.find((b) => b.id === activeLayoutId) || blueprints[0];

  // Shield countdown timer effect
  useEffect(() => {
    if (!shieldEndTime) {
      setTimeLeftStr('Sin escudo activo');
      return;
    }

    const interval = setInterval(() => {
      const diff = shieldEndTime - Date.now();
      if (diff <= 0) {
        setTimeLeftStr('¡ESCUDO EXPIRADO!');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [shieldEndTime]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setFamilyName(tempName.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-nordic-surface via-nordic-card to-nordic-surface border border-nordic-border p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-nordic-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏰</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="bg-nordic-surface border border-nordic-gold rounded-lg px-3 py-1 text-lg font-runic font-bold text-nordic-gold focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-nordic-gold text-black font-bold text-xs"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-runic font-bold text-nordic-text">
                    {familyName}
                  </h1>
                  <button
                    onClick={() => {
                      setTempName(familyName);
                      setEditingName(true);
                    }}
                    className="text-nordic-muted hover:text-nordic-gold transition-colors p-1"
                    title="Editar nombre de la familia"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-nordic-muted max-w-2xl">
              Planificación táctica de base de 4 parcelas, composiciones de combate PvP/PvE, guía de almacenamiento seguro y control de asedios.
            </p>
          </div>

          {/* Estado del Escudo de Protección */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              shieldEndTime && shieldEndTime > Date.now()
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
            }`}>
              <Shield className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-nordic-muted">
                  Escudo de Asedio
                </span>
                <span className="text-xs font-mono font-bold">
                  {timeLeftStr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Category Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-nordic-surface rounded-2xl border border-nordic-border scrollbar-none">
        <button
          onClick={() => setActiveTab('layouts')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'layouts'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>🏰</span>
          <span>Plantillas & Materiales</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>🛡️</span>
          <span>Integrantes & Roles ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chests')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'chests'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>📦</span>
          <span>Organización de Almacén</span>
        </button>

        <button
          onClick={() => setActiveTab('shield')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'shield'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>⏰</span>
          <span>Control de Escudo</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: PLANTILLAS Y PLANOS DE BASE                                     */}
      {/* ========================================================================= */}
      {activeTab === 'layouts' && (
        <div className="space-y-6">
          {/* Selector de Plantillas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blueprints.map((bp) => {
              const isSelected = bp.id === activeLayoutId;
              return (
                <div
                  key={bp.id}
                  onClick={() => setActiveLayoutId(bp.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-nordic-card border-2 border-nordic-gold shadow-lg shadow-nordic-gold/10'
                      : 'bg-nordic-surface border-nordic-border hover:border-nordic-gold/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-nordic-gold/15 text-nordic-gold font-semibold border border-nordic-gold/30">
                        {bp.tag}
                      </span>
                      <span className="text-[11px] text-nordic-muted font-mono">
                        {bp.difficulty}
                      </span>
                    </div>

                    <h3 className="font-runic font-bold text-base text-nordic-text">
                      {bp.name}
                    </h3>
                    <p className="text-xs text-nordic-muted line-clamp-3">
                      {bp.overview}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-nordic-border/60 flex items-center justify-between text-xs">
                    <span className={isSelected ? 'text-nordic-gold font-bold' : 'text-nordic-muted'}>
                      {isSelected ? '✓ Diseño Activo' : 'Seleccionar diseño'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-nordic-gold" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalle de la Plantilla Seleccionada */}
          <div className="rounded-2xl bg-nordic-surface border border-nordic-border p-6 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nordic-border">
              <div>
                <span className="text-xs font-mono text-nordic-gold uppercase tracking-wider block">
                  Plano Seleccionado
                </span>
                <h2 className="text-xl font-runic font-bold text-nordic-text">
                  {currentLayout.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-nordic-card text-nordic-muted text-xs border border-nordic-border font-mono">
                  Base de 4 Parcelas
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Vista previa de Cuadrícula (Map Grid Preview) */}
              <div className="lg:col-span-5 bg-nordic-card/80 border border-nordic-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-nordic-muted">
                  <span className="font-semibold uppercase tracking-wider">Esquema de Distribución (7x7)</span>
                  <span>4 Miembros</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 bg-[#05080f] p-3 rounded-lg border border-nordic-border">
                  {currentLayout.gridPreview.flatMap((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      let bgClass = 'bg-nordic-surface/60 border-nordic-border/40';
                      if (cell === '👑') bgClass = 'bg-amber-950/60 border-nordic-gold text-nordic-gold shadow-sm';
                      if (cell === '🛡️') bgClass = 'bg-sky-950/50 border-sky-500/60 text-sky-300';
                      if (cell === '🚪') bgClass = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300';
                      if (cell === '🕳️') bgClass = 'bg-rose-950/50 border-rose-500/60 text-rose-300';
                      if (cell === '🛏️') bgClass = 'bg-indigo-950/50 border-indigo-500/60 text-indigo-300';
                      if (cell === '🔨') bgClass = 'bg-purple-950/50 border-purple-500/60 text-purple-300';

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`aspect-square rounded-lg border flex items-center justify-center text-sm sm:text-base font-bold transition-all hover:scale-105 ${bgClass}`}
                          title={`Fila ${rIdx + 1}, Columna ${cIdx + 1}: ${cell}`}
                        >
                          {cell}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] text-nordic-muted pt-1">
                  <span>🧱 Pared</span>
                  <span>🚪 Puerta</span>
                  <span>📦 Cofre</span>
                  <span>👑 Cámara</span>
                  <span>🛏️ Hab. Miembro</span>
                  <span>🔨 Crafteo</span>
                </div>
              </div>

              {/* Características & Materiales Requeridos */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-nordic-gold uppercase tracking-wider mb-2">
                    Principales Claves de Defensa
                  </h4>
                  <ul className="space-y-1.5">
                    {currentLayout.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="text-xs text-nordic-text flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-nordic-gold flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-nordic-border/60">
                  <h4 className="text-xs font-semibold text-nordic-gold uppercase tracking-wider mb-3">
                    Estimación de Estructuras Requeridas
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-between">
                      <span className="text-nordic-muted">Paredes Pino:</span>
                      <strong className="text-nordic-text">{currentLayout.estimatedMaterials.pine_walls}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-between">
                      <span className="text-nordic-muted">Paredes Piedra:</span>
                      <strong className="text-nordic-gold">{currentLayout.estimatedMaterials.stone_walls}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-between">
                      <span className="text-nordic-muted">Paredes Hierro:</span>
                      <strong className="text-nordic-ice">{currentLayout.estimatedMaterials.iron_walls}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-between">
                      <span className="text-nordic-muted">Paredes Acero:</span>
                      <strong className="text-emerald-400">{currentLayout.estimatedMaterials.steel_walls}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-between">
                      <span className="text-nordic-muted">Trampas Oso:</span>
                      <strong className="text-rose-400">{currentLayout.estimatedMaterials.bear_traps}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-nordic-card border border-nordic-border flex items-center justify-between">
                      <span className="text-nordic-muted">Puertas:</span>
                      <strong className="text-nordic-text">{currentLayout.estimatedMaterials.doors}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Niveles de Paredes y Resistencia */}
          <div className="rounded-2xl bg-nordic-surface border border-nordic-border p-6 shadow-lg space-y-4">
            <h3 className="text-base font-runic font-bold text-nordic-text flex items-center gap-2">
              <span>🛡️</span> Niveles de Estructuras y Resistencia de Asedio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {wallTiers.map((tier) => (
                <div key={tier.tier} className="bg-nordic-card rounded-xl border border-nordic-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tier.icon}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-nordic-surface border border-nordic-border font-mono text-nordic-gold font-bold">
                      Tier {tier.tier}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-nordic-text">{tier.name}</h4>
                  <div className="text-xs text-nordic-muted space-y-1">
                    <p>Vida: <strong className="text-nordic-gold">{tier.durability}</strong></p>
                    <p className="text-[11px]">{tier.raidResistance}</p>
                    <div className="pt-1.5 border-t border-nordic-border/50 text-[10px] font-mono text-nordic-ice">
                      Coste: {tier.materialsPerWall}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guía de Construcción Paso a Paso para Guiarse */}
          <div className="rounded-2xl bg-nordic-surface border border-nordic-border p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-nordic-gold uppercase tracking-wider block">
                  Guía Táctica de Construcción
                </span>
                <h3 className="text-base font-runic font-bold text-nordic-text flex items-center gap-2">
                  <span>🛠️</span> ¿Cómo Construir tu Base Paso a Paso? (Pauta de Guiado)
                </h3>
              </div>
              <span className="text-xs text-nordic-muted font-mono hidden sm:block">5 Fases de Montaje</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {(familyLayoutsDataRaw.buildingSteps || []).map((step) => (
                <div key={step.step} className="bg-nordic-card rounded-xl border border-nordic-border p-3.5 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{step.icon}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nordic-gold/20 text-nordic-gold font-bold">
                        Fase {step.step}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-nordic-text leading-snug">{step.title}</h4>
                  </div>
                  <p className="text-[11px] text-nordic-muted leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: INTEGRANTES & ROLES DE FAMILIA                                  */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-nordic-surface p-4 rounded-xl border border-nordic-border">
            <div>
              <h3 className="font-runic font-bold text-base text-nordic-text">
                Gestor de Integrantes de la Familia (4 Máximo)
              </h3>
              <p className="text-xs text-nordic-muted">
                Asigna nombres, contraclases y verifica que cada miembro tenga listo su equipamiento antes de raids o PvP.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-nordic-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-nordic-card border border-nordic-gold/50 flex items-center justify-center font-bold text-nordic-gold font-mono">
                      #{member.id}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(member.id, { name: e.target.value })}
                        className="bg-transparent font-bold text-sm text-nordic-text focus:outline-none focus:border-b border-nordic-gold"
                        aria-label={`Nombre del Miembro ${member.id}`}
                      />
                      <span className="text-[11px] text-nordic-gold block font-mono">
                        {member.roleTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-nordic-muted tracking-wider block mb-1">
                      Subclase Asignada
                    </label>
                    <input
                      type="text"
                      value={member.subclassName}
                      onChange={(e) => updateMember(member.id, { subclassName: e.target.value })}
                      className="w-full bg-nordic-card border border-nordic-border rounded-lg px-3 py-1.5 text-xs text-nordic-text focus:outline-none focus:border-nordic-gold"
                      aria-label={`Subclase de ${member.name}`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-nordic-muted tracking-wider block mb-1">
                      Notas Tácticas del Miembro
                    </label>
                    <textarea
                      value={member.notes}
                      onChange={(e) => updateMember(member.id, { notes: e.target.value })}
                      rows={2}
                      className="w-full bg-nordic-card border border-nordic-border rounded-lg p-2.5 text-xs text-nordic-muted focus:outline-none focus:border-nordic-gold resize-none"
                    />
                  </div>

                  {/* Readiness Checklist */}
                  <div className="pt-2 border-t border-nordic-border/50 space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-nordic-gold tracking-wider block">
                      Checklist de Equipamiento PvP / Raid
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => toggleMemberGear(member.id, 'weaponReady')}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          member.gearCheck.weaponReady
                            ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                            : 'bg-nordic-card border-nordic-border text-nordic-muted'
                        }`}
                      >
                        <span>🗡️ Arma Principal</span>
                        {member.gearCheck.weaponReady && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => toggleMemberGear(member.id, 'armorReady')}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          member.gearCheck.armorReady
                            ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                            : 'bg-nordic-card border-nordic-border text-nordic-muted'
                        }`}
                      >
                        <span>🛡️ Set Armadura</span>
                        {member.gearCheck.armorReady && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => toggleMemberGear(member.id, 'potionsReady')}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          member.gearCheck.potionsReady
                            ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                            : 'bg-nordic-card border-nordic-border text-nordic-muted'
                        }`}
                      >
                        <span>🧪 Pociones Curativas</span>
                        {member.gearCheck.potionsReady && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => toggleMemberGear(member.id, 'supportStaffReady')}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          member.gearCheck.supportStaffReady
                            ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                            : 'bg-nordic-card border-nordic-border text-nordic-muted'
                        }`}
                      >
                        <span>🪄 Bastón Soporte</span>
                        {member.gearCheck.supportStaffReady && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: ORGANIZACIÓN DE ALMACÉN                                         */}
      {/* ========================================================================= */}
      {activeTab === 'chests' && (
        <div className="space-y-6">
          <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-lg space-y-4">
            <h3 className="text-base font-runic font-bold text-nordic-text flex items-center gap-2">
              <span>📦</span> Reglas de Seguridad y Clasificación de Cofres
            </h3>
            <p className="text-xs text-nordic-muted">
              Evita perder tus armas valiosas en incursiones enemigas siguiendo esta estructura de almacenamiento en las 4 parcelas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chestCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-nordic-card rounded-xl border border-nordic-border p-4 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-nordic-text">{cat.title}</h4>
                      <span className="text-[10px] font-mono text-nordic-gold font-semibold block">
                        Prioridad: {cat.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-nordic-muted pt-2 border-t border-nordic-border/50">
                    {cat.recommendedItems}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CONTROL DE ESCUDO DE ASIEDIO                                    */}
      {/* ========================================================================= */}
      {activeTab === 'shield' && (
        <div className="space-y-6">
          <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-6 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-nordic-gold uppercase tracking-wider block">
                  Protección de Base post-Asedio
                </span>
                <h3 className="text-xl font-runic font-bold text-nordic-text flex items-center gap-2">
                  <span>⏰</span> Temporizador de Escudo de Asedio (48 Horas)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShieldDurationHours(48)}
                  className="px-4 py-2 bg-nordic-gold text-black font-bold text-xs rounded-xl hover:bg-nordic-gold-light transition-colors shadow-md"
                >
                  Activar Escudo (48 Horas)
                </button>
                <button
                  onClick={() => setShieldDurationHours(24)}
                  className="px-3 py-2 bg-nordic-card border border-nordic-gold/40 text-nordic-gold text-xs rounded-xl hover:bg-nordic-surface transition-colors"
                >
                  24 Horas
                </button>
                {shieldEndTime && (
                  <button
                    onClick={clearShield}
                    className="px-3 py-2 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs rounded-xl hover:bg-rose-900/50 transition-colors"
                  >
                    Desactivar
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-nordic-card border border-nordic-border text-center space-y-2">
              <span className="text-xs text-nordic-muted uppercase tracking-wider font-semibold block">
                Tiempo Restante de Inmunidad
              </span>
              <div className="text-3xl sm:text-4xl font-runic font-bold text-nordic-gold font-mono">
                {timeLeftStr}
              </div>
              {shieldEndTime && shieldEndTime > Date.now() ? (
                <p className="text-xs text-emerald-400 font-medium">
                  ✓ Tu base de familia está completamente blindada contra ataques.
                </p>
              ) : (
                <p className="text-xs text-rose-400 font-medium">
                  ⚠️ Atención: Tu base no tiene escudo activo y puede ser atacada en asedios.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
