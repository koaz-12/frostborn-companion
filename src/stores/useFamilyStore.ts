import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FamilyMember {
  id: number;
  name: string;
  roleTitle: 'Tanque / Frontline' | 'Sanador / Healer' | 'DPS Rango' | 'Control / Dispel';
  subclassName: string;
  notes: string;
  gearCheck: {
    weaponReady: boolean;
    armorReady: boolean;
    potionsReady: boolean;
    supportStaffReady: boolean;
  };
}

interface FamilyStoreState {
  familyName: string;
  activeLayoutId: string;
  shieldEndTime: number | null;
  members: FamilyMember[];

  setFamilyName: (name: string) => void;
  setActiveLayoutId: (id: string) => void;
  updateMember: (id: number, updates: Partial<FamilyMember>) => void;
  toggleMemberGear: (memberId: number, gearKey: keyof FamilyMember['gearCheck']) => void;
  setShieldDurationHours: (hours: number) => void;
  clearShield: () => void;
}

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: 1,
    name: 'Miembro 1 (Líder)',
    roleTitle: 'Tanque / Frontline',
    subclassName: 'Protector / Berserker',
    notes: 'Inicia el choque PvP, absorbe daño y mantiene la línea frontal.',
    gearCheck: { weaponReady: true, armorReady: true, potionsReady: true, supportStaffReady: false }
  },
  {
    id: 2,
    name: 'Miembro 2',
    roleTitle: 'Sanador / Healer',
    subclassName: 'Sanctuary / Druid',
    notes: 'Prioridad 1: Curación constante con Bastón de Soporte y limpieza de área.',
    gearCheck: { weaponReady: true, armorReady: true, potionsReady: true, supportStaffReady: true }
  },
  {
    id: 3,
    name: 'Miembro 3',
    roleTitle: 'DPS Rango',
    subclassName: 'Pathfinder / Fire Mage',
    notes: 'Daño en ráfaga desde la distancia segura tras el Tanque.',
    gearCheck: { weaponReady: true, armorReady: false, potionsReady: true, supportStaffReady: false }
  },
  {
    id: 4,
    name: 'Miembro 4',
    roleTitle: 'Control / Dispel',
    subclassName: 'Sorcerer / Nosferatu',
    notes: 'Elimina escudos enemigos, aplica disipación de efectos y remata objetivos.',
    gearCheck: { weaponReady: false, armorReady: false, potionsReady: true, supportStaffReady: false }
  }
];

export const useFamilyStore = create<FamilyStoreState>()(
  persist(
    (set) => ({
      familyName: 'Familia Nórdica',
      activeLayoutId: 'honeycomb-vault',
      shieldEndTime: null,
      members: DEFAULT_MEMBERS,

      setFamilyName: (familyName) => set({ familyName }),
      setActiveLayoutId: (activeLayoutId) => set({ activeLayoutId }),
      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m))
        })),
      toggleMemberGear: (memberId, gearKey) =>
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              gearCheck: {
                ...m.gearCheck,
                [gearKey]: !m.gearCheck[gearKey]
              }
            };
          })
        })),
      setShieldDurationHours: (hours) =>
        set({
          shieldEndTime: Date.now() + hours * 3600 * 1000
        }),
      clearShield: () => set({ shieldEndTime: null })
    }),
    {
      name: 'frostborn_family_store'
    }
  )
);
