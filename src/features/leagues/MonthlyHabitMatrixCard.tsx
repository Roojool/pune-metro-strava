import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { MonthlyHabitMatrixSummary } from './types';

interface MonthlyHabitMatrixCardProps {
  summary: MonthlyHabitMatrixSummary;
}

export function MonthlyHabitMatrixCard({ summary }: MonthlyHabitMatrixCardProps) {
  // Find weekday offset of day 1 (0=Sunday, 1=Monday, ..., 6=Saturday)
  // We want Monday (1) to be column 0, Sunday (0) to be column 6
  const firstDay = summary.days[0];
  const firstDayOfWeek = firstDay
    ? new Date(Date.UTC(summary.year, summary.days[0] ? new Date(firstDay.dateStr).getUTCMonth() : 0, 1)).getUTCDay()
    : 1;

  // Monday-based column: (dayOfWeek + 6) % 7
  const blankDaysCount = (firstDayOfWeek + 6) % 7;
  const blankSlots = Array.from({ length: blankDaysCount });

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
              <Icon name="calendar" size={18} color="#00CD6B" />
            </View>
            <View>
              <Text style={styles.eyebrow}>MONTHLY HABIT MATRIX · CONSISTENCY</Text>
              <Text style={styles.title}>{summary.monthName} {summary.year} Calendar</Text>
            </View>
          </View>
          <Pill
            text={`${summary.activeDaysCount} ACTIVE DAYS`}
            color={summary.activeDaysCount > 0 ? '#102B1E' : '#142026'}
            ink={summary.activeDaysCount > 0 ? '#00CD6B' : '#7D95A0'}
          />
        </View>

        {/* 3 Consistency Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{summary.consistencyPercentage}%</Text>
            <Text style={styles.statLabel}>Monthly Cadence</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{summary.currentStreakDays}d</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{summary.longestStreakDays}d</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Calendar Heatmap Grid */}
        <View style={styles.calendarContainer}>
          {/* Weekday Labels Header */}
          <View style={styles.weekdayRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, i) => (
              <Text key={`${w}-${i}`} style={styles.weekdayLabel}>
                {w}
              </Text>
            ))}
          </View>

          {/* Day Cells Grid */}
          <View style={styles.daysGrid}>
            {blankSlots.map((_, i) => (
              <View key={`blank-${i}`} style={styles.blankDayCell} />
            ))}

            {summary.days.map(d => {
              const cellBg = d.isActive
                ? '#00CD6B'
                : d.isToday
                ? '#1A2E24'
                : '#0E171B';
              const cellBorder = d.isToday
                ? '#00CD6B'
                : d.isActive
                ? '#00B359'
                : '#142329';
              const textInk = d.isActive
                ? '#002B13'
                : d.isToday
                ? '#00CD6B'
                : '#5C7079';

              return (
                <View
                  key={d.dateStr}
                  style={[
                    styles.dayCell,
                    { backgroundColor: cellBg, borderColor: cellBorder },
                  ]}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${d.dateStr}, ${d.dayOfWeekShort}: ${d.ridesCount} rides, ${d.caloriesBurned} kcal. ${d.isToday ? 'Today.' : ''} ${d.isActive ? 'Active commute day.' : 'No rides.'}`}
                >
                  <Text style={[styles.dayCellText, { color: textInk }]}>
                    {d.dayOfMonth}
                  </Text>
                  {d.isActive && (
                    <View style={styles.activeDot} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Habit Status Banner */}
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>{summary.habitStatusTitle}</Text>
          <Text style={styles.statusSubtitle}>{summary.habitStatusSubtitle}</Text>
        </View>

        <Text style={styles.disclaimer}>
          The monthly habit matrix marks India Standard Time calendar days where at least one self-reported ride was logged on this device.
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
    backgroundColor: '#0E2E1B',
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 10,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#16272E',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#71868F',
  },
  calendarContainer: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 10,
    gap: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#122026',
  },
  weekdayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71868F',
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  blankDayCell: {
    width: 32,
    height: 32,
    margin: 1,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  dayCellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#002B13',
  },
  statusBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 4,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusSubtitle: {
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
