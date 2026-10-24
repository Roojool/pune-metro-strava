import type { Journey } from '../../domain/models';
import type { PuneTreeSpecies, PuneTreeSpeciesId, TreeCanopyTier, TreeOffsetSummary } from './types';

export const PUNE_NATIVE_TREES: Record<PuneTreeSpeciesId, PuneTreeSpecies> = {
  peepal: {
    id: 'peepal',
    name: 'Peepal (Sacred Fig)',
    marathiName: 'पिंपळ',
    botanicalName: 'Ficus religiosa',
    annualCo2AbsorptionKg: 22.5,
    icon: '🍃',
    significance: 'Continuous 24-hour oxygen release and iconic Pune heritage shade.',
    puneHabitat: 'Vetal Tekdi, Fergusson College Hill & Old Pune Peths',
  },
  neem: {
    id: 'neem',
    name: 'Neem (Indian Lilac)',
    marathiName: 'कडुलिंब',
    botanicalName: 'Azadirachta indica',
    annualCo2AbsorptionKg: 20.0,
    icon: '🌿',
    significance: 'Natural air purifier resilient to vehicular pollution and dust.',
    puneHabitat: 'Savitribai Phule Pune University campus & Aundh avenues',
  },
  banyan: {
    id: 'banyan',
    name: 'Banyan (Vad)',
    marathiName: 'वड',
    botanicalName: 'Ficus benghalensis',
    annualCo2AbsorptionKg: 25.0,
    icon: '🌳',
    significance: 'Expansive multi-trunk canopy offering massive carbon storage.',
    puneHabitat: 'Sarasbaug, Empress Botanical Garden & Bund Garden',
  },
  tamarind: {
    id: 'tamarind',
    name: 'Tamarind (Chinch)',
    marathiName: 'चिंच',
    botanicalName: 'Tamarindus indica',
    annualCo2AbsorptionKg: 19.0,
    icon: '🍂',
    significance: 'Drought-tolerant ancient heritage tree of historical Pune settlements.',
    puneHabitat: 'Shaniwar Wada perimeter & Chinchwad historic corridors',
  },
  gulmohar: {
    id: 'gulmohar',
    name: 'Gulmohar (Royal Poinciana)',
    marathiName: 'गुलमोहर',
    botanicalName: 'Delonix regia',
    annualCo2AbsorptionKg: 18.0,
    icon: '🌺',
    significance: 'Vivid summer cooling canopy that lowers local urban heat islands.',
    puneHabitat: 'Prabhat Road, Model Colony & Kalyani Nagar greenways',
  },
};

const AVERAGE_TREE_ANNUAL_CO2_KG = 21.77; // Average mature urban tree sequestration in Pune

function getJourneyKm(j: Journey): number {
  if (typeof j.kilometers === 'number' && j.kilometers > 0) return j.kilometers;
  if (typeof (j as any).distanceKm === 'number' && (j as any).distanceKm > 0) return (j as any).distanceKm;
  return 6.0;
}

function getJourneyCo2Kg(j: Journey): number {
  if (typeof j.co2Kg === 'number' && j.co2Kg > 0) return j.co2Kg;
  const km = getJourneyKm(j);
  // Pune average vehicle avoidance: ~132 grams CO2 saved per passenger-km
  return Math.round(km * 0.132 * 100) / 100;
}

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

/**
 * Calculates commuter carbon offset, tree adoption equivalents, and ecological footprint.
 */
