import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { OPEN_STATIONS } from '@/data/pune';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Page, Notice, styles } from '@/components/UI';
import { theme } from '@/theme';
export default function LogScreen() {
  const nav=useRouter(); const {addJourney,ready}=useApp(); const [from,setFrom]=useState('pcmc'); const [to,setTo]=useState('civil-court'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const save=async()=>{setBusy(true);const result=await addJourney(from,to);setBusy(false);if(!result.ok){setError(result.message);return;}nav.replace('/');};
  return <ScrollView style={{backgroundColor:theme.bg}}><Page><Heading title="Where did you ride?" subtitle="Manual logging · no GPS required"/>{(['Origin','Destination'] as const).map((label,index)=><Card key={label} style={{gap:12}}><Text style={styles.section}>{label}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{OPEN_STATIONS.map(s=><Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${s.name}`} key={s.id} onPress={()=>index===0?setFrom(s.id):setTo(s.id)} style={{padding:12,borderRadius:10,backgroundColor:(index===0?from:to)===s.id?theme.paleMint:theme.bg}}><Text style={styles.body}>{s.name}</Text></Pressable>)}</View></Card>)}{error?<Notice error>{error}</Notice>:null}<Action label={busy?'Saving…':'Confirm journey'} disabled={!ready||busy} onPress={save}/><Text style={styles.muted}>Distance and impact are illustrative estimates. Official fare not calculated.</Text></Page></ScrollView>;
}
