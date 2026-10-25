import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Icon, Pill, Progress, styles as uiStyles } from '@/components/UI';
import type { EnrichedLeaderboardEntry, RivalDuelComparison } from './types';
import { calculateRivalDuel } from './scoring';

interface RivalDuelCardProps {
  currentUser: EnrichedLeaderboardEntry;
  rivals: EnrichedLeaderboardEntry[];
  onLogRide?: () => void;
}

export function RivalDuelCard({
  currentUser,
  rivals,
  onLogRide,
}: RivalDuelCardProps) {
  // Filter out self and pick default rival
  const otherRivals = rivals.filter(r => r.id !== currentUser.id);
  const [selectedRivalId, setSelectedRivalId] = useState<string>(
    otherRivals[0]?.id || ''
  );

  const selectedRival =
    otherRivals.find(r => r.id === selectedRivalId) || otherRivals[0];

  if (!selectedRival) {
    return null;
  }

  const duel: RivalDuelComparison = calculateRivalDuel(currentUser, selectedRival);
  const a11ySummary = `Rival duel: You (${duel.userScore} kcal) versus ${duel.rivalName} (${duel.rivalScore} kcal). ${duel.duelInsight}`;

  const maxScore = Math.max(1, duel.userScore, duel.rivalScore);
  const userPercent = Math.round((duel.userScore / maxScore) * 100);
  const rivalPercent = Math.round((duel.rivalScore / maxScore) * 100);

  return (
    <Card style={localStyles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={a11ySummary}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={localStyles.iconBadge}>
              <Icon name="award" size={18} color="#00CD6B" />
            </View>
            <View>
              <Text style={localStyles.eyebrow}>HEAD-TO-HEAD DUEL</Text>
              <Text style={localStyles.title}>Commuter Calorie Rivalry</Text>
            </View>
          </View>
          <Pill
            text={duel.userLeads ? 'LEADING' : 'CHALLENGER'}
            color={duel.userLeads ? '#173A26' : '#302019'}
            ink={duel.userLeads ? '#00CD6B' : '#FFC6B0'}
          />
        </View>

        {/* Rival Selection Selector Chips */}
        <View style={{ gap: 6 }}>
          <Text style={localStyles.selectorHeading}>SELECT RIVAL TO COMPARE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {otherRivals.slice(0, 4).map(r => {
              const isSelected = r.id === selectedRival.id;
              return (
                <Pressable
                  key={r.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Duel with ${r.name}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedRivalId(r.id)}
                  style={({ pressed }) => [
                    localStyles.rivalChip,
                    isSelected ? localStyles.rivalChipActive : null,
                    pressed ? { opacity: 0.8 } : null,
                  ]}
                >
                  <Text
                    style={[
                      localStyles.rivalChipText,
                      isSelected ? localStyles.rivalChipTextActive : null,
                    ]}
                  >
                    {r.name}
                  </Text>
                  <Text style={localStyles.chipScore}>{r.caloriesBurned} kcal</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Side-by-Side Split Card */}
        <View style={localStyles.duelContainer}>
          {/* User Side */}
          <View style={localStyles.sideBox}>
            <Text style={localStyles.sideLabel}>YOU</Text>
            <Text style={localStyles.sideScore}>{duel.userScore}</Text>
            <Text style={localStyles.sideUnit}>kcal burned</Text>
            <View style={localStyles.barWrapper}>
              <View style={[localStyles.barFill, { width: `${userPercent}%`, backgroundColor: '#00CD6B' }]} />
            </View>
          </View>

          {/* VS Divider Badge */}
          <View style={localStyles.vsBadge}>
            <Text style={localStyles.vsText}>VS</Text>
          </View>

          {/* Rival Side */}
          <View style={[localStyles.sideBox, { alignItems: 'flex-end' }]}>
            <Text style={localStyles.sideLabel}>{duel.rivalName.toUpperCase()}</Text>
            <Text style={localStyles.sideScore}>{duel.rivalScore}</Text>
            <Text style={localStyles.sideUnit}>kcal burned</Text>
            <View style={[localStyles.barWrapper, { alignItems: 'flex-end' }]}>
              <View style={[localStyles.barFill, { width: `${rivalPercent}%`, backgroundColor: '#AD79FF' }]} />
            </View>
          </View>
        </View>

        {/* Gap & Bridge Metrics */}
        <View style={localStyles.gapBox}>
          <View style={localStyles.gapCol}>
            <Text style={localStyles.gapValue}>
              {Math.abs(duel.calorieGap)} kcal
            </Text>
            <Text style={localStyles.gapDesc}>
              {duel.userLeads ? 'Lead margin' : 'Calorie deficit'}
            </Text>
          </View>

          <View style={localStyles.gapDivider} />

          <View style={localStyles.gapCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="trending-up" size={14} color="#159CAC" />
              <Text style={localStyles.gapValue}>{duel.stairFlightsToBridge}</Text>
            </View>
            <Text style={localStyles.gapDesc}>Flights of stairs</Text>
          </View>

          <View style={localStyles.gapDivider} />

          <View style={localStyles.gapCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="compass" size={14} color="#00CD6B" />
              <Text style={localStyles.gapValue}>{duel.kmToBridge} km</Text>
            </View>
            <Text style={localStyles.gapDesc}>Walking equiv.</Text>
          </View>
        </View>

        {/* Actionable Coach Insight */}
        <View style={localStyles.insightNotice}>
          <Icon name="target" size={16} color="#00CD6B" />
          <Text style={localStyles.insightText}>{duel.duelInsight}</Text>
        </View>

        {/* Call to action */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Log a ride to challenge ${duel.rivalName}`}
          onPress={onLogRide}
          style={({ pressed }) => [
            localStyles.actionButton,
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Icon name="zap" size={16} color="#070A08" />
          <Text style={localStyles.actionText}>
            {duel.userLeads
              ? `Log a ride to extend lead over ${duel.rivalName}`
              : `Take on ${duel.rivalName} with a new ride`}
          </Text>
        </Pressable>
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
  selectorHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#7D8A80',
  },
  rivalChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#16221A',
    borderWidth: 1,
    borderColor: '#243A2C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  rivalChipActive: {
    backgroundColor: '#1E3827',
    borderColor: '#00CD6B',
  },
  rivalChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rivalChipTextActive: {
    color: '#00CD6B',
  },
  chipScore: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A968E',
  },
  duelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0E0B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#192C1F',
    gap: 12,
  },
  sideBox: {
    flex: 1,
    gap: 2,
  },
  sideLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#7E8B81',
  },
  sideScore: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sideUnit: {
    fontSize: 10,
    color: '#8A968E',
    fontWeight: '600',
  },
  barWrapper: {
    height: 6,
    width: '100%',
    backgroundColor: '#1E2620',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  vsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E2E23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E4C36',
  },
  vsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00CD6B',
  },
  gapBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0E0B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#192C1F',
  },
  gapCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  gapValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gapDesc: {
    fontSize: 10,
    color: '#7E8B81',
    fontWeight: '500',
  },
  gapDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#1E3224',
  },
  insightNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#132418',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#23442C',
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#B4F5D0',
  },
  actionButton: {
    backgroundColor: '#00CD6B',
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: '#070A08',
    fontSize: 13,
    fontWeight: '800',
  },
});
