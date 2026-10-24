import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { VerticalAscentSummary } from './types';

interface VerticalAscentCardProps {
  summary: VerticalAscentSummary;
}

export function VerticalAscentCard({ summary }: VerticalAscentCardProps) {
  const pct = Math.round(summary.landmarkRatio * 100);

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
              <Icon name="arrow-up" size={18} color="#3498DB" />
            </View>
            <View>
              <Text style={styles.eyebrow}>CONCOURSE ASCENT · PHYSICAL VERT</Text>
              <Text style={styles.title}>Station Vertical Climb</Text>
            </View>
          </View>
          <Pill
            text={summary.climberRankTitle.toUpperCase()}
            color="#0D2230"
            ink="#5DADE2"
          />
        </View>

        {/* 3 Vertical Pillars */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalVerticalMeters}
              <Text style={styles.metricUnit}> m</Text>
            </Text>
            <Text style={styles.metricTitle}>Vertical Gained</Text>
            <Text style={styles.metricSub}>+{summary.maxSingleRideMeters}m peak ride</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalStairFlights}
              <Text style={styles.metricUnit}> fl</Text>
            </Text>
            <Text style={styles.metricTitle}>Stair Flights</Text>
            <Text style={styles.metricSub}>~{summary.totalStationSteps} steps</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {pct}
              <Text style={styles.metricUnit}>%</Text>
            </Text>
            <Text style={styles.metricTitle}>Landmark Goal</Text>
            <Text style={styles.metricSub} numberOfLines={1}>
              {summary.landmarkEquivalentName.split(' ')[0]}
            </Text>
          </View>
        </View>

        {/* Landmark Progression Track */}
        <View style={styles.landmarkBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="map-pin" size={14} color="#3498DB" />
              <Text style={styles.landmarkEyebrow}>CURRENT VERTICAL TARGET</Text>
            </View>
            <Text style={styles.landmarkTarget}>{summary.landmarkEquivalentName}</Text>
          </View>

          <View style={styles.landmarkTrack}>
            <View
              style={[
                styles.landmarkFill,
                { width: `${Math.max(4, pct)}%` },
              ]}
            />
          </View>

          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }]}>
            <Text style={styles.deepestLabel}>Deepest station reached:</Text>
            <Text style={styles.deepestVal} numberOfLines={1}>
              {summary.deepestStationTraversed}
            </Text>
          </View>

          <Text style={styles.rankSubtitle}>{summary.climberRankSubtitle}</Text>
        </View>

        <Text style={styles.disclaimer}>
          Vertical meters estimated from Pune Metro civil depth and elevation: Civil Court (~33.1m depth, India's deepest station) and elevated platform viaducts (~12-15m height).
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
    backgroundColor: '#0E1F29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#3498DB',
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
    color: '#3498DB',
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
  landmarkBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 8,
  },
  landmarkEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#3498DB',
  },
  landmarkTarget: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BDC9D1',
  },
  landmarkTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#11222B',
    overflow: 'hidden',
  },
  landmarkFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 3,
  },
  deepestLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71868F',
  },
  deepestVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CD6B',
    flex: 1,
    textAlign: 'right',
    marginLeft: 6,
  },
  rankSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8EA1A9',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
