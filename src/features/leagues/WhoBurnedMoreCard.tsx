import React from 'react';
import { Text } from '@/components/Typography';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Icon, Pill, Progress, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { BurnSummary, CommuterBurnTier, RivalMatchup, ScoringMetric, WeeklyBurnPacing } from './types';

interface WhoBurnedMoreCardProps {
  summary: BurnSummary;
  rivalMatchup: RivalMatchup;
  metric: ScoringMetric;
  burnTier?: CommuterBurnTier;
  weeklyPacing?: WeeklyBurnPacing;
  onLogRide?: () => void;
}

export function WhoBurnedMoreCard({
  summary,
  rivalMatchup,
  metric,
  burnTier,
  weeklyPacing,
  onLogRide,
}: WhoBurnedMoreCardProps) {
  const isTop = rivalMatchup.isTopRank;
  const hasRival = rivalMatchup.hasRivalAbove && rivalMatchup.rivalName;

  // Accessibility summary text
  const tierInfo = burnTier ? ` Current tier: ${burnTier.title}.` : '';
  const pacingInfo = weeklyPacing ? ` Weekly pacing: ${weeklyPacing.summaryText}` : '';
  const a11ySummary = `Who Burned More summary: ${summary.calories} active calories burned, equivalent to ${summary.walkingKmEquivalent} kilometers of walking, ${summary.flightOfStairsEquivalent} flights of station stairs, and ${summary.co2SavedKg} kilograms of CO2 saved.${tierInfo}${pacingInfo} ${rivalMatchup.recommendation}`;

  return (
    <Card style={localStyles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={a11ySummary}
        style={{ gap: 16 }}
      >
        {/* Top Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={localStyles.iconBadge}>
            <Icon name="activity" size={18} color="#00CD6B" />
          </View>
          <View>
            <Text style={localStyles.eyebrow}>WHO BURNED MORE? · ACTIVE COMMUTE</Text>
            <Text style={localStyles.title}>Transit Exercise & Eco Burn</Text>
          </View>
        </View>
        <Pill text="STRAVA HABIT DEMO" color="#173A26" ink="#B4F5D0" />
      </View>

      {/* Main Metric Spotlight */}
      <View style={localStyles.spotlightContainer}>
        <View style={localStyles.caloriesBox}>
          <Text style={localStyles.calorieValue}>
            {summary.calories}
            <Text style={localStyles.calorieUnit}> kcal</Text>
          </Text>
          <Text style={localStyles.calorieLabel}>
            Active calories burned choosing Pune Metro over sitting in traffic
          </Text>
        </View>

        {/* 3 Physical Equivalents */}
        <View style={localStyles.equivalentsGrid}>
          <View style={localStyles.equivalentCol}>
            <View style={localStyles.statIconRow}>
              <Icon name="compass" size={14} color={theme.primary} />
              <Text style={localStyles.statValue}>{summary.walkingKmEquivalent} km</Text>
            </View>
            <Text style={localStyles.statLabel}>Walk equiv.</Text>
          </View>

          <View style={localStyles.statDivider} />

          <View style={localStyles.equivalentCol}>
            <View style={localStyles.statIconRow}>
              <Icon name="trending-up" size={14} color={theme.aqua} />
              <Text style={localStyles.statValue}>{summary.flightOfStairsEquivalent}</Text>
            </View>
            <Text style={localStyles.statLabel}>Stair flights</Text>
          </View>

          <View style={localStyles.statDivider} />

          <View style={localStyles.equivalentCol}>
            <View style={localStyles.statIconRow}>
              <Icon name="wind" size={14} color="#AD79FF" />
              <Text style={localStyles.statValue}>{summary.co2SavedKg} kg</Text>
            </View>
            <Text style={localStyles.statLabel}>CO₂ saved</Text>
          </View>
        </View>
      </View>

      {/* Commuter Burn Tier Badge */}
      {burnTier ? (
        <View style={localStyles.tierBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }]}>
            <Text style={localStyles.tierEyebrow}>COMMUTER BURN TIER</Text>
            <View style={localStyles.perkBadge}>
              <Text style={localStyles.perkText}>{burnTier.perk}</Text>
            </View>
          </View>
          <Text style={localStyles.tierTitle}>{burnTier.badge}</Text>
          <Text style={localStyles.tierDescription}>{burnTier.description}</Text>
        </View>
      ) : null}

      {/* Weekly 7-Day Burn Pacing */}
      {weeklyPacing ? (
        <View style={localStyles.pacingBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }]}>
            <Text style={localStyles.pacingEyebrow}>WEEKLY BURN PACING · ROLLING 7 DAYS</Text>
            <Pill
              text={weeklyPacing.pacingStatus.toUpperCase()}
              color={
                weeklyPacing.pacingStatus === 'ahead'
                  ? '#173A26'
                  : weeklyPacing.pacingStatus === 'on-track'
                  ? '#122A30'
                  : '#302019'
              }
              ink={
                weeklyPacing.pacingStatus === 'ahead'
                  ? '#00CD6B'
                  : weeklyPacing.pacingStatus === 'on-track'
                  ? '#159CAC'
                  : '#FFC6B0'
              }
            />
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Weekly burn pacing: ${weeklyPacing.burnedLast7DaysKcal} of ${weeklyPacing.weeklyTargetKcal} kcal`}
            accessibilityValue={{
              min: 0,
              max: weeklyPacing.weeklyTargetKcal,
              now: weeklyPacing.burnedLast7DaysKcal,
              text: `${weeklyPacing.burnedLast7DaysKcal} of ${weeklyPacing.weeklyTargetKcal} kcal`,
            }}
          >
            <Progress value={weeklyPacing.percent} color="#00CD6B" />
          </View>
          <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
            <Text style={localStyles.pacingNumbers}>
              {weeklyPacing.burnedLast7DaysKcal} / {weeklyPacing.weeklyTargetKcal} kcal
            </Text>
            <Text style={localStyles.pacingPercent}>{weeklyPacing.percent}%</Text>
          </View>
          <Text style={localStyles.pacingSummary}>{weeklyPacing.summaryText}</Text>
        </View>
      ) : null}

      {/* Head-to-Head Rival Matchup Section */}
      <View style={localStyles.rivalSection}>
        <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={localStyles.rivalHeading}>
            {isTop ? '🏆 LEAGUE PACESETTER' : '⚔️ NEXT RIVAL MATCHUP'}
          </Text>
          <Text style={localStyles.rivalRankPill}>
            {isTop ? 'Rank #1' : `Rank #${rivalMatchup.userRank} vs #${rivalMatchup.rivalRank}`}
          </Text>
        </View>

        {isTop ? (
          <View style={localStyles.leadNotice}>
            <Text style={localStyles.leadText}>
              You are setting the pace at the top of the leaderboard! Every additional ride widens your lead.
            </Text>
          </View>
        ) : hasRival ? (
          <View style={{ gap: 8 }}>
            <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={localStyles.rivalName}>
                Target: {rivalMatchup.rivalName}
              </Text>
              <Text style={localStyles.rivalDeficit}>
                +{rivalMatchup.scoreDeficit} {rivalMatchup.targetUnit} ahead
              </Text>
            </View>

            {/* Visual deficit proximity bar */}
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`Rival progress: ${rivalMatchup.userScore} of ${rivalMatchup.rivalScore} ${rivalMatchup.targetUnit}`}
              accessibilityValue={{
                min: 0,
                max: rivalMatchup.rivalScore ?? 100,
                now: rivalMatchup.userScore,
                text: `${rivalMatchup.userScore} of ${rivalMatchup.rivalScore} ${rivalMatchup.targetUnit}`,
              }}
            >
              <Progress
                value={
                  rivalMatchup.rivalScore
                    ? Math.min(100, Math.round((rivalMatchup.userScore / rivalMatchup.rivalScore) * 100))
                    : 0
                }
                color={theme.primary}
              />
            </View>

            <Text style={localStyles.recommendation}>
              {rivalMatchup.recommendation}
            </Text>
          </View>
        ) : (
          <Text style={localStyles.recommendation}>
            Log a ride to establish your rank and take on your first rival.
          </Text>
        )}
      </View>

      {/* Footer Disclaimer */}
      <Text style={localStyles.disclaimer}>
        Active transit burn is estimated from concourse walking, station stairs, and platform transit stabilization. Self-reported Pune Metro demo.
      </Text>
      </View>
    </Card>
  );
}

