import type { Journey } from '../../domain/models';
import type { AcousticTier, AcousticWellnessSummary, PuneQuietHaven } from './types';

export const PUNE_QUIET_HAVENS: PuneQuietHaven[] = [
  {
    id: 'sarasbaug_dawn',
    name: 'Sarasbaug Lake & Temple Lawn',
    marathiName: 'सारसबाग तलाव व मंदिर',
    ambientDecibels: 54,
    description: 'Tranquil morning serenity along historic Peshwa lakeside lawns.',
    unlockedAtMinutes: 20,
    isUnlocked: false,
  },
  {
    id: 'osho_teerth',
    name: 'Osho Teerth Zen Park',
    marathiName: 'ओशो तीर्थ उद्यान',
    ambientDecibels: 48,
    description: 'Flowing natural stream and dense bamboo grove insulated from urban roar.',
    unlockedAtMinutes: 60,
    isUnlocked: false,
  },
  {
    id: 'empress_garden',
    name: 'Empress Botanical Garden Canopy',
    marathiName: 'एम्प्रेस बॉटनिकल गार्डन',
    ambientDecibels: 50,
    description: 'Towering banyan and mahogany canopy absorbing street traffic honking.',
    unlockedAtMinutes: 120,
    isUnlocked: false,
  },
  {
    id: 'vetal_tekdi_ridge',
    name: 'Vetal Tekdi Sunrise Ridge',
    marathiName: 'वेताळ टेकडी माथा',
    ambientDecibels: 45,
    description: "Pune's highest natural hilltop ridge whispering above city acoustics.",
    unlockedAtMinutes: 240,
    isUnlocked: false,
  },
];

function getJourneyKm(j: Journey): number {
  if (typeof j.kilometers === 'number' && j.kilometers > 0) return j.kilometers;
  if (typeof (j as any).distanceKm === 'number' && (j as any).distanceKm > 0) return (j as any).distanceKm;
  return 6.0;
}

function getJourneyDurationMinutes(j: Journey): number {
  if (typeof j.minutes === 'number' && j.minutes > 0) return j.minutes;
  const km = getJourneyKm(j);
  return Math.round(km * 1.8);
}

/**
 * Calculates commuter acoustic wellness, sound pressure reduction, and quiet haven equivalents.
 */
