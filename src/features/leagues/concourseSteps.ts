import type { Journey } from '../../domain/models';
import { isLineTransferJourney } from './scoring';
import type { ConcourseStepsSummary } from './types';

interface StationStepProfile {
  entrySteps: number;
  exitSteps: number;
}

const STATION_STEP_MAP: Record<string, StationStepProfile> = {
  'civil-court': { entrySteps: 420, exitSteps: 380 }, // Deepest station (~33.1m depth)
  swargate: { entrySteps: 310, exitSteps: 290 },
  pcmc: { entrySteps: 240, exitSteps: 220 },
  vanaz: { entrySteps: 240, exitSteps: 220 },
  ramwadi: { entrySteps: 240, exitSteps: 220 },
  'pune-railway-station': { entrySteps: 250, exitSteps: 230 },
};

const DEFAULT_ELEVATED_STEPS: StationStepProfile = {
  entrySteps: 180,
  exitSteps: 160,
};

const STEP_MILESTONES = [
  { target: 1000, title: 'Concourse Walker' },
  { target: 5000, title: '5K Active Transit Stepper' },
  { target: 10000, title: '10K Station Century Club' },
  { target: 25000, title: 'Pune Metro Marathon Stepper' },
];

/**
 * Returns station entry and exit physical step profiles.
 */
export function getStationStepProfile(stationId: string): StationStepProfile {
  return STATION_STEP_MAP[stationId] ?? DEFAULT_ELEVATED_STEPS;
}

/**
 * Calculates pedestrian concourse steps, station walking distance, and Pune park loop equivalents.
 */
export function calculateConcourseSteps(journeys: Journey[]): ConcourseStepsSummary {
  if (journeys.length === 0) {
    return {
      totalEstimatedSteps: 0,
      totalConcourseKm: 0,
      interchangeSteps: 0,
      averageStepsPerRide: 0,
      puneParkLapEquivalent: 'Deccan Gymkhana Track (400m)',
      puneParkLapCount: 0,
      stepMilestoneTitle: 'Concourse Walker',
      stepMilestoneProgress: 0,
      stepMilestoneTarget: 1000,
      accessibilityDescription: 'Concourse steps: 0 steps logged. Concourse Walker target: 1,000 steps.',
    };
  }

  let totalEstimatedSteps = 0;
  let interchangeSteps = 0;

  for (const j of journeys) {
    const originProfile = getStationStepProfile(j.from);
    const destProfile = getStationStepProfile(j.to);

    let rideSteps = originProfile.entrySteps + destProfile.exitSteps;

    const stationList = j.stationIds ?? [j.from, j.to];
    if (isLineTransferJourney(stationList)) {
      rideSteps += 450; // Civil Court multi-tier interchange platforms & concourse bridge
      interchangeSteps += 450;
    }

    totalEstimatedSteps += rideSteps;
  }

  // Average commuter stride length: ~0.75m -> 1,333 steps = 1 km
  const totalConcourseKm = Math.round((totalEstimatedSteps * 0.75 / 1000) * 10) / 10;
  const averageStepsPerRide = Math.round(totalEstimatedSteps / journeys.length);

  // Pune walking track equivalents
  let puneParkLapEquivalent: string;
  let puneParkLapCount: number;

  if (totalEstimatedSteps < 2000) {
    puneParkLapEquivalent = 'Deccan Gymkhana Track (400m)';
    puneParkLapCount = Math.round((totalEstimatedSteps / 530) * 10) / 10;
  } else if (totalEstimatedSteps < 6000) {
    puneParkLapEquivalent = 'Sambhaji Park JM Road Promenade (800m)';
    puneParkLapCount = Math.round((totalEstimatedSteps / 1060) * 10) / 10;
  } else {
    puneParkLapEquivalent = 'Saras Baug Lake Promenade (1.2km)';
    puneParkLapCount = Math.round((totalEstimatedSteps / 1600) * 10) / 10;
  }

  // Find next milestone
  let milestone = STEP_MILESTONES[STEP_MILESTONES.length - 1];
  for (const ms of STEP_MILESTONES) {
    if (totalEstimatedSteps < ms.target) {
      milestone = ms;
      break;
    }
  }

  const stepMilestoneTarget = milestone.target;
  const stepMilestoneTitle = milestone.title;
  const stepMilestoneProgress = Math.min(
    1,
    Math.round((totalEstimatedSteps / stepMilestoneTarget) * 100) / 100
  );

  const accessibilityDescription = `Concourse steps: ${totalEstimatedSteps.toLocaleString()} steps (~${totalConcourseKm} km walked in stations). Equal to ${puneParkLapCount} laps around ${puneParkLapEquivalent}. Next milestone: ${stepMilestoneTitle} (${Math.round(stepMilestoneProgress * 100)}%).`;

  return {
    totalEstimatedSteps,
    totalConcourseKm,
    interchangeSteps,
    averageStepsPerRide,
    puneParkLapEquivalent,
    puneParkLapCount,
    stepMilestoneTitle,
    stepMilestoneProgress,
    stepMilestoneTarget,
    accessibilityDescription,
  };
}
