import type { Journey, LineId } from '../../domain/models';
import { calculateJourneyCalories } from './scoring';
import { getStationName } from '../../data/pune';

export interface PuneBurnMilestone {
  id: string;
  name: string;
  landmark: string;
  caloriesTarget: number;
  unlocked: boolean;
  description: string;
  icon: string;
}

export interface PuneMilestoneProgress {
  currentMilestone: PuneBurnMilestone;
  nextMilestone: PuneBurnMilestone | null;
  progressPercent: number;
  caloriesRemaining: number;
  unlockedCount: number;
  totalCount: number;
}

export interface CorridorBurnSummary {
  corridorKey: string;
  fromName: string;
  toName: string;
  totalCalories: number;
  ridesCount: number;
  hasInterchange: boolean;
}

/**
 * Authentic Pune cultural calorie burn milestones.
 * In Strava, fitness achievements are compared to croissants or alpine climbs.
 * In MetroQuest Pune, commuter calorie burn is celebrated with iconic Pune food & landmark hikes!
 */
export const PUNE_MILESTONES: PuneBurnMilestone[] = [
  {
    id: 'poha-deccan',
    name: 'Plate of Kanda Poha',
    landmark: 'Deccan Gymkhana & FC Road',
    caloriesTarget: 200,
    unlocked: false,
    description: 'Active station walking burned equivalent to a steaming plate of authentic Pune Poha.',
    icon: 'sun',
  },
  {
    id: 'misal-karve',
    name: 'Spicy Katakirr Misal Pav',
    landmark: 'Karve Nagar & Deccan',
    caloriesTarget: 450,
    unlocked: false,
    description: 'Concourse climbs and platform walks burned off a full spicy Pune Misal with rassa and pav!',
    icon: 'activity',
  },
  {
    id: 'sinhagad-steps',
    name: 'Sinhagad Fort Step Climb',
    landmark: 'Pune Darwaja & Tanaji Kada',
    caloriesTarget: 800,
    unlocked: false,
    description: 'Equal to climbing the steep heritage stairs from Sinhagad base up to Pune Darwaja!',
    icon: 'trending-up',
  },
  {
    id: 'vetal-tekdi',
    name: 'Vetal Tekdi Ridge Hike',
    landmark: 'ARAI & Kothrud Ridge',
    caloriesTarget: 1400,
    unlocked: false,
    description: 'Burned equivalent to traversing the entire high ridge of Vetal Tekdi at sunrise.',
    icon: 'compass',
  },
  {
    id: 'katraj-ghat',
    name: 'Katraj to Sinhagad (K2S) Legend',
    landmark: 'South Pune Ridgeway',
    caloriesTarget: 2500,
    unlocked: false,
    description: 'The ultimate endurance feat: equivalent to completing the famed 16 km night ridgeway trek!',
    icon: 'award',
  },
];

/**
 * Evaluates commuter progress toward authentic Pune burn milestones.
 */
export function calculatePuneMilestoneProgress(totalCalories: number): PuneMilestoneProgress {
  const milestones = PUNE_MILESTONES.map(m => ({
    ...m,
    unlocked: totalCalories >= m.caloriesTarget,
  }));

  const unlockedCount = milestones.filter(m => m.unlocked).length;
  const currentMilestone =
    unlockedCount > 0 ? milestones[unlockedCount - 1] : milestones[0];
  const nextMilestone =
    unlockedCount < milestones.length ? milestones[unlockedCount] : null;

  let progressPercent = 0;
  let caloriesRemaining = 0;

  if (nextMilestone) {
    const floor = unlockedCount > 0 ? currentMilestone.caloriesTarget : 0;
    const targetSpan = nextMilestone.caloriesTarget - floor;
    const progressInSpan = Math.max(0, totalCalories - floor);
    progressPercent = Math.min(100, Math.round((progressInSpan / targetSpan) * 100));
    caloriesRemaining = Math.max(0, nextMilestone.caloriesTarget - totalCalories);
  } else {
    // All unlocked!
    progressPercent = 100;
    caloriesRemaining = 0;
  }

  return {
    currentMilestone,
    nextMilestone,
    progressPercent,
    caloriesRemaining,
    unlockedCount,
    totalCount: milestones.length,
  };
}

/**
 * Identifies the top Pune Metro corridors where the commuter has burned the most active calories.
 */
export function getTopBurnCorridors(journeys: Journey[]): CorridorBurnSummary[] {
  const map = new Map<string, { from: string; to: string; calories: number; count: number; interchange: boolean }>();

  for (const j of journeys) {
    const fromId = j.from;
    const toId = j.to;
    // Standardize directional key alphabetically so A->B and B->A share corridor progress
    const key = [fromId, toId].sort().join('::');
    const cal = calculateJourneyCalories(j);
    const stationList = j.stationIds ?? [fromId, toId];
    const isInterchange = stationList.includes('civil-court') && fromId !== 'civil-court' && toId !== 'civil-court';

    const existing = map.get(key);
    if (existing) {
      existing.calories += cal;
      existing.count += 1;
    } else {
      map.set(key, {
        from: fromId,
        to: toId,
        calories: cal,
        count: 1,
        interchange: isInterchange,
      });
    }
  }

  const results: CorridorBurnSummary[] = [];
  for (const [key, val] of map.entries()) {
    results.push({
      corridorKey: key,
      fromName: getStationName(val.from),
      toName: getStationName(val.to),
      totalCalories: val.calories,
      ridesCount: val.count,
      hasInterchange: val.interchange,
    });
  }

  return results.sort((a, b) => b.totalCalories - a.totalCalories);
}
