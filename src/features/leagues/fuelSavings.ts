import type { Journey } from '../../domain/models';
import type { FuelSavingsSummary } from './types';

function getJourneyKm(j: Journey): number {
  return typeof j.kilometers === 'number' ? j.kilometers : (j as any).distanceKm || 0;
}

function getJourneyFare(j: Journey, km: number): number {
  if (typeof j.fare === 'number' && j.fare > 0) return j.fare;
  // Standard Pune Metro slab: ₹10 (0-2 km), ₹15 (2-4 km), ₹20 (4-8 km), ₹25 (8-12 km), ₹30-35 (>12 km)
  if (km <= 2) return 10;
  if (km <= 4) return 15;
  if (km <= 8) return 20;
  if (km <= 12) return 25;
  return 30;
}

/**
 * Calculates rupee fuel savings, auto-rickshaw fare offsets, and economic commute efficiency.
 */
export function calculateFuelSavings(journeys: Journey[]): FuelSavingsSummary {
  if (!journeys || journeys.length === 0) {
    return {
      totalRupeesSavedVsScooter: 0,
      totalRupeesSavedVsAuto: 0,
      totalRupeesSavedVsCar: 0,
      totalMetroFareSpent: 0,
      netEconomicSavings: 0,
      petrolLitersAvoided: 0,
      puneCulturalSavingEquivalent: 'Log rides to unlock Pune cultural savings equivalents.',
      savingsPersona: 'Budget Smart Explorer',
      savingsPersonaMarathi: 'बचत शोधक',
      shareableSavingsText:
        '💰 Pune Metro Strava — Commuter Rupee Fuel Savings\nNo rides logged yet. Complete rides on Pune Metro to track financial and fuel savings vs road travel!',
      accessibilityDescription:
        'Commuter Fuel Savings: No rides logged yet. Travel on Pune Metro to compute petrol savings and auto fare offsets.',
    };
  }

  let totalKm = 0;
  let totalMetroFareSpent = 0;
  let totalScooterCost = 0;
  let totalAutoCost = 0;
  let totalCarCost = 0;

  for (const j of journeys) {
    const km = getJourneyKm(j);
    totalKm += km;

    const fare = getJourneyFare(j, km);
    totalMetroFareSpent += fare;

    // Two-wheeler (Activa ~35 km/L @ ₹106/L + maintenance = ₹3.50/km)
    totalScooterCost += km * 3.5;

    // Auto-rickshaw (₹25 base for first 1.5 km + ₹17/km)
    const autoFare = Math.max(25, 25 + Math.max(0, km - 1.5) * 17);
    totalAutoCost += autoFare;

    // Car (~12 km/L @ ₹106/L + ₹30 parking/maintenance = ₹10.50/km)
    totalCarCost += km * 10.5;
  }

  const totalRupeesSavedVsScooter = Math.max(0, Math.round(totalScooterCost - totalMetroFareSpent));
  const totalRupeesSavedVsAuto = Math.max(0, Math.round(totalAutoCost - totalMetroFareSpent));
  const totalRupeesSavedVsCar = Math.max(0, Math.round(totalCarCost - totalMetroFareSpent));

  const netEconomicSavings = totalRupeesSavedVsScooter;
  const petrolLitersAvoided = Math.round((totalKm / 35) * 10) / 10;

  // Cultural Savings Equivalent
  let puneCulturalSavingEquivalent = '1 Irani Chai & Bun Maska at Goodluck Café (~₹90)';
  if (netEconomicSavings >= 1500) {
    const packets = Math.round(netEconomicSavings / 140);
    puneCulturalSavingEquivalent = `${packets} packets of Chitale Bandhu Bakarwadi (₹${netEconomicSavings} saved)`;
  } else if (netEconomicSavings >= 800) {
    puneCulturalSavingEquivalent = '1 monthly Pune Metro One Smart Card pass recharge (~₹800)';
  } else if (netEconomicSavings >= 400) {
    puneCulturalSavingEquivalent = '4 plates of SPDP at FC Road Vaishali (~₹480)';
  } else if (netEconomicSavings >= 150) {
    puneCulturalSavingEquivalent = '2 packets of Chitale Bandhu Bakarwadi (~₹280)';
  }

  // Persona
  let savingsPersona = 'Budget Smart Explorer';
  let savingsPersonaMarathi = 'बचत शोधक';

  if (netEconomicSavings >= 1200) {
    savingsPersona = 'Pune Financial Freedom Champion';
    savingsPersonaMarathi = 'पुणे आर्थिक स्वातंत्र्य नायक';
  } else if (netEconomicSavings >= 500) {
    savingsPersona = 'Smart Pune Transit Economist';
    savingsPersonaMarathi = 'हुशार पुणे अर्थशास्त्री';
  } else if (netEconomicSavings >= 150) {
    savingsPersona = 'Paisa Vasool Commuter';
    savingsPersonaMarathi = 'पैसा वसूल प्रवासी';
  }

  const shareableSavingsText = [
    '💰 Pune Metro Strava — Commuter Rupee Fuel Savings',
    `🎖️ Status: ${savingsPersona} (${savingsPersonaMarathi})`,
    `🛵 Saved vs Two-Wheeler: ₹${totalRupeesSavedVsScooter}`,
    `🛺 Saved vs Auto-Rickshaw: ₹${totalRupeesSavedVsAuto}`,
    `⛽ Petrol Avoided: ~${petrolLitersAvoided} liters (~₹106/L)`,
    `🎁 Pune Cultural Equivalent: ${puneCulturalSavingEquivalent}`,
    `🎫 Metro Fare Invested: ₹${totalMetroFareSpent}`,
  ].join('\n');

  const accessibilityDescription = `Commuter Fuel Savings: Status ${savingsPersona}. Saved ₹${totalRupeesSavedVsScooter} versus scooter fuel and ₹${totalRupeesSavedVsAuto} versus auto-rickshaws. Avoided ${petrolLitersAvoided} liters of petrol. Cultural equivalent: ${puneCulturalSavingEquivalent}.`;

  return {
    totalRupeesSavedVsScooter,
    totalRupeesSavedVsAuto,
    totalRupeesSavedVsCar,
    totalMetroFareSpent,
    netEconomicSavings,
    petrolLitersAvoided,
    puneCulturalSavingEquivalent,
    savingsPersona,
    savingsPersonaMarathi,
    shareableSavingsText,
    accessibilityDescription,
  };
}
