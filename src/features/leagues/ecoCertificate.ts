import type { Journey } from '../../domain/models';
import { sanitizeParticipantName } from './edgeCases';
import type { EcoCertificateSummary, EcoCertificateTier } from './types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Calculates a verified, privacy-preserving Pune Metro Clean Air Commuter Certificate.
 */
export function generateEcoCertificate(
  journeys: Journey[],
  userName: string = 'Pune Explorer',
  now: Date = new Date()
): EcoCertificateSummary {
  const recipientName = sanitizeParticipantName(userName);
  const totalCleanKm = Math.round(
    journeys.reduce((sum, j) => sum + (j.kilometers || 0), 0) * 10
  ) / 10;

  const totalCo2PreventedKg = Math.round(totalCleanKm * 0.12 * 10) / 10;
  const totalPm25PreventedGrams = Math.round(totalCleanKm * 0.15 * 10) / 10;
  const fuelSavedLiters = Math.round((totalCleanKm / 20) * 10) / 10;

  // Format issue date in IST (UTC+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  const issueDateFormatted = `${istDate.getUTCDate()} ${MONTH_NAMES[istDate.getUTCMonth()]} ${istDate.getUTCFullYear()}`;

  // Deterministic 4-digit certificate code
  const codeHash = Math.abs(Math.round(totalCleanKm * 100) + journeys.length * 37) % 9000 + 1000;
  const certificateId = `PMC-ECO-${codeHash}`;

  let tier: EcoCertificateTier;
  let tierTitle: string;
  let tierMarathi: string;
  let nextTierTargetKg: number;
  let progressToNextTierRatio: number;
  let isEligibleForOfficialCert: boolean;

  if (totalCo2PreventedKg < 5) {
    tier = 'provisional';
    tierTitle = 'Provisional Eco Commuter';
    tierMarathi = 'प्रारंभिक हरित प्रवासी';
    nextTierTargetKg = 5;
    progressToNextTierRatio = Math.min(1, Math.round((totalCo2PreventedKg / 5) * 100) / 100);
    isEligibleForOfficialCert = false;
  } else if (totalCo2PreventedKg < 15) {
    tier = 'bronze';
    tierTitle = 'Bronze Green Steward';
    tierMarathi = 'कांस्य हरित पालक';
    nextTierTargetKg = 15;
    progressToNextTierRatio = Math.min(1, Math.round((totalCo2PreventedKg / 15) * 100) / 100);
    isEligibleForOfficialCert = true;
  } else if (totalCo2PreventedKg < 35) {
    tier = 'silver';
    tierTitle = 'Silver Clean Air Guardian';
    tierMarathi = 'रौप्य स्वच्छ हवा रक्षक';
    nextTierTargetKg = 35;
    progressToNextTierRatio = Math.min(1, Math.round((totalCo2PreventedKg / 35) * 100) / 100);
    isEligibleForOfficialCert = true;
  } else if (totalCo2PreventedKg < 50) {
    tier = 'gold';
    tierTitle = 'Gold Urban Forest Champion';
    tierMarathi = 'सुवर्ण पर्यावरण चॅम्पियन';
    nextTierTargetKg = 50;
    progressToNextTierRatio = Math.min(1, Math.round((totalCo2PreventedKg / 50) * 100) / 100);
    isEligibleForOfficialCert = true;
  } else {
    tier = 'diamond';
    tierTitle = 'Diamond Net-Zero Legend';
    tierMarathi = 'डायमंड नेट-झिरो लिजेंड';
    nextTierTargetKg = 50;
    progressToNextTierRatio = 1.0;
    isEligibleForOfficialCert = true;
  }

  const shareableCertificateText = [
    `🌿 Pune Metro Clean Air Commuter Certificate`,
    `Awarded to: ${recipientName}`,
    `Status: ${tierTitle} (${tierMarathi})`,
    `Certificate ID: ${certificateId}`,
    `• Clean Distance: ${totalCleanKm} km`,
    `• Tailpipe CO₂ Prevented: ${totalCo2PreventedKg} kg`,
    `• Toxic PM2.5 Spared: ${totalPm25PreventedGrams} g`,
    `• Petrol Saved: ${fuelSavedLiters} L`,
    `Issued on: ${issueDateFormatted}`,
    `Verified locally on device · MetroQuest Pune`,
  ].join('\n');

  const accessibilityDescription = `Clean air commuter certificate for ${recipientName}: ${tierTitle} (${tierMarathi}). ${totalCleanKm} km traveled, ${totalCo2PreventedKg} kg CO2 prevented, ${fuelSavedLiters} L petrol saved. Certificate ID: ${certificateId}.`;

  return {
    certificateId,
    recipientName,
    tier,
    tierTitle,
    tierMarathi,
    totalCleanKm,
    totalCo2PreventedKg,
    totalPm25PreventedGrams,
    fuelSavedLiters,
    issueDateFormatted,
    isEligibleForOfficialCert,
    nextTierTargetKg,
    progressToNextTierRatio,
    shareableCertificateText,
    accessibilityDescription,
  };
}
