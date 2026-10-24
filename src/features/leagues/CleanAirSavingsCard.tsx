import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { CleanAirMetrics } from './types';

interface CleanAirSavingsCardProps {
  metrics: CleanAirMetrics;
}

export function CleanAirSavingsCard({ metrics }: CleanAirSavingsCardProps) {
  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={metrics.accessibilitySummary}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Icon name="wind" size={18} color="#2ECC71" />
            </View>
            <View>
              <Text style={styles.eyebrow}>PUNE CLEAN AIR INITIATIVE · ECO IMPACT</Text>
              <Text style={styles.title}>Zero-Emission Commute</Text>
            </View>
          </View>
          <Pill
            text={metrics.ecoTierTitle.toUpperCase()}
            color="#0E2E1B"
            ink="#2ECC71"
          />
        </View>

        {/* 3 Environmental Impact Pillars */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {metrics.fuelSavedLiters}
              <Text style={styles.metricUnit}> L</Text>
            </Text>
            <Text style={styles.metricTitle}>Petrol Saved</Text>
            <Text style={styles.metricSub}>~₹{metrics.fuelExpenseSavedRupees} fuel cost</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {metrics.pm25PreventedGrams}
              <Text style={styles.metricUnit}> g</Text>
            </Text>
            <Text style={styles.metricTitle}>PM2.5 Avoided</Text>
            <Text style={styles.metricSub}>Toxic soot spared</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {metrics.treesAbsorptionEquivalent}
              <Text style={styles.metricUnit}> 🌳</Text>
            </Text>
            <Text style={styles.metricTitle}>Tree-Years</Text>
            <Text style={styles.metricSub}>{metrics.co2PreventedKg} kg CO₂ offset</Text>
          </View>
        </View>

        {/* Traffic Delay Avoidance Spotlight */}
        <View style={styles.trafficBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="navigation" size={14} color="#55C5E0" />
              <Text style={styles.trafficEyebrow}>ROAD CONGESTION AVOIDANCE</Text>
            </View>
            <Text style={styles.timeSavedVal}>~{metrics.roadMinutesSaved} mins saved</Text>
          </View>

          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.corridorLabel}>Top Eco Corridor:</Text>
            <Text style={styles.corridorName} numberOfLines={1}>
              {metrics.topEcoCorridor}
            </Text>
          </View>

          <Text style={styles.tierDesc}>{metrics.ecoTierDescription}</Text>
        </View>

        <Text style={styles.disclaimer}>
          Environmental savings benchmarked against average Pune mixed vehicle road traffic (~20 km/L stop-and-go fuel economy, ~0.12 kg CO₂/km avoided).
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
    backgroundColor: '#0B2416',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#2ECC71',
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
    color: '#2ECC71',
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
  trafficBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 6,
  },
  trafficEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#55C5E0',
  },
  timeSavedVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00CD6B',
  },
  corridorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71868F',
  },
  corridorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  tierDesc: {
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
