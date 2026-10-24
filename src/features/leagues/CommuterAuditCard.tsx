import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { CommuterAuditSummary } from './types';

interface CommuterAuditCardProps {
  summary: CommuterAuditSummary;
}

export function CommuterAuditCard({ summary }: CommuterAuditCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableAuditText);
          setShareFeedback('AUDIT COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableAuditText,
        title: 'Pune Metro Commuter Fair Play Audit',
      });
      setShareFeedback('SHARED!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShareFeedback(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'fair_play_champion':
        return { bg: '#0A2616', border: '#10B981', ink: '#A7F3D0' };
      case 'verified_commuter':
        return { bg: '#0E2433', border: '#0284C7', ink: '#BAE6FD' };
      default:
        return { bg: '#1F1E16', border: '#D97706', ink: '#FDE68A' };
    }
  };

  const tierColors = getTierColor(summary.trustTier);

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={summary.accessibilityDescription}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Icon name="check-circle" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.eyebrow}>LEADERBOARD INTEGRITY · FAIR PLAY AUDIT</Text>
              <Text style={styles.title}>Commuter Fair Play Audit</Text>
            </View>
          </View>
          <Pill
            text={`${summary.trustScore}/100 TRUST SCORE`}
            color={tierColors.bg}
            ink={tierColors.ink}
          />
        </View>

        {/* 3 Compliance Pillars */}
        <View style={styles.metricsGrid}>
          {/* Pillar 1: Anti-Spam */}
          <View style={styles.metricCol}>
            <Text style={[styles.statusText, summary.rapidSpamChecksPassed ? styles.passText : styles.failText]}>
              {summary.rapidSpamChecksPassed ? 'PASSED ✓' : 'FLAGGED ⚠️'}
            </Text>
            <Text style={styles.metricTitle}>1-Min Intervals</Text>
            <Text style={styles.metricSub}>Anti-spam rule</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* Pillar 2: Daily Limit */}
          <View style={styles.metricCol}>
            <Text style={[styles.statusText, summary.dailyCapCompliant ? styles.passText : styles.failText]}>
              {summary.dailyCapCompliant ? 'PASSED ✓' : 'EXCEEDED ⚠️'}
            </Text>
            <Text style={styles.metricTitle}>≤10 Rides / Day</Text>
            <Text style={styles.metricSub}>Fair play cap</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* Pillar 3: Physical Plausibility */}
          <View style={styles.metricCol}>
            <Text style={[styles.statusText, styles.passText]}>
              {Math.round(summary.velocityPlausibilityRatio * 100)}%
            </Text>
            <Text style={styles.metricTitle}>Realistic Speed</Text>
            <Text style={styles.metricSub}>≤90 km/h train</Text>
          </View>
        </View>

        {/* Audit Status Box */}
        <View style={styles.statusBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={styles.statusEyebrow}>VERIFICATION STATUS · {summary.trustTierMarathi}</Text>
              <Text style={styles.statusTitle}>{summary.trustTierTitle}</Text>
            </View>
            <Text style={styles.badgeCode}>{summary.auditVerificationBadge}</Text>
          </View>

          {summary.flaggedAnomaliesCount > 0 ? (
            <View style={{ gap: 4, marginTop: 4 }}>
              {summary.integrityFlags.slice(0, 2).map((flag, idx) => (
                <Text key={idx} style={styles.flagWarning}>
                  • {flag.message}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.cleanStatusText}>
              All on-device transit logs fully satisfy Pune Metro fair-play rules. Leaderboard score is certified clean.
            </Text>
          )}
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share fair play audit badge"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#10B981" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Fair Play Audit Badge'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          XP and rides are self-reported on this device, not independently verified by metro automated gates. Fair-play heuristics prevent rapid duplicate abuse and daily spamming.
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
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#08281D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#10B981',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#16272E',
    marginHorizontal: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  passText: {
    color: '#10B981',
  },
  failText: {
    color: '#EF4444',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
  },
  statusBox: {
    backgroundColor: '#071811',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0F442E',
    padding: 12,
    gap: 6,
  },
  statusEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#10B981',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeCode: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#6EE7B7',
    backgroundColor: '#062016',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cleanStatusText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#D1FAE5',
  },
  flagWarning: {
    fontSize: 11,
    color: '#FCA5A5',
    lineHeight: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#08251C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#115E42',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
