import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { CorridorBurnSummary } from './puneBurnEquivalents';

interface CorridorBurnCardProps {
  corridors: CorridorBurnSummary[];
}

export function CorridorBurnCard({ corridors }: CorridorBurnCardProps) {
  const hasCorridors = corridors.length > 0;

  return (
    <Card style={styles.card}>
      <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.iconBox}>
            <Icon name="map" size={18} color="#55C5E0" />
          </View>
          <View>
            <Text style={styles.eyebrow}>TRANSIT CORRIDOR BURN</Text>
            <Text style={styles.title}>Top Commute Routes</Text>
          </View>
        </View>
        <Pill text={hasCorridors ? `${corridors.length} ACTIVE` : 'DISCOVER'} color="#0F242A" ink="#55C5E0" />
      </View>

      {hasCorridors ? (
        <View style={{ gap: 10 }}>
          {corridors.slice(0, 4).map((c, i) => (
            <View key={c.corridorKey} style={styles.corridorRow}>
              <View style={styles.rankNum}>
                <Text style={styles.rankText}>#{i + 1}</Text>
              </View>

              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={styles.corridorName}>
                  {c.fromName} ↔ {c.toName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.metaText}>
                    {c.ridesCount} {c.ridesCount === 1 ? 'ride' : 'rides'}
                  </Text>
                  {c.hasInterchange ? (
                    <View style={styles.transferTag}>
                      <Text style={styles.transferText}>Civil Court Transfer (+25 kcal)</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 1 }}>
                <Text style={styles.caloriesValue}>{c.totalCalories}</Text>
                <Text style={styles.caloriesUnit}>kcal</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Log rides between different stations to analyze which Pune Metro corridors burn the most active energy.
          </Text>
        </View>
      )}

      <Text style={styles.disclaimer}>
        Corridor burn combines station entrance stairs, platform walks, and transit stabilization.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A1317',
    borderColor: '#18313A',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#11252D',
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
  corridorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F1E24',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#19343E',
  },
  rankNum: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#173642',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#55C5E0',
  },
  corridorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F5F2',
  },
  metaText: {
    fontSize: 11,
    color: '#8CA1A9',
  },
  transferTag: {
    backgroundColor: '#261C33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transferText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AD79FF',
  },
  caloriesValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  caloriesUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#55C5E0',
  },
  emptyBox: {
    padding: 12,
    backgroundColor: '#0F1E24',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8CA1A9',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#657B84',
  },
});
