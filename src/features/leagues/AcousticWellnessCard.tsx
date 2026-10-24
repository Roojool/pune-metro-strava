import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { AcousticWellnessSummary } from './types';

interface AcousticWellnessCardProps {
  summary: AcousticWellnessSummary;
}

export function AcousticWellnessCard({ summary }: AcousticWellnessCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableAcousticText);
          setShareFeedback('WELLNESS COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableAcousticText,
        title: 'Pune Metro Acoustic Wellness',
      });
      setShareFeedback('SHARED!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShareFeedback(null);
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
              <Icon name="volume-2" size={18} color="#38BDF8" />
            </View>
            <View>
              <Text style={styles.eyebrow}>AUDITORY RECOVERY · DECIBEL SHIELD</Text>
              <Text style={styles.title}>Acoustic Wellness & Noise Shield</Text>
            </View>
          </View>
          <Pill
            text={summary.tierTitle.toUpperCase()}
            color="#082F49"
            ink="#7DD3FC"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.quietTransitMinutes}
              <Text style={styles.metricUnit}> min</Text>
            </Text>
            <Text style={styles.metricTitle}>Quiet Transit</Text>
            <Text style={styles.metricSub}>65 dBA insulated</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              -{summary.decibelReductionDba}
              <Text style={styles.metricUnit}> dBA</Text>
            </Text>
            <Text style={styles.metricTitle}>Decibel Shield</Text>
            <Text style={styles.metricSub}>vs 92 dBA street</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.acousticEnergyReductionPercent}
              <Text style={styles.metricUnit}>%</Text>
            </Text>
            <Text style={styles.metricTitle}>Energy Wave Cut</Text>
            <Text style={styles.metricSub}>Sound pressure drop</Text>
          </View>
        </View>

        {/* Pune Quiet Havens Section */}
        <View style={styles.havensSection}>
          <Text style={styles.sectionHeader}>PUNE TRANQUIL HAVEN EQUIVALENTS</Text>
          <View style={{ gap: 8 }}>
            {summary.unlockedHavens.map((haven) => (
              <View
                key={haven.id}
                style={[styles.havenCard, haven.isUnlocked && styles.unlockedHavenCard]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${haven.name}: ${haven.marathiName}. Ambient noise: ${haven.ambientDecibels} decibels. ${
                  haven.isUnlocked
                    ? 'Serene Haven Unlocked!'
                    : `Locked. Requires ${haven.unlockedAtMinutes} quiet transit minutes.`
                } ${haven.description}`}
              >
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={[styles.havenName, haven.isUnlocked && styles.unlockedHavenName]}>
                    {haven.name}
                  </Text>
                  {haven.isUnlocked ? (
                    <Text style={styles.unlockedTag}>SERENE HAVEN ✓</Text>
                  ) : (
                    <Text style={styles.lockedTag}>{haven.unlockedAtMinutes}m QUIET</Text>
                  )}
                </View>

                <Text style={styles.marathiText}>{haven.marathiName}</Text>
                <Text style={styles.descText}>{haven.description}</Text>

                <View style={styles.ambientRow}>
                  <Icon name="activity" size={12} color={haven.isUnlocked ? '#38BDF8' : '#64748B'} />
                  <Text style={[styles.ambientText, haven.isUnlocked && styles.unlockedAmbientText]}>
                    Ambient sound level: ~{haven.ambientDecibels} dBA
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Toward Next Tier */}
        <View style={styles.progressContainer}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
            <Text style={styles.progressLabel}>
              Progress to Next Acoustic Tier ({summary.nextTierMinutes} min)
            </Text>
            <Text style={styles.progressPercent}>{summary.progressPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${summary.progressPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* Wellness Tip */}
        <View style={styles.tipBox}>
          <Icon name="smile" size={16} color="#38BDF8" />
          <Text style={styles.tipText}>{summary.wellnessTip}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share acoustic wellness"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#38BDF8" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Acoustic Wellness'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Acoustic wellness quantifies reduction in auditory fatigue from insulated air-conditioned metro transit (~65 dBA) compared to roadside traffic noise and pressure horns (~92 dBA).
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#08131A',
    borderColor: '#112C3D',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#082F49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F0F9FF',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#0C1C26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#16384C',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#38BDF8',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7DD3FC',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E0F2FE',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 10,
    color: '#0284C7',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#1E475F',
  },
  havensSection: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1,
  },
  havenCard: {
    backgroundColor: '#0C1821',
    borderColor: '#162D3D',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  unlockedHavenCard: {
    backgroundColor: '#102533',
    borderColor: '#0284C7',
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  havenName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    flex: 1,
  },
  unlockedHavenName: {
    color: '#F0F9FF',
    fontWeight: '800',
  },
  unlockedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  lockedTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  marathiText: {
    fontSize: 11,
    color: '#7DD3FC',
  },
  descText: {
    fontSize: 11,
    color: '#BAE6FD',
    lineHeight: 15,
  },
  ambientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ambientText: {
    fontSize: 11,
    color: '#64748B',
  },
  unlockedAmbientText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  progressContainer: {
    gap: 2,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BAE6FD',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#11222E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0E2330',
    borderColor: '#19455E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#E0F2FE',
    lineHeight: 17,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#082F49',
    borderColor: '#0284C7',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0F9FF',
  },
  disclaimer: {
    fontSize: 10,
    color: '#0284C7',
    lineHeight: 14,
    textAlign: 'center',
  },
});
