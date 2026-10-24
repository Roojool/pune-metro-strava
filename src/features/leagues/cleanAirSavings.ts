import type { Journey } from '../../domain/models';
import { getStationName } from '../../data/pune';
import type { CleanAirMetrics, EcoTier } from './types';

/**
 * Calculates environmental savings and clean air impact from replacing road commutes with Pune Metro.
 */
export function calculateCleanAirMetrics(journeys: Journey[]): CleanAirMetrics {
  const totalKm = Math.round(journeys.reduce((sum, j) => sum + j.kilometers, 0) * 10) / 10;

  if (totalKm === 0) {
    return {
      totalKm: 0,
      fuelSavedLiters: 0,
      fuelExpenseSavedRupees: 0,
      co2PreventedKg: 0,
      pm25PreventedGrams: 0,
      treesAbsorptionEquivalent: 0,
      roadMinutesSaved: 0,
      ecoTier: 'seedling',
      ecoTierTitle: 'Seedling Commuter',
      ecoTierDescription: 'Log your first Pune Metro ride to start calculating avoided road pollution and fuel savings.',
      topEcoCorridor: 'None logged yet',
      accessibilitySummary: 'Clean air metrics: 0 km logged. Seedling commuter status.',
    };
  }

  // Average Pune mixed vehicle fuel efficiency in stop-and-go road traffic (~20 km/L)
  const fuelSavedLiters = Math.round((totalKm / 20) * 10) / 10;

  // Pune average petrol cost (~₹105/L)
  const fuelExpenseSavedRupees = Math.round(fuelSavedLiters * 105);

  // Avoided tailpipe CO2 (~0.12 kg/km avoided vs urban mixed road traffic)
  const co2PreventedKg = Math.round(totalKm * 0.12 * 10) / 10;

  // Toxic exhaust particulate matter (PM2.5/PM10) avoided (~0.15g per km)
  const pm25PreventedGrams = Math.round(totalKm * 0.15 * 10) / 10;

  // Tree absorption equivalent (22 kg CO2 per mature urban tree per year)
  const treesAbsorptionEquivalent = Math.round((co2PreventedKg / 22) * 10) / 10;

  // Surface road delay saved in traffic (~2.2 minutes saved per km vs Karve/Old Highway bottlenecks)
  const roadMinutesSaved = Math.round(totalKm * 2.2);

  let ecoTier: EcoTier;
  let ecoTierTitle: string;
  let ecoTierDescription: string;

  if (co2PreventedKg < 5) {
    ecoTier = 'seedling';
    ecoTierTitle = 'Seedling Commuter';
    ecoTierDescription = 'Sprouting green transit roots across Pune.';
  } else if (co2PreventedKg < 15) {
    ecoTier = 'sapling';
    ecoTierTitle = 'Sapling Commuter';
    ecoTierDescription = 'Actively purifying city air and avoiding road traffic congestion.';
  } else if (co2PreventedKg < 35) {
    ecoTier = 'green_canopy';
    ecoTierTitle = 'Green Canopy Guardian';
    ecoTierDescription = 'Substantial eco protector shielding Pune from dozens of kilos of vehicle exhaust.';
  } else {
    ecoTier = 'forest_guardian';
    ecoTierTitle = 'Urban Forest Legend';
    ecoTierDescription = 'Championing emission-free urban mobility with landmark carbon offsets.';
  }

  // Aggregate kilometers by corridor to identify top eco corridor
  const corridorKm: Record<string, number> = {};
  for (const j of journeys) {
    const key = [j.from, j.to].sort().join(' ↔ ');
    corridorKm[key] = (corridorKm[key] ?? 0) + j.kilometers;
  }

  let topKey = '';
  let topDist = 0;
  for (const [key, dist] of Object.entries(corridorKm)) {
    if (dist > topDist) {
      topDist = dist;
      topKey = key;
    }
  }

  let topEcoCorridor = 'None logged yet';
  if (topKey) {
    const [fromId, toId] = topKey.split(' ↔ ');
    topEcoCorridor = `${getStationName(fromId)} ↔ ${getStationName(toId)}`;
  }

  const accessibilitySummary = `Clean air impact: ${totalKm} km traveled. Prevented ${co2PreventedKg} kg CO2 and ${pm25PreventedGrams} g PM2.5. Saved ${fuelSavedLiters} L of petrol (₹${fuelExpenseSavedRupees}) and ${roadMinutesSaved} minutes in road traffic. Tier: ${ecoTierTitle}.`;

  return {
    totalKm,
    fuelSavedLiters,
    fuelExpenseSavedRupees,
    co2PreventedKg,
    pm25PreventedGrams,
    treesAbsorptionEquivalent,
    roadMinutesSaved,
    ecoTier,
    ecoTierTitle,
    ecoTierDescription,
    topEcoCorridor,
    accessibilitySummary,
  };
}
