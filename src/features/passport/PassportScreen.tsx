import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/state/AppState';
import { LINES, OPEN_STATIONS, STATIONS } from '@/data/pune';
import { ESTIMATES, networkCompletion } from '@/domain/metro';
import type { LineId } from '@/domain/models';
import { Action, Card, Heading, Icon, Notice, Page, Pill, Progress, SectionTitle, Stat, styles } from '@/components/UI';
import { theme } from '@/theme';
import { passportShareSummary } from './presentation';

export default function PassportScreen() {
  const app = useApp();
  const nav = useRouter();
  const { journeys, visitedIds, totalJourneys, totalKm, totalSavings, totalCo2, monthlyJourneys, points, ready, storageError } = app;
  const [lineId, setLineId] = useState<LineId>('purple');
  const [selectedId, setSelectedId] = useState('civil-court');
  const [shareMessage, setShareMessage] = useState('');
  const [shareError, setShareError] = useState(false);
  const [sharing, setSharing] = useState(false);
  const wide = useWindowDimensions().width >= 1150;
  const line = LINES.find(item => item.id === lineId)!;
  const stations = line.stationIds.map(id => STATIONS.find(station => station.id === id)!);
  const selected = stations.find(station => station.id === selectedId) ?? stations[0];
  const selectedCollected = visitedIds.includes(selected.id);
  const lineCollected = stations.filter(station => station.operational && visitedIds.includes(station.id)).length;
  const lineTotal = stations.filter(station => station.operational).length;
  const completion = networkCompletion(visitedIds);
  const totalMinutes = journeys.reduce((sum, journey) => sum + journey.minutes, 0);
  const summary = passportShareSummary(app, OPEN_STATIONS.length);
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

  async function sharePassport() {
    setSharing(true);
    setShareMessage('');
    setShareError(false);
    try {
      const result = await Share.share({ title: 'My MetroQuest passport', message: summary });
      setShareMessage(result?.action === Share.dismissedAction ? 'Sharing cancelled. Your passport stays private.' : 'Share action completed. Your summary contains totals only, with no routes or travel dates.');
    } catch {
      setShareError(true);
      setShareMessage('Sharing is unavailable or was cancelled. You can select and copy the passport summary below. No data has been published by MetroQuest.');
    } finally {
      setSharing(false);
    }
  }

  return <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ flexGrow: 1 }}>
    <Page>
      <Heading eyebrow="COLLECT MOMENTS, NOT TRAFFIC" title="Your metro passport." subtitle="A familiar route. A new discovery. Every station adds to your story." />
      {storageError ? <Notice error>{storageError}</Notice> : null}
      {!ready ? <Notice>Opening your local passport…</Notice> : null}
      {ready && totalJourneys === 0 ? <Card style={{ gap: 12 }}>
        <View style={styles.row}><View style={styles.iconBox}><Icon name="map-pin" /></View><Text style={styles.section}>Your first stamp is one ride away</Text></View>
        <Text style={styles.body}>Log a ride you have taken and its boarding and exit stations will be stamped here.</Text>
        <Action label="Log your first ride" icon="plus" onPress={() => nav.navigate('/log')} />
      </Card> : null}

      <Card style={[local.passportCard, { flexDirection: wide ? 'row' : 'column' }]}>
        <View style={{ flex: 1, gap: 18 }}>
          <View style={styles.row}><Icon name="compass" color="#FFD8C7" /><Text style={local.lightEyebrow}>PUNE EXPLORER PASSPORT</Text></View>
          <View style={{ gap: 4 }}>
            <Text style={local.passportNumber}>{visitedIds.length}<Text style={local.passportDenominator}> / {OPEN_STATIONS.length}</Text></Text>
            <Text style={local.passportLabel}>stations collected. More city to discover.</Text>
          </View>
          <View style={{ gap: 10, maxWidth: 520 }}>
            <Progress value={completion} color="#FC8D5E" />
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <Text style={local.lightMuted}>{completion}% of selectable stations</Text>
              <Text style={local.lightMuted}>{OPEN_STATIONS.length - visitedIds.length} still to explore</Text>
            </View>
          </View>
          <Text style={local.lightMuted}>Stamps come from your manually logged boarding and exit stations.</Text>
        </View>
        <View style={[local.stamp, { alignSelf: wide ? 'center' : 'flex-end' }]}>
          <Text style={local.stampCaption}>METROQUEST · PUNE</Text>
          <Icon name="navigation" size={30} color="#FFD8C7" />
          <Text style={local.stampTitle}>{visitedIds.length ? 'ON THE MOVE' : 'ALL ABOARD'}</Text>
          <Text style={local.stampCaption}>LOCAL DEMO PASSPORT</Text>
        </View>
      </Card>

      <View style={local.statsRow}>
        <Stat label="Journeys logged" value={String(totalJourneys)} icon="navigation" hint="Self-reported rides" />
        <Stat label="Distance explored" value={`${totalKm.toFixed(1)} km`} icon="map" hint="Illustrative route estimate" />
        <Stat label="Estimated ride time" value={`${totalMinutes} min`} icon="clock" hint="Excludes waiting and transfers" />
        <Stat label="This month" value={String(monthlyJourneys)} icon="calendar" hint={month} />
      </View>

      <SectionTitle aside={wide ? 'Tap a station to explore' : undefined}>Your station collection</SectionTitle>
      <View accessibilityRole="tablist" style={local.lineTabs}>
        {LINES.map(item => <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityLabel={`Explore ${item.name}`}
          accessibilityState={{ selected: lineId === item.id }}
          onPress={() => { setLineId(item.id); setSelectedId('civil-court'); }}
          style={({ pressed }) => [local.lineTab, { borderColor: lineId === item.id ? item.color : theme.border, backgroundColor: lineId === item.id ? (item.id === 'purple' ? theme.palePurple : '#E8F6F7') : theme.surface, opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={[local.lineDot, { backgroundColor: item.color }]} />
          <Text style={[local.lineTabText, { color: lineId === item.id ? item.color : theme.muted }]}>{item.name}</Text>
          <Icon name="arrow-right" size={16} color={lineId === item.id ? item.color : theme.muted} />
        </Pressable>)}
      </View>

      <View style={{ flexDirection: wide ? 'row' : 'column-reverse', gap: 16, alignItems: 'stretch' }}>
        <Card style={{ flex: 1, gap: 16 }}>
          <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
            <View style={{ gap: 4 }}><Text style={styles.section}>{line.name}</Text><Text style={styles.muted}>{stations[0].name} ↔ {stations[stations.length - 1].name}</Text></View>
            <Pill text={`${lineCollected} / ${lineTotal} COLLECTED`} color={lineId === 'purple' ? theme.palePurple : '#E8F6F7'} ink={line.color} />
          </View>
          <Progress value={lineCollected / lineTotal * 100} color={line.color} />
          <View style={{ marginTop: 4 }}>
            {stations.map((station, index) => {
              const collected = visitedIds.includes(station.id);
              const selectedStation = selected.id === station.id;
              const status = !station.operational ? 'Unavailable' : collected ? 'Collected' : 'To explore';
              return <Pressable
                key={station.id}
                accessibilityRole="button"
                accessibilityLabel={`${station.name}, ${status}. Show station details`}
                accessibilityState={{ selected: selectedStation }}
                onPress={() => setSelectedId(station.id)}
                style={({ pressed }) => [local.stationRow, { backgroundColor: selectedStation ? theme.bg : pressed ? '#F3F1EF' : 'transparent' }]}
              >
                <View style={{ width: 30, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                  {index > 0 ? <View style={[local.track, { top: 0, backgroundColor: line.color }]} /> : null}
                  {index < stations.length - 1 ? <View style={[local.track, { bottom: 0, backgroundColor: line.color }]} /> : null}
                  <View style={[local.stationDot, { borderColor: station.operational ? line.color : theme.border, backgroundColor: collected ? line.color : '#fff' }]}>
                    {collected ? <Icon name="check" size={11} color="#fff" /> : !station.operational ? <Icon name="minus" size={10} color={theme.muted} /> : null}
                  </View>
                </View>
                <View style={{ flex: 1, gap: 3, paddingVertical: 12 }}>
                  <Text style={[local.stationName, { color: station.operational ? theme.ink : theme.muted }]}>{station.name}</Text>
                  <Text style={[local.stationStatus, { color: collected ? theme.primary : theme.muted }]}>{station.line === 'interchange' ? `Interchange · ${status.toLowerCase()}` : status}</Text>
                </View>
                <Icon name={collected ? 'check-circle' : 'chevron-right'} size={17} color={collected ? theme.primary : theme.muted} />
              </Pressable>;
            })}
          </View>
          <View style={[styles.row, { flexWrap: 'wrap', gap: 16 }]}>
            <View style={styles.row}><View style={[local.legendDot, { backgroundColor: line.color, borderColor: line.color }]} /><Text style={styles.muted}>Collected</Text></View>
            <View style={styles.row}><View style={[local.legendDot, { borderColor: line.color }]} /><Text style={styles.muted}>To explore</Text></View>
            <View style={styles.row}><Icon name="minus-circle" size={12} color={theme.muted} /><Text style={styles.muted}>Unavailable</Text></View>
          </View>
          <Text style={styles.muted}>Schematic route, not a geographic map. Passing through a station does not collect it.</Text>
        </Card>

        <View style={{ width: wide ? 285 : '100%', gap: 16 }}>
          <Card style={{ gap: 16 }}>
            <View style={[local.detailIcon, { backgroundColor: selectedCollected ? theme.paleMint : theme.palePurple }]}><Icon name={selectedCollected ? 'check-circle' : !selected.operational ? 'lock' : 'map-pin'} size={25} color={selectedCollected ? theme.primary : line.color} /></View>
            <View style={{ gap: 7 }}>
              <Text style={styles.eyebrow}>STATION SPOTLIGHT</Text>
              <Text style={[styles.section, { fontSize: 23, lineHeight: 28 }]}>{selected.name}</Text>
              <Text style={styles.muted}>{selected.line === 'interchange' ? 'Purple + Aqua interchange' : line.name}</Text>
            </View>
            <Pill text={!selected.operational ? 'NOT OPEN FOR COLLECTION' : selectedCollected ? 'PASSPORT STAMP COLLECTED' : 'YOUR NEXT DISCOVERY?'} color={selectedCollected ? theme.paleMint : theme.bg} ink={selectedCollected ? theme.primary : theme.muted} />
            <Text style={styles.body}>{!selected.operational ? 'Range Hill is not marked open in our official reference snapshot. It cannot be selected as a journey endpoint.' : selectedCollected ? 'You have boarded or exited here in a manual journey log. A small stamp in your city story.' : 'Board or exit at this station and log your journey to add its stamp to your passport.'}</Text>
            <Text style={styles.muted}>Station stamps are self-reported and are not independently verified gate entries.</Text>
          </Card>
          <Card style={{ backgroundColor: theme.paleMint, borderColor: theme.paleMint, gap: 12 }}>
            <Icon name="compass" />
            <Text style={styles.section}>The city is the reward.</Text>
            <Text style={styles.body}>Try a new stop on your next ride. Your usual commute can be the start of a new discovery.</Text>
          </Card>
        </View>
      </View>

      <SectionTitle>Your commute, in perspective</SectionTitle>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
        <Card style={{ flex: 1, gap: 12 }}>
          <View style={styles.row}><View style={styles.iconBox}><Icon name="trending-up" /></View><Text style={styles.section}>A lighter travel budget</Text></View>
          <Text style={styles.statValue}>₹{Math.round(totalSavings).toLocaleString('en-IN')}</Text>
          <Pill text="ILLUSTRATIVE SAVINGS" color={theme.paleMint} ink={theme.primary} />
          <Text style={styles.body}>A model of what your recorded metro distance could save compared with a road commute.</Text>
          <Text style={styles.muted}>Assumes road budget ₹{ESTIMATES.roadRupeesPerKm}/km and metro comparison budget ₹{ESTIMATES.metroBudgetPerKm}/km. This is not an official fare or verified money saved.</Text>
        </Card>
        <Card style={{ flex: 1, gap: 12 }}>
          <View style={styles.row}><View style={styles.iconBox}><Icon name="wind" /></View><Text style={styles.section}>A little less footprint</Text></View>
          <Text style={styles.statValue}>{totalCo2.toFixed(2)} <Text style={{ fontSize: 17 }}>kg CO₂e</Text></Text>
          <Pill text="ILLUSTRATIVE AVOIDED EMISSIONS" color={theme.paleMint} ink={theme.primary} />
          <Text style={styles.body}>An estimated comparison for your logged distance, not a measured environmental result.</Text>
          <Text style={styles.muted}>Assumes {ESTIMATES.roadKgPerKm} kg/km for road and {ESTIMATES.metroKgPerKm} kg/km for metro. Actual emissions vary with vehicle, occupancy and electricity mix.</Text>
        </Card>
      </View>

      <SectionTitle>Good progress deserves a little celebration</SectionTitle>
      <Card style={{ gap: 18 }}>
        <View style={[styles.row, { flexWrap: 'wrap', justifyContent: 'space-between' }]}>
          <View style={{ gap: 7 }}><Text style={styles.section}>Your shareable passport</Text><Text style={styles.muted}>Preview below · totals only · no routes, station names or travel dates</Text></View>
          <Pill text={`${points} XP`} color={theme.palePurple} ink={theme.purple} />
        </View>
        <View style={local.sharePreview}>
          <Icon name="navigation" color={theme.primary} size={24} />
          <Text selectable style={[styles.body, { lineHeight: 25 }]}>{summary}</Text>
        </View>
        <Action label={sharing ? 'Opening share options…' : 'Share my passport summary'} icon="share-2" disabled={!ready || sharing} onPress={sharePassport} />
        {shareMessage ? <Notice error={shareError}>{shareMessage}</Notice> : null}
        <Text style={styles.muted}>Nothing is posted automatically. Choose where to share, or select the preview text to copy it. Web sharing depends on browser support.</Text>
      </Card>
    </Page>
  </ScrollView>;
}

const local = StyleSheet.create({
  passportCard: { backgroundColor: theme.dark, borderColor: theme.dark, padding: 28, gap: 24, overflow: 'hidden' },
  lightEyebrow: { color: '#FFD8C7', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  passportNumber: { color: '#fff', fontSize: 64, fontWeight: '800', letterSpacing: -3, lineHeight: 72 },
  passportDenominator: { color: '#E5A389', fontSize: 30, letterSpacing: -1 },
  passportLabel: { color: '#F7E9E2', fontSize: 14, lineHeight: 22 },
  lightMuted: { color: '#D1C7C3', fontSize: 11, lineHeight: 18 },
  stamp: { height: 150, width: 150, borderRadius: 75, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#9C6B59', justifyContent: 'center', alignItems: 'center', gap: 10, transform: [{ rotate: '-10deg' }], marginRight: 10 },
  stampCaption: { color: '#FFB18F', fontSize: 7, fontWeight: '700', letterSpacing: 1.4 },
  stampTitle: { color: '#FFD8C7', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  lineTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  lineTab: { minHeight: 50, minWidth: 150, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineTabText: { fontSize: 14, fontWeight: '700', flex: 1 },
  lineDot: { width: 9, height: 9, borderRadius: 5 },
  stationRow: { minHeight: 64, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', gap: 12, alignItems: 'center' },
  track: { width: 3, position: 'absolute', height: '50%', opacity: 0.25 },
  stationDot: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stationName: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  stationStatus: { fontSize: 11, lineHeight: 16 },
  legendDot: { height: 10, width: 10, borderRadius: 5, borderWidth: 1.5, backgroundColor: '#fff' },
  detailIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sharePreview: { backgroundColor: theme.bg, borderRadius: 15, borderWidth: 1, borderColor: theme.border, padding: 20, gap: 14 },
});