export function calculateAcousticWellness(journeys: Journey[]): AcousticWellnessSummary {
  const havens: PuneQuietHaven[] = PUNE_QUIET_HAVENS.map((h) => ({
    ...h,
    isUnlocked: false,
  }));

  const averageCoachDba = 65; // AC, insulated train coach
  const roadwayPeakDba = 92; // Typical Pune street traffic with pressure horns
  const decibelReductionDba = roadwayPeakDba - averageCoachDba; // 27 dBA
  const acousticEnergyReductionPercent = 99.8; // 10^(-2.7) = 0.002 = 99.8% reduction in sound wave pressure

  if (!journeys || journeys.length === 0) {
    return {
      quietTransitMinutes: 0,
      roadNoiseMinutesAvoided: 0,
      averageCoachDba,
      roadwayPeakDba,
      decibelReductionDba,
      acousticEnergyReductionPercent,
      peacefulZoneScore: 0,
      acousticTier: 'acoustic_seeker',
      tierTitle: 'Acoustic Seeker',
      tierTitleMarathi: 'शांतता शोधक',
      unlockedHavens: havens,
      nextTierMinutes: 30,
      progressPercent: 0,
      wellnessTip:
        'Log your Pune Metro rides to track how many hours of 90+ dBA roadside traffic noise and pressure horns you bypass.',
      shareableAcousticText:
        '🎧 Pune Metro Strava — Acoustic Wellness & Noise Shield\nNo rides logged yet. Travel in air-conditioned 65 dBA metro coaches to shield your hearing from roadside traffic roar!',
      accessibilityDescription:
        'Acoustic Wellness: No rides logged yet. Zero quiet transit minutes logged. Next milestone: Acoustic Seeker at 30 minutes.',
    };
  }

  let totalMinutes = 0;
  for (const j of journeys) {
    totalMinutes += getJourneyDurationMinutes(j);
  }

  const quietTransitMinutes = totalMinutes;
  const roadNoiseMinutesAvoided = totalMinutes;

  // Unlock havens
  for (const haven of havens) {
    haven.isUnlocked = quietTransitMinutes >= haven.unlockedAtMinutes;
  }

  // Peaceful zone score (0 to 100)
  const peacefulZoneScore = Math.min(
    100,
    Math.round(quietTransitMinutes * 0.8 + journeys.length * 2.5)
  );

  let acousticTier: AcousticTier = 'acoustic_seeker';
  let tierTitle = 'Acoustic Seeker';
  let tierTitleMarathi = 'शांतता शोधक';
  let nextTierMinutes = 30;
  let prevTierBaseMinutes = 0;

  if (quietTransitMinutes >= 200) {
    acousticTier = 'silent_corridor_champion';
    tierTitle = 'Silent Corridor Champion';
    tierTitleMarathi = 'शांतता महामार्ग सम्राट';
    nextTierMinutes = 360;
    prevTierBaseMinutes = 200;
  } else if (quietTransitMinutes >= 90) {
    acousticTier = 'decibel_shield_master';
    tierTitle = 'Decibel Shield Master';
    tierTitleMarathi = 'ध्वनी संरक्षण निष्णात';
    nextTierMinutes = 200;
    prevTierBaseMinutes = 90;
  } else if (quietTransitMinutes >= 30) {
    acousticTier = 'zen_commuter';
    tierTitle = 'Zen Commuter';
    tierTitleMarathi = 'ध्यानस्थ प्रवासी';
    nextTierMinutes = 90;
    prevTierBaseMinutes = 30;
  }

  const range = nextTierMinutes - prevTierBaseMinutes;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((quietTransitMinutes - prevTierBaseMinutes) / range) * 100))
  );

  let wellnessTip = '';
  if (acousticTier === 'silent_corridor_champion') {
    wellnessTip = `Superb auditory recovery! You have enjoyed ${quietTransitMinutes} minutes of serene 65 dBA commute, matching the hush of Vetal Tekdi ridge.`;
  } else if (acousticTier === 'decibel_shield_master') {
    wellnessTip = `Exceptional acoustic shield! By avoiding 92 dBA street horns, your auditory fatigue dropped by ${acousticEnergyReductionPercent}%.`;
  } else if (acousticTier === 'zen_commuter') {
    wellnessTip = `Great mindful rhythm! You have unlocked tranquil haven equivalents. Keep riding to attain Decibel Shield Master.`;
  } else {
    wellnessTip = `Pune roads reach 92+ dBA in peak rush. Your metro cabin provides a peaceful 65 dBA haven. ${nextTierMinutes - quietTransitMinutes} min to next tier.`;
  }

  const shareableAcousticText = `🎧 Pune Metro Strava — Acoustic Wellness\n` +
    `Tier: ${tierTitle} (${tierTitleMarathi})\n` +
    `• Quiet Transit: ${quietTransitMinutes} minutes\n` +
    `• Sound Energy Cut: ${acousticEnergyReductionPercent}% (65 dBA cabin vs 92 dBA street)\n` +
    `• Acoustic Relief: -${decibelReductionDba} dBA\n` +
    `• Peaceful Zone Score: ${peacefulZoneScore}/100\n` +
    `Havens Unlocked: ${havens.filter((h) => h.isUnlocked).length} of ${havens.length}\n` +
    `#PuneMetro #AcousticWellness #ZenCommute #Punekar`;

  const accessibilityDescription =
    `Acoustic Wellness: ${tierTitle} (${tierTitleMarathi}). ` +
    `${quietTransitMinutes} quiet transit minutes logged. ` +
    `Avoided ${roadNoiseMinutesAvoided} minutes of 92 dBA street traffic noise inside 65 dBA insulated coaches. ` +
    `${havens.filter((h) => h.isUnlocked).length} quiet havens unlocked. Peaceful score: ${peacefulZoneScore} of 100.`;

  return {
    quietTransitMinutes,
    roadNoiseMinutesAvoided,
    averageCoachDba,
    roadwayPeakDba,
    decibelReductionDba,
    acousticEnergyReductionPercent,
    peacefulZoneScore,
    acousticTier,
    tierTitle,
    tierTitleMarathi,
    unlockedHavens: havens,
    nextTierMinutes,
    progressPercent,
    wellnessTip,
    shareableAcousticText,
    accessibilityDescription,
  };
}
