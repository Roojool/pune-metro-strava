import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/Typography';
import { Card, Icon, Progress, styles } from '@/components/UI';
import type { Achievement } from '@/domain/models';
import { theme } from '@/theme';
import { buildAchievementProgress, type AchievementProgressStats } from './achievementProgress';

interface AchievementCollectionProps {
  achievements: readonly Achievement[];
  stats: AchievementProgressStats;
}

export function AchievementCollection({ achievements, stats }: AchievementCollectionProps) {
  const items = buildAchievementProgress(achievements, stats);
  const unlocked = achievements.filter(achievement => achievement.unlocked).length;

  return <View style={{ gap: 12, minWidth: 0 }}>
    <View style={{ gap: 5 }}>
      <Text accessibilityRole="header" style={[styles.section, { marginTop: 12 }]}>The little wins collection</Text>
      <Text style={styles.muted}>{unlocked} OF {achievements.length} UNLOCKED</Text>
      <Text style={styles.muted}>Progress comes from self-reported rides saved on this device. Ride and station goals use all-time totals.</Text>
      <Text style={styles.muted}>The three-day badge uses your current streak in India calendar days. A ride today or yesterday keeps the streak active; the badge locks again when the streak breaks.</Text>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, minWidth: 0 }}>
      {items.map(({ achievement, progress, guidance }) => <Card key={achievement.id} style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 240,
        minWidth: 0,
        gap: 13,
        backgroundColor: achievement.unlocked ? '#14281B' : theme.surface,
        borderColor: achievement.unlocked ? '#28583C' : theme.border,
      }}>
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: achievement.unlocked ? '#173A26' : theme.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={achievement.unlocked ? 'award' : 'lock'} size={24} color={achievement.unlocked ? theme.primary : theme.muted}/>
        </View>
        <Text style={{ fontWeight: '700', fontSize: 11, letterSpacing: 1, color: achievement.unlocked ? theme.primary : theme.muted }}>
          {achievement.unlocked ? 'UNLOCKED' : 'TO DISCOVER'}
        </Text>
        <Text accessibilityRole="header" style={{ fontWeight: '700', fontSize: 16, color: theme.ink }}>{achievement.title}</Text>
        <Text style={styles.muted}>{achievement.description}</Text>
        {progress ? <View style={{ gap: 9 }}>
          <Text style={[styles.body, { fontWeight: '700' }]}>{progress.valueText}</Text>
          <View accessible accessibilityRole="progressbar" accessibilityLabel={`${achievement.title} progress`}
            accessibilityValue={{ min: 0, max: 100, now: progress.percent, text: progress.valueText }}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-valuetext={progress.valueText}>
            <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Progress value={progress.percent} color={theme.primary}/>
            </View>
          </View>
        </View> : null}
        <Text style={styles.body}>{guidance}</Text>
      </Card>)}
    </View>
  </View>;
}