export function calculateTreeOffset(journeys: Journey[]): TreeOffsetSummary {
  if (!journeys || journeys.length === 0) {
    return {
      kgCo2Saved: 0,
      treeYearsSequestered: 0,
      treeDaysSequestered: 0,
      oxygenGeneratedLiters: 0,
      biodiversityScore: 0,
      activeTier: 'sapling',
      tierTitle: 'Peepal Sapling',
      tierTitleMarathi: 'पिंपळ रोपटे',
      featuredTree: PUNE_NATIVE_TREES.peepal,
      treesAdoptedCount: 0,
      nextTierTargetKg: 5.0,
      progressToNextTierPercent: 0,
      ecologicalTip:
        'Log your Pune Metro journeys to measure your clean-air carbon sequestration and urban tree equivalents.',
      shareableTreeText:
        '🌱 Pune Metro Strava — Urban Tree Offset\nNo journeys logged yet. Commute clean on Pune Metro to grow your urban forest offset!',
      accessibilityDescription:
        'Commuter Tree Offset: No journeys logged yet. Zero kilograms CO2 saved so far. Next milestone: Peepal Sapling at 5 kg CO2.',
    };
  }

  let totalCo2 = 0;
  const visitedStations = new Set<string>();

  for (const j of journeys) {
    totalCo2 += getJourneyCo2Kg(j);
    const from = getOriginStation(j);
    const to = getDestinationStation(j);
    if (from) visitedStations.add(from);
    if (to) visitedStations.add(to);
    if (Array.isArray(j.stationIds)) {
      for (const s of j.stationIds) {
        if (s) visitedStations.add(s);
      }
    }
  }

  const kgCo2Saved = Math.round(totalCo2 * 100) / 100;
  const treeYearsSequestered = Math.round((kgCo2Saved / AVERAGE_TREE_ANNUAL_CO2_KG) * 100) / 100;
  const treeDaysSequestered = Math.round((kgCo2Saved / AVERAGE_TREE_ANNUAL_CO2_KG) * 365);
  const oxygenGeneratedLiters = Math.round(kgCo2Saved * 750); // ~750L of O2 equivalent preserved
  const treesAdoptedCount = Math.floor(kgCo2Saved / 20.0);

  // Biodiversity score (0 to 100) based on route diversity, ride count, and carbon saved
  const biodiversityScore = Math.min(
    100,
    Math.round(visitedStations.size * 3.5 + journeys.length * 1.5 + kgCo2Saved * 1.2)
  );

  let activeTier: TreeCanopyTier = 'sapling';
  let tierTitle = 'Peepal Sapling';
  let tierTitleMarathi = 'पिंपळ रोपटे';
  let featuredTree = PUNE_NATIVE_TREES.peepal;
  let nextTierTargetKg = 5.0;
  let prevTierBaseKg = 0;

  if (kgCo2Saved >= 60.0) {
    activeTier = 'biosphere_patron';
    tierTitle = 'Western Ghats Biosphere Patron';
    tierTitleMarathi = 'पश्चिम घाट जैवविविधता संरक्षक';
    featuredTree = PUNE_NATIVE_TREES.banyan;
    nextTierTargetKg = 100.0;
    prevTierBaseKg = 60.0;
  } else if (kgCo2Saved >= 30.0) {
    activeTier = 'canopy_champion';
    tierTitle = 'Sahyadri Canopy Champion';
    tierTitleMarathi = 'सह्याद्री हरित छत्रपती';
    featuredTree = PUNE_NATIVE_TREES.gulmohar;
    nextTierTargetKg = 60.0;
    prevTierBaseKg = 30.0;
  } else if (kgCo2Saved >= 15.0) {
    activeTier = 'forest_guardian';
    tierTitle = 'Vetal Tekdi Forest Guardian';
    tierTitleMarathi = 'वेताळ टेकडी वनरक्षक';
    featuredTree = PUNE_NATIVE_TREES.neem;
    nextTierTargetKg = 30.0;
    prevTierBaseKg = 15.0;
  } else if (kgCo2Saved >= 5.0) {
    activeTier = 'grove';
    tierTitle = 'Neem Grove Contributor';
    tierTitleMarathi = 'कडुलिंब वन संरक्षक';
    featuredTree = PUNE_NATIVE_TREES.tamarind;
    nextTierTargetKg = 15.0;
    prevTierBaseKg = 5.0;
  }

  const range = nextTierTargetKg - prevTierBaseKg;
  const progressToNextTierPercent = Math.min(
    100,
    Math.max(0, Math.round(((kgCo2Saved - prevTierBaseKg) / range) * 100))
  );

  let ecologicalTip = '';
  if (activeTier === 'biosphere_patron') {
    ecologicalTip = `Remarkable impact! Your ${kgCo2Saved} kg CO₂ saved equals ${treeDaysSequestered} days of mature Peepal and Banyan canopy absorption across Pune.`;
  } else if (activeTier === 'canopy_champion') {
    ecologicalTip = `Sahyadri level! You've protected Pune's urban microclimate by generating the equivalent of ${oxygenGeneratedLiters.toLocaleString()} L of clean oxygen.`;
  } else if (activeTier === 'forest_guardian') {
    ecologicalTip = `Like the lush slopes of Vetal Tekdi, your metro transit has saved ${kgCo2Saved} kg of tailpipe CO₂ emissions.`;
  } else if (activeTier === 'grove') {
    ecologicalTip = `Great rhythm! You have offset ${treeDaysSequestered} tree-days of emissions. Keep riding to reach Vetal Tekdi Guardian.`;
  } else {
    ecologicalTip = `Every metro commute prevents roadside emissions. You need ${(nextTierTargetKg - kgCo2Saved).toFixed(1)} kg more CO₂ saved to reach ${tierTitle}.`;
  }

  const shareableTreeText = `🌳 Pune Metro Strava — Urban Tree Offset\n` +
    `Status: ${tierTitle} (${tierTitleMarathi})\n` +
    `• CO₂ Sequestered: ${kgCo2Saved} kg\n` +
    `• Mature Tree Absorption: ${treeDaysSequestered} days (${treeYearsSequestered} tree-years)\n` +
    `• Clean Oxygen Produced: ${oxygenGeneratedLiters.toLocaleString()} Liters\n` +
    `• Biodiversity Score: ${biodiversityScore}/100\n` +
    `Featured Tree: ${featuredTree.icon} ${featuredTree.name} (${featuredTree.botanicalName})\n` +
    `#PuneMetro #GreenCommute #Punekar`;

  const accessibilityDescription =
    `Commuter Tree Offset: ${tierTitle} (${tierTitleMarathi}). ` +
    `${kgCo2Saved} kg CO2 saved across ${journeys.length} rides. ` +
    `Equivalent to ${treeDaysSequestered} tree-days of carbon absorption and ${oxygenGeneratedLiters.toLocaleString()} liters of clean oxygen. ` +
    `Biodiversity score: ${biodiversityScore} out of 100.`;

  return {
    kgCo2Saved,
    treeYearsSequestered,
    treeDaysSequestered,
    oxygenGeneratedLiters,
    biodiversityScore,
    activeTier,
    tierTitle,
    tierTitleMarathi,
    featuredTree,
    treesAdoptedCount,
    nextTierTargetKg,
    progressToNextTierPercent,
    ecologicalTip,
    shareableTreeText,
    accessibilityDescription,
  };
}
