import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Page, Stat, styles, Notice } from '@/components/UI';
import { theme } from '@/theme';
export default function HomeScreen() {
  const nav = useRouter(); const { user, journeys, points, totalKm, ready, storageError } = useApp();
  return <ScrollView style={{backgroundColor:theme.bg}}><Page><Heading eyebrow="YOUR CITY. YOUR ADVENTURE." title={`Welcome aboard, ${user.name}.`} subtitle="Make your everyday commute a little more extraordinary." /><Card style={{backgroundColor:theme.dark,gap:14}}><Text style={{color:'#fff',fontSize:30,fontWeight:'800'}}>Make every ride count.</Text><Text style={{color:'#D3E8DB',lineHeight:22}}>Collect stations. Find your community. Enjoy the journey.</Text><Action label="Log a ride" onPress={()=>nav.push('/log')} icon="plus" disabled={!ready}/></Card>{storageError ? <Notice error>{storageError}</Notice> : null}<View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}><Stat label="Journeys" value={String(journeys.length)} icon="navigation"/><Stat label="Estimated distance" value={`${totalKm.toFixed(1)} km`} icon="map"/><Stat label="Your XP" value={String(points)} icon="zap"/></View><Text style={styles.muted}>Local demo · manually recorded rides · no live tracking</Text></Page></ScrollView>;
}
