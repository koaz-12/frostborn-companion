export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemType = 'weapon' | 'armor' | 'tool' | 'resource' | 'magic';

export type ClassBase = 'warrior' | 'bowman' | 'curer';

export interface CraftRecipe {
  [materialId: string]: number;
}

export interface ItemDonation {
  id: string;
  name: string;
  nameEn: string;
  type: ItemType;
  rarity: Rarity;
  masteryPoints: number; // Base points at 100% durability
  maxDurability: number;
  craftRecipe?: CraftRecipe;
  efficiencyRating: 'top' | 'high' | 'medium' | 'low';
  notes?: string;
  icon?: string;
}

export interface DistrictRequirements {
  materials: {
    [materialId: string]: number;
  };
  influencePoints: number;
}

export interface DistrictLevel {
  level: number;
  requirements: DistrictRequirements;
  unlocks: string[];
  maxChests?: number;
  maxDoors?: number;
}

export interface SubclassData {
  id: string;
  name: string;
  role: string;
  description: string;
  bestWeapons: string[];
  bestArmor: string[];
  recommendedRunes: string[];
  familyRole: string;
  pvpRating: number; // 1-5
  pveRating: number; // 1-5
  soloRating: number; // 1-5
  familyRating: number; // 1-5
  counters?: string[];
  counteredBy?: string[];
  tips: string[];
}

export interface ClassData {
  id: ClassBase;
  name: string;
  description: string;
  subclasses: SubclassData[];
  levels: {
    level: number;
    requiredPoints: number;
    perks: string[];
  }[];
}

export interface GuideBoss {
  name: string;
  hp?: string | number;
  threatLevel: 'Baja' | 'Media' | 'Alta' | 'Extrema';
  recommendedGear: string;
  strategy: string;
}

export interface GuideSection {
  id: string;
  title: string;
  category: 'sanctum' | 'tombs' | 'graveyard' | 'den' | 'forge' | 'pvp' | 'survival' | 'district';
  badge?: string;
  overview: string;
  requirements: string[];
  preparationChecklist: string[];
  mechanics: string[];
  bosses?: GuideBoss[];
  tips: string[];
}

export interface UserInventory {
  [materialId: string]: number;
}

export interface MaterialMeta {
  id: string;
  name: string;
  category: 'wood' | 'stone' | 'metal' | 'cloth' | 'rare' | 'special';
  icon: string;
  source?: string;
}

