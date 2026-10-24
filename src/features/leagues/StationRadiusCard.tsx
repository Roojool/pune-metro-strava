import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { StationRadiusSummary } from './types';

interface StationRadiusCardProps {
  summary: StationRadiusSummary;
}

export function StationRadiusCard({ summary }: StationRadiusCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableRadiusText);
          setShareFeedback('RADIUS COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableRadiusText,
        title: 'Pune Metro Station Neighborhood Walking Catchments',
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
              <Icon name="compass" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.eyebrow}>FIRST/LAST-MILE WALK · 15-MIN CATCHMENT</Text>
              <Text style={styles.title}>Station Neighborhood Radius</Text>
            </View>
          </View>
          <Pill
            text={`${summary.unlockedCatchmentsCount} / ${summary.totalCatchments} PRECINCTS`}
            color="#06281E"
            ink="#A7F3D0"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ~{summary.totalEstimatedWalkKm}
              <Text style={styles.metricUnit}> km</Text>
            </Text>
            <Text style={styles.metricTitle}>Street Walking</Text>
            <Text style={styles.metricSub}>First/Last mile</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalWalkSteps.toLocaleString()}
            </Text>
            <Text style={styles.metricTitle}>Walk Steps</Text>
            <Text style={styles.metricSub}>Accessing stations</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              +{summary.firstLastMileBurnKcal}
              <Text style={styles.metricUnit}> kcal</Text>
            </Text>
            <Text style={styles.metricTitle}>Extra Burn</Text>
            <Text style={styles.metricSub}>Active pedestrian</Text>
          </View>
        </View>

        {/* Catchments Grid */}
        <View style={styles.catchmentList}>
          <Text style={styles.catchmentHeader}>PUNE WALKABLE NEIGHBORHOOD CATCHMENTS</Text>
          <View style={styles.catchmentsGrid}>
            {summary.catchments.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.catchmentCard,
                  c.isUnlocked && styles.unlockedCatchmentCard,
                ]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${c.name}: ${c.marathiName}. ${
                  c.isUnlocked
                    ? `Unlocked! ${c.totalKmWalked} km walked across ${c.visitCount} visits.`
                    : `In progress: ${c.visitCount} of 2 visits to unlock.`
                } Walking radius is ${c.walkRadiusMeters} meters. Landmarks include ${c.prominentLandmarks.join(', ')}.`}
              >
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={[styles.catchmentName, c.isUnlocked && styles.unlockedName]}>
                    {c.name}
                  </Text>
                  {c.isUnlocked ? (
                    <Text style={styles.unlockedTag}>EXPLORED ✓</Text>
                  ) : (
                    <Text style={styles.lockedTag}>{c.visitCount} / 2 visits</Text>
                  )}
                </View>

                <Text style={styles.marathiText}>{c.marathiName}</Text>

                {/* Landmarks reachable on foot */}
                <View style={styles.landmarksWrap}>
                  {c.prominentLandmarks.slice(0, 3).map((l, i) => (
                    <View key={i} style={styles.landmarkChip}>
                      <Text style={styles.landmarkText}>{l}</Text>
                    </View>
                  ))}
                </View>

                <View style={[uiStyles.row, { justifyContent: 'space-between', marginTop: 2 }]}>
                  <Text style={styles.radiusSub}>~{c.walkRadiusMeters}m walk radius</Text>
                  {c.isUnlocked && (
                    <Text style={styles.walkedSub}>~{c.totalKmWalked} km walked</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Active Commute Multiplier Callout */}
        <View style={styles.multiplierBox}>
          <Icon name="activity" size={16} color="#10B981" />
          <Text style={styles.multiplierText}>
            Taking Pune Metro turns a sedentary commute into an active daily habit: ~{summary.activeCommuteMultiplier}x more active calories than driving.
          </Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share walkable catchments"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#10B981" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Walkable Catchments'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          First- and last-mile walking estimates model standard 10–15 minute pedestrian access to Pune Metro stations. No GPS routes are logged or shared.
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
    backgroundColor: '#06281E',
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
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
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
  catchmentList: {
    gap: 8,
  },
  catchmentHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  catchmentsGrid: {
    gap: 8,
  },
  catchmentCard: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 6,
  },
  unlockedCatchmentCard: {
    backgroundColor: '#071A14',
    borderColor: '#0D4E3A',
  },
  catchmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  unlockedName: {
    color: '#FFFFFF',
  },
  unlockedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  lockedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  marathiText: {
    fontSize: 10,
    color: '#64748B',
  },
  landmarksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  landmarkChip: {
    backgroundColor: '#0F1A1F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#18313A',
  },
  landmarkText: {
    fontSize: 9,
    color: '#94A3B8',
  },
  radiusSub: {
    fontSize: 10,
    color: '#64748B',
  },
  walkedSub: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  multiplierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#071C14',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F4D38',
    padding: 10,
  },
  multiplierText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#A7F3D0',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#06281E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0D5C45',
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
