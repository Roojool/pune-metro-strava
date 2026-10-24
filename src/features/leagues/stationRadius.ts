import type { Journey } from '../../domain/models';
import type { NeighborhoodCatchment, StationRadiusSummary } from './types';

interface CatchmentDefinition {
  id: string;
  name: string;
  marathiName: string;
  associatedStations: string[];
  walkRadiusMeters: number;
  prominentLandmarks: string[];
}

const PUNE_CATCHMENTS: CatchmentDefinition[] = [
  {
    id: 'deccan-fc-road',
    name: 'FC Road & Deccan Cultural District',
    marathiName: 'फर्ग्युसन व डेक्कन सांस्कृतिक परिसर',
    associatedStations: ['deccan-gymkhana', 'sambhaji-udyan', 'garware-college'],
    walkRadiusMeters: 800,
    prominentLandmarks: ['Fergusson College Road', 'JM Road', 'Balgandharva Rangmandir', 'Sambhaji Park'],
  },
  {
    id: 'peth-heritage',
    name: 'Historic Peth & Market Precinct',
    marathiName: 'ऐतिहासिक पेठ व मंडई परिसर',
    associatedStations: ['pmc', 'mandai', 'kasba-peth'],
    walkRadiusMeters: 750,
    prominentLandmarks: ['Shaniwar Wada', 'Mahatma Phule Mandai', 'Kasba Ganpati', 'Tulshibaug'],
  },
  {
    id: 'civil-court-legal',
    name: 'District Court & Administrative Hub',
    marathiName: 'जिल्हा न्यायालय व प्रशासकीय केंद्र',
    associatedStations: ['civil-court', 'shivajinagar'],
    walkRadiusMeters: 900,
    prominentLandmarks: ['District Court', 'Shivajinagar Bus Stand', 'COEP Tech University', 'Sangam Bridge'],
  },
  {
    id: 'kalyani-kp-corridor',
    name: 'Kalyani Nagar & Koregaon Park Corridor',
    marathiName: 'कल्याणी नगर व कोरेगाव पार्क परिसर',
    associatedStations: ['kalyani-nagar', 'bund-garden', 'ruby-hall-clinic'],
    walkRadiusMeters: 950,
    prominentLandmarks: ['Jogger Park', 'Koregaon Park North Main Rd', 'Bund Garden Walkway', 'Ruby Hall Clinic'],
  },
  {
    id: 'karve-coaching-hub',
    name: 'Karve Road & Kothrud Educational Belt',
    marathiName: 'कर्वे रस्ता व कोथरूड शिक्षण परिसर',
    associatedStations: ['nal-stop', 'ideal-colony', 'anand-nagar', 'vanaz'],
    walkRadiusMeters: 850,
    prominentLandmarks: ['SNDT Women University', 'Law College Road', 'Maharshi Karve Statue', 'Kothrud Market'],
  },
  {
    id: 'pcmc-industrial-gateway',
    name: 'PCMC Arterial & Industrial Gateway',
    marathiName: 'पिंपरी-चिंचवड औद्योगिक प्रवेशद्वार',
    associatedStations: ['pcmc', 'sant-tukaram-nagar', 'nashik-phata', 'kasarwadi'],
    walkRadiusMeters: 800,
    prominentLandmarks: ['PCMC Municipal Corporation', 'Dr. D.Y. Patil Medical Hub', 'Nashik Phata Flyover', 'MIDC Belt'],
  },
];

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

/**
 * Calculates first- and last-mile walking radius metrics and neighborhood catchments.
 */
