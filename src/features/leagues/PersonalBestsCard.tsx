import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { PersonalBestsSummary } from './types';

interface PersonalBestsCardProps {
  summary: PersonalBestsSummary;
}

export function PersonalBestsCard({ summary }: PersonalBestsCardProps) {
  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={summary.accessibilitySummary}
        style={{ gap: 14 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Icon name="award" size={18} color="#55C5E0" />
            </View>
            <View>
              <Text style={styles.eyebrow}>HALL OF FAME · PERSONAL BESTS</Text>
              <Text style={styles.title}>{summary.headline}</Text>
            </View>
          </View>
          <Pill text={`${summary.uniqueStationsVisited} STATIONS`} color="#0F242A" ink="#55C5E0" />
        </View>

        {/* 3 Records Grid */}
        <View style={styles.recordsGrid}>
          {summary.records.map((r, i) => (
            <View key={r.id} style={styles.recordCol}>
              <Text style={styles.recordValue}>
                {r.value}
                <Text style={styles.recordUnit}> {r.unit}</Text>
              </Text>
              <Text style={styles.recordTitle}>{r.title}</Text>
              <Text style={styles.recordSubtitle}>{r.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Favorite Corridor Highlight */}
        <View style={styles.favoriteRow}>
          <Icon name="compass" size={16} color={theme.primary} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={styles.favoriteLabel}>Most Frequent Transit Corridor</Text>
            <Text style={styles.favoriteValue}>{summary.favoriteCorridor}</Text>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={styles.lifetimeVal}>{summary.totalLifetimeBurnKcal}</Text>
            <Text style={styles.lifetimeUnit}>total kcal</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Personal bests are calculated from all self-reported journeys stored on this device.
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
    backgroundColor: '#12262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#55C5E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recordsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14252B',
    padding: 12,
    gap: 8,
  },
  recordCol: {
    flex: 1,
    gap: 3,
  },
  recordValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recordUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55C5E0',
  },
  recordTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C6D3D9',
  },
  recordSubtitle: {
    fontSize: 10,
    color: '#71868F',
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#101B20',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1C313A',
  },
  favoriteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8CA1A9',
    letterSpacing: 0.5,
  },
  favoriteValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lifetimeBox: {
    alignItems: 'flex-end',
    gap: 1,
  },
  lifetimeVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00CD6B',
  },
  lifetimeUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8CA1A9',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B85',
  },
});
