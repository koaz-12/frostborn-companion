import { describe, it, expect } from 'vitest';
import {
  calculateDistrictCost,
  calculateInventoryProgress,
  calculateDonationPoints,
  calculateDonationPlan,
  getRecommendedDonationPlans,
  calculateClassProgress
} from '../src/lib/calculations';
import { DistrictLevel, ItemDonation, ClassData } from '../src/types';

describe('calculateDistrictCost', () => {
  const mockLevels: DistrictLevel[] = [
    {
      level: 1,
      requirements: { materials: { pine_log: 40, limestone: 20 }, influencePoints: 0 },
      unlocks: ['Anciano']
    },
    {
      level: 2,
      requirements: { materials: { pine_log: 80, limestone: 40, planks: 20 }, influencePoints: 30 },
      unlocks: ['Banquero']
    },
    {
      level: 3,
      requirements: { materials: { planks: 50, stone_blocks: 30 }, influencePoints: 60 },
      unlocks: ['Taberna']
    }
  ];

  it('calcula correctamente el coste acumulado de nivel 1 a nivel 3', () => {
    const result = calculateDistrictCost(1, 3, mockLevels);
    // De 1 a 3 incluye niveles 2 y 3:
    // pine_log: 80
    // limestone: 40
    // planks: 20 + 50 = 70
    // stone_blocks: 30
    // influencePoints: 30 + 60 = 90
    expect(result.totalMaterials.pine_log).toBe(80);
    expect(result.totalMaterials.limestone).toBe(40);
    expect(result.totalMaterials.planks).toBe(70);
    expect(result.totalMaterials.stone_blocks).toBe(30);
    expect(result.totalInfluence).toBe(90);
    expect(result.totalMaterials.influencePoints).toBe(90);
    expect(result.levelsIncluded).toEqual([2, 3]);
    expect(result.unlocks).toContain('Banquero');
    expect(result.unlocks).toContain('Taberna');
  });

  it('devuelve vacío si el nivel actual es mayor o igual al objetivo', () => {
    const result = calculateDistrictCost(3, 3, mockLevels);
    expect(result.levelsIncluded).toHaveLength(0);
    expect(Object.keys(result.totalMaterials)).toHaveLength(0);
    expect(result.totalInfluence).toBe(0);
  });

  it('omite correctamente los materiales e influencia de niveles marcados con ticket de autollenado', () => {
    // Si saltamos el nivel 2 con ticket, solo debe contar el nivel 3
    const result = calculateDistrictCost(1, 3, mockLevels, [2]);
    expect(result.levelsIncluded).toEqual([3]);
    expect(result.skippedLevelsIncluded).toEqual([2]);
    expect(result.totalMaterials.pine_log).toBeUndefined();
    expect(result.totalMaterials.limestone).toBeUndefined();
    expect(result.totalMaterials.planks).toBe(50);
    expect(result.totalMaterials.stone_blocks).toBe(30);
    expect(result.totalInfluence).toBe(60);
    // Pero mantiene los desbloqueos
    expect(result.unlocks).toContain('Banquero');
    expect(result.unlocks).toContain('Taberna');
  });
});

describe('calculateInventoryProgress', () => {
  it('calcula progreso parcial y faltantes con exactitud', () => {
    const required = { pine_log: 100, limestone: 50 };
    const inventory = { pine_log: 50, limestone: 50 };

    const result = calculateInventoryProgress(required, inventory);
    expect(result.overallPercent).toBe(67); // (50 + 50) / (100 + 50) = 100/150 = 66.6% -> 67%
    expect(result.isComplete).toBe(false);

    const pine = result.breakdown.find(b => b.materialId === 'pine_log');
    expect(pine?.missing).toBe(50);
    expect(pine?.percent).toBe(50);

    const lime = result.breakdown.find(b => b.materialId === 'limestone');
    expect(lime?.missing).toBe(0);
    expect(lime?.percent).toBe(100);
  });

  it('marca completado cuando todos los materiales superan o igualan el requisito', () => {
    const required = { pine_log: 100 };
    const inventory = { pine_log: 150 }; // Exceso no debe alterar el 100%

    const result = calculateInventoryProgress(required, inventory);
    expect(result.overallPercent).toBe(100);
    expect(result.isComplete).toBe(true);
  });
});

