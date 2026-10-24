import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, Progress, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { WeekendChallenge } from './types';

interface WeekendChallengeCardProps {
  challenges: WeekendChallenge[];
}

export function WeekendChallengeCard({ challenges }: WeekendChallengeCardProps) {
  const completedCount = challenges.filter(c => c.isCompleted).length;

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`Weekend Challenges: ${completedCount} of ${challenges.length} completed.`}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Icon name="target" size={18} color="#FF9500" />
            </View>
            <View>
              <Text style={styles.eyebrow}>WEEKEND TRANSIT MISSIONS</Text>
              <Text style={styles.title}>Pune Metro Weekend Raid</Text>
            </View>
          </View>
          <Pill
            text={`${completedCount}/${challenges.length} COMPLETED`}
            color="#261E14"
            ink="#FF9500"
          />
        </View>

        {/* Challenges List */}
        <View style={{ gap: 12 }}>
          {challenges.map(c => {
            const percent = Math.min(100, Math.round((c.currentProgress / c.targetCount) * 100));
            return (
              <View
                key={c.id}
                style={[
                  styles.challengeItem,
                  { borderColor: c.isCompleted ? '#1E4732' : '#232D33' },
                ]}
              >
                <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }]}>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={styles.challengeTitle}>{c.title}</Text>
                    <Text style={styles.challengeSubtitle}>{c.subtitle}</Text>
                  </View>
                  <View style={[styles.rewardPill, { backgroundColor: c.isCompleted ? '#163624' : '#2A2016' }]}>
                    <Text style={[styles.rewardText, { color: c.isCompleted ? '#00CD6B' : '#FF9500' }]}>
                      {c.isCompleted ? 'COMPLETED' : 'WEEKEND GOAL'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.challengeDesc}>{c.description}</Text>

                {/* Progress Bar */}
                <View
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={`${c.title} progress: ${c.currentProgress} of ${c.targetCount}`}
                  accessibilityValue={{ min: 0, max: c.targetCount, now: c.currentProgress, text: `${c.currentProgress} of ${c.targetCount}` }}
                  style={{ gap: 4 }}
                >
                  <Progress value={percent} color={c.isCompleted ? '#00CD6B' : '#FF9500'} />
                  <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
                    <Text style={styles.progressText}>
                      {c.currentProgress} / {c.targetCount} completed
                    </Text>
                    <Text style={styles.timeText}>{c.remainingTimeText}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          Weekend goals reset every Monday at 00:00 IST. Tracks active exploration milestones across Saturday and Sunday.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D1114',
    borderColor: '#19262E',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#261C13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FF9500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  challengeItem: {
    backgroundColor: '#0A0E10',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  challengeSubtitle: {
    fontSize: 11,
    color: '#8CA1A9',
  },
  rewardPill: {
    backgroundColor: '#1E2B24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CD6B',
  },
  challengeDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#C3D0D6',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F5F5F2',
  },
  timeText: {
    fontSize: 10,
    color: '#71868F',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657880',
  },
});
