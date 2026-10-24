import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { WeeklyConsistencyProfile } from './types';

interface WeeklyConsistencyCardProps {
  profile: WeeklyConsistencyProfile;
}

export function WeeklyConsistencyCard({ profile }: WeeklyConsistencyCardProps) {
  // Find max rides among the 7 days for bar height normalization
  const maxDayRides = Math.max(1, ...profile.days.map(d => d.ridesCount));

  const scoreColor =
    profile.consistencyScore >= 70
      ? { bg: '#102B1E', ink: '#00CD6B' }
      : profile.consistencyScore >= 35
      ? { bg: '#29200B', ink: '#F39C12' }
      : { bg: '#142026', ink: '#7D95A0' };

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={profile.accessibilityDescription}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Icon name="clock" size={18} color="#00CD6B" />
            </View>
            <View>
              <Text style={styles.eyebrow}>COMMUTER RHYTHM · 7-DAY CADENCE</Text>
              <Text style={styles.title}>Weekly Transit Rhythm</Text>
            </View>
          </View>
          <Pill
            text={`${profile.consistencyScore}/100 SCORE`}
            color={scoreColor.bg}
            ink={scoreColor.ink}
          />
        </View>

        {/* Persona Spotlight */}
        <View style={styles.personaBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.personaTitle}>{profile.personaTitle}</Text>
            {profile.peakDayName !== 'None' && (
              <Pill text={`PEAK: ${profile.peakDayName.toUpperCase()}`} color="#0F242A" ink="#55C5E0" />
            )}
          </View>
          <Text style={styles.personaSubtitle}>{profile.personaSubtitle}</Text>

          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <Text style={styles.splitVal}>{profile.weekdayRides}</Text>
              <Text style={styles.splitLabel}>Weekday Rides</Text>
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <Text style={styles.splitVal}>{profile.weekendRides}</Text>
              <Text style={styles.splitLabel}>Weekend Rides</Text>
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <Text style={styles.splitVal}>{profile.totalWeekCalories}</Text>
              <Text style={styles.splitLabel}>Weekly Active kcal</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartHeader}>Rides per Day of Week (IST)</Text>
          <View style={styles.barsRow}>
            {profile.days.map(d => {
              const heightPct = Math.round((d.ridesCount / maxDayRides) * 100);
              const barHeight = d.ridesCount > 0 ? Math.max(12, Math.round((heightPct / 100) * 54)) : 4;

              return (
                <View
                  key={d.dayShort}
                  style={styles.barCol}
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={`${d.dayFull}: ${d.ridesCount} rides, ${d.caloriesBurned} kcal burned. ${d.isPeakDay ? 'Peak travel day.' : ''}`}
                >
                  <Text style={[styles.barCount, d.isPeakDay && styles.barCountPeak]}>
                    {d.ridesCount > 0 ? d.ridesCount : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: d.isPeakDay
                            ? '#00CD6B'
                            : d.ridesCount > 0
                            ? '#3498DB'
                            : '#14252C',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, d.isPeakDay && styles.dayLabelPeak]}>
                    {d.dayShort}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 30-Day Monthly Projection Box */}
        <View style={styles.projectionBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="trending-up" size={14} color="#55C5E0" />
            <Text style={styles.projectionEyebrow}>PROJECTED 30-DAY HABIT IMPACT</Text>
          </View>
          <View style={[uiStyles.row, { justifyContent: 'space-around', paddingTop: 4 }]}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.projVal}>~{profile.projectedMonthlyCalories.toLocaleString()}</Text>
              <Text style={styles.projUnit}>estimated kcal burned</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#1A2F37', height: '80%' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.projVal}>~{profile.projectedMonthlyCo2Kg} kg</Text>
              <Text style={styles.projUnit}>avoided tailpipe CO₂</Text>
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Cadence projections are estimated from local device trips and adjust continuously as you commute.
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
    backgroundColor: '#0D2919',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#00CD6B',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personaBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#15252C',
    padding: 12,
    gap: 8,
  },
  personaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  personaSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8EA1A9',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122026',
    padding: 8,
    marginTop: 4,
  },
  splitItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  splitDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#16272E',
  },
  splitVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  splitLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#71868F',
  },
  chartContainer: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 10,
  },
  chartHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#8CA1A9',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71868F',
    height: 14,
  },
  barCountPeak: {
    color: '#00CD6B',
    fontWeight: '800',
  },
  barTrack: {
    width: 16,
    height: 54,
    backgroundColor: '#0B1518',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#556972',
  },
  dayLabelPeak: {
    color: '#00CD6B',
    fontWeight: '800',
  },
  projectionBox: {
    backgroundColor: '#0D1A20',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#19303A',
    padding: 10,
    gap: 6,
  },
  projectionEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#55C5E0',
  },
  projVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00CD6B',
  },
  projUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: '#7B919A',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
