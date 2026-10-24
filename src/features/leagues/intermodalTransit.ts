import type { Journey } from '../../domain/models';
import type { IntermodalHub, IntermodalTransitSummary } from './types';

interface HubDefinition {
  id: string;
  stationId: string;
  hubName: string;
  marathiName: string;
  connectingModes: string[];
  interchangeStairsFlights: number;
}

const PUNE_INTERMODAL_HUBS: HubDefinition[] = [
  {
    id: 'pune-railway-station',
    stationId: 'pune-railway-station',
    hubName: 'Pune Railway Station Junction',
    marathiName: 'पुणे रेल्वे स्टेशन जंक्शन',
    connectingModes: ['Indian Railways', 'PMPML City Bus', 'Prepaid Auto Stand'],
    interchangeStairsFlights: 4,
  },
  {
    id: 'shivajinagar',
    stationId: 'shivajinagar',
    hubName: 'Shivajinagar Multi-Modal Hub',
    marathiName: 'शिवाजीनगर बहुविध वाहतूक केंद्र',
    connectingModes: ['Suburban Local Trains', 'MSRTC Intercity ST Stand', 'PMPML Bus Terminal'],
    interchangeStairsFlights: 5,
  },
  {
    id: 'swargate',
    stationId: 'swargate',
    hubName: 'Swargate Underground ST Gateway',
    marathiName: 'स्वारगेट भुयारी एसटी प्रवेशद्वार',
    connectingModes: ['MSRTC State Transport', 'PMPML South Hub', 'Intercity Shared Cabs'],
    interchangeStairsFlights: 6,
  },
  {
    id: 'civil-court',
    stationId: 'civil-court',
    hubName: 'Civil Court Multi-Corridor Skywalk',
    marathiName: 'दिवाणी न्यायालय द्वि-मार्ग स्कायवॉक',
    connectingModes: ['Purple Line', 'Aqua Line', 'PMPML Feeder', 'District Court Skybridge'],
    interchangeStairsFlights: 10,
  },
  {
    id: 'bhosari',
    stationId: 'nashik-phata',
    hubName: 'Nashik Phata Multi-Tier Interchange',
    marathiName: 'नाशिक फाटा बहुस्तरीय उड्डाणपूल',
    connectingModes: ['BRTS Corridor', 'PCMC Feeder Buses', 'Nashik Highway Coaches'],
    interchangeStairsFlights: 4,
  },
  {
    id: 'ramwadi',
    stationId: 'ramwadi',
    hubName: 'Ramwadi Airport & Nagar Rd Gateway',
    marathiName: 'रामवाडी विमानतळ व नगर रस्ता प्रवेशद्वार',
    connectingModes: ['Pune Airport Shuttle Feeder', 'Ahmednagar Highway Buses', 'Kharadi IT Feeder'],
    interchangeStairsFlights: 4,
  },
];

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

function getJourneyStationList(j: Journey): string[] {
  if (Array.isArray(j.stationIds) && j.stationIds.length > 0) return j.stationIds;
  return [getOriginStation(j), getDestinationStation(j)].filter(Boolean);
}

/**
 * Calculates intermodal connection metrics across Pune's major transit interchanges.
 */
