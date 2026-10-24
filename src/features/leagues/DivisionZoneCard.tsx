import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, Progress, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { DivisionStanding } from './types';

interface DivisionZoneCardProps {
  standing: DivisionStanding;
}

export function DivisionZoneCard({ standing }: DivisionZoneCardProps) {
  const { tierInfo, zone, userRank, totalParticipants, userScore, targetUnit } = standing;

  // Visual configuration based on zone
  const isPromotion = zone === 'promotion';
  const isRelegation = zone === 'relegation';

  const zoneColor = isPromotion ? '#00CD6B' : isRelegation ? '#FF7A45' : '#55C5E0';
  const zoneBg = isPromotion ? '#122B1E' : isRelegation ? '#2E150F' : '#0F232B';
  const zoneBorder = isPromotion ? '#1E4732' : isRelegation ? '#4A2318' : '#1A3945';
  const zoneTagText = isPromotion ? 'PROMOTION ZONE' : isRelegation ? 'RELEGATION DANGER' : 'SAFE ZONE';

  // Calculate relative progress inside current division window
  const maxScore = Math.max(1, standing.promotionCutoffScore * 1.25, userScore * 1.1);
  const userPercent = Math.min(100, Math.round((userScore / maxScore) * 100));

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={standing.a11yZoneDescription}
        style={{ gap: 14 }}
      >
        {/* Tier and Zone Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={[
                styles.tierIconBadge,
                { backgroundColor: tierInfo.badgeBg, borderColor: tierInfo.borderTint },
              ]}
            >
              <Icon name="award" size={18} color={tierInfo.badgeColor} />
            </View>
            <View>
              <Text style={[styles.eyebrow, { color: tierInfo.badgeColor }]}>
                {tierInfo.title.toUpperCase()}
              </Text>
              <Text style={styles.title}>{standing.headline}</Text>
            </View>
          </View>
          <Pill text={zoneTagText} color={zoneBg} ink={zoneColor} />
        </View>

        {/* Status Callout Box */}
        <View style={[styles.statusBox, { backgroundColor: zoneBg, borderColor: zoneBorder }]}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon
                name={isPromotion ? 'trending-up' : isRelegation ? 'alert-circle' : 'shield'}
                size={16}
                color={zoneColor}
              />
              <Text style={[styles.statusRank, { color: zoneColor }]}>
                Rank #{userRank} of {totalParticipants}
              </Text>
            </View>
            <Text style={styles.scoreText}>
              {userScore} {targetUnit}
            </Text>
          </View>
          <Text style={styles.subtext}>{standing.subtext}</Text>
        </View>

        {/* Division Thresholds Grid */}
        <View style={styles.cutoffsGrid}>
          <View style={styles.cutoffCol}>
            <Text style={styles.cutoffLabel}>Promotion Line (Top {standing.promotionRanksCount})</Text>
            <Text style={[styles.cutoffValue, { color: '#00CD6B' }]}>
              {standing.promotionCutoffScore} {targetUnit}
            </Text>
          </View>

          <View style={styles.cutoffDivider} />

          <View style={styles.cutoffCol}>
            <Text style={styles.cutoffLabel}>
              {standing.relegationRanksCount > 0
                ? `Relegation Line (Bottom ${standing.relegationRanksCount})`
                : 'Safety (No Relegation)'}
            </Text>
            <Text
              style={[
                styles.cutoffValue,
                { color: standing.relegationRanksCount > 0 ? '#FF7A45' : '#8CA1A9' },
              ]}
            >
              {standing.relegationRanksCount > 0
                ? `${standing.relegationCutoffScore} ${targetUnit}`
                : 'Protected'}
            </Text>
          </View>
        </View>

        {/* Visual Progress Bar */}
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`Division score: ${userScore} ${targetUnit}. Promotion threshold is ${standing.promotionCutoffScore} ${targetUnit}`}
          accessibilityValue={{
            min: 0,
            max: Math.round(maxScore),
            now: userScore,
            text: `${userScore} ${targetUnit}`,
          }}
        >
          <Progress value={userPercent} color={zoneColor} />
        </View>

        {/* Explanation Note */}
        <Text style={styles.disclaimer}>
          Rolling 7-day standings. The top {standing.promotionRanksCount} move up to the next division at the weekly reset. Self-reported transit habit preview.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A1215',
    borderColor: '#152930',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  tierIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
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
  statusBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  statusRank: {
    fontSize: 13,
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F5F2',
  },
  subtext: {
    fontSize: 12,
    lineHeight: 18,
    color: '#D4E2E8',
  },
  cutoffsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1A1E',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16282E',
  },
  cutoffCol: {
    flex: 1,
    gap: 2,
  },
  cutoffLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8CA1A9',
  },
  cutoffValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  cutoffDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E3238',
    marginHorizontal: 8,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#71868F',
  },
});
