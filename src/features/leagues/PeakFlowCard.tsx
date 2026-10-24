import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { PeakFlowSummary } from './types';

interface PeakFlowCardProps {
  summary: PeakFlowSummary;
}

export function PeakFlowCard({ summary }: PeakFlowCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableFlowText);
          setShareFeedback('RHYTHM COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableFlowText,
        title: 'Pune Metro Commute Transit Rhythm',
      });
      setShareFeedback('SHARED!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShareFeedback(null);
    }
  };

  const getPersonaColor = (persona: string) => {
    if (persona.includes('Warrior')) {
      return { bg: '#2B120B', border: '#D97706', ink: '#FCD34D' };
    }
    if (persona.includes('Pioneer')) {
      return { bg: '#102A1E', border: '#059669', ink: '#A7F3D0' };
    }
    if (persona.includes('Optimizer')) {
      return { bg: '#0A2533', border: '#0284C7', ink: '#BAE6FD' };
    }
    return { bg: '#1E1528', border: '#7C3AED', ink: '#DDD6FE' };
  };

  const personaColors = getPersonaColor(summary.dominantPersona);

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
              <Icon name="clock" size={18} color="#06B6D4" />
            </View>
            <View>
              <Text style={styles.eyebrow}>TRANSIT RHYTHM · GRID BALANCER</Text>
              <Text style={styles.title}>Commute Transit Rhythm</Text>
            </View>
          </View>
          <Pill
            text={summary.dominantPersona.toUpperCase()}
            color={personaColors.bg}
            ink={personaColors.ink}
          />
        </View>

        {/* 2 Exertion & Grid Relief Metrics */}
        <View style={styles.metricRow}>
          {/* Core Balance Stamina */}
          <View style={styles.metricBox}>
            <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={styles.metricTag}>CORE STAMINA</Text>
              <Text style={styles.peakIndicator}>PEAK</Text>
            </View>
            <Text style={styles.metricVal}>
              +{summary.crowdStaminaKcal} <Text style={styles.metricUnit}>kcal</Text>
            </Text>
            <Text style={styles.metricSub}>
              {summary.peakRidesCount} peak rush rides ({summary.peakRidesPercent}%)
            </Text>
          </View>

          {/* Grid Balancer Rewards */}
          <View style={styles.metricBox}>
            <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={styles.metricTag}>GRID BALANCER</Text>
              <Text style={styles.offPeakIndicator}>OFF-PEAK</Text>
            </View>
            <Text style={styles.metricVal}>
              +{summary.gridBalancerPoints} <Text style={styles.metricUnit}>XP</Text>
            </Text>
            <Text style={styles.metricSub}>
              {summary.offPeakRidesCount} off-peak rides ({summary.offPeakRidesPercent}%)
            </Text>
          </View>
        </View>

        {/* 5-Window Distribution Breakdown */}
        <View style={styles.distributionBox}>
          <Text style={styles.distHeader}>PUNE METRO 24-HOUR RHYTHM (IST)</Text>
          <View style={{ gap: 8 }}>
            {summary.windowBreakdown.map((win) => (
              <View key={win.id} style={{ gap: 3 }}>
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.windowLabel, win.isPeak && styles.peakLabel]}>
                      {win.label}
                    </Text>
                    <Text style={styles.hoursLabel}>({win.hoursLabel})</Text>
                  </View>
                  <Text style={styles.windowCount}>
                    {win.count} {win.count === 1 ? 'ride' : 'rides'} ({win.percent}%)
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.max(win.count > 0 ? 6 : 0, win.percent)}%`,
                        backgroundColor: win.isPeak ? '#F59E0B' : '#06B6D4',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Actionable Efficiency Tip */}
        <View style={styles.tipBox}>
          <Icon name="zap" size={16} color="#FBBF24" />
          <Text style={styles.tipText}>{summary.efficiencyTip}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share commute transit rhythm"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#06B6D4" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Commute Transit Rhythm'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Time windows windowed in India Standard Time (IST). Off-peak travel alleviates congestion at critical interchange hubs like Civil Court and Swargate.
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
    backgroundColor: '#08252C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#06B6D4',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 4,
  },
  metricTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  peakIndicator: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  offPeakIndicator: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06B6D4',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metricSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  distributionBox: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 10,
  },
  distHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  windowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  peakLabel: {
    color: '#FDE68A',
  },
  hoursLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  windowCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  track: {
    height: 5,
    backgroundColor: '#14252B',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2.5,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C1908',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A3D12',
    padding: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#FEF3C7',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#092128',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#164E63',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BAE6FD',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
