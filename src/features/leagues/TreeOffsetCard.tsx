import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { TreeOffsetSummary } from './types';

interface TreeOffsetCardProps {
  summary: TreeOffsetSummary;
}

export function TreeOffsetCard({ summary }: TreeOffsetCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableTreeText);
          setShareFeedback('OFFSET COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableTreeText,
        title: 'Pune Metro Urban Tree Offset',
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
              <Icon name="sun" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.eyebrow}>PUNE URBAN FOREST · TEKDI BIOSPHERE</Text>
              <Text style={styles.title}>Urban Tree Offset & Bio-Sequestration</Text>
            </View>
          </View>
          <Pill
            text={summary.tierTitle.toUpperCase()}
            color="#064E3B"
            ink="#6EE7B7"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.kgCo2Saved}
              <Text style={styles.metricUnit}> kg</Text>
            </Text>
            <Text style={styles.metricTitle}>CO₂ Sequestered</Text>
            <Text style={styles.metricSub}>Tailpipe avoidance</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.treeDaysSequestered}
              <Text style={styles.metricUnit}> days</Text>
            </Text>
            <Text style={styles.metricTitle}>Tree Absorption</Text>
            <Text style={styles.metricSub}>Mature canopy span</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.oxygenGeneratedLiters.toLocaleString()}
              <Text style={styles.metricUnit}> L</Text>
            </Text>
            <Text style={styles.metricTitle}>Oxygen Preserved</Text>
            <Text style={styles.metricSub}>Photosynthetic yield</Text>
          </View>
        </View>

        {/* Featured Native Tree Spotlight */}
        <View style={styles.treeSpotlightCard}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View style={{ gap: 2 }}>
              <Text style={styles.spotlightHeader}>REPRESENTATIVE PUNE FLORA</Text>
              <Text style={styles.treeName}>
                {summary.featuredTree.icon} {summary.featuredTree.name}
              </Text>
              <Text style={styles.botanicalName}>
                {summary.featuredTree.botanicalName} · {summary.featuredTree.marathiName}
              </Text>
            </View>
            <View style={styles.absorptionBadge}>
              <Text style={styles.absorptionVal}>~{summary.featuredTree.annualCo2AbsorptionKg}</Text>
              <Text style={styles.absorptionUnit}>kg CO₂/yr</Text>
            </View>
          </View>

          <Text style={styles.treeSignificance}>
            {summary.featuredTree.significance}
          </Text>

          <View style={styles.habitatRow}>
            <Icon name="map-pin" size={13} color="#34D399" />
            <Text style={styles.habitatText}>
              Native Pune Habitat: {summary.featuredTree.puneHabitat}
            </Text>
          </View>
        </View>

        {/* Tier Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
            <Text style={styles.progressLabel}>
              Progress to Next Ecological Milestone ({summary.nextTierTargetKg} kg CO₂)
            </Text>
            <Text style={styles.progressPercent}>{summary.progressToNextTierPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${summary.progressToNextTierPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* Ecological Tip Box */}
        <View style={styles.tipBox}>
          <Icon name="check-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>{summary.ecologicalTip}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share urban tree offset"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#34D399" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Urban Tree Offset'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Tree sequestration calculations use mature native Western Ghats species averages (21.77 kg CO₂/tree/year). Transit savings model displacement of private Pune vehicular traffic.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#091512',
    borderColor: '#123326',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ECFDF5',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#0D211A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#163E2F',
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
    color: '#34D399',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6EE7B7',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D1FAE5',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 10,
    color: '#6EE7B7',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#1E4E3B',
  },
  treeSpotlightCard: {
    backgroundColor: '#0C281E',
    borderColor: '#194B37',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  spotlightHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6EE7B7',
    letterSpacing: 1,
  },
  treeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  botanicalName: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#A7F3D0',
  },
  absorptionBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  absorptionVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
  },
  absorptionUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  treeSignificance: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 17,
  },
  habitatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#194B37',
  },
  habitatText: {
    fontSize: 11,
    color: '#6EE7B7',
    fontWeight: '600',
    flex: 1,
  },
  progressContainer: {
    gap: 2,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#123326',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0D211A',
    borderColor: '#194B37',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 17,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064E3B',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ECFDF5',
  },
  disclaimer: {
    fontSize: 10,
    color: '#6EE7B7',
    lineHeight: 14,
    textAlign: 'center',
  },
});
