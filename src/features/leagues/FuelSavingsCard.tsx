import React, { useState } from 'react';
import { Text } from '@/components/Typography';
import { View, StyleSheet, Pressable, Share, Platform } from 'react-native';
import { Card, Icon, Pill, styles as uiStyles } from '@/components/UI';
import type { FuelSavingsSummary } from './types';

interface FuelSavingsCardProps {
  summary: FuelSavingsSummary;
}

export function FuelSavingsCard({ summary }: FuelSavingsCardProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary.shareableSavingsText);
          setShareFeedback('SAVINGS COPIED!');
          setTimeout(() => setShareFeedback(null), 3000);
          return;
        }
      }
      await Share.share({
        message: summary.shareableSavingsText,
        title: 'Pune Metro Commuter Rupee Fuel Savings',
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
              <Icon name="tag" size={18} color="#22C55E" />
            </View>
            <View>
              <Text style={styles.eyebrow}>FINANCIAL ROI · PETROL SAVINGS</Text>
              <Text style={styles.title}>Commuter Rupee Savings</Text>
            </View>
          </View>
          <Pill
            text={summary.savingsPersona.toUpperCase()}
            color="#0A2612"
            ink="#86EFAC"
          />
        </View>

        {/* 3 Metric Columns */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ₹{summary.totalRupeesSavedVsScooter}
            </Text>
            <Text style={styles.metricTitle}>vs Scooter</Text>
            <Text style={styles.metricSub}>Fuel & upkeep</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ₹{summary.totalRupeesSavedVsAuto}
            </Text>
            <Text style={styles.metricTitle}>vs Rickshaw</Text>
            <Text style={styles.metricSub}>RTO meter fare</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              ~{summary.petrolLitersAvoided}
              <Text style={styles.metricUnit}> L</Text>
            </Text>
            <Text style={styles.metricTitle}>Petrol Saved</Text>
            <Text style={styles.metricSub}>@ ₹106/liter</Text>
          </View>
        </View>

        {/* Pune Cultural Economic Equivalent Box */}
        <View style={styles.equivalentBox}>
          <View style={[uiStyles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="gift" size={16} color="#22C55E" />
              <Text style={styles.equivalentHeader}>PUNE ECONOMIC EQUIVALENT</Text>
            </View>
            <Text style={styles.fareTag}>Metro: ₹{summary.totalMetroFareSpent}</Text>
          </View>
          <Text style={styles.equivalentVal}>{summary.puneCulturalSavingEquivalent}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share rupee savings records"
          style={styles.shareButton}
        >
          <Icon name="share" size={15} color="#22C55E" />
          <Text style={styles.shareText}>
            {shareFeedback ?? 'Share Rupee Savings Summary'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Savings benchmarked against average Pune petrol rates (₹106/L), Activa mileage (~35 km/L), and RTO auto rates. No payment or financial records are accessed or shared.
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
    backgroundColor: '#0A2612',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#22C55E',
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
    color: '#22C55E',
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
  equivalentBox: {
    backgroundColor: '#071F10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#114D25',
    padding: 12,
    gap: 6,
  },
  equivalentHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#22C55E',
  },
  fareTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#86EFAC',
  },
  equivalentVal: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    color: '#DCFCE7',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#0A2612',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#15652E',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#86EFAC',
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