export function calculateIntermodalTransit(journeys: Journey[]): IntermodalTransitSummary {
  if (!journeys || journeys.length === 0) {
    const emptyHubs: IntermodalHub[] = PUNE_INTERMODAL_HUBS.map((def) => ({
      ...def,
      visitCount: 0,
      isUnlocked: false,
    }));

    return {
      totalIntermodalVisits: 0,
      unlockedHubsCount: 0,
      totalHubs: PUNE_INTERMODAL_HUBS.length,
      intermodalConnectivityScore: 0,
      intermodalTransferKcal: 0,
      hubs: emptyHubs,
      dominantFeederMode: 'Local Walking Feeder',
      intermodalPersona: 'Local Corridor Rider',
      intermodalPersonaMarathi: 'स्थानिक मार्ग प्रवासी',
      shareableIntermodalText:
        '🚉 Pune Metro Strava — Intermodal Hub Connectivity\nNo intermodal trips logged yet. Travel through major interchanges like Civil Court or Swargate to unlock multi-modal connectivity!',
      accessibilityDescription:
        'Intermodal Connectivity: No multi-modal hub visits logged yet. Use Pune Metro to connect with railways and bus terminals.',
    };
  }

  // Count visits to each intermodal hub
  const hubVisitMap: Record<string, number> = {};
  for (const j of journeys) {
    const from = getOriginStation(j);
    const to = getDestinationStation(j);
    const stationList = getJourneyStationList(j);

    for (const def of PUNE_INTERMODAL_HUBS) {
      if (from === def.stationId || to === def.stationId || stationList.includes(def.stationId)) {
        hubVisitMap[def.id] = (hubVisitMap[def.id] || 0) + 1;
      }
    }
  }

  const hubs: IntermodalHub[] = PUNE_INTERMODAL_HUBS.map((def) => {
    const visitCount = hubVisitMap[def.id] || 0;
    return {
      id: def.id,
      stationId: def.stationId,
      hubName: def.hubName,
      marathiName: def.marathiName,
      connectingModes: def.connectingModes,
      interchangeStairsFlights: def.interchangeStairsFlights,
      visitCount,
      isUnlocked: visitCount > 0,
    };
  });

  const totalIntermodalVisits = hubs.reduce((sum, h) => sum + h.visitCount, 0);
  const unlockedHubsCount = hubs.filter((h) => h.isUnlocked).length;

  // Intermodal Transfer Exertion (stair flights walking across interchanges ~4 kcal/flight)
  const intermodalTransferKcal = hubs.reduce(
    (sum, h) => sum + h.visitCount * h.interchangeStairsFlights * 4,
    0
  );

  // Connectivity Score (0-100)
  const intermodalConnectivityScore = Math.min(
    100,
    Math.round((unlockedHubsCount / PUNE_INTERMODAL_HUBS.length) * 60 + Math.min(40, totalIntermodalVisits * 4))
  );

  // Dominant Feeder Mode
  let dominantHub = hubs[0];
  for (let i = 1; i < hubs.length; i++) {
    if (hubs[i].visitCount > dominantHub.visitCount) {
      dominantHub = hubs[i];
    }
  }

  let dominantFeederMode = 'City Bus & Walking Feeder';
  if (dominantHub.visitCount > 0) {
    if (dominantHub.id === 'pune-railway-station' || dominantHub.id === 'shivajinagar') {
      dominantFeederMode = 'Indian Railways & Suburban Rail';
    } else if (dominantHub.id === 'swargate') {
      dominantFeederMode = 'MSRTC State Transport Buses';
    } else if (dominantHub.id === 'civil-court') {
      dominantFeederMode = 'Metro Dual-Corridor Interchange';
    } else if (dominantHub.id === 'bhosari') {
      dominantFeederMode = 'PCMC BRTS & Highway Feeder';
    } else if (dominantHub.id === 'ramwadi') {
      dominantFeederMode = 'Airport Shuttle & IT Feeder';
    }
  }

  // Persona
  let intermodalPersona = 'Interchange Connector';
  let intermodalPersonaMarathi = 'जंक्शन प्रवासी';

  if (unlockedHubsCount >= 5) {
    intermodalPersona = 'Regional Commute Master';
    intermodalPersonaMarathi = 'प्रादेशिक वाहतूक सम्राट';
  } else if (unlockedHubsCount >= 3) {
    intermodalPersona = 'Multi-Modal Transit Pioneer';
    intermodalPersonaMarathi = 'बहुविध वाहतूक प्रणेता';
  } else if (unlockedHubsCount === 0) {
    intermodalPersona = 'Local Corridor Rider';
    intermodalPersonaMarathi = 'स्थानिक मार्ग प्रवासी';
  }

  const shareableIntermodalText = [
    '🚉 Pune Metro Strava — Intermodal Hub Connectivity',
    `🎖️ Status: ${intermodalPersona} (${intermodalPersonaMarathi})`,
    `🔄 Connectivity Score: ${intermodalConnectivityScore} / 100`,
    `📍 Interchanges Unlocked: ${unlockedHubsCount} / ${PUNE_INTERMODAL_HUBS.length}`,
    `🚌 Primary Feeder: ${dominantFeederMode}`,
    `🧗 Interchange Stairs Exertion: +${intermodalTransferKcal} kcal`,
  ].join('\n');

  const accessibilityDescription = `Intermodal Connectivity: Status ${intermodalPersona}. Connectivity score ${intermodalConnectivityScore}/100. Unlocked ${unlockedHubsCount} of ${PUNE_INTERMODAL_HUBS.length} transit interchange hubs with ${totalIntermodalVisits} total visits. Primary connecting feeder: ${dominantFeederMode}.`;

  return {
    totalIntermodalVisits,
    unlockedHubsCount,
    totalHubs: PUNE_INTERMODAL_HUBS.length,
    intermodalConnectivityScore,
    intermodalTransferKcal,
    hubs,
    dominantFeederMode,
    intermodalPersona,
    intermodalPersonaMarathi,
    shareableIntermodalText,
    accessibilityDescription,
  };
}
