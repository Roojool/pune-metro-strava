import type { Journey } from '../../domain/models';
import { calculateJourneyCalories } from './scoring';
import type { BurnPaceEfficiencySummary } from './types';

/**
 * Calculates commute pace, speed, and physical calorie burn rates compared to road traffic.
 */
export function calculateBurnPaceEfficiency(journeys: Journey[]): BurnPaceEfficiencySummary {
  if (journeys.length === 0) {
    return {
      averagePaceMinPerKm: 0,
      averageSpeedKmh: 0,
      burnRateKcalPerKm: 0,
      burnRateKcalPerMinute: 0,
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      totalCaloriesBurned: 0,
      roadPaceComparisonMinPerKm: 4.0,
      timeSavingsMultiplier: 2.2,
      efficiencyRatingTitle: 'Pace Explorer',
      efficiencyRatingSubtitle: 'Log your first journey to begin measuring your speed and active burn rates!',
      accessibilityDescription: 'Burn pace efficiency: 0 km logged. Pace Explorer rating.',
    };
  }

  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;
  let totalCaloriesBurned = 0;

  for (const j of journeys) {
    const km = j.kilometers || 0;
    const mins =
      ('minutes' in j && typeof j.minutes === 'number' && j.minutes) ||
      ('durationMinutes' in (j as any) && typeof (j as any).durationMinutes === 'number' && (j as any).durationMinutes) ||
      Math.max(1, Math.round(km * 1.8));

    totalDistanceKm += km;
    totalDurationMinutes += mins;
    totalCaloriesBurned += calculateJourneyCalories(j);
  }

  totalDistanceKm = Math.round(totalDistanceKm * 10) / 10;

  const averagePaceMinPerKm =
    totalDistanceKm > 0
      ? Math.round((totalDurationMinutes / totalDistanceKm) * 10) / 10
      : 0;

  const averageSpeedKmh =
    totalDurationMinutes > 0
      ? Math.round((totalDistanceKm / (totalDurationMinutes / 60)) * 10) / 10
      : 0;

  const burnRateKcalPerKm =
    totalDistanceKm > 0
      ? Math.round((totalCaloriesBurned / totalDistanceKm) * 10) / 10
      : 0;

  const burnRateKcalPerMinute =
    totalDurationMinutes > 0
      ? Math.round((totalCaloriesBurned / totalDurationMinutes) * 10) / 10
      : 0;

  const roadPaceComparisonMinPerKm = 4.0; // ~15 km/h in peak Pune road traffic
  const timeSavingsMultiplier =
    averagePaceMinPerKm > 0
      ? Math.round((roadPaceComparisonMinPerKm / averagePaceMinPerKm) * 10) / 10
      : 2.2;

  let efficiencyRatingTitle: string;
  let efficiencyRatingSubtitle: string;

  if (averageSpeedKmh >= 30) {
    efficiencyRatingTitle = 'Express Transit Sprinter';
    efficiencyRatingSubtitle = `Blazing fast commute averaging ${averageSpeedKmh} km/h—bypassing surface road congestion!`;
  } else if (averageSpeedKmh >= 22) {
    efficiencyRatingTitle = 'Active Concourse Cruiser';
    efficiencyRatingSubtitle = `Balanced rhythm averaging ${averagePaceMinPerKm} min/km with strong platform and stairs exertion.`;
  } else {
    efficiencyRatingTitle = 'Steady Station Stepper';
    efficiencyRatingSubtitle = `High active burn density (${burnRateKcalPerKm} kcal/km) prioritizing stairs and station concourse steps.`;
  }

  const accessibilityDescription = `Pace & burn efficiency: ${averageSpeedKmh} km/h (${averagePaceMinPerKm} min/km). Burn rate: ${burnRateKcalPerKm} kcal/km, ${burnRateKcalPerMinute} kcal/min. ${timeSavingsMultiplier}x faster than Pune peak road traffic. Rating: ${efficiencyRatingTitle}.`;

  return {
    averagePaceMinPerKm,
    averageSpeedKmh,
    burnRateKcalPerKm,
    burnRateKcalPerMinute,
    totalDistanceKm,
    totalDurationMinutes,
    totalCaloriesBurned,
    roadPaceComparisonMinPerKm,
    timeSavingsMultiplier,
    efficiencyRatingTitle,
    efficiencyRatingSubtitle,
    accessibilityDescription,
  };
}
