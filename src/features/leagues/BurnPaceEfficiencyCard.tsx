import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { BurnPaceEfficiencySummary } from './types';

interface BurnPaceEfficiencyCardProps {
  summary: BurnPaceEfficiencySummary;
}

export function BurnPaceEfficiencyCard({ summary }: BurnPaceEfficiencyCardProps) {
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
              <Icon name="activity" size={18} color="#F39C12" />
            </View>
            <View>
              <Text style={styles.eyebrow}>STRAVA PACE · COMMUTE EFFICIENCY</Text>
              <Text style={styles.title}>Commute Pace & Burn Rate</Text>
            </View>
          </View>
          <Pill
            text={summary.efficiencyRatingTitle.toUpperCase()}
            color="#291F09"
            ink="#F39C12"
          />
        </View>

        {/* 3 Metric Pillars */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.averageSpeedKmh}
              <Text style={styles.metricUnit}> km/h</Text>
            </Text>
            <Text style={styles.metricTitle}>Transit Speed</Text>
            <Text style={styles.metricSub}>{summary.averagePaceMinPerKm} min/km pace</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.burnRateKcalPerKm}
              <Text style={styles.metricUnit}> kcal</Text>
            </Text>
            <Text style={styles.metricTitle}>Burn per Km</Text>
            <Text style={styles.metricSub}>{summary.burnRateKcalPerMinute} kcal/min</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.timeSavingsMultiplier}x
              <Text style={styles.metricUnit}> fast</Text>
            </Text>
            <Text style={styles.metricTitle}>vs Road Traffic</Text>
            <Text style={styles.metricSub}>Karve/Old Hwy</Text>
          </View>
        </View>

        {/* Road Comparison Spotlight */}
        <View style={styles.comparisonBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={14} color="#F39C12" />
              <Text style={styles.comparisonEyebrow}>PUNE SURFACE TRAFFIC COMPARISON</Text>
            </View>
            <Text style={styles.comparisonBadge}>
              {summary.timeSavingsMultiplier}X TIME SAVINGS
            </Text>
          </View>

          {/* Speed Bar Comparison */}
          <View style={{ gap: 6, marginTop: 4 }}>
            <View style={{ gap: 2 }}>
              <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
                <Text style={styles.barLabel}>Pune Metro Pace</Text>
                <Text style={styles.barValGreen}>{summary.averagePaceMinPerKm} min/km</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, Math.max(15, Math.round((summary.averageSpeedKmh / 40) * 100)))}%`,
                      backgroundColor: '#00CD6B',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={{ gap: 2 }}>
              <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
                <Text style={styles.barLabel}>Peak Road Traffic Pace</Text>
                <Text style={styles.barValRed}>{summary.roadPaceComparisonMinPerKm} min/km</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: '38%',
                      backgroundColor: '#E74C3C',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <Text style={styles.subtitleText}>{summary.efficiencyRatingSubtitle}</Text>
        </View>

        <Text style={styles.disclaimer}>
          Commute pace and speed calculated from elapsed journey duration and track distances. Road comparison benchmarks against average peak Pune surface traffic (~15 km/h, 4.0 min/km).
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
    backgroundColor: '#261C08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#F39C12',
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
    color: '#F39C12',
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
  comparisonBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 8,
  },
  comparisonEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#F39C12',
  },
  comparisonBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#00CD6B',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8EA1A9',
  },
  barValGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00CD6B',
  },
  barValRed: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E74C3C',
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#11222B',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  subtitleText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8EA1A9',
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
