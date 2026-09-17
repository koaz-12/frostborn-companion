# ⚔️ Frostborn Companion — Hub del Guerrero Nórdico

Aplicación web progresiva (PWA) de herramientas, calculadoras y guías estratégicas para **Frostborn: Action RPG** (Kefir Games).

🌐 **Sitio Web Online**: [https://koaz-12.github.io/frostborn-companion/](https://koaz-12.github.io/frostborn-companion/)

---

## ✨ Características Principales

### 🏛️ Calculadora de Distrito Popular
- Cálculo acumulado de recursos de nivel 1 a 199.
- **🎟️ Omisión por Ticket de Autollenado**: Marca niveles que llenaste con tickets del juego y descuéntalos de la lista de materiales requeridos.
- **🚪 Límites de Puertas y Cofres de Base**: Guía de desbloqueos de Arquitecto I a V (+22 puertas y +13 cofres totales para tu base).
- **Inspector de Nivel**: Vista detallada por nivel con barras de progreso comparando contra tu inventario actual y botón de inspección rápida.

### ⚡ Calculadora de Altar de Odín
- Calculadora de ofrendas para Odín, Thor y Freyja.
- Conteo de puntos de influencia y bonificaciones de clan/distrito.

### 🏰 Hub de Familia y Asedios (Family Hub)
- **Plano táctico de base para 4 miembros** con cuadrícula interactiva (7x7) y cálculo estimado de paredes de Pino a Acero.
- **Gestión de roles de la familia** (Tanque, Healer, Rango DPS, Control) con checklist de equipamiento.
- **Organización de almacén** (cofres de alta seguridad vs señuelo).
- **Temporizador de Escudo de Asedio** de 48 horas con cuenta regresiva en tiempo real.

### 🎒 Inventario Inteligente
- Registro y guardado local de tus materiales actuales.
- Sincronización instantánea con las calculadoras de distrito y altar.

---

## 🛠️ Tecnologías

- **React 18 + TypeScript**
- **Vite 6**
- **Tailwind CSS** con tema oscuro nórdico
- **Zustand** (con persistencia en `localStorage`)
- **Lucide Icons**
- **Vite PWA Plugin** (funciona 100% offline y se puede instalar como app)

---

## 🚀 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/koaz-12/frostborn-companion.git

# Entrar a la carpeta
cd frostborn-companion

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
