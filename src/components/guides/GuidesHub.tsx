import React, { useState } from 'react';
import guidesDataRaw from '../../data/guides.json';
import classesDataRaw from '../../data/classes.json';
import { GuideSection, ClassData, SubclassData } from '../../types';
import {
  BookOpen,
  Sword,
  Skull,
  Shield,
  Zap,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const guidesData = guidesDataRaw.guides as GuideSection[];
const classesData = classesDataRaw.classes as ClassData[];

export const GuidesHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'sanctum' | 'tombs' | 'events' | 'classes' | 'pvp' | 'district'>('sanctum');
  const [selectedSubclass, setSelectedSubclass] = useState<SubclassData | null>(null);
  const [expandedGuideId, setExpandedGuideId] = useState<string>('sanctum-normal');

  // Filter guides by active category
  const filteredGuides = guidesData.filter(g => {
    if (activeCategory === 'sanctum') return g.category === 'sanctum';
    if (activeCategory === 'tombs') return g.category === 'tombs';
    if (activeCategory === 'events') return ['graveyard', 'den', 'forge'].includes(g.category);
    if (activeCategory === 'pvp') return g.category === 'pvp';
    if (activeCategory === 'district') return g.category === 'district';
    return false;
  });

  // Flat list of all subclasses across base classes
  const allSubclasses: { subclass: SubclassData; baseName: string }[] = [];
  for (const cls of classesData) {
    for (const sub of cls.subclasses) {
      allSubclasses.push({ subclass: sub, baseName: cls.name.split(' ')[0] });
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-nordic-surface via-nordic-card to-nordic-surface border border-nordic-border p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-nordic-ice/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📖</span>
              <h1 className="text-2xl sm:text-3xl font-runic font-bold text-nordic-text">
                Guías & Estrategia Nórdica
              </h1>
            </div>
            <p className="text-sm text-nordic-muted max-w-2xl">
              Tácticas del Sanctum de Odín, mecánicas de las 20 tumbas, builds de clases, contraclases de PvP y defensa en asedios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-nordic-surface border border-nordic-ice/40 text-nordic-ice text-xs font-mono font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Base de Conocimiento
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-nordic-surface rounded-2xl border border-nordic-border scrollbar-none">
        <button
          onClick={() => setActiveCategory('sanctum')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeCategory === 'sanctum'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>⚡</span>
          <span>Sanctum de Odín</span>
        </button>

        <button
          onClick={() => setActiveCategory('tombs')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeCategory === 'tombs'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>🏺</span>
          <span>Tumbas (Tombs)</span>
        </button>

        <button
          onClick={() => setActiveCategory('classes')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeCategory === 'classes'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>🛡️</span>
          <span>Builds de Clases & Meta</span>
        </button>

        <button
          onClick={() => setActiveCategory('events')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeCategory === 'events'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>🚢</span>
          <span>Barcos, Guarida & Forja</span>
        </button>

        <button
          onClick={() => setActiveCategory('pvp')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeCategory === 'pvp'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>⚔️</span>
          <span>PvP & Raids</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('district');
            setExpandedGuideId('influence-points-guide');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeCategory === 'district'
              ? 'bg-nordic-gold text-black font-bold shadow-md'
              : 'text-nordic-muted hover:text-nordic-text hover:bg-nordic-card'
          }`}
        >
          <span>🎖️</span>
          <span>Distrito & Influencia</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* VISTA DE GUÍAS DE MAZMORRAS / EVENTOS / PVP                */}
      {/* ========================================================= */}
      {activeCategory !== 'classes' && (
        <div className="space-y-4">
          {filteredGuides.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;

            return (
              <div
                key={guide.id}
                className="bg-nordic-surface rounded-2xl border border-nordic-border overflow-hidden transition-all shadow-lg"
              >
                {/* Header del acordeón */}
                <div
                  onClick={() => setExpandedGuideId(isExpanded ? '' : guide.id)}
                  className="p-5 cursor-pointer flex items-center justify-between gap-4 hover:bg-nordic-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-nordic-card border border-nordic-border flex items-center justify-center text-nordic-gold">
                      {guide.category === 'sanctum' && <Zap className="w-5 h-5" />}
                      {guide.category === 'tombs' && <Skull className="w-5 h-5" />}
                      {guide.category === 'pvp' && <Sword className="w-5 h-5" />}
                      {['graveyard', 'den', 'forge'].includes(guide.category) && <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-runic font-bold text-base text-nordic-text">
                          {guide.title}
                        </h3>
                        {guide.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-nordic-gold/15 text-nordic-gold border border-nordic-gold/30 font-semibold">
                            {guide.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-nordic-muted line-clamp-1 mt-0.5">
                        {guide.overview}
                      </p>
                    </div>
                  </div>

                  <button className="p-2 rounded-lg bg-nordic-card text-nordic-muted">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Contenido expandible */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-nordic-border/70 space-y-5">
                    {/* Requisitos de Acceso */}
                    <div className="bg-nordic-card/60 rounded-xl p-4 border border-nordic-border/60">
                      <span className="text-xs font-semibold uppercase text-nordic-gold tracking-wider flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-4 h-4 text-nordic-gold" />
                        Requisitos de Entrada
                      </span>
                      <ul className="space-y-1.5">
                        {guide.requirements.map((req, i) => (
                          <li key={i} className="text-xs text-nordic-text flex items-start gap-2">
                            <span className="text-nordic-gold font-bold">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Checklist de Preparación */}
                    <div>
                      <span className="text-xs font-semibold uppercase text-nordic-muted tracking-wider block mb-2">
                        🎒 Equipo & Consumibles Recomendados
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {guide.preparationChecklist.map((item, i) => (
                          <div
                            key={i}
                            className="bg-nordic-card/40 border border-nordic-border rounded-lg p-2.5 text-xs text-nordic-text flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mecánicas Clave */}
                    <div>
                      <span className="text-xs font-semibold uppercase text-nordic-muted tracking-wider block mb-2">
                        ⚙️ Mecánicas y Estrategias del Mapa
                      </span>
                      <div className="space-y-2">
                        {guide.mechanics.map((mech, i) => (
                          <div
                            key={i}
                            className="bg-nordic-surface border border-nordic-border rounded-xl p-3 text-xs text-nordic-text leading-relaxed"
                          >
                            {mech}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Jefes (si existen) */}
                    {guide.bosses && guide.bosses.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold uppercase text-nordic-blood tracking-wider flex items-center gap-1.5 mb-2">
                          <Skull className="w-4 h-4 text-nordic-blood" />
                          Jefes Principales
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {guide.bosses.map((boss, i) => (
                            <div
                              key={i}
                              className="bg-red-950/15 border border-red-900/40 rounded-xl p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-nordic-text">
                                  {boss.name}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                                  {boss.hp}
                                </span>
                              </div>
                              <p className="text-xs text-nordic-muted">
                                <strong>Equipo:</strong> {boss.recommendedGear}
                              </p>
                              <p className="text-xs text-nordic-text bg-nordic-surface/80 p-2.5 rounded-lg border border-nordic-border">
                                <strong>Estrategia:</strong> {boss.strategy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips Pro */}
                    {guide.tips && (
                      <div className="bg-nordic-gold/10 border border-nordic-gold/30 rounded-xl p-3.5 space-y-1">
                        <span className="text-xs font-bold text-nordic-gold uppercase block mb-1">
                          💡 Consejos del Anciano de Nuevo Heim:
                        </span>
                        {guide.tips.map((tip, i) => (
                          <p key={i} className="text-xs text-nordic-text">
                            • {tip}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA DE CLASES, BUILDS Y CONTRACLASES                     */}
      {/* ========================================================= */}
      {activeCategory === 'classes' && (
        <div className="space-y-6">
          {/* Selector de Subclase */}
          <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-4">
            <span className="text-xs uppercase font-semibold text-nordic-muted tracking-wider block mb-3">
              Selecciona una Subclase para ver su Build Completo
            </span>
            <div className="flex flex-wrap gap-2">
              {allSubclasses.map(({ subclass, baseName }) => {
                const isSelected = selectedSubclass?.id === subclass.id;

                return (
                  <button
                    key={subclass.id}
                    onClick={() => setSelectedSubclass(subclass)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-nordic-gold text-black font-bold shadow-md'
                        : 'bg-nordic-card text-nordic-muted hover:text-nordic-text border border-nordic-border'
                    }`}
                  >
                    <span>{subclass.name}</span>
                    <span className="text-[10px] opacity-70">({baseName})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalle de la Subclase Seleccionada */}
          {selectedSubclass && (
            <div className="bg-nordic-surface rounded-2xl border border-nordic-gold/50 p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-nordic-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-runic font-bold text-2xl text-nordic-gold">
                      {selectedSubclass.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-nordic-card border border-nordic-border text-xs text-nordic-muted font-medium">
                      {selectedSubclass.role}
                    </span>
                  </div>
                  <p className="text-xs text-nordic-text max-w-2xl">
                    {selectedSubclass.description}
                  </p>
                </div>

                {/* Ratings */}
                <div className="flex gap-3 text-xs bg-nordic-card p-3 rounded-xl border border-nordic-border">
                  <div className="text-center">
                    <span className="text-nordic-muted block text-[10px]">PvE</span>
                    <span className="font-bold text-nordic-gold">{'⭐'.repeat(selectedSubclass.pveRating)}</span>
                  </div>
                  <div className="text-center border-l border-nordic-border pl-3">
                    <span className="text-nordic-muted block text-[10px]">PvP</span>
                    <span className="font-bold text-nordic-gold">{'⭐'.repeat(selectedSubclass.pvpRating)}</span>
                  </div>
                  <div className="text-center border-l border-nordic-border pl-3">
                    <span className="text-nordic-muted block text-[10px]">Familia</span>
                    <span className="font-bold text-nordic-gold">{'⭐'.repeat(selectedSubclass.familyRating)}</span>
                  </div>
                </div>
              </div>

              {/* Equipamiento y Runas Recomendadas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-nordic-card/60 p-4 rounded-xl border border-nordic-border">
                  <span className="text-xs font-semibold uppercase text-nordic-muted block mb-2">
                    🗡️ Mejores Armas
                  </span>
                  <ul className="space-y-1">
                    {selectedSubclass.bestWeapons.map((w, i) => (
                      <li key={i} className="text-xs text-nordic-text flex items-center gap-1.5">
                        <span className="text-nordic-gold">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-nordic-card/60 p-4 rounded-xl border border-nordic-border">
                  <span className="text-xs font-semibold uppercase text-nordic-muted block mb-2">
                    🛡️ Armadura Óptima
                  </span>
                  <ul className="space-y-1">
                    {selectedSubclass.bestArmor.map((a, i) => (
                      <li key={i} className="text-xs text-nordic-text flex items-center gap-1.5">
                        <span className="text-nordic-gold">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-nordic-card/60 p-4 rounded-xl border border-nordic-border">
                  <span className="text-xs font-semibold uppercase text-nordic-muted block mb-2">
                    ✨ Runas Recomendadas
                  </span>
                  <ul className="space-y-1">
                    {selectedSubclass.recommendedRunes.map((r, i) => (
                      <li key={i} className="text-xs text-nordic-text flex items-center gap-1.5">
                        <span className="text-nordic-gold">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Matchups y Contraclases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSubclass.counters && selectedSubclass.counters.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5">
                    <span className="text-xs font-bold uppercase text-emerald-400 block mb-2">
                      ✅ Es Fuerte Contra (Counters):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubclass.counters.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-emerald-900/30 text-emerald-300 text-xs font-medium border border-emerald-700/50"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubclass.counteredBy && selectedSubclass.counteredBy.length > 0 && (
                  <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-3.5">
                    <span className="text-xs font-bold uppercase text-red-400 block mb-2">
                      ⚠️ Es Débil Frente A:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubclass.counteredBy.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-red-900/30 text-red-300 text-xs font-medium border border-red-800/50"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rol en Familia y Tips */}
              <div className="bg-nordic-card/40 border border-nordic-border rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold uppercase text-nordic-gold block">
                  👥 Rol en Grupo de 4 (Familia):
                </span>
                <p className="text-xs text-nordic-text leading-relaxed">
                  {selectedSubclass.familyRole}
                </p>

                <div className="pt-2 border-t border-nordic-border/60">
                  <span className="text-xs font-semibold uppercase text-nordic-muted block mb-1">
                    Consejos de Combate:
                  </span>
                  {selectedSubclass.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-nordic-text">
                      • {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabla Resumen de Sinergias y Meta PvP */}
          <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-5">
            <h3 className="text-sm font-semibold text-nordic-text mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-nordic-gold" />
              Regla de Oro del Metagame de Frostborn
            </h3>
            <p className="text-xs text-nordic-muted mb-4">
              En Frostborn ninguna clase gana sola. Los enfrentamientos de clanes los define la coordinación de la Familia:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-nordic-card p-3 rounded-xl border border-nordic-border">
                <strong className="text-nordic-gold block mb-1">Tier S en PvP:</strong>
                <p className="text-nordic-muted">
                  <strong>Sorcerer</strong> (dispel absoluto), <strong>Druid</strong> (control por raíces) y <strong>Nosferatu</strong> (inmunidad y robo de vida).
                </p>
              </div>

              <div className="bg-nordic-card p-3 rounded-xl border border-nordic-border">
                <strong className="text-nordic-ice block mb-1">Reyes del PvE:</strong>
                <p className="text-nordic-muted">
                  <strong>Fire Mage</strong> (daño en área devastador en el Sanctum) y <strong>Berserk</strong> (burst melee contra jefes).
                </p>
              </div>

              <div className="bg-nordic-card p-3 rounded-xl border border-nordic-border">
                <strong className="text-emerald-400 block mb-1">Consejo Pro:</strong>
                <p className="text-nordic-muted">
                  Lleva al menos 3 clases distintas a Nivel 4 de maestría para cambiar tu rol según sea PvP, farmeo o mazmorra.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
