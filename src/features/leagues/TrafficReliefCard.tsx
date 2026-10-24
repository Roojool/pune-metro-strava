import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { TrafficReliefSummary } from './types';

interface TrafficReliefCardProps {
  summary: TrafficReliefSummary;
}

export function TrafficReliefCard({ summary }: TrafficReliefCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableTrafficText);
          setShareFeedback('RELIEF COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableTrafficText,
        title: 'Pune Metro Road Traffic Relief',
      });
      setShareFeedback('SHARED!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShareFeedback(null);
    }
  };

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
              <Icon name="navigation" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.eyebrow}>CIVIC ARTERIAL FLOW · GRIDLOCK RELIEF</Text>
              <Text style={styles.title}>Road Traffic Decongestant</Text>
            </View>
          </View>
          <Pill
            text={summary.tierTitle.toUpperCase()}
            color="#451A03"
            ink="#FCD34D"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.roadKmTraveledAvoided}
              <Text style={styles.metricUnit}> km</Text>
            </Text>
            <Text style={styles.metricTitle}>Road VKT Avoided</Text>
            <Text style={styles.metricSub}>Private vehicle miles</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.trafficSignalMinutesSaved}
              <Text style={styles.metricUnit}> min</Text>
            </Text>
            <Text style={styles.metricTitle}>Signal Wait Saved</Text>
            <Text style={styles.metricSub}>Red light idling</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.roadSpaceOccupancySqMHours}
              <Text style={styles.metricUnit}> m²·h</Text>
            </Text>
            <Text style={styles.metricTitle}>Lane Space Freed</Text>
            <Text style={styles.metricSub}>Asphalt congestion</Text>
          </View>
        </View>

        {/* Major Choke Points Bypassed Section */}
        <View style={styles.chokeSection}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.sectionHeader}>MAJOR PUNE CHOKE POINTS BYPASSED</Text>
            <Text style={styles.headerCount}>
              {summary.chokePointsBypassedCount} of {summary.totalChokePoints}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {summary.chokePoints.map((cp) => (
              <View
                key={cp.id}
                style={[styles.chokeCard, cp.isBypassed && styles.bypassedChokeCard]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${cp.name}: ${cp.marathiName}. ${
                  cp.isBypassed
                    ? `Bypassed ${cp.bypassCount} times! Sparing ~${cp.peakDelayMinutes} mins road delay.`
                    : 'Not bypassed yet.'
                } Parallel corridor: ${cp.roadName}.`}
              >
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={[styles.cpName, cp.isBypassed && styles.bypassedCpName]} numberOfLines={1}>
                    {cp.name}
                  </Text>
                  {cp.isBypassed ? (
                    <Text style={styles.bypassedBadge}>{cp.bypassCount}x BYPASSED ✓</Text>
                  ) : (
                    <Text style={styles.pendingBadge}>ROAD JAM</Text>
                  )}
                </View>

                <Text style={styles.marathiText}>{cp.marathiName}</Text>
                <Text style={styles.roadText}>{cp.roadName}</Text>

                <View style={styles.delayRow}>
                  <Icon name="clock" size={12} color={cp.isBypassed ? '#FBBF24' : '#94A3B8'} />
                  <Text style={[styles.delayText, cp.isBypassed && styles.bypassedDelayText]}>
                    Bypasses ~{cp.peakDelayMinutes} min typical peak road delay
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Toward Next Tier */}
        <View style={styles.progressContainer}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
            <Text style={styles.progressLabel}>
              Progress to Next Decongestant Milestone ({summary.nextTierKm} km)
            </Text>
            <Text style={styles.progressPercent}>{summary.progressPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${summary.progressPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* Congestion Relief Tip */}
        <View style={styles.tipBox}>
          <Icon name="zap" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>{summary.congestionReliefTip}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share road traffic relief"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#F59E0B" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Road Traffic Relief'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Civic decongestion models private road trips eliminated along arterial Pune roads. Traffic delay baselines reflect peak hours across Sancheti, Swargate, and Alka Talkies choke points.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131109',
    borderColor: '#33240D',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#451A03',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFBEB',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#1C160B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D2A11',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FBBF24',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FDE68A',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF3C7',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 10,
    color: '#D97706',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#4A3414',
  },
  chokeSection: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
  },
  headerCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  chokeCard: {
    backgroundColor: '#18140C',
    borderColor: '#2D200E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  bypassedChokeCard: {
    backgroundColor: '#231B0E',
    borderColor: '#5B3C13',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cpName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    flex: 1,
  },
  bypassedCpName: {
    color: '#FEF3C7',
    fontWeight: '800',
  },
  bypassedBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
  },
  pendingBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  marathiText: {
    fontSize: 11,
    color: '#FDE68A',
  },
  roadText: {
    fontSize: 10,
    color: '#D97706',
    fontStyle: 'italic',
  },
  delayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  delayText: {
    fontSize: 11,
    color: '#64748B',
  },
  bypassedDelayText: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  progressContainer: {
    gap: 2,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FDE68A',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FBBF24',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#261C0D',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E160A',
    borderColor: '#3D2A11',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#FEF3C7',
    lineHeight: 17,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#451A03',
    borderColor: '#78350F',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFBEB',
  },
  disclaimer: {
    fontSize: 10,
    color: '#D97706',
    lineHeight: 14,
    textAlign: 'center',
  },
});
