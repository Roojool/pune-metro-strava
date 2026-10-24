import type { Journey } from '../../domain/models';
import { calculateJourneyCalories } from './scoring';
import type { PuneReplenishItem, PuneReplenishSummary } from './types';

const REPLENISH_CATALOG: Omit<PuneReplenishItem, 'isUnlocked' | 'earnedRatio'>[] = [
  {
    id: 'kokum-sharbat',
    name: 'Kokum Sharbat',
    marathiName: 'कोकम सरबत',
    category: 'hydration',
    calorieValue: 65,
    icon: '🥤',
    description: 'Refreshing indigenous cooling drink packed with garcinol and electrolytes.',
    landmarkLocation: 'Deccan Gymkhana Station exits',
  },
  {
    id: 'rasvanti-juice',
    name: 'Fresh Sugarcane Juice',
    marathiName: 'ऊस रस',
    category: 'hydration',
    calorieValue: 140,
    icon: '🎋',
    description: 'Natural post-commute electrolyte replenisher with ginger and lemon.',
    landmarkLocation: 'Rasvanti Griha near Garware College',
  },
  {
    id: 'bun-maska-chai',
    name: 'Bun Maska & Irani Chai',
    marathiName: 'बन मस्का आणि इराणी चहा',
    category: 'carb_snack',
    calorieValue: 290,
    icon: '☕',
    description: 'Iconic Pune comfort snack delivering fast carbs after long commutes.',
    landmarkLocation: 'Goodluck Cafe near FC Road',
  },
  {
    id: 'spdp-vaishali',
    name: 'SPDP (Sev Potato Dahi Puri)',
    marathiName: 'शेव बटाटा दही पुरी',
    category: 'traditional_treat',
    calorieValue: 410,
    icon: '🥟',
    description: 'Crispy puris with spiced potatoes, chilled sweet curd, and crunchy sev.',
    landmarkLocation: 'Vaishali Restaurant on FC Road',
  },
  {
    id: 'sujata-mastani',
    name: 'Mango Sujata Mastani',
    marathiName: 'मँगो मस्तानी',
    category: 'traditional_treat',
    calorieValue: 620,
    icon: '🍨',
    description: 'Thick creamy mango milkshake crowned with ice cream and pistachios.',
    landmarkLocation: 'Sujata Mastani near Sadashiv Peth',
  },
];

/**
 * Calculates physical hydration replenishment and matches calories burned with Pune food culture.
 */
export function calculatePuneReplenish(journeys: Journey[]): PuneReplenishSummary {
  const totalCaloriesBurned = journeys.reduce(
    (sum, j) => sum + calculateJourneyCalories(j),
    0
  );

  // In Pune ambient commute conditions, sweat loss is ~2.5 ml per active calorie burned
  const estimatedFluidLossMl = Math.round(totalCaloriesBurned * 2.5);
  const recommendedWaterGlasses =
    totalCaloriesBurned > 0
      ? Math.max(1, Math.round(estimatedFluidLossMl / 250))
      : 0;

  const items: PuneReplenishItem[] = REPLENISH_CATALOG.map(item => {
    const earnedRatio =
      item.calorieValue > 0
        ? Math.min(1, Math.round((totalCaloriesBurned / item.calorieValue) * 100) / 100)
        : 0;
    return {
      ...item,
      isUnlocked: totalCaloriesBurned >= item.calorieValue,
      earnedRatio,
    };
  });

  const unlockedCount = items.filter(i => i.isUnlocked).length;

  // Active recommendation: highest unlocked treat, or first treat if none unlocked
  const unlockedItems = items.filter(i => i.isUnlocked);
  const activeRecommendation =
    unlockedItems.length > 0
      ? unlockedItems[unlockedItems.length - 1]
      : items[0];

  let hydrationTip: string;
  if (totalCaloriesBurned === 0) {
    hydrationTip = 'Stay hydrated on your commutes across Pune’s sunny afternoons!';
  } else if (totalCaloriesBurned < 150) {
    hydrationTip = 'A glass of cool water or Kokum Sharbat replenishes early station walking sweat.';
  } else if (totalCaloriesBurned < 350) {
    hydrationTip = 'Stairs and platform walks burned noticeable energy—drink 2-3 glasses of water!';
  } else {
    hydrationTip = 'High endurance commute! Replenish sodium and potassium with coconut water or fresh sugarcane juice.';
  }

  const accessibilityDescription = `Commuter replenishment guide: ${totalCaloriesBurned} kcal burned, ~${estimatedFluidLossMl} ml fluid loss (${recommendedWaterGlasses} glasses recommended). ${unlockedCount} of ${items.length} Pune recharge treats unlocked. Top recommendation: ${activeRecommendation.name}.`;

  return {
    estimatedFluidLossMl,
    recommendedWaterGlasses,
    totalCaloriesBurned,
    activeRecommendation,
    items,
    unlockedCount,
    hydrationTip,
    accessibilityDescription,
  };
}
