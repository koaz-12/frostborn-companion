import { DistrictLevel, ItemDonation, UserInventory, ClassData } from '../types';

export interface DistrictCostResult {
  totalMaterials: Record<string, number>;
  totalInfluence: number;
  levelsIncluded: number[];
  skippedLevelsIncluded: number[];
  unlocks: string[];
}

export interface MaterialProgressItem {
  materialId: string;
  required: number;
  owned: number;
  missing: number;
  percent: number;
}

export interface InventoryProgressResult {
  breakdown: MaterialProgressItem[];
  overallPercent: number;
  totalRequiredUnits: number;
  totalOwnedUnits: number;
  isComplete: boolean;
}

export interface DonationPlanOption {
  item: ItemDonation;
  pointsPerItem: number;
  itemsNeeded: number;
  totalPointsGenerated: number;
  totalCraftMaterials?: Record<string, number>;
  efficiencyRating: 'top' | 'high' | 'medium' | 'low';
}

/**
 * Calcula los materiales totales y puntos de influencia requeridos para subir el distrito
 * desde startLevel hasta targetLevel (ambos inclusive en la transición: de startLevel a targetLevel).
 * Permite omitir niveles específicos si fueron completados con Ticket de Carrito o Autollenado.
 */
export function calculateDistrictCost(
  startLevel: number,
  targetLevel: number,
  districtLevels: DistrictLevel[],
  skippedLevels: number[] = []
): DistrictCostResult {
  const totalMaterials: Record<string, number> = {};
  let totalInfluence = 0;
  const levelsIncluded: number[] = [];
  const skippedLevelsIncluded: number[] = [];
  const unlocks: string[] = [];

  if (startLevel >= targetLevel) {
    return {
      totalMaterials,
      totalInfluence: 0,
      levelsIncluded,
      skippedLevelsIncluded,
      unlocks
    };
  }

  // Filtrar niveles entre startLevel + 1 y targetLevel
  const allInRange = districtLevels
    .filter(lvl => lvl.level > startLevel && lvl.level <= targetLevel)
    .sort((a, b) => a.level - b.level);

  for (const lvl of allInRange) {
    // Si el nivel fue saltado / llenado con ticket de carrito
    if (skippedLevels.includes(lvl.level)) {
      skippedLevelsIncluded.push(lvl.level);
      if (lvl.unlocks && Array.isArray(lvl.unlocks)) {
        unlocks.push(...lvl.unlocks);
      }
      continue;
    }

    levelsIncluded.push(lvl.level);
    if (lvl.requirements) {
      if (lvl.requirements.materials) {
        for (const [matId, qty] of Object.entries(lvl.requirements.materials)) {
          totalMaterials[matId] = (totalMaterials[matId] || 0) + qty;
        }
      }
      if (lvl.requirements.influencePoints) {
        totalInfluence += lvl.requirements.influencePoints;
      }
    }
    if (lvl.unlocks && Array.isArray(lvl.unlocks)) {
      unlocks.push(...lvl.unlocks);
    }
  }

  // Si hay puntos de influencia, agregarlos también al desglose
  if (totalInfluence > 0) {
    totalMaterials['influencePoints'] = totalInfluence;
  }

  return {
    totalMaterials,
    totalInfluence,
    levelsIncluded,
    skippedLevelsIncluded,
    unlocks
  };
}

/**
 * Calcula el progreso en tiempo real comparando los materiales requeridos contra el inventario del usuario.
 */
export function calculateInventoryProgress(
  requiredMaterials: Record<string, number>,
  inventory: UserInventory
): InventoryProgressResult {
  const breakdown: MaterialProgressItem[] = [];
  let totalRequiredUnits = 0;
  let totalOwnedCappedUnits = 0;

  const entries = Object.entries(requiredMaterials);
  if (entries.length === 0) {
    return {
      breakdown: [],
      overallPercent: 100,
      totalRequiredUnits: 0,
      totalOwnedUnits: 0,
      isComplete: true
    };
  }

  for (const [materialId, required] of entries) {
    const owned = Math.max(0, inventory[materialId] || 0);
    const cappedOwned = Math.min(owned, required);
    const missing = Math.max(0, required - owned);
    const percent = required > 0 ? Math.min(100, Math.round((owned / required) * 100)) : 100;

    totalRequiredUnits += required;
    totalOwnedCappedUnits += cappedOwned;

    breakdown.push({
      materialId,
      required,
      owned,
      missing,
      percent
    });
  }

  // Ordenar: primero los que más faltan
  breakdown.sort((a, b) => a.percent - b.percent);

  const overallPercent = totalRequiredUnits > 0
    ? Math.min(100, Math.round((totalOwnedCappedUnits / totalRequiredUnits) * 100))
    : 100;

  return {
    breakdown,
    overallPercent,
    totalRequiredUnits,
    totalOwnedUnits: totalOwnedCappedUnits,
    isComplete: overallPercent >= 100
  };
}

