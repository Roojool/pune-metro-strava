import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useApp } from '@/state/AppState';
import { OPEN_STATIONS } from '@/data/pune';
import { Card, Heading, Page, Progress, styles } from '@/components/UI';
import { theme } from '@/theme';
export default function PassportScreen(){const {visitedIds,totalKm}=useApp();return <ScrollView style={{backgroundColor:theme.bg}}><Page><Heading title="Your metro passport." subtitle="Every station is a new story."/><Card style={{gap:12}}><Text style={styles.statValue}>{visitedIds.length} / {OPEN_STATIONS.length} stations</Text><Progress value={visitedIds.length/OPEN_STATIONS.length*100}/><Text style={styles.muted}>{totalKm.toFixed(1)} estimated km · only boarding and exit stations count</Text></Card><View style={{gap:10}}>{OPEN_STATIONS.map(s=><Card key={s.id}><Text style={styles.body}>{visitedIds.includes(s.id)?'✓':'○'} {s.name}</Text></Card>)}</View></Page></ScrollView>}
