import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { VisualShareCardConfig } from './types';
import { generateLeagueShareSummary, handleLeagueShare } from './share';

interface VisualCommuterCardProps {
  config: VisualShareCardConfig;
}

export function VisualCommuterCard({ config }: VisualCommuterCardProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const a11ySummary = `MetroQuest Pune Commuter Card for ${config.userName}: Rank #${config.rank} of ${config.totalParticipants} in ${config.leagueTitle}, ${config.points} XP, Level ${config.level} (${config.levelTitle}), ${config.calories} active kcal burned, ${config.streakDays} day streak. Landmark milestone: ${config.milestoneTitle}.`;

  const onShare = async () => {
    setSharing(true);
    const summaryText = generateLeagueShareSummary({
      rank: config.rank,
      totalParticipants: config.totalParticipants,
      leagueTitle: config.leagueTitle,
      points: config.points,
      caloriesBurned: config.calories,
      level: config.level,
      milestoneName: config.milestoneTitle,
      isZeroState: config.points === 0 && config.calories === 0,
    });
    const res = await handleLeagueShare(summaryText);
    setNotice(res.message);
    setSharing(false);
  };

  return (
    <Card style={localStyles.outerCard}>
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
              <Icon name="credit-card" size={18} color="#00CD6B" />
            </View>
            <View>
              <Text style={localStyles.eyebrow}>OFFICIAL COMMUTER BADGE</Text>
              <Text style={localStyles.title}>Digital MetroPass Card</Text>
            </View>
          </View>
          <Pill text="VERIFIED DEMO" color="#173A26" ink="#B4F5D0" />
        </View>

        {/* Styled Pass Graphic */}
        <View style={localStyles.passContainer}>
          {/* Pass Top Bar */}
          <View style={localStyles.passTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={localStyles.metroDot} />
              <Text style={localStyles.passBrand}>METROQUEST · PUNE</Text>
            </View>
            <Text style={localStyles.passRankBadge}>#{config.rank} OF {config.totalParticipants}</Text>
          </View>

          {/* User Name & League Title */}
          <View style={{ gap: 2 }}>
            <Text style={localStyles.passUserName}>{config.userName}</Text>
            <Text style={localStyles.passLeague}>{config.leagueTitle.toUpperCase()}</Text>
          </View>

          {/* Main Dual Metric Spotlight */}
          <View style={localStyles.metricsRow}>
            <View style={localStyles.metricCol}>
              <Text style={localStyles.metricValue}>{config.calories}</Text>
              <Text style={localStyles.metricLabel}>ACTIVE KCAL</Text>
            </View>

            <View style={localStyles.metricDivider} />

            <View style={localStyles.metricCol}>
              <Text style={localStyles.metricValue}>{config.points}</Text>
              <Text style={localStyles.metricLabel}>TOTAL XP</Text>
            </View>

            <View style={localStyles.metricDivider} />

            <View style={localStyles.metricCol}>
              <Text style={localStyles.metricValue}>{config.streakDays}d</Text>
              <Text style={localStyles.metricLabel}>STREAK</Text>
            </View>
          </View>

          {/* Milestone Strip */}
          <View style={localStyles.milestoneStrip}>
            <Icon name="award" size={14} color="#00CD6B" />
            <Text style={localStyles.milestoneText}>
              Milestone: {config.milestoneTitle}
            </Text>
          </View>

          {/* Barcode & Verification Watermark */}
          <View style={localStyles.watermarkRow}>
            <View style={localStyles.barcodeMock}>
              <View style={[localStyles.bar, { width: 3 }]} />
              <View style={[localStyles.bar, { width: 1 }]} />
              <View style={[localStyles.bar, { width: 4 }]} />
              <View style={[localStyles.bar, { width: 2 }]} />
              <View style={[localStyles.bar, { width: 1 }]} />
              <View style={[localStyles.bar, { width: 5 }]} />
              <View style={[localStyles.bar, { width: 2 }]} />
              <View style={[localStyles.bar, { width: 3 }]} />
              <View style={[localStyles.bar, { width: 1 }]} />
              <View style={[localStyles.bar, { width: 4 }]} />
            </View>
            <Text style={localStyles.watermarkText}>PUNE METRO AFC DEMO</Text>
          </View>
        </View>

        {/* Share Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share digital commuter card"
          onPress={onShare}
          disabled={sharing}
          style={({ pressed }) => [
            localStyles.shareButton,
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Icon name="share-2" size={16} color="#070A08" />
          <Text style={localStyles.shareText}>
            {sharing ? 'Opening share sheet…' : 'Share Commuter Card'}
          </Text>
        </Pressable>

        {notice ? (
          <View style={localStyles.noticeBox}>
            <Text style={localStyles.noticeText}>{notice}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const localStyles = StyleSheet.create({
  outerCard: {
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
  passContainer: {
    backgroundColor: '#070D09',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1C3825',
    padding: 16,
    gap: 12,
  },
  passTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00CD6B',
  },
  passBrand: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#00CD6B',
  },
  passRankBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#162C1D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passUserName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  passLeague: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9990',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1A12',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E3624',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7D8C82',
    letterSpacing: 0.6,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E3624',
  },
  milestoneStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#132417',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24442B',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B4F5D0',
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  barcodeMock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 14,
  },
  bar: {
    height: '100%',
    backgroundColor: '#415447',
    borderRadius: 1,
  },
  watermarkText: {
    fontSize: 9,
    color: '#55695B',
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  shareButton: {
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
  shareText: {
    color: '#070A08',
    fontSize: 13,
    fontWeight: '800',
  },
  noticeBox: {
    backgroundColor: '#172B1C',
    borderRadius: 8,
    padding: 10,
  },
  noticeText: {
    fontSize: 12,
    color: '#B4F5D0',
    textAlign: 'center',
  },
});
