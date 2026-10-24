import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { SegmentVelocitySummary } from './types';

interface SegmentVelocityCardProps {
  summary: SegmentVelocitySummary;
}

export function SegmentVelocityCard({ summary }: SegmentVelocityCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableSegmentsText);
          setShareFeedback('SEGMENTS COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableSegmentsText,
        title: 'Pune Metro Strava Segment Velocity & Local Legends',
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
              <Icon name="zap" size={18} color="#EAB308" />
            </View>
            <View>
              <Text style={styles.eyebrow}>STRAVA SEGMENTS · LOCAL LEGENDS</Text>
              <Text style={styles.title}>Commute Segment Velocity</Text>
            </View>
          </View>
          <Pill
            text={`${summary.localLegendCrownsCount} CROWNS 👑`}
            color="#2A2206"
            ink="#FDE047"
          />
        </View>

        {/* 3 Metrics Overview */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalSegmentsCompleted}
              <Text style={styles.metricUnit}>/{summary.segments.length}</Text>
            </Text>
            <Text style={styles.metricTitle}>Completed</Text>
            <Text style={styles.metricSub}>Corridors logged</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ~{summary.totalTimeSavedMinutes}
              <Text style={styles.metricUnit}> min</Text>
            </Text>
            <Text style={styles.metricTitle}>Traffic Saved</Text>
            <Text style={styles.metricSub}>vs Pune roads</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.localLegendCrownsCount}
              <Text style={styles.metricUnit}> 👑</Text>
            </Text>
            <Text style={styles.metricTitle}>Local Legends</Text>
            <Text style={styles.metricSub}>3+ traversals</Text>
          </View>
        </View>

        {/* Segment Cards */}
        <View style={styles.segmentsList}>
          <Text style={styles.listHeader}>ICONIC PUNE METRO TRANSIT SEGMENTS</Text>
          <View style={{ gap: 8 }}>
            {summary.segments.map((seg) => {
              const isPurple = seg.line === 'purple';
              return (
                <View
                  key={seg.id}
                  style={[
                    styles.segmentCard,
                    seg.isCompleted && styles.completedSegmentCard,
                    seg.isLocalLegend && styles.legendSegmentCard,
                  ]}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${seg.title}: ${seg.marathiTitle}. ${seg.distanceKm} kilometers. ${
                    seg.isLocalLegend
                      ? 'Local Legend crown earned with 3 or more traversals.'
                      : seg.isCompleted
                      ? `Completed ${seg.timesTraversed} times.`
                      : 'Unexplored.'
                  } Metro takes ${seg.standardMinutes} minutes versus ${seg.roadMinutes} minutes on roads.`}
                >
                  <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                      <Text style={[styles.lineBadge, isPurple ? styles.purpleBadge : styles.aquaBadge]}>
                        {isPurple ? 'PURPLE' : 'AQUA'}
                      </Text>
                      <Text style={[styles.segmentTitle, seg.isCompleted && styles.completedTitle]} numberOfLines={1}>
                        {seg.title}
                      </Text>
                    </View>
                    {seg.isLocalLegend ? (
                      <Text style={styles.crownTag}>LOCAL LEGEND 👑</Text>
                    ) : seg.isCompleted ? (
                      <Text style={styles.traversedTag}>{seg.timesTraversed}x LOGGED</Text>
                    ) : (
                      <Text style={styles.unexploredTag}>UNEXPLORED</Text>
                    )}
                  </View>

                  <Text style={styles.marathiText}>{seg.marathiTitle}</Text>

                  {/* Distance & Traffic Comparison Bar */}
                  <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }]}>
                    <Text style={styles.distanceText}>
                      {seg.distanceKm} km · Metro: ~{seg.standardMinutes}m
                    </Text>
                    <Text style={styles.roadComparisonText}>
                      Road: ~{seg.roadMinutes}m ({seg.roadMinutes - seg.standardMinutes}m faster)
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Time Savings Callout */}
        <View style={styles.savingsBox}>
          <Icon name="check-circle" size={16} color="#EAB308" />
          <Text style={styles.savingsText}>
            Pune Metro commutes bypass bottlenecks at the Old Mumbai Highway, Sambhaji Bridge, and Karve Road, saving up to 37 minutes per trip.
          </Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share segment velocity records"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#EAB308" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Segment Velocity Records'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Transit segments benchmark travel times against actual Pune peak surface road traffic (~15 km/h). No private tracking data is shared.
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
    backgroundColor: '#261E08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#EAB308',
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
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EAB308',
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
  segmentsList: {
    gap: 8,
  },
  listHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  segmentCard: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 4,
  },
  completedSegmentCard: {
    backgroundColor: '#09161A',
    borderColor: '#133E4A',
  },
  legendSegmentCard: {
    backgroundColor: '#1C1605',
    borderColor: '#634A09',
  },
  lineBadge: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  purpleBadge: {
    backgroundColor: '#2D1F47',
    color: '#D8B4FE',
  },
  aquaBadge: {
    backgroundColor: '#0E2E38',
    color: '#67E8F9',
  },
  segmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    flexShrink: 1,
  },
  completedTitle: {
    color: '#FFFFFF',
  },
  crownTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE047',
  },
  traversedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  unexploredTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  marathiText: {
    fontSize: 10,
    color: '#64748B',
  },
  distanceText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  roadComparisonText: {
    fontSize: 10,
    color: '#4ADE80',
    fontWeight: '600',
  },
  savingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E1805',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A390C',
    padding: 10,
  },
  savingsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#FEF08A',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1F1804',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#543F08',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FEF08A',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
