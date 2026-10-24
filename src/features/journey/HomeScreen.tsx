import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Icon, Notice, Page, Pill, Progress, SectionTitle, Stat, styles } from '@/components/UI';
import { OPEN_STATIONS, getStationName } from '@/data/pune';
import { findStation, routeBetween } from '@/domain/metro';
import { theme } from '@/theme';
import { recentCommutes } from './journey-ui';
import RouteMap from './RouteMap';

export default function HomeScreen() {
  const nav = useRouter();
  const wide = useWindowDimensions().width >= 1120;
  const { user, journeys, totalJourneys, points, totalKm, totalCo2, visitedIds, weeklyJourneys, streak, challenges, ready, storageError, addJourney } = useApp();
  const [savingRoute, setSavingRoute] = useState<string | null>(null);
  const busy = savingRoute !== null;
  const [historyLimit, setHistoryLimit] = useState(5);
  const [feedback, setFeedback] = useState<{ route: string; message: string; error: boolean } | null>(null);
  const commutes = recentCommutes(journeys);
  const challenge = challenges[0];
  const level = Math.floor(points / 100) + 1;
  const activity = journeys[0] ?? routeBetween('pcmc', 'civil-court');
  const logAgain = async (from: string, to: string) => {
    if (busy) return;
    const route = `${from}:${to}`;
    setSavingRoute(route); setFeedback(null);
    try {
      const result = await addJourney(from, to);
      setFeedback({ route, message: result.message, error: !result.ok });
    } catch {
      setFeedback({ route, message: 'Your ride could not be saved. Please try again.', error: true });
    } finally { setSavingRoute(null); }
  };

  if (!ready || storageError) return <ScrollView style={{ backgroundColor: theme.bg }}><Page>
    <Heading title="Your metro activity" />
    <Notice error={Boolean(storageError)}>{storageError || 'Opening your local passport…'}</Notice>
    {storageError ? <Action label="Open profile for recovery options" onPress={() => nav.navigate('/profile')} /> : null}
  </Page></ScrollView>;

  return <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ flexGrow: 1 }}><Page>
    <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 16 }}>
      <View style={{ flex: 1 }}><Heading eyebrow="YOUR METRO ACTIVITY" title={`Hey, ${user.name}.`} subtitle="Your commute. Your progress. Your next little win." /></View>
      <View style={{ minWidth: 170 }}><Action label="Log a ride" icon="plus" disabled={!ready || busy} onPress={() => nav.push('/log')} /></View>
    </View>

    <Card style={[local.hero, { flexDirection: wide ? 'row' : 'column', padding: wide ? 28 : 22 }]}>
      <View style={{ flex: 1, gap: 15, justifyContent: 'center' }}>
        <Pill text={journeys.length ? 'LATEST SELF-REPORTED RIDE' : 'SAMPLE ROUTE · NOT A LOGGED RIDE'} color="#3D322C" ink="#FFA37A" />
        <Text accessibilityRole="header" style={[local.heroTitle, !wide && { fontSize: 30, lineHeight: 35, letterSpacing: -0.8 }]}>Make every ride count.</Text>
        <Text style={local.heroBody}>{getStationName(activity.stationIds[0])} → {getStationName(activity.stationIds[activity.stationIds.length - 1])}</Text>
        <View style={{ flexDirection: 'row', gap: 25, flexWrap: 'wrap' }}><View style={{ gap: 5 }}><Text style={local.activityNumber}>{activity.kilometers.toFixed(1)}<Text style={local.activityUnit}> km</Text></Text><Text style={local.activityCaption}>Estimated distance</Text></View><View style={{ gap: 5 }}><Text style={local.activityNumber}>{activity.minutes}<Text style={local.activityUnit}> min</Text></Text><Text style={local.activityCaption}>Estimated duration</Text></View>{journeys[0] ? <View style={{ gap: 5 }}><Text style={local.activityNumber}>+{journeys[0].points}<Text style={local.activityUnit}> XP</Text></Text><Text style={local.activityCaption}>Ride earned</Text></View> : null}</View>
        <Text style={{ color: '#B8C2C8', fontSize: 11 }}>Manual logging · no GPS recording</Text>
      </View>
      <View style={{ width: wide ? 360 : '100%', maxWidth: 440, alignSelf: 'center' }}><RouteMap stationIds={activity.stationIds} /></View>
    </Card>

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Stat label="Rides logged" value={String(totalJourneys)} icon="navigation" hint="Your personal journey" />
      <Stat label="Estimated distance" value={`${totalKm.toFixed(1)} km`} icon="map" hint="Every little ride adds up" />
      <Stat label="Stations collected" value={`${visitedIds.length} / ${OPEN_STATIONS.length}`} icon="compass" hint="Boarding and exit stations" />
      <Stat label="Estimated CO₂e avoided" value={`${totalCo2.toFixed(2)} kg`} icon="feather" hint="Illustrative road comparison" />
    </View>

    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
      <Card style={{ flex: 1.25, gap: 15 }}>
        <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><View style={[styles.row, { flex: 1, minWidth: 150 }]}><View style={styles.iconBox}><Icon name="zap" /></View><Text style={[styles.section, { flexShrink: 1 }]}>Your progress</Text></View><Pill text={`LEVEL ${level}`} color={theme.paleMint} ink={theme.primary} /></View>
        <Text style={styles.statValue}>{points}<Text style={{ fontSize: 15, fontWeight: '500', color: theme.muted }}> XP earned</Text></Text>
        <Progress value={points % 100} />
        <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Text style={styles.muted}>{100 - points % 100} XP to level {level + 1}</Text><Text style={styles.muted}>{streak} day{streak === 1 ? '' : 's'} in your streak</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Explore leagues and achievements" onPress={() => nav.navigate('/leagues')} style={({ pressed }) => [local.textLink, { opacity: pressed ? 0.65 : 1 }]}><Text style={local.linkText}>Find your next milestone</Text><Icon name="arrow-up-right" size={16} /></Pressable>
      </Card>
      <Card style={{ flex: 1, gap: 14, backgroundColor: '#FFF4EE', borderColor: '#F4E2D7' }}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}><Icon name="target" color="#BE460F" /><Pill text="THIS WEEK" color="#FFE4D6" ink="#BE460F" /></View>
        <Text style={styles.section}>{challenge?.title ?? 'The five-ride club'}</Text>
        <Text style={styles.body}>{challenge?.description ?? 'Record 5 rides in the last 7 days'}</Text>
        <Progress value={challenge ? challenge.progress / challenge.target * 100 : 0} />
        <Text style={{ color: '#BE460F', fontWeight: '700', fontSize: 13 }}>{weeklyJourneys} ride{weeklyJourneys === 1 ? '' : 's'} in the last 7 days · {Math.max(0, (challenge?.target ?? 5) - weeklyJourneys)} to go</Text>
      </Card>
    </View>

    <SectionTitle aside={commutes.length ? 'One tap. Back on track.' : 'Ready when you are'}>Your usual routes</SectionTitle>
    {commutes.length ? <View style={{ gap: 10 }}>{commutes.map(journey => <Card key={`${journey.from}:${journey.to}`} style={{ gap: 14 }}>
      <View style={[styles.row, { flexWrap: 'wrap', justifyContent: 'space-between' }]}>
        <View style={{ flex: 1, minWidth: 160, gap: 6 }}><Text style={[styles.body, { fontWeight: '600' }]}>{getStationName(journey.from)} → {getStationName(journey.to)}</Text><Text style={styles.muted}>{journey.kilometers.toFixed(1)} km · {journey.minutes} min · estimated</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Log again from ${getStationName(journey.from)} to ${getStationName(journey.to)}`} accessibilityState={{ disabled: !ready || busy, busy: savingRoute === `${journey.from}:${journey.to}` }} disabled={!ready || busy} onPress={() => logAgain(journey.from, journey.to)} style={({ pressed }) => [local.repeatAction, { opacity: !ready || busy ? 0.45 : pressed ? 0.8 : 1 }]}><Icon name="repeat" size={18} /><Text style={local.linkText}>{savingRoute === `${journey.from}:${journey.to}` ? 'Saving…' : 'Log again'}</Text></Pressable>
      </View>
      {feedback?.route === `${journey.from}:${journey.to}` ? <View accessibilityLiveRegion="polite"><Notice error={feedback.error}>{feedback.message}</Notice></View> : null}
    </Card>)}</View> : <Card style={{ gap: 14 }}><View style={styles.row}><Icon name="repeat" /><Text style={styles.section}>Your first route starts here</Text></View><Text style={styles.body}>PCMC → Civil Court. Two taps to your first station stamps.</Text><View style={{ alignSelf: 'flex-start' }}><Action label="Start with PCMC → Civil Court" secondary disabled={!ready} onPress={() => nav.push('/log')} /></View></Card>}

    <SectionTitle aside="Your self-reported journeys">Recent rides</SectionTitle>
    {journeys.length ? <Card style={{ paddingVertical: 4 }}>{journeys.slice(0, historyLimit).map((journey, index) => <View accessible accessibilityLabel={`Manual ride from ${getStationName(journey.from)} to ${getStationName(journey.to)}, ${new Date(journey.at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} India time, ${journey.kilometers.toFixed(1)} estimated kilometres, ${journey.minutes} estimated minutes, ${journey.points} XP`} key={journey.id} style={[local.rideRow, index ? { borderTopWidth: 1, borderTopColor: theme.border } : undefined]}>
      <View style={[styles.iconBox, { backgroundColor: findStation(journey.from)?.line === 'aqua' ? '#E7F5F6' : theme.palePurple }]}><Icon name="navigation" size={17} color={findStation(journey.from)?.line === 'aqua' ? theme.aqua : theme.purple} /></View>
      <View style={{ flex: 1, gap: 5 }}><Text style={[styles.body, { fontWeight: '600' }]}>{getStationName(journey.from)} → {getStationName(journey.to)}</Text><Text style={styles.muted}>{new Date(journey.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</Text><Text style={styles.muted}>{journey.kilometers.toFixed(1)} km · {journey.minutes} min · estimated</Text></View>
      <Text style={local.rideXp}>+{journey.points} XP</Text>
    </View>)}
      {journeys.length > 5 ? <View style={local.historyFooter}>
        <Text accessibilityLiveRegion="polite" style={styles.muted}>Showing {Math.min(historyLimit, journeys.length)} of {journeys.length} rides</Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>{historyLimit < journeys.length ? <Action label="Show older rides" secondary onPress={() => setHistoryLimit(limit => limit + 5)} /> : null}{historyLimit > 5 ? <Action label="Show recent rides" secondary onPress={() => setHistoryLimit(5)} /> : null}</View>
      </View> : null}
    </Card> : <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}><Icon name="sunrise" size={27} /><Text style={styles.section}>Good things start with one ride.</Text><Text style={[styles.muted, { textAlign: 'center' }]}>Your recent journeys will appear here after your first log.</Text></Card>}
    <Pressable accessibilityRole="button" accessibilityLabel="Open your metro passport" onPress={() => nav.navigate('/passport')} style={({ pressed }) => [local.passportCta, { flexDirection: wide ? 'row' : 'column', opacity: pressed ? 0.8 : 1 }]}><View style={{ gap: 7, flex: 1 }}><Text style={styles.section}>There’s more Pune to discover.</Text><Text style={styles.muted}>Every new station is another page in your passport.</Text></View><View style={styles.row}><Text style={local.linkText}>Explore your passport</Text><Icon name="arrow-right" size={17} /></View></Pressable>
    <Text style={styles.muted}>Local demo · scores are self-reported · distance, savings and CO₂e are illustrative estimates, not verified travel or measured impact.</Text>
  </Page></ScrollView>;
}

const local = StyleSheet.create({
  hero: { backgroundColor: theme.dark, borderColor: theme.dark, gap: 24, padding: 28, overflow: 'hidden' },
  heroTitle: { color: '#fff', fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -1.2, maxWidth: 400 },
  heroBody: { color: '#D4DBDF', fontSize: 14, lineHeight: 23 },
  activityNumber: { color: '#fff', fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  activityUnit: { color: '#C2CACE', fontSize: 13, fontWeight: '500' },
  activityCaption: { color: '#B8C2C8', fontSize: 10 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, minHeight: 48, alignSelf: 'flex-start' },
  linkText: { color: theme.primary, fontSize: 13, fontWeight: '700' },
  repeatAction: { minHeight: 48, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: theme.paleMint, flexDirection: 'row', gap: 9, justifyContent: 'center', alignItems: 'center' },
  rideRow: { flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 16 },
  rideXp: { color: theme.primary, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  historyFooter: { gap: 12, borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 16 },
  passportCta: { padding: 22, gap: 16, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#EDD0C0', backgroundColor: theme.paleMint },
});
