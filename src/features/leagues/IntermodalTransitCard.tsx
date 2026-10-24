import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { IntermodalTransitSummary } from './types';

interface IntermodalTransitCardProps {
  summary: IntermodalTransitSummary;
}

export function IntermodalTransitCard({ summary }: IntermodalTransitCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableIntermodalText);
          setShareFeedback('CONNECTIVITY COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableIntermodalText,
        title: 'Pune Metro Intermodal Hub Connectivity',
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
              <Icon name="git-pull-request" size={18} color="#818CF8" />
            </View>
            <View>
              <Text style={styles.eyebrow}>MULTI-MODAL NETWORK · FEEDER HUBS</Text>
              <Text style={styles.title}>Intermodal Hub Connectivity</Text>
            </View>
          </View>
          <Pill
            text={`${summary.intermodalConnectivityScore} / 100 PTS`}
            color="#1E1B4B"
            ink="#C7D2FE"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.unlockedHubsCount}
              <Text style={styles.metricUnit}>/{summary.totalHubs}</Text>
            </Text>
            <Text style={styles.metricTitle}>Hubs Unlocked</Text>
            <Text style={styles.metricSub}>Transit gateways</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.totalIntermodalVisits}
            </Text>
            <Text style={styles.metricTitle}>Hub Visits</Text>
            <Text style={styles.metricSub}>Connections logged</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              +{summary.intermodalTransferKcal}
              <Text style={styles.metricUnit}> kcal</Text>
            </Text>
            <Text style={styles.metricTitle}>Transfer Exertion</Text>
            <Text style={styles.metricSub}>Stairs & bridges</Text>
          </View>
        </View>

        {/* Intermodal Hubs List */}
        <View style={styles.hubsList}>
          <Text style={styles.listHeader}>MAJOR PUNE TRANSIT INTERCHANGES</Text>
          <View style={{ gap: 8 }}>
            {summary.hubs.map((hub) => (
              <View
                key={hub.id}
                style={[
                  styles.hubCard,
                  hub.isUnlocked && styles.unlockedHubCard,
                ]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${hub.hubName}: ${hub.marathiName}. ${
                  hub.isUnlocked
                    ? `Connected! Visited ${hub.visitCount} times.`
                    : 'Unvisited interchange hub.'
                } Connecting modes: ${hub.connectingModes.join(', ')}. ${hub.interchangeStairsFlights} stair flights.`}
              >
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={[styles.hubName, hub.isUnlocked && styles.unlockedHubName]} numberOfLines={1}>
                    {hub.hubName}
                  </Text>
                  {hub.isUnlocked ? (
                    <Text style={styles.connectedTag}>{hub.visitCount}x CONNECTED ✓</Text>
                  ) : (
                    <Text style={styles.unvisitedTag}>UNVISITED</Text>
                  )}
                </View>

                <Text style={styles.marathiText}>{hub.marathiName}</Text>

                {/* Connecting Modes Chips */}
                <View style={styles.modesWrap}>
                  {hub.connectingModes.map((mode, i) => (
                    <View key={i} style={styles.modeChip}>
                      <Text style={styles.modeText}>{mode}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.stairsSub}>
                  ~{hub.interchangeStairsFlights} stair flights transfer concourse
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary Feeder Callout Box */}
        <View style={styles.feederBox}>
          <Icon name="compass" size={16} color="#818CF8" />
          <Text style={styles.feederText}>
            Primary connecting feeder mode: {summary.dominantFeederMode}. Seamlessly bridging local and regional Pune travel.
          </Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share intermodal hub connectivity"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#818CF8" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Intermodal Hub Connectivity'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Intermodal connectivity models transfers with Indian Railways, MSRTC state buses, and PMPML bus terminals across Pune. No private travel routes are shared.
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
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#818CF8',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#16272E',
    marginHorizontal: 4,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
  },
  hubsList: {
    gap: 8,
  },
  listHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  hubCard: {
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 4,
  },
  unlockedHubCard: {
    backgroundColor: '#0F1123',
    borderColor: '#2D2866',
  },
  hubName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    flexShrink: 1,
  },
  unlockedHubName: {
    color: '#FFFFFF',
  },
  connectedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818CF8',
  },
  unvisitedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  marathiText: {
    fontSize: 10,
    color: '#64748B',
  },
  modesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  modeChip: {
    backgroundColor: '#12162B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#242C56',
  },
  modeText: {
    fontSize: 9,
    color: '#C7D2FE',
  },
  stairsSub: {
    fontSize: 10,
    color: '#64748B',
  },
  feederBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#131131',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#312E81',
    padding: 10,
  },
  feederText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#E0E7FF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#18153B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C7D2FE',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
