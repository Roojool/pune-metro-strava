import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { PuneReplenishSummary } from './types';

interface PuneReplenishCardProps {
  summary: PuneReplenishSummary;
}

export function PuneReplenishCard({ summary }: PuneReplenishCardProps) {
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
              <Icon name="coffee" size={18} color="#FF7675" />
            </View>
            <View>
              <Text style={styles.eyebrow}>POST-BURN RECHARGE · PUNE WELLNESS</Text>
              <Text style={styles.title}>Hydration & Food Replenish</Text>
            </View>
          </View>
          <Pill
            text={`${summary.unlockedCount}/${summary.items.length} UNLOCKED`}
            color={summary.unlockedCount > 0 ? '#2C1616' : '#142026'}
            ink={summary.unlockedCount > 0 ? '#FF7675' : '#7D95A0'}
          />
        </View>

        {/* 3 Hydration Stats */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ~{summary.estimatedFluidLossMl}
              <Text style={styles.metricUnit}> ml</Text>
            </Text>
            <Text style={styles.metricTitle}>Fluid Loss</Text>
            <Text style={styles.metricSub}>Sweat & exertion</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.recommendedWaterGlasses}
              <Text style={styles.metricUnit}> 💧</Text>
            </Text>
            <Text style={styles.metricTitle}>Water Intake</Text>
            <Text style={styles.metricSub}>250ml glasses</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalCaloriesBurned}
              <Text style={styles.metricUnit}> kcal</Text>
            </Text>
            <Text style={styles.metricTitle}>Physical Burn</Text>
            <Text style={styles.metricSub}>Active transit</Text>
          </View>
        </View>

        {/* Active Recommendation Banner */}
        <View style={styles.recommendationBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.recommendationEyebrow}>TOP POST-COMMUTE RECHARGE</Text>
            <Pill text={`${summary.activeRecommendation.calorieValue} KCAL`} color="#1F1313" ink="#FF7675" />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <Text style={{ fontSize: 24 }}>{summary.activeRecommendation.icon}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.recName}>{summary.activeRecommendation.name}</Text>
              <Text style={styles.recMarathi}>{summary.activeRecommendation.marathiName}</Text>
            </View>
          </View>

          <Text style={styles.recDesc}>{summary.activeRecommendation.description}</Text>

          <View style={styles.locationRow}>
            <Icon name="map-pin" size={12} color="#BDC9D1" />
            <Text style={styles.locationText} numberOfLines={1}>
              {summary.activeRecommendation.landmarkLocation}
            </Text>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>{summary.hydrationTip}</Text>
          </View>
        </View>

        {/* All Replenishment Treats Grid */}
        <View style={{ gap: 6 }}>
          <Text style={styles.catalogHeader}>Pune Commuter Food Rewards</Text>
          {summary.items.map(item => {
            const pct = Math.round(item.earnedRatio * 100);

            return (
              <View
                key={item.id}
                style={[styles.itemRow, item.isUnlocked && styles.itemRowUnlocked]}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={`${item.name}, ${item.marathiName}: ${item.calorieValue} kcal. Progress: ${pct}%. ${item.isUnlocked ? 'Earned!' : 'In progress.'}`}
              >
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    {item.isUnlocked ? (
                      <Text style={styles.earnedTag}>EARNED ✓</Text>
                    ) : (
                      <Text style={styles.pctText}>{pct}% ({item.calorieValue} kcal)</Text>
                    )}
                  </View>
                  <View style={styles.itemTrack}>
                    <View
                      style={[
                        styles.itemFill,
                        {
                          width: `${Math.max(4, pct)}%`,
                          backgroundColor: item.isUnlocked ? '#00CD6B' : '#FF7675',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          Hydration and calorie replenishment estimates based on average Pune commuter ambient walking exertion (~2.5 ml sweat loss/kcal). Food portions benchmarked against authentic Pune culinary staples.
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
    backgroundColor: '#2B1515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FF7675',
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
    color: '#FF7675',
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BDC9D1',
  },
  metricSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#71868F',
  },
  recommendationBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 6,
  },
  recommendationEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#FF7675',
  },
  recName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recMarathi: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8EA1A9',
  },
  recDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: '#9EAFB7',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#BDC9D1',
  },
  tipBox: {
    backgroundColor: '#111A1F',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  tipText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#7B9BAA',
  },
  catalogHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#8EA1A9',
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#070C0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122026',
    padding: 8,
  },
  itemRowUnlocked: {
    borderColor: '#243C2E',
    backgroundColor: '#08140E',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  earnedTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00CD6B',
  },
  pctText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71868F',
  },
  itemTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#142229',
    overflow: 'hidden',
    marginTop: 3,
  },
  itemFill: {
    height: '100%',
    borderRadius: 2,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
