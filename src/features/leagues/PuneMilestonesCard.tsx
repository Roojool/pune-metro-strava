import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, Progress, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { PuneMilestoneProgress } from './puneBurnEquivalents';

interface PuneMilestonesCardProps {
  progress: PuneMilestoneProgress;
  totalCalories: number;
}

export function PuneMilestonesCard({
  progress,
  totalCalories,
}: PuneMilestonesCardProps) {
  const current = progress.currentMilestone;
  const next = progress.nextMilestone;
  const isAllUnlocked = progress.unlockedCount === progress.totalCount;

  const a11ySummary = `Pune Burn Milestones: ${progress.unlockedCount} of ${progress.totalCount} milestones unlocked. Current: ${current.name} (${current.caloriesTarget} kcal target). ${next ? `Next: ${next.name}, ${progress.caloriesRemaining} calories remaining.` : 'All Pune landmarks unlocked!'}`;

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={a11ySummary}
        style={{ gap: 14 }}
      >
        {/* Card Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Icon name="award" size={18} color="#FFC6B0" />
            </View>
            <View>
              <Text style={styles.eyebrow}>PUNE CULTURAL BURN MILESTONES</Text>
              <Text style={styles.title}>Food & Landmark Climbs</Text>
            </View>
          </View>
          <Pill
            text={`${progress.unlockedCount} OF ${progress.totalCount} UNLOCKED`}
            color="#2B2019"
            ink="#FFC6B0"
          />
        </View>

        {/* Milestone Spotlight */}
        <View style={styles.spotlight}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.landmarkTag}>{current.landmark}</Text>
              <Text style={styles.milestoneName}>{current.name}</Text>
              <Text style={styles.milestoneDesc}>{current.description}</Text>
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetValue}>{current.caloriesTarget}</Text>
              <Text style={styles.targetUnit}>kcal</Text>
            </View>
          </View>

          {/* Next Milestone Proximity */}
          {next ? (
            <View style={{ gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#28201B' }}>
              <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
                <Text style={styles.nextLabel}>
                  Next target: <Text style={{ color: '#F5F5F2', fontWeight: '700' }}>{next.name}</Text>
                </Text>
                <Text style={styles.nextDeficit}>{progress.caloriesRemaining} kcal to go</Text>
              </View>

              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={`${next.name} milestone progress: ${progress.progressPercent} percent`}
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: progress.progressPercent,
                  text: `${progress.progressPercent}% toward ${next.name}`,
                }}
              >
                <Progress value={progress.progressPercent} color="#FFC6B0" />
              </View>
            </View>
          ) : (
            <View style={styles.allUnlockedBox}>
              <Icon name="check" size={16} color="#00CD6B" />
              <Text style={styles.allUnlockedText}>
                All Pune cultural burn landmarks conquered! You are a true city transit legend.
              </Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Cultural Pune calorie comparisons are illustrative estimates based on typical local portions and hill trails.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161311',
    borderColor: '#382B24',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#302019',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFC6B0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotlight: {
    backgroundColor: '#1E1815',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D2C22',
    padding: 14,
    gap: 12,
  },
  landmarkTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC6B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  milestoneDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#D1C7C3',
  },
  targetBadge: {
    backgroundColor: '#302019',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFC6B0',
  },
  targetUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D1C7C3',
  },
  nextLabel: {
    fontSize: 12,
    color: '#A8ABA9',
  },
  nextDeficit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC6B0',
  },
  allUnlockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14281B',
    padding: 10,
    borderRadius: 8,
  },
  allUnlockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BCD5C7',
    flexShrink: 1,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8A827E',
  },
});
