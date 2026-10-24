import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { CommuterTrophy, TrophyCabinetSummary, TrophyRarity } from './types';

interface TrophyCabinetCardProps {
  summary: TrophyCabinetSummary;
}

export function TrophyCabinetCard({ summary }: TrophyCabinetCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableShowcaseText);
          setShareFeedback('SHOWCASE COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableShowcaseText,
        title: 'Pune Metro Commuter Trophy Cabinet',
      });
      setShareFeedback('SHARED!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShareFeedback(null);
    }
  };

  const getRarityStyle = (rarity: TrophyRarity, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: '#070C0E',
        border: '#14252B',
        accent: '#475569',
        badgeBg: '#0F1A1F',
        badgeInk: '#64748B',
      };
    }
    switch (rarity) {
      case 'obsidian':
        return {
          bg: '#0F172A',
          border: '#38BDF8',
          accent: '#38BDF8',
          badgeBg: '#082F49',
          badgeInk: '#BAE6FD',
        };
      case 'gold':
        return {
          bg: '#1C1504',
          border: '#F59E0B',
          accent: '#F59E0B',
          badgeBg: '#451A03',
          badgeInk: '#FDE68A',
        };
      case 'silver':
        return {
          bg: '#141824',
          border: '#94A3B8',
          accent: '#E2E8F0',
          badgeBg: '#1E293B',
          badgeInk: '#E2E8F0',
        };
      case 'bronze':
      default:
        return {
          bg: '#1A120B',
          border: '#D97706',
          accent: '#FBBF24',
          badgeBg: '#451A03',
          badgeInk: '#FCD34D',
        };
    }
  };

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
              <Icon name="award" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.eyebrow}>PERMANENT STRAVA TROPHY SHELF</Text>
              <Text style={styles.title}>Commuter Trophy Cabinet</Text>
            </View>
          </View>
          <Pill
            text={`${summary.unlockedCount} / ${summary.totalTrophies} UNLOCKED`}
            color="#2B1A04"
            ink="#FDE68A"
          />
        </View>

        {/* Cabinet Banner & Progress */}
        <View style={styles.shelfHeader}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={styles.rankEyebrow}>CABINET STATUS · {summary.cabinetRankMarathi}</Text>
              <Text style={styles.rankTitle}>{summary.cabinetRankTitle}</Text>
            </View>
            <Text style={styles.rankScore}>
              {summary.cabinetScore} / 825 pts ({summary.completionPercent}%)
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.max(4, summary.completionPercent)}%` },
              ]}
            />
          </View>
        </View>

        {/* Trophy Grid (8 Trophies) */}
        <View style={styles.trophyGrid}>
          {summary.trophies.map((trophy) => {
            const styleInfo = getRarityStyle(trophy.rarity, trophy.isUnlocked);
            return (
              <View
                key={trophy.id}
                style={[
                  styles.trophyCard,
                  {
                    backgroundColor: styleInfo.bg,
                    borderColor: styleInfo.border,
                  },
                ]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${trophy.title}: ${trophy.marathiTitle}. ${
                  trophy.isUnlocked
                    ? `Unlocked on ${trophy.unlockedAtFormatted ?? 'recently'}.`
                    : `In progress: ${trophy.progressPercent}% complete. Needs ${trophy.criteriaLabel}.`
                }`}
              >
                {/* Top Badge Row */}
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <View
                    style={[
                      styles.rarityBadge,
                      { backgroundColor: styleInfo.badgeBg },
                    ]}
                  >
                    <Text style={[styles.rarityText, { color: styleInfo.badgeInk }]}>
                      {trophy.rarity.toUpperCase()}
                    </Text>
                  </View>
                  {trophy.isUnlocked ? (
                    <Text style={styles.unlockedTag}>EARNED ✓</Text>
                  ) : (
                    <Text style={styles.lockedTag}>{trophy.progressPercent}%</Text>
                  )}
                </View>

                {/* Trophy Title */}
                <View style={{ gap: 2, marginTop: 4 }}>
                  <Text style={[styles.trophyTitle, !trophy.isUnlocked && styles.mutedText]}>
                    {trophy.title}
                  </Text>
                  <Text style={styles.marathiText}>{trophy.marathiTitle}</Text>
                </View>

                {/* Description */}
                <Text style={styles.trophyDesc} numberOfLines={2}>
                  {trophy.description}
                </Text>

                {/* Progress / Status Footer */}
                {trophy.isUnlocked ? (
                  <View style={styles.footerRow}>
                    <Text style={styles.unlockedDate}>
                      {trophy.unlockedAtFormatted ? `Unlocked ${trophy.unlockedAtFormatted}` : 'Unlocked'}
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 4, marginTop: 2 }}>
                    <View style={styles.miniTrack}>
                      <View
                        style={[
                          styles.miniFill,
                          {
                            width: `${Math.max(4, trophy.progressPercent)}%`,
                            backgroundColor: styleInfo.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressSub}>
                      {trophy.currentValue} / {trophy.targetValue} {trophy.criteriaLabel}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share commuter trophy showcase"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#F59E0B" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Trophy Cabinet Showcase'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Commemorative medallions are minted from your verified on-device transit logs across Pune Metro lines. No private location data is shared.
        </Text>
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
    backgroundColor: '#261C08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#F59E0B',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shelfHeader: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 8,
  },
  rankEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#F59E0B',
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rankScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FDE68A',
  },
  track: {
    height: 6,
    backgroundColor: '#14252B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trophyCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unlockedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  lockedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  trophyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mutedText: {
    color: '#94A3B8',
  },
  marathiText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  trophyDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  footerRow: {
    marginTop: 2,
  },
  unlockedDate: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  miniTrack: {
    height: 4,
    backgroundColor: '#14252B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressSub: {
    fontSize: 9,
    color: '#64748B',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1E170A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A3412',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FDE68A',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