export function calculateStationRadius(journeys: Journey[]): StationRadiusSummary {
  if (!journeys || journeys.length === 0) {
    const emptyCatchments: NeighborhoodCatchment[] = PUNE_CATCHMENTS.map((c) => ({
      ...c,
      visitCount: 0,
      isUnlocked: false,
      totalKmWalked: 0,
    }));

    return {
      totalEstimatedWalkKm: 0,
      totalWalkSteps: 0,
      firstLastMileBurnKcal: 0,
      activeCommuteMultiplier: 1.0,
      unlockedCatchmentsCount: 0,
      totalCatchments: PUNE_CATCHMENTS.length,
      catchments: emptyCatchments,
      topWalkableHub: 'None logged yet',
      pedestrianPersona: 'Emerging Pedestrian',
      pedestrianPersonaMarathi: 'प्रारंभिक पदयात्री',
      shareableRadiusText:
        '🚶 Pune Metro Strava — First/Last-Mile Walking Radius\nNo rides logged yet. Complete metro commutes to explore walkable catchments across Pune!',
      accessibilityDescription:
        'Neighborhood Walking Radius: No journeys logged yet. Take metro rides to track first-mile and last-mile walking distance.',
    };
  }

  // Count visits to stations across all journeys
  const stationVisits: Record<string, number> = {};
  for (const j of journeys) {
    const from = getOriginStation(j);
    const to = getDestinationStation(j);
    if (from) stationVisits[from] = (stationVisits[from] || 0) + 1;
    if (to) stationVisits[to] = (stationVisits[to] || 0) + 1;
  }

  // Evaluate each neighborhood catchment
  const catchments: NeighborhoodCatchment[] = PUNE_CATCHMENTS.map((def) => {
    let visitCount = 0;
    for (const stId of def.associatedStations) {
      visitCount += stationVisits[stId] || 0;
    }
    const isUnlocked = visitCount >= 2;
    // Each visit generates an estimated walk equal to the catchment radius
    const totalKmWalked = Math.round(((visitCount * def.walkRadiusMeters) / 1000) * 10) / 10;
    return {
      id: def.id,
      name: def.name,
      marathiName: def.marathiName,
      associatedStations: def.associatedStations,
      walkRadiusMeters: def.walkRadiusMeters,
      prominentLandmarks: def.prominentLandmarks,
      visitCount,
      isUnlocked,
      totalKmWalked,
    };
  });

  const unlockedCatchmentsCount = catchments.filter((c) => c.isUnlocked).length;

  // Find top walkable hub
  let topHub = catchments[0];
  for (let i = 1; i < catchments.length; i++) {
    if (catchments[i].visitCount > topHub.visitCount) {
      topHub = catchments[i];
    }
  }
  const topWalkableHub = topHub.visitCount > 0 ? topHub.name : 'None logged yet';

  // Average pedestrian walk per journey: ~1.3 km (650m origin walk + 650m destination walk)
  const totalEstimatedWalkKm = Math.round(journeys.length * 1.3 * 10) / 10;
  const totalWalkSteps = journeys.length * 1700;
  const firstLastMileBurnKcal = Math.round(journeys.length * 65);

  // Active commute physical multiplier vs sedentary driving
  const activeCommuteMultiplier = 2.3;

  // Pedestrian Persona
  let pedestrianPersona = 'Urban Neighborhood Walker';
  let pedestrianPersonaMarathi = 'स्थानिक परिसर पदयात्री';

  if (unlockedCatchmentsCount >= 5) {
    pedestrianPersona = 'Pune Master Flâneur';
    pedestrianPersonaMarathi = 'पुणे नगर परिभ्रमण नायक';
  } else if (unlockedCatchmentsCount >= 3) {
    pedestrianPersona = 'Corridor Pedestrian Champion';
    pedestrianPersonaMarathi = 'मार्ग पदयात्री विजेता';
  } else if (unlockedCatchmentsCount === 0) {
    pedestrianPersona = 'First-Mile Explorer';
    pedestrianPersonaMarathi = 'प्रथम टप्पा शोधक';
  }

  const shareableRadiusText = [
    '🚶 Pune Metro Strava — First/Last-Mile Walking Radius',
    `🎖️ Pedestrian Status: ${pedestrianPersona} (${pedestrianPersonaMarathi})`,
    `👟 Active Walking: ~${totalEstimatedWalkKm} km (~${totalWalkSteps.toLocaleString()} steps)`,
    `🔥 Extra Walk Burn: +${firstLastMileBurnKcal} kcal outside stations`,
    `📍 Neighborhood Catchments: ${unlockedCatchmentsCount} / ${PUNE_CATCHMENTS.length} Unlocked`,
    `🏆 Top Pedestrian Precinct: ${topWalkableHub}`,
  ].join('\n');

  const accessibilityDescription = `Neighborhood Walking Radius: ${pedestrianPersona}. Estimated ${totalEstimatedWalkKm} km walked (${totalWalkSteps} steps) connecting to metro stations, burning ${firstLastMileBurnKcal} kcal. ${unlockedCatchmentsCount} of ${PUNE_CATCHMENTS.length} Pune neighborhood catchments unlocked. Top walkable precinct is ${topWalkableHub}.`;

  return {
    totalEstimatedWalkKm,
    totalWalkSteps,
    firstLastMileBurnKcal,
    activeCommuteMultiplier,
    unlockedCatchmentsCount,
    totalCatchments: PUNE_CATCHMENTS.length,
    catchments,
    topWalkableHub,
    pedestrianPersona,
    pedestrianPersonaMarathi,
    shareableRadiusText,
    accessibilityDescription,
  };
}
