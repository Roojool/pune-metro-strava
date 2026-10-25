import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { ActiveBurnStreakSummary } from './types';

interface BurnStreakMatrixCardProps {
  summary: ActiveBurnStreakSummary;
}

export function BurnStreakMatrixCard({ summary }: BurnStreakMatrixCardProps) {
  const a11ySummary = `14-Day Commuter Burn Streak Matrix: Current streak is ${summary.currentStreak} days, longest streak is ${summary.longestStreak} days. ${summary.streakStatusText}`;

  return (
    <Card style={localStyles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={a11ySummary}
        style={{ gap: 14 }}
      >
        {/* Card Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={localStyles.iconBadge}>
              <Icon name="zap" size={18} color="#00CD6B" />
            </View>
            <View>
              <Text style={localStyles.eyebrow}>14-DAY COMMUTE MOMENTUM</Text>
              <Text style={localStyles.title}>Active Burn Habit Matrix</Text>
            </View>
          </View>
          {summary.shieldActive ? (
            <Pill text="SHIELD ACTIVE" color="#302019" ink="#FFC6B0" />
          ) : (
            <Pill text={`${summary.currentStreak} DAY STREAK`} color="#173A26" ink="#B4F5D0" />
          )}
        </View>

        {/* Top Streak Stats Row */}
        <View style={localStyles.statsContainer}>
          <View style={localStyles.statCol}>
            <Text style={localStyles.statNumber}>{summary.currentStreak}</Text>
            <Text style={localStyles.statLabel}>Current streak (days)</Text>
          </View>

          <View style={localStyles.statDivider} />

          <View style={localStyles.statCol}>
            <Text style={localStyles.statNumber}>{summary.longestStreak}</Text>
            <Text style={localStyles.statLabel}>Best streak (days)</Text>
          </View>

          <View style={localStyles.statDivider} />

          <View style={localStyles.statCol}>
            <Text style={localStyles.statNumber}>{summary.activeStreakDays}</Text>
            <Text style={localStyles.statLabel}>Total active days</Text>
          </View>
        </View>

        {/* 14-Day Activity Matrix Dots Grid */}
        <View style={localStyles.matrixContainer}>
          <Text style={localStyles.matrixHeading}>LAST 14 CALENDAR DAYS (IST)</Text>
          <View style={localStyles.dotsRow}>
            {summary.twoWeekMatrix.map(day => {
              const a11yDotLabel = `${day.dayName} ${day.dayOfMonth}: ${
                day.isActive ? `${day.calories} kcal, ${day.ridesCount} rides` : 'No rides logged'
              }${day.isToday ? ' (Today)' : ''}`;

              return (
                <View
                  key={day.dateKey}
                  accessible
                  accessibilityLabel={a11yDotLabel}
                  style={localStyles.dayColumn}
                >
                  <Text style={localStyles.dayNameText}>{day.dayName.slice(0, 1)}</Text>
                  <View
                    style={[
                      localStyles.dot,
                      day.isActive ? localStyles.dotActive : localStyles.dotInactive,
                      day.isToday ? localStyles.dotToday : null,
                    ]}
                  >
                    {day.isActive ? (
                      <View style={localStyles.innerGlow} />
                    ) : null}
                  </View>
                  <Text style={[localStyles.dayNumberText, day.isToday ? localStyles.dayTodayText : null]}>
                    {day.dayOfMonth}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Status / Coach Text */}
        <View style={[localStyles.statusNotice, summary.shieldActive ? localStyles.shieldNotice : null]}>
          <Icon
            name={summary.shieldActive ? 'shield' : 'check-circle'}
            size={16}
            color={summary.shieldActive ? '#FFC6B0' : '#00CD6B'}
          />
          <Text style={[localStyles.statusText, summary.shieldActive ? { color: '#FFC6B0' } : null]}>
            {summary.streakStatusText}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const localStyles = StyleSheet.create({
  card: {
    backgroundColor: '#0F1612',
    borderColor: '#1F3827',
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#173A26',
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0E0B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#192C1F',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8A968E',
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#1E3224',
  },
  matrixContainer: {
    backgroundColor: '#0A0E0B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#192C1F',
    padding: 14,
    gap: 10,
  },
  matrixHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#7D8A80',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayNameText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F7C73',
  },
  dayNumberText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6F7C73',
  },
  dayTodayText: {
    color: '#00CD6B',
    fontWeight: '800',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: '#00CD6B',
  },
  dotInactive: {
    backgroundColor: '#1B241E',
  },
  dotToday: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  innerGlow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#122216',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E3C27',
  },
  shieldNotice: {
    backgroundColor: '#261814',
    borderColor: '#4A2A22',
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#BCD5C7',
  },
});
