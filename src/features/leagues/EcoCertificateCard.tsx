import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { EcoCertificateSummary, EcoCertificateTier } from './types';

interface EcoCertificateCardProps {
  certificate: EcoCertificateSummary;
  onShare: (text: string) => Promise<void>;
}

const TIER_BORDER_COLORS: Record<EcoCertificateTier, { border: string; bg: string; ink: string }> = {
  provisional: { border: '#1E3640', bg: '#0A1317', ink: '#7D95A0' },
  bronze: { border: '#784323', bg: '#1C120C', ink: '#E59866' },
  silver: { border: '#4E616C', bg: '#141D22', ink: '#BDC9D1' },
  gold: { border: '#8A701E', bg: '#241C0A', ink: '#F4D03F' },
  diamond: { border: '#2980B9', bg: '#0D1E2A', ink: '#5DADE2' },
};

export function EcoCertificateCard({ certificate, onShare }: EcoCertificateCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const tierStyle = TIER_BORDER_COLORS[certificate.tier];
  const pct = Math.round(certificate.progressToNextTierRatio * 100);

  const handlePressShare = async () => {
    setIsSharing(true);
    try {
      await onShare(certificate.shareableCertificateText);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={certificate.accessibilityDescription}
        style={{ gap: 14 }}
      >
        {/* Certificate Frame */}
        <View style={[styles.certFrame, { borderColor: tierStyle.border, backgroundColor: tierStyle.bg }]}>
          {/* Top Seal & Eyebrow */}
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="award" size={16} color={tierStyle.ink} />
              <Text style={[styles.certEyebrow, { color: tierStyle.ink }]}>
                PUNE METRO · SUSTAINABILITY ACCREDITATION
              </Text>
            </View>
            <Pill
              text={certificate.certificateId}
              color="#091216"
              ink="#8EA1A9"
            />
          </View>

          {/* Title & Recipient */}
          <View style={{ alignItems: 'center', gap: 3, marginVertical: 6 }}>
            <Text style={styles.certMainTitle}>Clean Air Commuter Certificate</Text>
            <Text style={styles.presentedText}>This certificate of environmental stewardship is awarded to</Text>
            <Text style={styles.recipientName}>{certificate.recipientName}</Text>
            <View style={styles.tierBadge}>
              <Text style={[styles.tierTitle, { color: tierStyle.ink }]}>
                {certificate.tierTitle.toUpperCase()}
              </Text>
              <Text style={styles.tierMarathi}>· {certificate.tierMarathi}</Text>
            </View>
          </View>

          {/* 4 Environmental Achievement Pillars */}
          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{certificate.totalCleanKm}</Text>
              <Text style={styles.statUnit}>km clean</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{certificate.totalCo2PreventedKg}</Text>
              <Text style={styles.statUnit}>kg CO₂ saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{certificate.totalPm25PreventedGrams}</Text>
              <Text style={styles.statUnit}>g PM2.5 spared</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{certificate.fuelSavedLiters}</Text>
              <Text style={styles.statUnit}>L petrol saved</Text>
            </View>
          </View>

          {/* Issue Date & Verification Seal */}
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }]}>
            <Text style={styles.issueDate}>Issued: {certificate.issueDateFormatted}</Text>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedText}>DEVICE-VERIFIED LOGS ✓</Text>
            </View>
          </View>
        </View>

        {/* Next Tier Progression */}
        {certificate.tier !== 'diamond' && (
          <View style={styles.nextTierBox}>
            <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={styles.nextTierLabel}>Next Tier Goal ({certificate.nextTierTargetKg} kg CO₂)</Text>
              <Text style={styles.nextTierVal}>{certificate.totalCo2PreventedKg} / {certificate.nextTierTargetKg} kg ({pct}%)</Text>
            </View>
            <View style={styles.tierTrack}>
              <View style={[styles.tierFill, { width: `${Math.max(4, pct)}%` }]} />
            </View>
          </View>
        )}

        {/* Share Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share your Clean Air Commuter Certificate"
          onPress={handlePressShare}
          disabled={isSharing}
          style={({ pressed }) => [
            styles.shareBtn,
            pressed && styles.shareBtnPressed,
            isSharing && styles.shareBtnDisabled,
          ]}
        >
          <Icon name="share-2" size={16} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>
            {isSharing ? 'Sharing certificate…' : 'Share Clean Air Certificate'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Certificate displays aggregate environmental savings only. Private commute locations, routes, and home schedules are never disclosed.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0C1316',
    borderColor: '#192C33',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  certFrame: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    gap: 8,
  },
  certEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  certMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  presentedText: {
    fontSize: 11,
    color: '#8EA1A9',
    marginTop: 2,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00CD6B',
    marginTop: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tierTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierMarathi: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8EA1A9',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 10,
    marginVertical: 4,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#16272E',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: 8,
    fontWeight: '600',
    color: '#71868F',
  },
  issueDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71868F',
  },
  verifiedTag: {
    backgroundColor: '#0D2619',
    borderColor: '#1A6137',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00CD6B',
    letterSpacing: 0.5,
  },
  nextTierBox: {
    backgroundColor: '#070C0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 10,
    gap: 6,
  },
  nextTierLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71868F',
  },
  nextTierVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00CD6B',
  },
  tierTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#122026',
    overflow: 'hidden',
  },
  tierFill: {
    height: '100%',
    backgroundColor: '#00CD6B',
    borderRadius: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#132832',
    borderColor: '#2980B9',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  shareBtnPressed: {
    backgroundColor: '#1B3B4A',
  },
  shareBtnDisabled: {
    opacity: 0.6,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
