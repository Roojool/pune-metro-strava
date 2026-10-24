import type { Journey, LineId } from '../../domain/models';
import type { MetroSegment, SegmentVelocitySummary } from './types';

interface SegmentDefinition {
  id: string;
  title: string;
  marathiTitle: string;
  line: LineId | 'interchange';
  fromStationId: string;
  toStationId: string;
  distanceKm: number;
  standardMinutes: number;
  roadMinutes: number;
}

const PUNE_SEGMENTS: SegmentDefinition[] = [
  {
    id: 'pcmc-civil-court',
    title: 'The North-South Arterial Sprint',
    marathiTitle: 'उत्तर-दक्षिण मुख्य मार्ग',
    line: 'purple',
    fromStationId: 'pcmc',
    toStationId: 'civil-court',
    distanceKm: 13.9,
    standardMinutes: 24,
    roadMinutes: 55,
  },
  {
    id: 'vanaz-ramwadi',
    title: 'The East-West Cultural Crosser',
    marathiTitle: 'पूर्व-पश्चिम सांस्कृतिक मार्ग',
    line: 'aqua',
    fromStationId: 'vanaz',
    toStationId: 'ramwadi',
    distanceKm: 15.7,
    standardMinutes: 28,
    roadMinutes: 65,
  },
  {
    id: 'mutha-viaduct',
    title: 'The Mutha River Aerial Viaduct',
    marathiTitle: 'मुठा नदी उन्नत मार्ग',
    line: 'aqua',
    fromStationId: 'deccan-gymkhana',
    toStationId: 'pmc',
    distanceKm: 1.8,
    standardMinutes: 4,
    roadMinutes: 18,
  },
  {
    id: 'peth-underground',
    title: 'The Peth Heritage Subterranean Link',
    marathiTitle: 'पेठ वारसा भुयारी मार्ग',
    line: 'purple',
    fromStationId: 'mandai',
    toStationId: 'swargate',
    distanceKm: 2.1,
    standardMinutes: 5,
    roadMinutes: 22,
  },
  {
    id: 'campus-to-tech',
    title: 'Garware to Kalyani Nagar Rapid Link',
    marathiTitle: 'गरवारे ते कल्याणी नगर द्रुतगती मार्ग',
    line: 'aqua',
    fromStationId: 'garware-college',
    toStationId: 'kalyani-nagar',
    distanceKm: 8.4,
    standardMinutes: 16,
    roadMinutes: 42,
  },
  {
    id: 'industrial-flyby',
    title: 'The Phugewadi-Dapodi Highway Flyby',
    marathiTitle: 'फुगेवाडी-दापोडी उड्डाण मार्ग',
    line: 'purple',
    fromStationId: 'phugewadi',
    toStationId: 'dapodi',
    distanceKm: 1.4,
    standardMinutes: 3,
    roadMinutes: 14,
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
 * Evaluates Strava-style Pune Metro segments, personal velocity records, and local legend crowns.
 */
export function calculateSegmentVelocity(journeys: Journey[]): SegmentVelocitySummary {
  if (!journeys || journeys.length === 0) {
    const emptySegments: MetroSegment[] = PUNE_SEGMENTS.map((seg) => ({
      ...seg,
      timesTraversed: 0,
      isCompleted: false,
      isLocalLegend: false,
      totalMinutesSaved: 0,
    }));

    return {
      totalSegmentsCompleted: 0,
      localLegendCrownsCount: 0,
      totalTimeSavedMinutes: 0,
      segments: emptySegments,
      favoriteSegment: 'None traversed yet',
      segmentPersona: 'Segment Explorer',
      segmentPersonaMarathi: 'मार्ग शोधक',
      shareableSegmentsText:
        '⚡ Pune Metro Strava — Commute Segments & Local Legends\nNo segments completed yet. Ride iconic corridors to unlock personal bests and Local Legend crowns!',
      accessibilityDescription:
        'Commute Segments: No segments traversed yet. Travel along Pune Metro corridors to benchmark against road congestion.',
    };
  }

  // Evaluate each segment across all journeys
  const segments: MetroSegment[] = PUNE_SEGMENTS.map((seg) => {
    let timesTraversed = 0;
    let minPace: number | undefined;

    for (const j of journeys) {
      const from = getOriginStation(j);
      const to = getDestinationStation(j);
      const stationList = getJourneyStationList(j);

      const isDirect =
        (from === seg.fromStationId && to === seg.toStationId) ||
        (from === seg.toStationId && to === seg.fromStationId);

      const isThrough =
        stationList.includes(seg.fromStationId) &&
        stationList.includes(seg.toStationId);

      if (isDirect || isThrough) {
        timesTraversed += 1;
        if (typeof j.minutes === 'number' && typeof j.kilometers === 'number' && j.kilometers > 0) {
          const pace = Math.round((j.minutes / j.kilometers) * 10) / 10;
          if (minPace === undefined || pace < minPace) {
            minPace = pace;
          }
        }
      }
    }

    const isCompleted = timesTraversed > 0;
    const isLocalLegend = timesTraversed >= 3;
    const timeSavedPerTraverse = seg.roadMinutes - seg.standardMinutes;
    const totalMinutesSaved = timesTraversed * timeSavedPerTraverse;

    return {
      id: seg.id,
      title: seg.title,
      marathiTitle: seg.marathiTitle,
      line: seg.line,
      fromStationId: seg.fromStationId,
      toStationId: seg.toStationId,
      distanceKm: seg.distanceKm,
      standardMinutes: seg.standardMinutes,
      roadMinutes: seg.roadMinutes,
      timesTraversed,
      isCompleted,
      isLocalLegend,
      bestPaceMinPerKm: minPace,
      totalMinutesSaved,
    };
  });

  const totalSegmentsCompleted = segments.filter((s) => s.isCompleted).length;
  const localLegendCrownsCount = segments.filter((s) => s.isLocalLegend).length;
  const totalTimeSavedMinutes = segments.reduce((sum, s) => sum + s.totalMinutesSaved, 0);

  // Favorite segment
  let fav = segments[0];
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].timesTraversed > fav.timesTraversed) {
      fav = segments[i];
    }
  }
  const favoriteSegment = fav.timesTraversed > 0 ? fav.title : 'None traversed yet';

  // Persona
  let segmentPersona = 'Segment Explorer';
  let segmentPersonaMarathi = 'मार्ग शोधक';

  if (localLegendCrownsCount >= 3) {
    segmentPersona = 'Pune Transit Local Legend';
    segmentPersonaMarathi = 'पुणे स्थानक सम्राट';
  } else if (totalSegmentsCompleted >= 4) {
    segmentPersona = 'City Corridor Specialist';
    segmentPersonaMarathi = 'शहर मार्ग तज्ज्ञ';
  } else if (totalSegmentsCompleted >= 1) {
    segmentPersona = 'Segment Challenger';
    segmentPersonaMarathi = 'मार्ग आव्हानवीर';
  }

  const shareableSegmentsText = [
    '⚡ Pune Metro Strava — Commute Segments & Local Legends',
    `🎖️ Status: ${segmentPersona} (${segmentPersonaMarathi})`,
    `🏆 Local Legend Crowns: ${localLegendCrownsCount} Earned 👑`,
    `🏁 Segments Completed: ${totalSegmentsCompleted} / ${PUNE_SEGMENTS.length}`,
    `⏱️ Congestion Time Saved: ~${totalTimeSavedMinutes} minutes vs road traffic`,
    `📍 Top Segment: ${favoriteSegment} (${fav.timesTraversed} traversals)`,
  ].join('\n');

  const accessibilityDescription = `Commute Segments: ${segmentPersona}. Completed ${totalSegmentsCompleted} of ${PUNE_SEGMENTS.length} iconic segments with ${localLegendCrownsCount} Local Legend crowns earned. Saved approximately ${totalTimeSavedMinutes} minutes compared to peak Pune road traffic. Favorite segment: ${favoriteSegment}.`;

  return {
    totalSegmentsCompleted,
    localLegendCrownsCount,
    totalTimeSavedMinutes,
    segments,
    favoriteSegment,
    segmentPersona,
    segmentPersonaMarathi,
    shareableSegmentsText,
    accessibilityDescription,
  };
}