const localStyles = StyleSheet.create({
  card: {
    backgroundColor: '#0E1410',
    borderColor: '#1D3324',
    borderWidth: 1,
    gap: 16,
    padding: 18,
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
  spotlightContainer: {
    backgroundColor: '#070A08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2E20',
    padding: 16,
    gap: 14,
  },
  caloriesBox: {
    gap: 4,
  },
  calorieValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  calorieUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00CD6B',
  },
  calorieLabel: {
    fontSize: 13,
    color: '#C3CDC6',
    lineHeight: 18,
  },
  equivalentsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#17271D',
  },
  equivalentCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F2',
  },
  statLabel: {
    fontSize: 11,
    color: '#8A968E',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E3224',
  },
  tierBox: {
    backgroundColor: '#0F1A13',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D3B26',
    padding: 14,
    gap: 6,
  },
  tierEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#00CD6B',
  },
  perkBadge: {
    backgroundColor: '#173A26',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  perkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B4F5D0',
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tierDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#A9B7AE',
  },
  pacingBox: {
    backgroundColor: '#0A120D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#182C1E',
    padding: 14,
    gap: 8,
  },
  pacingEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#7D8C82',
  },
  pacingNumbers: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pacingPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00CD6B',
  },
  pacingSummary: {
    fontSize: 12,
    lineHeight: 17,
    color: '#BCD5C7',
  },
  rivalSection: {
    backgroundColor: '#141D17',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#243C2C',
    padding: 14,
    gap: 10,
  },
  rivalHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#00CD6B',
  },
  rivalRankPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A8ABA9',
  },
  leadNotice: {
    paddingVertical: 4,
  },
  leadText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#BCD5C7',
    fontWeight: '500',
  },
  rivalName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rivalDeficit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFC6B0',
  },
  recommendation: {
    fontSize: 12,
    lineHeight: 18,
    color: '#BCD5C7',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#7D8881',
  },
});
