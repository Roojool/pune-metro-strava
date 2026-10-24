import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { StreakShieldSummary } from './types';

interface StreakShieldCardProps {
  summary: StreakShieldSummary;
}

export function StreakShieldCard({ summary }: StreakShieldCardProps) {
  const isWarning = summary.isStreakAtRisk && summary.shieldsAvailable === 0;
  const pct = Math.round(summary.progressToNextShieldRatio * 100);

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
              <Icon name="shield" size={18} color="#00CEC9" />
            </View>
            <View>
              <Text style={styles.eyebrow}>FAIR PLAY HABIT · REST DAY PROTECTION</Text>
              <Text style={styles.title}>Commuter Streak Shield</Text>
            </View>
          </View>
          <Pill
            text={`${summary.shieldsAvailable}/${summary.maxShields} SHIELDS`}
            color={summary.shieldsAvailable > 0 ? '#0B2927' : '#142026'}
            ink={summary.shieldsAvailable > 0 ? '#00CEC9' : '#7D95A0'}
          />
        </View>

        {/* 2 Shield Slots Shelf */}
        <View style={styles.shelfContainer}>
          {Array.from({ length: summary.maxShields }).map((_, i) => {
            const isFilled = i < summary.shieldsAvailable;
            const threshold = i === 0 ? '3-day streak' : '7-day streak';

            return (
              <View
                key={`shield-slot-${i}`}
                style={[
                  styles.shieldSlot,
                  isFilled ? styles.shieldSlotFilled : styles.shieldSlotEmpty,
                ]}
              >
                <Icon
                  name="shield"
                  size={20}
                  color={isFilled ? '#00CEC9' : '#334E59'}
                />
                <Text style={[styles.slotLabel, isFilled && styles.slotLabelFilled]}>
                  {isFilled ? `Shield ${i + 1} Ready` : `Unlock at ${threshold}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Status Callout */}
        <View style={[styles.statusBox, isWarning && styles.statusBoxWarning]}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={[styles.statusHeadline, isWarning && styles.statusHeadlineWarning]}>
              {summary.shieldStatusHeadline}
            </Text>
            <Text style={styles.resetCountdown}>{summary.hoursUntilReset}h to 5:30 AM IST</Text>
          </View>
          <Text style={styles.statusMessage}>{summary.shieldStatusMessage}</Text>
        </View>

        {/* Weekly Commute Progress Toward Next Shield */}
        <View style={styles.progressContainer}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.progressLabel}>Rolling Weekly Commute Target</Text>
            <Text style={styles.progressVal}>
              {summary.weeklyCommuteDaysSoFar} / {summary.weeklyCommuteTarget} days ({pct}%)
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(4, pct)}%` }]} />
          </View>
        </View>

        <Text style={styles.fairPlayNotice}>{summary.fairPlayNotice}</Text>
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
    backgroundColor: '#0B2927',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#00CEC9',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shelfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  shieldSlotFilled: {
    backgroundColor: '#09211F',
    borderColor: '#0E4945',
  },
  shieldSlotEmpty: {
    backgroundColor: '#070C0E',
    borderColor: '#14252B',
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71868F',
  },
  slotLabelFilled: {
    color: '#E0F8F7',
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: '#0A1215',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16252C',
    padding: 12,
    gap: 4,
  },
  statusBoxWarning: {
    backgroundColor: '#26120D',
    borderColor: '#662215',
  },
  statusHeadline: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00CEC9',
  },
  statusHeadlineWarning: {
    color: '#FF7675',
  },
  resetCountdown: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71868F',
  },
  statusMessage: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8EA1A9',
  },
  progressContainer: {
    backgroundColor: '#070C0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 10,
    gap: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71868F',
  },
  progressVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00CEC9',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#122026',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#00CEC9',
    borderRadius: 2,
  },
  fairPlayNotice: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
