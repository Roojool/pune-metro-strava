import type { Journey } from '../../domain/models';
import { getJourneyTimestamp } from './leagueBadges';
import type { AuditFlag, AuditTrustTier, CommuterAuditSummary } from './types';

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

function getJourneyKm(j: Journey): number {
  return typeof j.kilometers === 'number' ? j.kilometers : (j as any).distanceKm || 0;
}

/**
 * Converts an ISO timestamp to 'YYYY-MM-DD' in India Standard Time (UTC+5:30).
 */
function getIstDayKey(isoDate: string): string {
  try {
    const ms = Date.parse(isoDate);
    if (!Number.isFinite(ms)) return '';
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(ms + istOffsetMs);
    const y = istDate.getUTCFullYear();
    const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(istDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '';
  }
}

/**
 * Conducts a fair-play integrity and compliance audit across commuter transit logs.
 */
export function calculateCommuterAudit(journeys: Journey[]): CommuterAuditSummary {
  if (!journeys || journeys.length === 0) {
    return {
      trustScore: 100,
      trustTier: 'provisional',
      trustTierTitle: 'Provisional Account',
      trustTierMarathi: 'तात्पुरते खाते',
      totalJourneysAudited: 0,
      rapidSpamChecksPassed: true,
      dailyCapCompliant: true,
      velocityPlausibilityRatio: 1.0,
      flaggedAnomaliesCount: 0,
      integrityFlags: [],
      auditVerificationBadge: 'PUNE-AUDIT-PROVISIONAL-000',
      shareableAuditText:
        '🛡️ Pune Metro Strava — Fair Play Integrity Audit\nNo rides logged yet. Complete verified rides respecting the 1-minute interval and 10 rides/day fair play policy.',
      accessibilityDescription:
        'Fair Play Audit: Provisional clean standing with 0 rides logged. Compliant with fair play transit rules.',
    };
  }

  // Sort journeys chronologically
  const sorted = [...journeys].sort((a, b) => {
    const ta = Date.parse(getJourneyTimestamp(a)) || 0;
    const tb = Date.parse(getJourneyTimestamp(b)) || 0;
    return ta - tb;
  });

  const flags: AuditFlag[] = [];
  let rapidSpamChecksPassed = true;
  let dailyCapCompliant = true;
  let plausibleVelocityCount = 0;
  let evaluatedVelocityCount = 0;

  // 1. Rapid Interval Check (>= 60 seconds between consecutive logs)
  for (let i = 1; i < sorted.length; i++) {
    const prevTs = Date.parse(getJourneyTimestamp(sorted[i - 1]));
    const currTs = Date.parse(getJourneyTimestamp(sorted[i]));
    if (Number.isFinite(prevTs) && Number.isFinite(currTs)) {
      const diffMs = currTs - prevTs;
      if (diffMs < 60000) {
        rapidSpamChecksPassed = false;
        flags.push({
          type: 'rapid_duplicate',
          message: `Rapid log interval detected (${Math.round(diffMs / 1000)}s between rides < 60s minimum rule).`,
          journeyId: sorted[i].id,
        });
      }
    }
  }

  // 2. Daily Log Cap Check (<= 10 rides per calendar day)
  const dailyCounts: Record<string, number> = {};
  for (const j of sorted) {
    const day = getIstDayKey(getJourneyTimestamp(j)) || 'Unknown';
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  }

  for (const [day, count] of Object.entries(dailyCounts)) {
    if (count > 10 && day !== 'Unknown') {
      dailyCapCompliant = false;
      flags.push({
        type: 'daily_cap_exceeded',
        message: `Exceeded fair-play daily limit on ${day} (${count} rides > 10 ride maximum limit).`,
      });
    }
  }

  // 3. Physical Plausibility & Endpoints
  for (const j of sorted) {
    const from = getOriginStation(j);
    const to = getDestinationStation(j);
    if (from && to && from === to) {
      flags.push({
        type: 'same_station_endpoint',
        message: 'Origin and destination stations cannot be identical.',
        journeyId: j.id,
      });
    }

    const km = getJourneyKm(j);
    const mins = typeof j.minutes === 'number' ? j.minutes : 0;
    if (km > 0 && mins > 0) {
      evaluatedVelocityCount += 1;
      const speedKmh = km / (mins / 60);
      if (speedKmh <= 95) {
        plausibleVelocityCount += 1;
      } else {
        flags.push({
          type: 'velocity_implausible',
          message: `Implausible speed detected (~${Math.round(speedKmh)} km/h exceeds 90 km/h train capacity).`,
          journeyId: j.id,
        });
      }
    }
  }

  const velocityPlausibilityRatio =
    evaluatedVelocityCount > 0
      ? Math.round((plausibleVelocityCount / evaluatedVelocityCount) * 100) / 100
      : 1.0;

  // 4. Calculate Trust Score
  let score = 100;
  for (const f of flags) {
    if (f.type === 'rapid_duplicate') score -= 15;
    else if (f.type === 'daily_cap_exceeded') score -= 20;
    else score -= 10;
  }
  const trustScore = Math.max(0, score);

  // 5. Trust Tier
  let trustTier: AuditTrustTier = 'provisional';
  let trustTierTitle = 'Provisional Commuter';
  let trustTierMarathi = 'प्रारंभिक प्रवासी';

  if (trustScore >= 90 && sorted.length >= 5 && flags.length === 0) {
    trustTier = 'fair_play_champion';
    trustTierTitle = 'Punekar Fair Play Champion';
    trustTierMarathi = 'पुणेकर सत्यनिष्ठ विजेता';
  } else if (trustScore >= 75 && sorted.length >= 1) {
    trustTier = 'verified_commuter';
    trustTierTitle = 'Verified Transit Sportsman';
    trustTierMarathi = 'प्रमाणित प्रवासी खेळाडू';
  }

  const auditVerificationBadge = `PUNE-TRUST-${trustScore}-${sorted.length}R`;

  const shareableAuditText = [
    '🛡️ Pune Metro Strava — Fair Play Integrity Audit',
    `🎖️ Status: ${trustTierTitle} (${trustTierMarathi})`,
    `✅ Trust Score: ${trustScore} / 100`,
    `⏱️ Anti-Spam Interval Check: ${rapidSpamChecksPassed ? 'PASSED (≥1 min)' : 'FLAGGED'}`,
    `📅 Daily Limit Compliance: ${dailyCapCompliant ? 'PASSED (≤10 rides/day)' : 'FLAGGED'}`,
    `🚂 Transit Physics Check: ${Math.round(velocityPlausibilityRatio * 100)}% Realistic`,
    `🔐 Verification Badge: ${auditVerificationBadge}`,
  ].join('\n');

  const accessibilityDescription = `Fair Play Audit: Status ${trustTierTitle}. Trust score ${trustScore}/100 across ${sorted.length} audited rides. Rapid spam checks: ${
    rapidSpamChecksPassed ? 'passed' : 'flagged'
  }. Daily limit: ${dailyCapCompliant ? 'compliant' : 'exceeded'}. ${flags.length} integrity flags.`;

  return {
    trustScore,
    trustTier,
    trustTierTitle,
    trustTierMarathi,
    totalJourneysAudited: sorted.length,
    rapidSpamChecksPassed,
    dailyCapCompliant,
    velocityPlausibilityRatio,
    flaggedAnomaliesCount: flags.length,
    integrityFlags: flags,
    auditVerificationBadge,
    shareableAuditText,
    accessibilityDescription,
  };
}