/**
 * Calcula los puntos de ofrenda que genera un ítem según su durabilidad.
 * Fórmula exacta de Frostborn: puntos_reales = Math.floor(puntos_base * (durabilidad / 100)) * cantidad.
 */
export function calculateDonationPoints(
  basePoints: number,
  durabilityPercent: number,
  quantity: number = 1
): number {
  if (basePoints <= 0 || quantity <= 0) return 0;
  const clampedDurability = Math.max(0, Math.min(100, durabilityPercent));
  const pointsPerUnit = Math.floor(basePoints * (clampedDurability / 100));
  return pointsPerUnit * quantity;
}

/**
 * Genera recomendaciones de donación inversa para alcanzar una meta de puntos.
 * Calcula cuántas unidades del ítem se necesitan y los recursos de crafteo totales.
 */
export function calculateDonationPlan(
  targetPoints: number,
  item: ItemDonation,
  durabilityPercent: number = 100
): DonationPlanOption | null {
  if (targetPoints <= 0) return null;
  const pointsPerItem = calculateDonationPoints(item.masteryPoints, durabilityPercent, 1);
  if (pointsPerItem <= 0) return null;

  const itemsNeeded = Math.ceil(targetPoints / pointsPerItem);
  const totalPointsGenerated = itemsNeeded * pointsPerItem;

  let totalCraftMaterials: Record<string, number> | undefined = undefined;
  if (item.craftRecipe) {
    totalCraftMaterials = {};
    for (const [matId, qty] of Object.entries(item.craftRecipe)) {
      totalCraftMaterials[matId] = qty * itemsNeeded;
    }
  }

  return {
    item,
    pointsPerItem,
    itemsNeeded,
    totalPointsGenerated,
    totalCraftMaterials,
    efficiencyRating: item.efficiencyRating
  };
}

/**
 * Calcula las mejores opciones de donación ordenadas por eficiencia para una meta dada.
 */
export function getRecommendedDonationPlans(
  targetPoints: number,
  items: ItemDonation[],
  durabilityPercent: number = 100
): DonationPlanOption[] {
  if (targetPoints <= 0) return [];

  const ratingWeight: Record<string, number> = {
    top: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const plans: DonationPlanOption[] = [];
  for (const item of items) {
    const plan = calculateDonationPlan(targetPoints, item, durabilityPercent);
    if (plan) {
      plans.push(plan);
    }
  }

  // Ordenar primero por rating de eficiencia descendente, luego por menor cantidad de items
  plans.sort((a, b) => {
    const weightDiff = (ratingWeight[b.efficiencyRating] || 0) - (ratingWeight[a.efficiencyRating] || 0);
    if (weightDiff !== 0) return weightDiff;
    return a.itemsNeeded - b.itemsNeeded;
  });

  return plans;
}

/**
 * Calcula el progreso y los puntos restantes para alcanzar un nivel de clase específico.
 */
export function calculateClassProgress(
  currentPoints: number,
  targetLevel: number,
  classData: ClassData
): { pointsNeeded: number; isAchieved: boolean; nextLevelPerks: string[] } {
  const targetLevelObj = classData.levels.find(lvl => lvl.level === targetLevel);
  if (!targetLevelObj) {
    return { pointsNeeded: 0, isAchieved: false, nextLevelPerks: [] };
  }

  const required = targetLevelObj.requiredPoints;
  const pointsNeeded = Math.max(0, required - currentPoints);
  const isAchieved = currentPoints >= required;

  return {
    pointsNeeded,
    isAchieved,
    nextLevelPerks: targetLevelObj.perks || []
  };
}
