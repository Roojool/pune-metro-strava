import React from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import type { StationDensitySummary } from './types';

interface StationBurnHeatmapCardProps {
  summary: StationDensitySummary;
}

export function StationBurnHeatmapCard({ summary }: StationBurnHeatmapCardProps) {
  const hasStations = summary.topStations.length > 0;

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
              <Icon name="layers" size={18} color="#FF9500" />
            </View>
            <View>
              <Text style={styles.eyebrow}>STATION EXERTION HEATMAP</Text>
              <Text style={styles.title}>Elevation & Stairs Burn</Text>
            </View>
          </View>
          <Pill
            text={hasStations ? `${summary.topStations.length} HUBS` : 'EXPLORE'}
            color="#261E14"
            ink="#FF9500"
          />
        </View>

        {hasStations ? (
          <View style={{ gap: 10 }}>
            {summary.topStations.map((st, i) => {
              const isDeep = st.elevationType === 'underground_interchange';
              return (
                <View key={st.stationId} style={styles.stationRow}>
                  <View style={styles.rankNum}>
                    <Text style={styles.rankText}>#{i + 1}</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={styles.stationName}>{st.stationName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.metaText}>
                        {st.totalVisits} {st.totalVisits === 1 ? 'visit' : 'visits'} · ~{st.estimatedStairsClimbed} stair flights
                      </Text>
                      {isDeep ? (
                        <View style={styles.deepTag}>
                          <Text style={styles.deepText}>33m Deep Underground</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 1 }}>
                    <Text style={styles.burnValue}>{st.totalBurnKcal}</Text>
                    <Text style={styles.burnUnit}>kcal</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Log journeys between different stations to track where you climb the most station stairs and burn active transit calories.
            </Text>
          </View>
        )}

        {/* High-Burn Recommendation Tip */}
        <View style={styles.tipBox}>
          <Icon name="zap" size={15} color="#00CD6B" />
          <Text style={styles.tipText}>
            Pro Commuter Tip: Passing through {summary.deepestStationName} (deepest underground metro station in India) engages ~10 flights of stairs per transfer.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          Stair and platform exertion estimates are based on station concourse depths and elevated clearances.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0E1314',
    borderColor: '#1D2A2E',
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#261C13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FF9500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#080E10',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#18272C',
  },
  rankNum: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#1E2F36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9500',
  },
  stationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F5F2',
  },
  metaText: {
    fontSize: 11,
    color: '#8CA1A9',
  },
  deepTag: {
    backgroundColor: '#261C33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deepText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AD79FF',
  },
  burnValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  burnUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF9500',
  },
  emptyBox: {
    padding: 16,
    backgroundColor: '#080E10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#18272C',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8CA1A9',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10221A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A3F2E',
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#B4F5D0',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6F8087',
  },
});
