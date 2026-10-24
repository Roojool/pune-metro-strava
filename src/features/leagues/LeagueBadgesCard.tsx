import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { LeagueBadge, LeagueBadgeSummary, LeagueBadgeTier } from './types';

interface LeagueBadgesCardProps {
  summary: LeagueBadgeSummary;
}

type BadgeFilter = 'all' | 'unlocked' | 'progress';

const TIER_COLORS: Record<LeagueBadgeTier, { bg: string; border: string; ink: string }> = {
  bronze: { bg: '#29180C', border: '#784323', ink: '#E59866' },
  silver: { bg: '#1C252C', border: '#4E616C', ink: '#BDC9D1' },
  gold: { bg: '#2B230B', border: '#7A641A', ink: '#F4D03F' },
  diamond: { bg: '#122631', border: '#2980B9', ink: '#5DADE2' },
};

export function LeagueBadgesCard({ summary }: LeagueBadgesCardProps) {
  const [filter, setFilter] = useState<BadgeFilter>('all');

  const filteredBadges = summary.badges.filter(b => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'progress') return !b.isUnlocked;
    return true;
  });

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
              <Icon name="award" size={18} color="#F4D03F" />
            </View>
            <View>
              <Text style={styles.eyebrow}>METROQUEST · COMMUTER BADGES</Text>
              <Text style={styles.title}>Commuter Mastery Tiers</Text>
            </View>
          </View>
          <Pill
            text={`${summary.earnedCount}/${summary.totalCount} UNLOCKED`}
            color={summary.earnedCount > 0 ? '#143825' : '#142026'}
            ink={summary.earnedCount > 0 ? '#00CD6B' : '#7D95A0'}
          />
        </View>

        {/* Global Progress Bar */}
        <View style={styles.overallBarContainer}>
          <View style={styles.overallBarTrack}>
            <View
              style={[
                styles.overallBarFill,
                { width: `${Math.max(4, summary.completionPercent)}%` },
              ]}
            />
          </View>
          <View style={[uiStyles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.progressSubtext}>Mastery Completion</Text>
            <Text style={styles.progressPercent}>{summary.completionPercent}%</Text>
          </View>
        </View>

        {/* Next Milestone Spotlight */}
        {summary.nextBadge && (
          <View style={styles.nextMilestoneBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.nextMilestoneIcon}>{summary.nextBadge.icon}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.nextMilestoneEyebrow}>NEXT CLOSEST MILESTONE</Text>
                <Text style={styles.nextMilestoneTitle} numberOfLines={1}>
                  {summary.nextBadge.title} · {summary.nextBadge.marathiTitle}
                </Text>
              </View>
              <Text style={styles.nextMilestoneVal}>
                {summary.nextBadge.current}/{summary.nextBadge.target} {summary.nextBadge.unit}
              </Text>
            </View>
            <View style={styles.miniTrack}>
              <View
                style={[
                  styles.miniFill,
                  { width: `${Math.max(4, summary.nextBadge.progressRatio * 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter all badges"
            onPress={() => setFilter('all')}
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({summary.totalCount})
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter unlocked badges"
            onPress={() => setFilter('unlocked')}
            style={[styles.filterBtn, filter === 'unlocked' && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === 'unlocked' && styles.filterTextActive]}>
              Earned ({summary.earnedCount})
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter in-progress badges"
            onPress={() => setFilter('progress')}
            style={[styles.filterBtn, filter === 'progress' && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === 'progress' && styles.filterTextActive]}>
              In Progress ({summary.totalCount - summary.earnedCount})
            </Text>
          </Pressable>
        </View>

        {/* Badges List */}
        <View style={{ gap: 8 }}>
          {filteredBadges.map(b => {
            const tierStyle = TIER_COLORS[b.tier];
            const pct = Math.round(b.progressRatio * 100);

            return (
              <View
                key={b.id}
                style={[styles.badgeCard, b.isUnlocked && styles.badgeCardUnlocked]}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={`${b.title}, ${b.marathiTitle}. ${b.description}. Progress: ${b.current} of ${b.target} ${b.unit}, ${pct} percent. ${b.isUnlocked ? 'Unlocked.' : 'In progress.'}`}
              >
                <View style={[uiStyles.row, { alignItems: 'flex-start', gap: 10 }]}>
                  <View style={[styles.badgeIconBox, { backgroundColor: tierStyle.bg, borderColor: tierStyle.border }]}>
                    <Text style={{ fontSize: 20 }}>{b.icon}</Text>
                    <Text style={[styles.tierTag, { color: tierStyle.ink }]}>
                      {b.tier.toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                      <Text style={styles.badgeTitle} numberOfLines={1}>
                        {b.title}
                      </Text>
                      {b.isUnlocked ? (
                        <View style={styles.unlockedTag}>
                          <Text style={styles.unlockedTagText}>EARNED ✓</Text>
                        </View>
                      ) : (
                        <Text style={styles.progressRatioText}>
                          {b.current}/{b.target} {b.unit}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.badgeMarathi}>{b.marathiTitle}</Text>
                    <Text style={styles.badgeDesc}>{b.description}</Text>

                    {/* Progress Bar */}
                    <View style={styles.badgeTrack}>
                      <View
                        style={[
                          styles.badgeFill,
                          {
                            width: `${Math.max(3, pct)}%`,
                            backgroundColor: b.isUnlocked ? '#00CD6B' : tierStyle.ink,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          Commuter badges track real journeys logged on your device against Pune Metro physical and cultural milestones.
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
    backgroundColor: '#26200A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#F4D03F',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overallBarContainer: {
    backgroundColor: '#070C0E',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    gap: 6,
  },
  overallBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#122228',
    overflow: 'hidden',
  },
  overallBarFill: {
    height: '100%',
    backgroundColor: '#00CD6B',
    borderRadius: 3,
  },
  progressSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71868F',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00CD6B',
  },
  nextMilestoneBox: {
    backgroundColor: '#101B20',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E3640',
    padding: 10,
    gap: 8,
  },
  nextMilestoneIcon: {
    fontSize: 20,
  },
  nextMilestoneEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#F4D03F',
  },
  nextMilestoneTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextMilestoneVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BDC9D1',
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#15272F',
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    backgroundColor: '#F4D03F',
    borderRadius: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0F1A1F',
    borderWidth: 1,
    borderColor: '#192C33',
  },
  filterBtnActive: {
    backgroundColor: '#18303B',
    borderColor: '#3498DB',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7D95A0',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeCard: {
    backgroundColor: '#0A1013',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#162329',
    padding: 10,
  },
  badgeCardUnlocked: {
    borderColor: '#1E3A2B',
    backgroundColor: '#08140E',
  },
  badgeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    gap: 1,
  },
  tierTag: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  badgeMarathi: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7D95A0',
  },
  badgeDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: '#9EAFB7',
    marginTop: 2,
  },
  unlockedTag: {
    backgroundColor: '#0E2E1B',
    borderColor: '#196F3D',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unlockedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00CD6B',
    letterSpacing: 0.5,
  },
  progressRatioText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71868F',
  },
  badgeTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#132026',
    marginTop: 6,
    overflow: 'hidden',
  },
  badgeFill: {
    height: '100%',
    borderRadius: 2,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
