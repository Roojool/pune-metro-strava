import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import { theme } from '@/theme';
import { OPEN_STATIONS } from '@/data/pune';
import type { EnrichedLeaderboardEntry, RouteBurnEstimate } from './types';
import { estimateRouteBurn } from './scoring';

interface RouteBurnSimulatorProps {
  currentBoard?: EnrichedLeaderboardEntry[];
  currentUser?: EnrichedLeaderboardEntry;
  onLogRide?: (from: string, to: string) => void;
}

const PRESET_CORRIDORS = [
  { id: 'pcmc-swargate', label: 'PCMC ↔ Swargate', from: 'pcmc', to: 'swargate', tag: 'Purple Spine' },
  { id: 'vanaz-ramwadi', label: 'Vanaz ↔ Ramwadi', from: 'vanaz', to: 'ramwadi', tag: 'Aqua Line' },
  { id: 'nalstop-civilcourt', label: 'Nal Stop ↔ Civil Court', from: 'nal-stop', to: 'civil-court', tag: 'College Corridor' },
  { id: 'pcmc-ramwadi', label: 'PCMC ↔ Ramwadi', from: 'pcmc', to: 'ramwadi', tag: 'Deep Interchange' },
];

export function RouteBurnSimulator({
  currentBoard,
  currentUser,
  onLogRide,
}: RouteBurnSimulatorProps) {
  const [fromStation, setFromStation] = useState<string>('pcmc');
  const [toStation, setToStation] = useState<string>('swargate');

  const estimate: RouteBurnEstimate = estimateRouteBurn(
    fromStation,
    toStation,
    currentBoard,
    currentUser
  );

  const swapStations = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  const a11ySummary = `Route Burn Estimator: ${estimate.fromName} to ${estimate.toName}. Estimated ${estimate.calories} active calories, ${estimate.kilometers} km, ${estimate.flightOfStairsEquivalent} flights of stairs, saving ${estimate.co2SavedKg} kg CO2. ${estimate.overtakeNotice || ''}`;

  return (
    <Card style={localStyles.card}>
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={a11ySummary}
        style={{ gap: 16 }}
      >
        {/* Header */}
        <View style={[uiStyles.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={localStyles.iconBadge}>
              <Icon name="compass" size={18} color="#00CD6B" />
            </View>
            <View>
              <Text style={localStyles.eyebrow}>PREDICT MY NEXT COMMUTE</Text>
              <Text style={localStyles.title}>Route Burn Estimator</Text>
            </View>
          </View>
          <Pill text="INTERACTIVE SIMULATOR" color="#173A26" ink="#B4F5D0" />
        </View>

        <Text style={localStyles.subtitle}>
          See how many active walking calories and station stair flights your next Pune Metro ride will burn before you board.
        </Text>

        {/* Quick Corridor Presets */}
        <View style={{ gap: 8 }}>
          <Text style={localStyles.presetHeading}>POPULAR COMMUTER CORRIDORS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_CORRIDORS.map(corridor => {
              const isSelected =
                (fromStation === corridor.from && toStation === corridor.to) ||
                (fromStation === corridor.to && toStation === corridor.from);
              return (
                <Pressable
                  key={corridor.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select corridor ${corridor.label}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setFromStation(corridor.from);
                    setToStation(corridor.to);
                  }}
                  style={({ pressed }) => [
                    localStyles.presetChip,
                    isSelected ? localStyles.presetChipActive : null,
                    pressed ? { opacity: 0.8 } : null,
                  ]}
                >
                  <Text
                    style={[
                      localStyles.presetText,
                      isSelected ? localStyles.presetTextActive : null,
                    ]}
                  >
                    {corridor.label}
                  </Text>
                  <Text style={localStyles.presetTag}>{corridor.tag}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Route Direction Selector */}
        <View style={localStyles.routeBox}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={localStyles.stationLabel}>BOARDING STATION</Text>
            <Text style={localStyles.stationName}>{estimate.fromName}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Swap origin and destination stations"
            onPress={swapStations}
            style={({ pressed }) => [
              localStyles.swapButton,
              pressed ? { backgroundColor: '#2B3D30' } : null,
            ]}
          >
            <Icon name="repeat" size={16} color="#00CD6B" />
          </Pressable>

          <View style={{ flex: 1, gap: 4, alignItems: 'flex-end' }}>
            <Text style={localStyles.stationLabel}>DESTINATION</Text>
            <Text style={[localStyles.stationName, { textAlign: 'right' }]}>{estimate.toName}</Text>
          </View>
        </View>

        {/* Output Metrics Grid */}
        <View style={localStyles.resultsContainer}>
          <View style={localStyles.burnHighlightBox}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={localStyles.burnValue}>+{estimate.calories}</Text>
              <Text style={localStyles.burnUnit}>kcal</Text>
            </View>
            <Text style={localStyles.burnDetail}>
              {estimate.kilometers} km · {estimate.minutes} mins · {estimate.stationCount} stations
            </Text>
          </View>

          <View style={localStyles.statsRow}>
            <View style={localStyles.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="trending-up" size={13} color="#159CAC" />
                <Text style={localStyles.statNumber}>{estimate.flightOfStairsEquivalent}</Text>
              </View>
              <Text style={localStyles.statDesc}>Stair flights</Text>
            </View>

            <View style={localStyles.statDivider} />

            <View style={localStyles.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="compass" size={13} color="#00CD6B" />
                <Text style={localStyles.statNumber}>{estimate.walkingKmEquivalent} km</Text>
              </View>
              <Text style={localStyles.statDesc}>Walk equivalent</Text>
            </View>

            <View style={localStyles.statDivider} />

            <View style={localStyles.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="wind" size={13} color="#AD79FF" />
                <Text style={localStyles.statNumber}>{estimate.co2SavedKg} kg</Text>
              </View>
              <Text style={localStyles.statDesc}>CO₂ saved</Text>
            </View>
          </View>

          {/* Civil Court Deep Station Callout */}
          {estimate.isInterchange ? (
            <View style={localStyles.interchangeCallout}>
              <Icon name="layers" size={16} color="#00CD6B" />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={localStyles.interchangeTitle}>
                  Civil Court 33m Deep Concourse Transfer (+25 kcal)
                </Text>
                <Text style={localStyles.interchangeText}>
                  Includes vertical climb and multi-level concourse steps linking Line 1 and Line 2 platforms.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Overtake Notice / Leaderboard Impact */}
          {estimate.overtakeNotice ? (
            <View style={localStyles.overtakeBox}>
              <Text style={localStyles.overtakeText}>
                {estimate.overtakeNotice}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Action Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Record this ride from ${estimate.fromName} to ${estimate.toName}`}
          onPress={() => onLogRide?.(fromStation, toStation)}
          style={({ pressed }) => [
            localStyles.actionButton,
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Icon name="plus-circle" size={18} color="#070A08" />
          <Text style={localStyles.actionText}>Log this ride to claim these calories</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const localStyles = StyleSheet.create({
  card: {
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
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#A9B5AC',
  },
  presetHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#7D8A80',
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#16221A',
    borderWidth: 1,
    borderColor: '#243A2C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  presetChipActive: {
    backgroundColor: '#1E3827',
    borderColor: '#00CD6B',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  presetTextActive: {
    color: '#00CD6B',
  },
  presetTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A968E',
    backgroundColor: '#0F1612',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0E0B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1B2E21',
    gap: 10,
  },
  stationLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#7E8B81',
  },
  stationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18261D',
    borderWidth: 1,
    borderColor: '#26422E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    backgroundColor: '#0A0E0B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2E20',
    padding: 16,
    gap: 14,
  },
  burnHighlightBox: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#17271D',
  },
  burnValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#00CD6B',
    letterSpacing: -1,
  },
  burnUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B4F5D0',
  },
  burnDetail: {
    fontSize: 12,
    color: '#8C9A90',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statDesc: {
    fontSize: 11,
    color: '#7E8B81',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#1E3224',
  },
  interchangeCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#132418',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#23442C',
  },
  interchangeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B4F5D0',
  },
  interchangeText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#90A395',
  },
  overtakeBox: {
    backgroundColor: '#1C291F',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00CD6B',
  },
  overtakeText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#00CD6B',
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: '#070A08',
    fontSize: 14,
    fontWeight: '800',
  },
});
