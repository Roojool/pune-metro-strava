import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { RivalDuelDetail } from './types';

interface RivalDuelCardProps {
  duel: RivalDuelDetail;
}

export function RivalDuelCard({ duel }: RivalDuelCardProps) {
  const isAhead = duel.scoreDelta >= 0;
  const accentColor = isAhead ? '#00CD6B' : '#FF9500';
  const accentBg = isAhead ? '#122B1E' : '#2B1E0C';

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={duel.accessibilityAnnouncement}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.iconBox, { backgroundColor: accentBg }]}>
              <Icon name="zap" size={18} color={accentColor} />
            </View>
            <View>
              <Text style={[styles.eyebrow, { color: accentColor }]}>WHO BURNED MORE · RIVAL DUEL</Text>
              <Text style={styles.title}>{duel.headline}</Text>
            </View>
          </View>
          <Pill
            text={isAhead ? 'PACESETTER' : 'CHASER'}
            color={accentBg}
            ink={accentColor}
          />
        </View>

        {/* Head-to-Head Comparison Grid */}
        <View style={styles.duelGrid}>
          {/* Active Calories Burned */}
          <View style={styles.duelRow}>
            <View style={styles.rowLabelCol}>
              <Icon name="activity" size={14} color="#00CD6B" />
              <Text style={styles.rowLabel}>Active Burn</Text>
            </View>
            <View style={styles.scoresRow}>
              <Text style={styles.userScoreText}>{duel.userCalories} kcal</Text>
              <Text style={styles.vsText}>vs</Text>
              <Text style={styles.rivalScoreText}>{duel.rivalCalories} kcal</Text>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.duelRow}>
            <View style={styles.rowLabelCol}>
              <Icon name="award" size={14} color={theme.primary} />
              <Text style={styles.rowLabel}>XP Points</Text>
            </View>
            <View style={styles.scoresRow}>
              <Text style={styles.userScoreText}>{duel.userXp} XP</Text>
              <Text style={styles.vsText}>vs</Text>
              <Text style={styles.rivalScoreText}>{duel.rivalXp} XP</Text>
            </View>
          </View>

          {/* CO2 Emissions Saved */}
          <View style={styles.duelRow}>
            <View style={styles.rowLabelCol}>
              <Icon name="wind" size={14} color="#AD79FF" />
              <Text style={styles.rowLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.scoresRow}>
              <Text style={styles.userScoreText}>{duel.userCo2} kg</Text>
              <Text style={styles.vsText}>vs</Text>
              <Text style={styles.rivalScoreText}>{duel.rivalCo2} kg</Text>
            </View>
          </View>
        </View>

        {/* Catch-Up Transit Strategies (when trailing) */}
        {!isAhead && duel.suggestedCatchups.length > 0 ? (
          <View style={styles.catchupBox}>
            <Text style={styles.catchupTitle}>Catch-Up Pune Transit Corridors</Text>
            <View style={{ gap: 8 }}>
              {duel.suggestedCatchups.slice(0, 3).map((route, i) => (
                <View key={i} style={styles.routeItem}>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={styles.routeName}>{route.routeLabel}</Text>
                    <Text style={styles.routeMeta}>
                      +{route.estimatedKcal} kcal · +{route.xpValue} XP · {route.stationCount} stations
                    </Text>
                  </View>
                  <View style={styles.ridesNeededBadge}>
                    <Text style={styles.ridesNeededText}>
                      {route.ridesNeededToOvertake} {route.ridesNeededToOvertake === 1 ? 'ride' : 'rides'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.disclaimer}>
          Direct head-to-head competition against {duel.rivalName}. Live standings update with every self-reported ride.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F1315',
    borderColor: '#1D2A30',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  duelGrid: {
    backgroundColor: '#070A0B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#182429',
    padding: 12,
    gap: 10,
  },
  duelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9EACB3',
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00CD6B',
  },
  vsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55656E',
  },
  rivalScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C7D3D9',
  },
  catchupBox: {
    backgroundColor: '#161D21',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#24343B',
    gap: 8,
  },
  catchupTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#55C5E0',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#202E34',
  },
  routeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F5F5F2',
  },
  routeMeta: {
    fontSize: 10,
    color: '#8CA1A9',
  },
  ridesNeededBadge: {
    backgroundColor: '#0F262E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1D4554',
  },
  ridesNeededText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#55C5E0',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6F8089',
  },
});
