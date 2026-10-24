import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { SmogShieldSummary } from './types';

interface SmogShieldCardProps {
  summary: SmogShieldSummary;
}

export function SmogShieldCard({ summary }: SmogShieldCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableShieldText);
          setShareFeedback('SHIELD COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableShieldText,
        title: 'Pune Metro Commuter Smog Shield & Lung Health',
      });
      setShareFeedback('SHARED!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShareFeedback(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { bg: '#0A2533', border: '#38BDF8', ink: '#BAE6FD' };
      case 'gold':
        return { bg: '#291804', border: '#F59E0B', ink: '#FDE68A' };
      case 'silver':
        return { bg: '#17202A', border: '#94A3B8', ink: '#E2E8F0' };
      default:
        return { bg: '#1B140B', border: '#D97706', ink: '#FCD34D' };
    }
  };

  const tierColors = getTierColor(summary.smogShieldTier);

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
              <Icon name="shield" size={18} color="#0EA5E9" />
            </View>
            <View>
              <Text style={styles.eyebrow}>LUNG HEALTH · AQI EXPOSURE SHIELD</Text>
              <Text style={styles.title}>Commuter Smog Shield</Text>
            </View>
          </View>
          <Pill
            text={summary.smogShieldTitle.toUpperCase()}
            color={tierColors.bg}
            ink={tierColors.ink}
          />
        </View>

        {/* 3 Metrics Overview */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.pm25AvoidedMicrograms}
              <Text style={styles.metricUnit}> µg</Text>
            </Text>
            <Text style={styles.metricTitle}>PM2.5 Avoided</Text>
            <Text style={styles.metricSub}>Soot & brake dust</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ~{summary.smogMinutesAvoided}
              <Text style={styles.metricUnit}> min</Text>
            </Text>
            <Text style={styles.metricTitle}>Filtered Air</Text>
            <Text style={styles.metricSub}>Sealed coach time</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {summary.filteredAirLiters.toLocaleString()}
              <Text style={styles.metricUnit}> L</Text>
            </Text>
            <Text style={styles.metricTitle}>Clean Breath</Text>
            <Text style={styles.metricSub}>Inhaled volume</Text>
          </View>
        </View>

        {/* Hill Station / Mahabaleshwar Clean Air Equivalent */}
        <View style={styles.hillStationBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="wind" size={16} color="#38BDF8" />
              <Text style={styles.hillStationHeader}>WESTERN GHATS CLEAN AIR EQUIVALENT</Text>
            </View>
            <Text style={styles.hillStationVal}>~{summary.hillStationFreshAirDays} Days</Text>
          </View>
          <Text style={styles.hillStationSub}>{summary.healthBenefitText}</Text>
        </View>

        {/* Top Protected Route */}
        {summary.highestProtectionCorridor !== 'None logged yet' && (
          <View style={styles.corridorRow}>
            <Text style={styles.corridorLabel}>Primary Clean Air Corridor:</Text>
            <Text style={styles.corridorValue} numberOfLines={1}>
              {summary.highestProtectionCorridor}
            </Text>
          </View>
        )}

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share smog shield records"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#38BDF8" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Clean Air Smog Shield'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Particulate exposure modeling benchmarks roadside Pune traffic PM2.5 (~75 µg/m³) against HVAC-filtered metro coach air. No GPS tracking data is logged or shared.
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
    backgroundColor: '#082535',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#0EA5E9',
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
    color: '#38BDF8',
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
  hillStationBox: {
    backgroundColor: '#081E29',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10455B',
    padding: 12,
    gap: 6,
  },
  hillStationHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#38BDF8',
  },
  hillStationVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#BAE6FD',
  },
  hillStationSub: {
    fontSize: 11,
    lineHeight: 16,
    color: '#E0F2FE',
  },
  corridorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#070C0E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#14252B',
  },
  corridorLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  corridorValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    flexShrink: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#092736',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#145575',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BAE6FD',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
