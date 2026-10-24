import type { Journey } from '../../domain/models';
import type { DecongestionTier, PuneChokePoint, TrafficReliefSummary } from './types';

export const PUNE_CHOKE_POINTS: PuneChokePoint[] = [
  {
    id: 'sancheti_junction',
    name: 'Sancheti Chowk & Shivaji Nagar Junction',
    marathiName: 'संचेती चौक व शिवाजीनगर जंक्शन',
    roadName: 'Old Pune-Mumbai Highway (NH 48)',
    bypassStations: ['shivaji-nagar', 'civil-court'],
    peakDelayMinutes: 18,
    bypassCount: 0,
    isBypassed: false,
  },
  {
    id: 'alka_talkies',
    name: 'Alka Talkies Chowk & Riverside Road',
    marathiName: 'अलका टॉकीज चौक व नदीपात्र रस्ता',
    roadName: 'Laxmi Road & Karve Road Confluence',
    bypassStations: ['deccan-gymkhana', 'chhatrapati-sambhaji-udyan'],
    peakDelayMinutes: 15,
    bypassCount: 0,
    isBypassed: false,
  },
  {
    id: 'swargate_chowk',
    name: 'Swargate Chowk & Jedhe Flyover',
    marathiName: 'स्वारगेट चौक व जेधे उड्डाणपूल',
    roadName: 'Satara Road & Shivaji Road bottleneck',
    bypassStations: ['swargate', 'mandai'],
    peakDelayMinutes: 22,
    bypassCount: 0,
    isBypassed: false,
  },
  {
    id: 'nal_stop_karve',
    name: 'Nal Stop Junction & Karve Road',
    marathiName: 'नळ स्टॉप जंक्शन व कर्वे रस्ता',
    roadName: 'Karve Road & Law College Road merge',
    bypassStations: ['nal-stop', 'ideal-colony', 'garware-college'],
    peakDelayMinutes: 14,
    bypassCount: 0,
    isBypassed: false,
  },
  {
    id: 'yerwada_gunjan',
    name: 'Gunjan Chowk & Yerwada Bridge',
    marathiName: 'गुंजन चौक व येरवडा पूल',
    roadName: 'Pune-Ahmednagar Highway (SH 27)',
    bypassStations: ['yerwada', 'kalyani-nagar', 'bund-garden'],
    peakDelayMinutes: 16,
    bypassCount: 0,
    isBypassed: false,
  },
  {
    id: 'station_sasoon',
    name: 'Pune Railway Station & Sassoon Hospital Chowk',
    marathiName: 'पुणे रेल्वे स्टेशन व ससून रुग्णालय चौक',
    roadName: 'Station Road & Alankar Talkies Chowk',
    bypassStations: ['pune-railway-station', 'ruby-hall-clinic', 'mangalwar-peth'],
    peakDelayMinutes: 20,
    bypassCount: 0,
    isBypassed: false,
  },
];

function getJourneyKm(j: Journey): number {
  if (typeof j.kilometers === 'number' && j.kilometers > 0) return j.kilometers;
  if (typeof (j as any).distanceKm === 'number' && (j as any).distanceKm > 0) return (j as any).distanceKm;
  return 6.0;
}

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

function getJourneyStationSet(j: Journey): Set<string> {
  const set = new Set<string>();
  const from = getOriginStation(j);
  const to = getDestinationStation(j);
  if (from) set.add(from.toLowerCase().trim());
  if (to) set.add(to.toLowerCase().trim());
  if (Array.isArray(j.stationIds)) {
    for (const s of j.stationIds) {
      if (s) set.add(s.toLowerCase().trim());
    }
  }
  return set;
}

/**
 * Calculates road vehicle kilometers avoided, red-signal minutes saved, and Pune choke-point bypasses.
 */
