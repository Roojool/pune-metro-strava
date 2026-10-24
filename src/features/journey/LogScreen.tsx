import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LINES, STATIONS, getStationName } from '@/data/pune';
import { routeBetween } from '@/domain/metro';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Icon, Notice, Page, Pill, styles } from '@/components/UI';
import { theme } from '@/theme';
import { recentCommutes, searchStations } from './journey-ui';
import RouteMap from './RouteMap';

export default function LogScreen() {
  const nav = useRouter();
  const wide = useWindowDimensions().width >= 960;
  const { addJourney, journeys, ready, storageError } = useApp();
  const [from, setFrom] = useState('pcmc');
  const [to, setTo] = useState('civil-court');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const route = useMemo(() => {
    try { return routeBetween(from, to); } catch { return null; }
  }, [from, to]);
  const options = searchStations(STATIONS, query);
  const recent = recentCommutes(journeys);
  const openPicker = (field: 'from' | 'to') => { setQuery(''); setPicker(field); };
  const chooseStation = (id: string) => { if (picker === 'from') setFrom(id); else setTo(id); setPicker(null); setError(''); };
  const save = async () => {
    if (busy || !route) return;
    setBusy(true); setError('');
    try {
      const result = await addJourney(from, to);
      if (!result.ok) { setError(result.message); return; }
      nav.replace('/');
    } catch { setError('Could not save your ride on this device. Please try again.'); }
    finally { setBusy(false); }
  };

  if (!ready || storageError) return <ScrollView style={{ backgroundColor: theme.bg }}><Page>
    <Heading title="Where did you ride?" />
    <Notice error={Boolean(storageError)}>{storageError || 'Opening your local passport…'}</Notice>
    {storageError ? <Action label="Open profile for recovery options" onPress={() => nav.replace('/profile')} /> : null}
  </Page></ScrollView>;

  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: theme.bg }}><Page>
    <Heading eyebrow="QUICK JOURNEY LOG" title="Where did you ride?" subtitle="Record a ride you took, or try the sample route. Saved only on this device." />
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 18 }}>
      <View style={{ flex: 1.25, gap: 16 }}>
        <Card style={{ gap: 12 }}>
          <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.section}>Your route</Text><Pill text="MANUAL LOG" color={theme.paleMint} ink={theme.primary} /></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Origin: ${getStationName(from)}. Change boarding station`} accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => openPicker('from')} style={({ pressed }) => [local.stationField, { opacity: busy ? 0.5 : pressed ? 0.7 : 1 }]}>
            <View style={[local.endpoint, { borderColor: theme.purple }]} /><View style={{ flex: 1, gap: 6 }}><Text style={local.fieldLabel}>BOARDED AT</Text><Text style={local.stationName}>{getStationName(from)}</Text></View><Icon name="chevron-down" color={theme.muted} size={20} />
          </Pressable>
          <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 22 }}><View style={{ height: 24, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: theme.border }} /><Pressable accessibilityRole="button" accessibilityLabel="Swap origin and destination" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => { setFrom(to); setTo(from); setError(''); }} style={({ pressed }) => [local.swap, { opacity: busy ? 0.5 : pressed ? 0.65 : 1 }]}><Icon name="repeat" size={16} /><Text style={local.swapText}>Swap stations</Text></Pressable></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Destination: ${getStationName(to)}. Change exit station`} accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => openPicker('to')} style={({ pressed }) => [local.stationField, { opacity: busy ? 0.5 : pressed ? 0.7 : 1 }]}>
            <View style={[local.endpoint, { backgroundColor: theme.primary, borderColor: theme.primary }]} /><View style={{ flex: 1, gap: 6 }}><Text style={local.fieldLabel}>EXITED AT</Text><Text style={local.stationName}>{getStationName(to)}</Text></View><Icon name="chevron-down" color={theme.muted} size={20} />
          </Pressable>
          {route ? <View accessible accessibilityLabel={`Estimated journey: ${route.kilometers.toFixed(1)} kilometres, ${route.minutes} minutes`} style={local.estimate}>
            <Icon name="clock" size={16} color={theme.muted} />
            <Text style={[styles.muted, { flex: 1 }]}>{route.kilometers.toFixed(1)} km · {route.minutes} min · estimated</Text>
          </View> : null}
          {!route ? <Notice error>Choose two different open stations to continue.</Notice> : null}
          {error ? <Notice error>{error}</Notice> : null}
          <Action label={busy ? 'Saving your journey…' : 'Confirm journey'} icon="check" disabled={!ready || !route || busy} onPress={save} />
          <Text style={[styles.muted, { textAlign: 'center' }]}>Your passport, statistics and XP update together.</Text>
        </Card>
        {recent.length ? <Card style={{ gap: 14 }}><View style={styles.row}><Icon name="repeat" size={18} /><Text style={styles.section}>Recent routes</Text></View>{recent.map(journey => <Pressable key={`${journey.from}:${journey.to}`} accessibilityRole="button" accessibilityLabel={`Use recent route ${getStationName(journey.from)} to ${getStationName(journey.to)}`} accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => { setFrom(journey.from); setTo(journey.to); setError(''); }} style={({ pressed }) => [local.recentRoute, { opacity: busy ? 0.5 : pressed ? 0.65 : 1 }]}><Text style={[styles.body, { flex: 1 }]}>{getStationName(journey.from)} → {getStationName(journey.to)}</Text><Icon name="arrow-up-right" size={17} /></Pressable>)}</Card> : null}
      </View>

      <View style={{ flex: 1, gap: 16 }}>
        <Card style={{ backgroundColor: theme.dark, borderColor: theme.dark, gap: 18 }}>
          <Text style={{ color: '#C8D0D5', fontSize: 11, letterSpacing: 1.6, fontWeight: '700' }}>THE JOURNEY AT A GLANCE</Text>
          {route ? <><View style={{ width: '100%', maxWidth: 440, alignSelf: 'center' }}><RouteMap stationIds={route.stationIds} /></View><View style={{ height: 1, backgroundColor: '#3C454C' }} /><View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}><View style={{ gap: 6 }}><Text style={local.routeNumber}>{route.kilometers.toFixed(1)}<Text style={local.routeUnit}> km</Text></Text><Text style={local.routeCaption}>Estimated distance</Text></View><View style={{ gap: 6 }}><Text style={local.routeNumber}>{route.minutes}<Text style={local.routeUnit}> min</Text></Text><Text style={local.routeCaption}>Estimated duration</Text></View></View></> : <Text style={local.routeCaption}>Your route preview appears when two different stations are selected.</Text>}
          <Text style={{ color: '#B7C3CB', fontSize: 11, lineHeight: 18 }}>Route follows the station network, not recorded location. Time excludes waiting and transfers; segment distances are approximate.</Text>
        </Card>
        <Card style={{ gap: 12 }}><View style={styles.row}><Icon name="credit-card" size={19} /><Text style={styles.section}>Check your actual fare</Text></View><Text style={styles.body}>Operator fares are not calculated in this demo. Use Pune Metro’s official fare checker before you travel.</Text><Action label="Open official fare checker" secondary icon="external-link" onPress={async () => { try { await Linking.openURL('https://punemetrorail.org/fare_chart.aspx'); } catch { setError('Could not open the fare checker. Visit punemetrorail.org/fare_chart.aspx in your browser.'); } }} /></Card>
        <Card style={{ gap: 10, backgroundColor: theme.paleMint, borderColor: '#F1DDD2' }}><View style={styles.row}><Icon name="shield" size={18} /><Text style={styles.section}>Your commute, your control</Text></View><Text style={styles.muted}>No background location. No gate verification. Boarding and exit stations earn stamps; stations passed on the way do not.</Text><Text style={styles.muted}>To avoid accidental duplicates, wait one minute between logs. The local demo allows up to ten rides per UTC day.</Text></Card>
      </View>
    </View>

    <Modal visible={picker !== null} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={local.backdrop}><View accessibilityViewIsModal style={local.picker}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}><Text accessibilityRole="header" style={[styles.section, { flex: 1 }]}>{picker === 'from' ? 'Choose boarding station' : 'Choose exit station'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close station picker" onPress={() => setPicker(null)} style={({ pressed }) => [local.close, { opacity: pressed ? 0.65 : 1 }]}><Icon name="x" size={21} /></Pressable></View>
        <View style={local.search}><Icon name="search" size={18} color={theme.muted} /><TextInput accessibilityLabel="Search stations" placeholder="Search PCMC, Civil Court…" placeholderTextColor={theme.muted} autoFocus onKeyPress={event => { if (event.nativeEvent.key === 'Escape') setPicker(null); }} value={query} onChangeText={setQuery} autoCorrect={false} style={{ flex: 1, minWidth: 0, minHeight: 48, color: theme.ink, fontSize: 14 }} /></View>
        <Text style={styles.muted}>Open stations only · Range Hill is currently unavailable</Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>
          {options.length ? options.map(station => <Pressable accessibilityRole="button" accessibilityLabel={`Select ${station.name}`} accessibilityState={{ selected: station.id === (picker === 'from' ? from : to) }} key={station.id} onPress={() => chooseStation(station.id)} style={({ pressed }) => [local.option, { backgroundColor: station.id === (picker === 'from' ? from : to) ? theme.paleMint : pressed ? theme.bg : '#fff' }]}><View style={{ height: 9, width: 9, borderRadius: 5, backgroundColor: station.line === 'aqua' ? theme.aqua : theme.purple }} /><View style={{ flex: 1, gap: 3 }}><Text style={styles.body}>{station.name}</Text><Text style={styles.muted}>{station.line === 'interchange' ? 'Purple + Aqua interchange' : LINES.find(line => line.id === station.line)?.name}</Text></View>{station.id === (picker === 'from' ? from : to) ? <Icon name="check" size={18} /> : null}</Pressable>) : <View style={{ paddingVertical: 24, gap: 10 }}><Text style={styles.section}>No station found</Text><Text style={styles.muted}>Try another name or clear your search.</Text></View>}
        </ScrollView>
      </View></KeyboardAvoidingView>
    </Modal>
  </Page></ScrollView>;
}

const local = StyleSheet.create({
  stationField: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 76, padding: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.bg, borderRadius: 14 },
  endpoint: { height: 13, width: 13, borderRadius: 7, borderWidth: 3, backgroundColor: '#fff' },
  fieldLabel: { color: theme.muted, fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  stationName: { color: theme.ink, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  estimate: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  swap: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 9, minHeight: 48 },
  swapText: { color: theme.primary, fontSize: 11, fontWeight: '700' },
  recentRoute: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 12 },
  routeNumber: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: '#fff' },
  routeUnit: { fontSize: 14, fontWeight: '500', color: '#B7C3CB' },
  routeCaption: { fontSize: 11, lineHeight: 18, color: '#C8D0D5' },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,25,30,0.45)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  picker: { width: '100%', maxWidth: 580, maxHeight: '86%', backgroundColor: '#fff', borderRadius: 22, padding: 20, gap: 14 },
  close: { height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.bg },
  search: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 13, backgroundColor: theme.bg, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  option: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 13, paddingVertical: 13, minHeight: 64, borderRadius: 12 },
});
