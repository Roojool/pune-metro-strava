import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useApp } from '@/state/AppState';
import { Card, Heading, Page, styles } from '@/components/UI';
import { theme } from '@/theme';
export default function LeaguesScreen(){const {points,achievements}=useApp();return <ScrollView style={{backgroundColor:theme.bg}}><Page><Heading title="Your next little victory." subtitle="Sample leagues. Real motivation."/><Card><Text style={styles.statValue}>{points} XP</Text></Card>{achievements.map(a=><Card key={a.id}><Text style={styles.body}>{a.unlocked?'✓':'○'} {a.title}</Text><Text style={styles.muted}>{a.description}</Text></Card>)}</Page></ScrollView>}
