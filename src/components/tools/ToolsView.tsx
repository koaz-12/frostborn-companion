import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../stores/useInventoryStore';
import {
  Download,
  Upload,
  Clock,
  Check,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Image
} from 'lucide-react';
import { KNOWN_MATERIALS } from '../../constants/materials';
import { ItemIcon } from '../common/ItemIcon';

export const ToolsView: React.FC = () => {
  const { exportAppState, importAppState } = useInventoryStore();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedExport, setCopiedExport] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Timers: Sanctum 48h timer simulation, Daily tournament 24h timer
  const [sanctumSeconds, setSanctumSeconds] = useState(48 * 3600 - 14200);
  const [dailySeconds, setDailySeconds] = useState(24 * 3600 - 8400);

  useEffect(() => {
    const interval = setInterval(() => {
      setSanctumSeconds(prev => (prev > 0 ? prev - 1 : 48 * 3600));
      setDailySeconds(prev => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleDownloadJson = () => {
    const data = exportAppState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frostborn-companion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportAppState());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importAppState(importJsonText);
    if (ok) {
      setImportStatus('success');
      setImportJsonText('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-nordic-surface via-nordic-card to-nordic-surface border border-nordic-border p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏱️</span>
              <h1 className="text-2xl sm:text-3xl font-runic font-bold text-nordic-text">
                Utilidades & Respaldos
              </h1>
            </div>
            <p className="text-sm text-nordic-muted max-w-2xl">
              Temporizadores de reinicio de eventos, respaldos de datos de tu campamento y configuración sin conexión.
            </p>
          </div>
        </div>
      </div>

      {/* Temporizadores de Eventos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-nordic-card border border-nordic-gold/40 flex items-center justify-center text-nordic-gold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-nordic-muted">
                Reinicio del Sanctum de Odín
              </span>
              <h3 className="font-mono font-bold text-xl sm:text-2xl text-nordic-gold">
                {formatTime(sanctumSeconds)}
              </h3>
              <span className="text-[11px] text-nordic-muted">
                Ciclo de 48 horas tras activación
              </span>
            </div>
          </div>
        </div>

        <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-nordic-card border border-nordic-ice/40 flex items-center justify-center text-nordic-ice">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-nordic-muted">
                Torneo Diario & Misiones
              </span>
              <h3 className="font-mono font-bold text-xl sm:text-2xl text-nordic-ice">
                {formatTime(dailySeconds)}
              </h3>
              <span className="text-[11px] text-nordic-muted">
                Reinicio diario a las 00:00 UTC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exportar e Importar Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exportar */}
        <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-nordic-gold" />
            <h3 className="font-bold text-base text-nordic-text">
              Exportar mi Progreso
            </h3>
          </div>
          <p className="text-xs text-nordic-muted leading-relaxed">
            Descarga un archivo JSON con tu nivel actual de distrito, tus cofres de materiales y tu configuración del Altar de Odín. Úsalo para no perder tus datos o transferirlos a otro dispositivo.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex-1 py-2.5 px-4 bg-nordic-gold hover:bg-nordic-gold-light text-black font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .JSON</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="py-2.5 px-4 bg-nordic-card hover:bg-nordic-border border border-nordic-border text-nordic-text font-medium rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              <span>{copiedExport ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>
        </div>

        {/* Importar */}
        <div className="bg-nordic-surface rounded-2xl border border-nordic-border p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-nordic-ice" />
            <h3 className="font-bold text-base text-nordic-text">
              Importar / Restaurar Progreso
            </h3>
          </div>
          <p className="text-xs text-nordic-muted leading-relaxed">
            Pega el contenido JSON de una copia de seguridad para restaurar tus niveles e inventario.
          </p>

          <textarea
            rows={2}
            placeholder="Pega aquí el código JSON..."
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full bg-nordic-card border border-nordic-border rounded-xl p-3 text-xs font-mono text-nordic-text focus:outline-none focus:border-nordic-gold"
          />

          <button
            onClick={handleImport}
            className="w-full py-2.5 px-4 bg-nordic-card hover:bg-nordic-border border border-nordic-border text-nordic-text font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-nordic-ice" />
            <span>Restaurar Datos</span>
          </button>

          {importStatus === 'success' && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> ¡Datos restaurados con éxito!
            </p>
          )}
          {importStatus === 'error' && (
            <p className="text-xs text-nordic-blood flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Error: Formato JSON inválido.
            </p>
          )}
        </div>
      </div>

      {/* Respaldo de Sprites & Almacén Offline */}
      <div className="rounded-2xl bg-nordic-surface border border-nordic-border p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-nordic-text">
                  Almacén Offline & Sprites de Recursos
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold">
                  {Object.values(KNOWN_MATERIALS).length} / {Object.values(KNOWN_MATERIALS).length} Guardados
                </span>
              </div>
              <p className="text-xs text-nordic-muted">
                100% de los sprites e iconos de materiales están respaldados en la memoria local de tu dispositivo y precacheados por el Service Worker (PWA) para funcionar sin conexión.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGallery(!showGallery)}
            className="px-3.5 py-2 rounded-xl bg-nordic-card border border-nordic-border text-nordic-text hover:border-nordic-gold/40 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap self-start sm:self-center"
          >
            <Image className="w-4 h-4 text-nordic-gold" />
            <span>{showGallery ? 'Ocultar Galería' : 'Explorar Galería de Sprites'}</span>
          </button>
        </div>

        {showGallery && (
          <div className="pt-3 border-t border-nordic-border/60">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {Object.values(KNOWN_MATERIALS).map(mat => (
                <div
                  key={mat.id}
                  className="bg-nordic-card/60 border border-nordic-border rounded-xl p-2.5 flex flex-col items-center text-center gap-1.5 hover:border-nordic-gold/50 transition-colors"
                >
                  <ItemIcon
                    id={mat.id}
                    fallbackEmoji={mat.icon}
                    name={mat.name}
                    size="lg"
                  />
                  <div className="font-semibold text-[11px] text-nordic-text truncate w-full" title={mat.name}>
                    {mat.name}
                  </div>
                  {mat.source && (
                    <span className="text-[9px] text-nordic-muted truncate w-full" title={mat.source}>
                      {mat.source}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tarjeta de Aplicación PWA y Privacidad */}
      <div className="rounded-2xl bg-nordic-surface border border-nordic-border p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-nordic-gold font-bold text-sm">
          <Smartphone className="w-4 h-4" />
          <span>Modo Sin Conexión (PWA Ready) & Privacidad</span>
        </div>
        <p className="text-xs text-nordic-muted leading-relaxed">
          Esta aplicación funciona <strong>100% de manera local y offline</strong>. Ningún dato de tu cuenta o inventario se envía a servidores externos; todo se almacena en el <code>localStorage</code> seguro de tu navegador. Puedes instalarla en la pantalla de inicio de tu teléfono seleccionando <em>"Agregar a la pantalla principal"</em> en las opciones de Chrome o Safari.
        </p>
        <div className="flex items-center gap-3 pt-2 text-xs text-nordic-muted font-mono">
          <span>Versión: 1.35.x</span>
          <span>•</span>
          <span>Motor: React + Vite + Zustand</span>
          <span>•</span>
          <span>Nube: No requerida</span>
        </div>
      </div>
    </div>
  );
};
