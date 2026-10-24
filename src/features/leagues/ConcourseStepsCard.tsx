import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { ConcourseStepsSummary } from './types';

interface ConcourseStepsCardProps {
  summary: ConcourseStepsSummary;
}

export function ConcourseStepsCard({ summary }: ConcourseStepsCardProps) {
  const pct = Math.round(summary.stepMilestoneProgress * 100);

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
              <Icon name="navigation" size={18} color="#9B59B6" />
            </View>
            <View>
              <Text style={styles.eyebrow}>PEDOMETER · PHYSICAL STRAVA STEPS</Text>
              <Text style={styles.title}>Concourse Walking Steps</Text>
            </View>
          </View>
          <Pill
            text={`~${summary.totalConcourseKm} KM WALKED`}
            color="#22122B"
            ink="#D2B4DE"
          />
        </View>

        {/* 3 Step Metric Pillars */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalEstimatedSteps.toLocaleString()}
            </Text>
            <Text style={styles.metricTitle}>Station Steps</Text>
            <Text style={styles.metricSub}>~{summary.averageStepsPerRide} steps/ride</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.interchangeSteps}
              <Text style={styles.metricUnit}> st</Text>
            </Text>
            <Text style={styles.metricTitle}>Transfer Steps</Text>
            <Text style={styles.metricSub}>Civil Court bridges</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.puneParkLapCount}
              <Text style={styles.metricUnit}> 🏃</Text>
            </Text>
            <Text style={styles.metricTitle}>Park Laps</Text>
            <Text style={styles.metricSub} numberOfLines={1}>
              {summary.puneParkLapEquivalent.split(' ')[0]}
            </Text>
          </View>
        </View>

        {/* Park Lap Equivalent Spotlight */}
        <View style={styles.spotlightBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.spotlightEyebrow}>PUNE JOGGING EQUIVALENT</Text>
            <Text style={styles.spotlightLaps}>{summary.puneParkLapCount} Laps</Text>
          </View>
          <Text style={styles.spotlightPark}>{summary.puneParkLapEquivalent}</Text>

          {/* Milestone Progress */}
          <View style={{ gap: 4, marginTop: 4 }}>
            <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
              <Text style={styles.milestoneLabel}>Goal: {summary.stepMilestoneTitle}</Text>
              <Text style={styles.milestonePct}>{pct}% ({summary.stepMilestoneTarget.toLocaleString()} steps)</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(4, pct)}%` }]} />
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Concourse steps estimated from Pune Metro architectural station dimensions (ticket concourses, security gates, stairs/escalator access, and multi-tier platform connections).
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
    backgroundColor: '#201026',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#9B59B6',
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
    color: '#9B59B6',
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
  spotlightBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 6,
  },
  spotlightEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#9B59B6',
  },
  spotlightLaps: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00CD6B',
  },
  spotlightPark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  milestoneLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8EA1A9',
  },
  milestonePct: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9B59B6',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#122026',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#9B59B6',
    borderRadius: 2,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
