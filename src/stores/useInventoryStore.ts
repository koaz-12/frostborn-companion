import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClassBase, UserInventory } from '../types';

export interface BatchDonationEntry {
  id: string;
  itemId: string;
  durability: number;
  quantity: number;
}

interface AppStoreState {
  // Distrito
  districtCurrentLevel: number;
  districtTargetLevel: number;
  inventory: UserInventory;
  skippedLevels: number[];
  setDistrictLevels: (current: number, target: number) => void;
  setMaterialCount: (materialId: string, count: number) => void;
  bulkSetMaterials: (items: Record<string, number>) => void;
  resetInventory: () => void;
  toggleSkipLevel: (level: number) => void;
  clearSkippedLevels: () => void;
  setSkippedLevels: (levels: number[]) => void;

  // Altar de Odín
  altarMode: 'direct' | 'inverse' | 'catalog';
  altarTargetPoints: number;
  altarSelectedClass: ClassBase;
  altarTargetClassLevel: number;
  altarBatch: BatchDonationEntry[];
  setAltarMode: (mode: 'direct' | 'inverse' | 'catalog') => void;
  setAltarTargetPoints: (points: number) => void;
  setAltarClassGoal: (classId: ClassBase, targetLevel: number) => void;
  addBatchItem: (itemId: string, durability?: number, quantity?: number) => void;
  updateBatchItem: (id: string, updates: Partial<Omit<BatchDonationEntry, 'id'>>) => void;
  removeBatchItem: (id: string) => void;
  clearBatch: () => void;

  // Importar / Exportar
  exportAppState: () => string;
  importAppState: (jsonString: string) => boolean;
}

export const useInventoryStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      // Distrito por defecto: 1 -> 10
      districtCurrentLevel: 1,
      districtTargetLevel: 10,
      inventory: {
        pine_log: 0,
        limestone: 0,
        planks: 0,
        stone_blocks: 0,
        copper_ingot: 0,
        bronze_ingot: 0,
        nails: 0,
        gears: 0,
        influencePoints: 0
      },

      skippedLevels: [],

      setDistrictLevels: (current: number, target: number) =>
        set({
          districtCurrentLevel: Math.max(1, current),
          districtTargetLevel: Math.max(current + 1, target)
        }),

      toggleSkipLevel: (level: number) =>
        set(state => ({
          skippedLevels: state.skippedLevels.includes(level)
            ? state.skippedLevels.filter(lvl => lvl !== level)
            : [...state.skippedLevels, level].sort((a, b) => a - b)
        })),

      clearSkippedLevels: () =>
        set({
          skippedLevels: []
        }),

      setSkippedLevels: (levels: number[]) =>
        set({
          skippedLevels: levels
        }),

      setMaterialCount: (materialId: string, count: number) =>
        set(state => ({
          inventory: {
            ...state.inventory,
            [materialId]: Math.max(0, count)
          }
        })),

      bulkSetMaterials: (items: Record<string, number>) =>
        set(state => ({
          inventory: {
            ...state.inventory,
            ...items
          }
        })),

      resetInventory: () =>
        set({
          inventory: {}
        }),

      // Altar
      altarMode: 'inverse',
      altarTargetPoints: 450,
      altarSelectedClass: 'warrior',
      altarTargetClassLevel: 2,
      altarBatch: [
        { id: '1', itemId: 'strong_pickaxe', durability: 100, quantity: 5 },
        { id: '2', itemId: 'green_sword', durability: 80, quantity: 2 }
      ],

      setAltarMode: (mode) => set({ altarMode: mode }),
      setAltarTargetPoints: (points) => set({ altarTargetPoints: Math.max(0, points) }),
      setAltarClassGoal: (classId, targetLevel) =>
        set({ altarSelectedClass: classId, altarTargetClassLevel: targetLevel }),

      addBatchItem: (itemId, durability = 100, quantity = 1) =>
        set(state => ({
          altarBatch: [
            ...state.altarBatch,
            {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
              itemId,
              durability,
              quantity
            }
          ]
        })),

      updateBatchItem: (id, updates) =>
        set(state => ({
          altarBatch: state.altarBatch.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),

      removeBatchItem: (id) =>
        set(state => ({
          altarBatch: state.altarBatch.filter(item => item.id !== id)
        })),

      clearBatch: () => set({ altarBatch: [] }),

      // Exportar / Importar
      exportAppState: () => {
        const state = get();
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          districtCurrentLevel: state.districtCurrentLevel,
          districtTargetLevel: state.districtTargetLevel,
          inventory: state.inventory,
          altarTargetPoints: state.altarTargetPoints,
          altarSelectedClass: state.altarSelectedClass,
          altarTargetClassLevel: state.altarTargetClassLevel,
          altarBatch: state.altarBatch
        };
        return JSON.stringify(exportData, null, 2);
      },

      importAppState: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed && typeof parsed === 'object') {
            set({
              districtCurrentLevel: parsed.districtCurrentLevel ?? 1,
              districtTargetLevel: parsed.districtTargetLevel ?? 10,
              inventory: parsed.inventory ?? {},
              altarTargetPoints: parsed.altarTargetPoints ?? 450,
              altarSelectedClass: parsed.altarSelectedClass ?? 'warrior',
              altarTargetClassLevel: parsed.altarTargetClassLevel ?? 2,
              altarBatch: Array.isArray(parsed.altarBatch) ? parsed.altarBatch : []
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'frostborn-companion-storage',
      partialize: (state) => ({
        districtCurrentLevel: state.districtCurrentLevel,
        districtTargetLevel: state.districtTargetLevel,
        inventory: state.inventory,
        altarTargetPoints: state.altarTargetPoints,
        altarSelectedClass: state.altarSelectedClass,
        altarTargetClassLevel: state.altarTargetClassLevel,
        altarBatch: state.altarBatch
      })
    }
  )
);