describe('calculateDonationPoints', () => {
  it('calcula puntos completos al 100% de durabilidad', () => {
    const points = calculateDonationPoints(18, 100, 1);
    expect(points).toBe(18);
  });

  it('calcula reducción proporcional por durabilidad reducida', () => {
    // 18 * 0.5 = 9
    expect(calculateDonationPoints(18, 50, 1)).toBe(9);
    // 25 * 0.33 = 8.25 -> floor = 8
    expect(calculateDonationPoints(25, 33, 1)).toBe(8);
  });

  it('multiplica por la cantidad donada', () => {
    expect(calculateDonationPoints(20, 100, 5)).toBe(100);
  });

  it('trata valores extremos y durabilidad cero', () => {
    expect(calculateDonationPoints(50, 0, 1)).toBe(0);
    expect(calculateDonationPoints(50, 150, 1)).toBe(50); // Clamped to 100%
  });
});

describe('calculateDonationPlan and recommendations', () => {
  const mockItem: ItemDonation = {
    id: 'strong_pickaxe',
    name: 'Pico Fuerte',
    nameEn: 'Strong Pickaxe',
    type: 'tool',
    rarity: 'uncommon',
    masteryPoints: 18,
    maxDurability: 100,
    efficiencyRating: 'top',
    craftRecipe: {
      planks: 6,
      copper_ingot: 3
    }
  };

  it('calcula cuántos items son necesarios para alcanzar los puntos objetivo', () => {
    // Objetivo: 100 puntos. 18 puntos por pico. Math.ceil(100/18) = 6 picos
    const plan = calculateDonationPlan(100, mockItem, 100);
    expect(plan).not.toBeNull();
    expect(plan?.itemsNeeded).toBe(6);
    expect(plan?.totalPointsGenerated).toBe(108);
    // Materiales: 6 * 6 = 36 planks, 6 * 3 = 18 copper_ingot
    expect(plan?.totalCraftMaterials?.planks).toBe(36);
    expect(plan?.totalCraftMaterials?.copper_ingot).toBe(18);
  });

  it('ordena recomendaciones priorizando items de eficiencia top', () => {
    const lowItem: ItemDonation = {
      id: 'cloth_hat',
      name: 'Gorro',
      nameEn: 'Hat',
      type: 'armor',
      rarity: 'common',
      masteryPoints: 3,
      maxDurability: 50,
      efficiencyRating: 'low'
    };

    const recommendations = getRecommendedDonationPlans(100, [lowItem, mockItem], 100);
    expect(recommendations[0].item.id).toBe('strong_pickaxe');
  });
});

describe('calculateClassProgress', () => {
  const mockClass: ClassData = {
    id: 'warrior',
    name: 'Guerrero',
    description: 'Melee',
    subclasses: [],
    levels: [
      { level: 1, requiredPoints: 0, perks: ['Golpe'] },
      { level: 2, requiredPoints: 450, perks: ['Grito'] },
      { level: 3, requiredPoints: 1500, perks: ['Carga'] }
    ]
  };

  it('calcula puntos restantes para el nivel objetivo', () => {
    const progress = calculateClassProgress(300, 2, mockClass);
    expect(progress.pointsNeeded).toBe(150);
    expect(progress.isAchieved).toBe(false);
    expect(progress.nextLevelPerks).toContain('Grito');
  });

  it('detecta cuando el nivel ya ha sido alcanzado', () => {
    const progress = calculateClassProgress(500, 2, mockClass);
    expect(progress.pointsNeeded).toBe(0);
    expect(progress.isAchieved).toBe(true);
  });
});
