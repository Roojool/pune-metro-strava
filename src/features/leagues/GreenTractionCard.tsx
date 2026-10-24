import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { GreenTractionSummary } from './types';

interface GreenTractionCardProps {
  summary: GreenTractionSummary;
}

export function GreenTractionCard({ summary }: GreenTractionCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableSolarText);
          setShareFeedback('SOLAR COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableSolarText,
        title: 'Pune Metro Solar Traction Power',
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
              <Icon name="sun" size={18} color="#EAB308" />
            </View>
            <View>
              <Text style={styles.eyebrow}>MAHA METRO SOLAR MICROGRID · TRACTION</Text>
              <Text style={styles.title}>Solar Microgrid & Green Traction</Text>
            </View>
          </View>
          <Pill
            text={summary.tierTitle.toUpperCase()}
            color="#422006"
            ink="#FDE047"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.solarSolarKwh}
              <Text style={styles.metricUnit}> kWh</Text>
            </Text>
            <Text style={styles.metricTitle}>Solar PV Share</Text>
            <Text style={styles.metricSub}>65% renewable mix</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.regenerativeBrakingKwh}
              <Text style={styles.metricUnit}> kWh</Text>
            </Text>
            <Text style={styles.metricTitle}>Regenerative Brake</Text>
            <Text style={styles.metricSub}>Kinetic recapture</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.solarBulbHours.toLocaleString()}
              <Text style={styles.metricUnit}> hrs</Text>
            </Text>
            <Text style={styles.metricTitle}>LED Bulb Power</Text>
            <Text style={styles.metricSub}>10W light equivalent</Text>
          </View>
        </View>

        {/* Solar Stations Section */}
        <View style={styles.stationsSection}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.sectionHeader}>ROOFTOP SOLAR PHOTOVOLTAIC HUBS</Text>
            <Text style={styles.headerCount}>
              {summary.solarStationsVisitedCount} of {summary.totalSolarStations} Visited
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {summary.solarStations.map((station) => (
              <View
                key={station.stationId}
                style={[styles.stationCard, station.isVisited && styles.visitedStationCard]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${station.name}: ${station.marathiName}. Solar capacity: ${station.solarCapacityKwp} kWp. ${
                  station.isVisited ? 'Visited and solar powered!' : 'Not visited yet.'
                } Generates ~${station.annualSolarYieldMwh} MWh clean electricity annually.`}
              >
                <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={[styles.stationName, station.isVisited && styles.visitedStationName]} numberOfLines={1}>
                    {station.name}
                  </Text>
                  {station.isVisited ? (
                    <Text style={styles.visitedTag}>SOLAR POWERED ✓</Text>
                  ) : (
                    <Text style={styles.unvisitedTag}>UNVISITED</Text>
                  )}
                </View>

                <Text style={styles.marathiText}>{station.marathiName}</Text>

                <View style={styles.capacityRow}>
                  <Icon name="zap" size={12} color={station.isVisited ? '#FACC15' : '#71717A'} />
                  <Text style={[styles.capacityText, station.isVisited && styles.visitedCapacityText]}>
                    {station.solarCapacityKwp} kWp capacity · ~{station.annualSolarYieldMwh} MWh annual generation
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
              Progress to Next Solar Milestone ({summary.nextTierKwh} kWh)
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

        {/* Solar Tip */}
        <View style={styles.tipBox}>
          <Icon name="sun" size={16} color="#EAB308" />
          <Text style={styles.tipText}>{summary.solarTractionTip}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share solar traction power"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#EAB308" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Solar Traction Power'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Solar traction modeling reflects Maha Metro rooftop solar arrays on elevated stations and 18% kinetic energy fed back through regenerative braking during train deceleration.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121108',
    borderColor: '#302A10',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#422006',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EAB308',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FEFCE8',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#1C190B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#383212',
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
    color: '#FACC15',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FEF08A',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF9C3',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 10,
    color: '#CA8A04',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#4A4116',
  },
  stationsSection: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CA8A04',
    letterSpacing: 1,
  },
  headerCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FACC15',
  },
  stationCard: {
    backgroundColor: '#18160C',
    borderColor: '#292511',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  visitedStationCard: {
    backgroundColor: '#24210D',
    borderColor: '#713F12',
    borderLeftWidth: 4,
    borderLeftColor: '#EAB308',
  },
  stationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A1A1AA',
    flex: 1,
  },
  visitedStationName: {
    color: '#FEFCE8',
    fontWeight: '800',
  },
  visitedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FACC15',
  },
  unvisitedTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
  },
  marathiText: {
    fontSize: 11,
    color: '#FEF08A',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  capacityText: {
    fontSize: 11,
    color: '#71717A',
  },
  visitedCapacityText: {
    color: '#FACC15',
    fontWeight: '600',
  },
  progressContainer: {
    gap: 2,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FEF08A',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FACC15',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#26220E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EAB308',
    borderRadius: 3,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1F1A0B',
    borderColor: '#3D3412',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#FEF9C3',
    lineHeight: 17,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#422006',
    borderColor: '#854D0E',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FEFCE8',
  },
  disclaimer: {
    fontSize: 10,
    color: '#CA8A04',
    lineHeight: 14,
    textAlign: 'center',
  },
});