export function calculateTrafficRelief(journeys: Journey[]): TrafficReliefSummary {
  const chokePoints: PuneChokePoint[] = PUNE_CHOKE_POINTS.map((cp) => ({
    ...cp,
    bypassCount: 0,
    isBypassed: false,
  }));

  if (!journeys || journeys.length === 0) {
    return {
      roadKmTraveledAvoided: 0,
      trafficSignalMinutesSaved: 0,
      roadSpaceOccupancySqMHours: 0,
      chokePointsBypassedCount: 0,
      totalChokePoints: chokePoints.length,
      chokePoints,
      decongestionTier: 'chowk_cruiser',
      tierTitle: 'Chowk Cruiser',
      tierTitleMarathi: 'चौक प्रवासी',
      dominantChokePointBypassed: 'None yet',
      nextTierKm: 25.0,
      progressPercent: 0,
      congestionReliefTip:
        'Log your Pune Metro rides to track how many road kilometers and traffic gridlock minutes you eliminate from Pune streets.',
      shareableTrafficText:
        '🚦 Pune Metro Strava — Traffic Decongestant\nNo rides logged yet. Take Pune Metro to bypass iconic road bottlenecks like Sancheti Chowk, Alka Talkies and Swargate!',
      accessibilityDescription:
        'Road Traffic Relief: No rides logged yet. Zero road kilometers avoided so far. Next milestone: Chowk Cruiser at 25 km.',
    };
  }

  let totalKm = 0;

  for (const j of journeys) {
    totalKm += getJourneyKm(j);
    const stationSet = getJourneyStationSet(j);

    for (const cp of chokePoints) {
      const matches = cp.bypassStations.some((stationId) => stationSet.has(stationId.toLowerCase().trim()));
      if (matches) {
        cp.bypassCount += 1;
        cp.isBypassed = true;
      }
    }
  }

  const roadKmTraveledAvoided = Math.round(totalKm * 10) / 10;
  // In Pune, traffic signals are encountered approximately every 1.4 km with an average wait of 1.05 mins
  const trafficSignalMinutesSaved = Math.round(roadKmTraveledAvoided * 0.75);
  // Dynamic road space occupancy avoided (~2.8 m²*hr of asphalt lane freed per km traveled on metro)
  const roadSpaceOccupancySqMHours = Math.round(roadKmTraveledAvoided * 2.8);

  const bypassedList = chokePoints.filter((cp) => cp.isBypassed);
  const chokePointsBypassedCount = bypassedList.length;

  let dominantChokePointBypassed = 'None yet';
  if (bypassedList.length > 0) {
    const top = [...bypassedList].sort((a, b) => b.bypassCount - a.bypassCount)[0];
    dominantChokePointBypassed = `${top.name} (${top.bypassCount}x)`;
  }

  let decongestionTier: DecongestionTier = 'chowk_cruiser';
  let tierTitle = 'Chowk Cruiser';
  let tierTitleMarathi = 'चौक प्रवासी';
  let nextTierKm = 25.0;
  let prevTierBaseKm = 0;

  if (roadKmTraveledAvoided >= 300.0) {
    decongestionTier = 'traffic_legend';
    tierTitle = 'Pune Traffic Decongestant Legend';
    tierTitleMarathi = 'पुणे वाहतूक कोंडी निवारक शिरोमणी';
    nextTierKm = 500.0;
    prevTierBaseKm = 300.0;
  } else if (roadKmTraveledAvoided >= 150.0) {
    decongestionTier = 'flow_master';
    tierTitle = 'JM Road Flow Master';
    tierTitleMarathi = 'जंगळी महाराज मार्ग गती सम्राट';
    nextTierKm = 300.0;
    prevTierBaseKm = 150.0;
  } else if (roadKmTraveledAvoided >= 75.0) {
    decongestionTier = 'grid_unclogger';
    tierTitle = 'Deccan Grid Unclogger';
    tierTitleMarathi = 'डेक्कन कोंडी मुक्तिदाता';
    nextTierKm = 150.0;
    prevTierBaseKm = 75.0;
  } else if (roadKmTraveledAvoided >= 25.0) {
    decongestionTier = 'flyover_skipper';
    tierTitle = 'Flyover Skipper';
    tierTitleMarathi = 'उड्डाणपूल बायपास';
    nextTierKm = 75.0;
    prevTierBaseKm = 25.0;
  }

  const range = nextTierKm - prevTierBaseKm;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((roadKmTraveledAvoided - prevTierBaseKm) / range) * 100))
  );

  let congestionReliefTip = '';
  if (decongestionTier === 'traffic_legend') {
    congestionReliefTip = `Phenomenal civic contribution! You've eliminated ${roadKmTraveledAvoided} km of vehicular road congestion and spared Punekars ${roadSpaceOccupancySqMHours} m²-hrs of asphalt jamming.`;
  } else if (decongestionTier === 'flow_master') {
    congestionReliefTip = `Smooth arterial flow! By bypassing key bottlenecks, you've saved ${trafficSignalMinutesSaved} minutes of idling at Pune traffic lights.`;
  } else if (decongestionTier === 'grid_unclogger') {
    congestionReliefTip = `Great impact on Deccan and Shivaji Nagar traffic! You've bypassed ${chokePointsBypassedCount} major Pune choke points.`;
  } else if (decongestionTier === 'flyover_skipper') {
    congestionReliefTip = `You are skipping crowded flyovers and signal jams across Pune. Keep riding to reach Deccan Grid Unclogger!`;
  } else {
    congestionReliefTip = `Every kilometer on Pune Metro clears space for essential emergency ambulances and road buses. ${(nextTierKm - roadKmTraveledAvoided).toFixed(1)} km to next tier.`;
  }

  const shareableTrafficText = `🚦 Pune Metro Strava — Road Traffic Relief\n` +
    `Rank: ${tierTitle} (${tierTitleMarathi})\n` +
    `• Road Travel Avoided: ${roadKmTraveledAvoided} km\n` +
    `• Signal Waiting Saved: ${trafficSignalMinutesSaved} minutes\n` +
    `• Road Asphalt Freed: ${roadSpaceOccupancySqMHours} m²-hrs\n` +
    `• Choke Points Bypassed: ${chokePointsBypassedCount} of ${chokePoints.length}\n` +
    `Top Bottleneck Cleared: ${dominantChokePointBypassed}\n` +
    `#PuneMetro #TrafficRelief #Punekar`;

  const accessibilityDescription =
    `Road Traffic Relief: ${tierTitle} (${tierTitleMarathi}). ` +
    `${roadKmTraveledAvoided} km of road vehicle travel avoided. ` +
    `${trafficSignalMinutesSaved} minutes of red signal idling saved across ${chokePointsBypassedCount} bypassed choke points. ` +
    `Freed ${roadSpaceOccupancySqMHours} square-meter-hours of Pune road capacity.`;

  return {
    roadKmTraveledAvoided,
    trafficSignalMinutesSaved,
    roadSpaceOccupancySqMHours,
    chokePointsBypassedCount,
    totalChokePoints: chokePoints.length,
    chokePoints,
    decongestionTier,
    tierTitle,
    tierTitleMarathi,
    dominantChokePointBypassed,
    nextTierKm,
    progressPercent,
    congestionReliefTip,
    shareableTrafficText,
    accessibilityDescription,
  };
}
