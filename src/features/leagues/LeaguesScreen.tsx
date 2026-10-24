import { Text } from '@/components/Typography';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Page, Pill, SectionTitle, Icon, Progress, Notice, styles } from '@/components/UI';
import { rankLeaderboard, leaderboardScore } from '@/domain/metro';
import { LINES } from '@/data/pune';
import type { LeaderboardEntry, LineId } from '@/domain/models';
import { theme } from '@/theme';
import { SAMPLE_LEAGUE } from './sampleLeague';
type Scope = 'Pune' | 'Friends' | 'Route';
const ACTIVITY_ORANGE = '#00CD6B';
const ACTIVITY_INK = '#00CD6B'; // Readable orange text on the tinted activity cards.
// Preserve the shared visual bar and expose its name and units on web and native.
function LabeledProgress({ label, value, valueText }: { label: string; value: number; valueText: string }) {
  const percent = Math.round(Math.min(100, Math.max(0, value)));
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 100, now: percent, text: valueText }}
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={valueText}>
    <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Progress value={percent} color={ACTIVITY_ORANGE}/>
    </View>
  </View>;
}

export default function LeaguesScreen(){
  const router=useRouter();
  const {points,achievements,challenges,journeys,user,streak,activeDays,ready,storageError}=useApp();
  const [scope,setScope]=useState<Scope>('Pune');const [line,setLine]=useState<LineId>('purple');
  const [showXpDetails,setShowXpDetails]=useState(false);
  const wide=useWindowDimensions().width>=1180;
  if (!ready || storageError) return <ScrollView style={{backgroundColor:theme.bg}}><Page>
    <Heading title="Your leagues" subtitle="Local, self-reported progress and sample competition."/>
    <Notice error={!!storageError}>{storageError ?? <Text style={{color:theme.ink}}>Loading your saved XP, achievements and leagues…</Text>}</Notice>
    {storageError?<Action label="Open profile for recovery options" secondary onPress={()=>router.push('/profile')}/>:null}
  </Page></ScrollView>;
  const selectedLine=LINES.find(l=>l.id===line)!;
  const routeIds=selectedLine.stationIds;
  const routeJourneys=journeys.filter(j=>j.stationIds.filter(id=>routeIds.includes(id)).length>=2);
  const currentScore=scope==='Route'?leaderboardScore(routeJourneys):points;
  const samples=scope==='Friends'?SAMPLE_LEAGUE.slice(0,3):scope==='Route'?SAMPLE_LEAGUE.filter(e=>e.line===line):SAMPLE_LEAGUE;
  const current:LeaderboardEntry={id:'you',name:user.name.trim() || 'You',points:currentScore,sample:false,line};
  const board=rankLeaderboard([...samples,current]);const rank=board.findIndex(e=>e.id==='you')+1;
  const unlocked=achievements.filter(a=>a.unlocked).length;
  const leagueTitle=scope==='Route'?`${selectedLine.name} league`:scope==='Friends'?'Friends preview':'Pune explorers';
  return <ScrollView style={{backgroundColor:theme.bg}}><Page>
    <View style={{gap:8}}><Text style={[styles.eyebrow,{color:ACTIVITY_INK}]}>THE EVERYDAY ADVENTURE CLUB</Text><Heading title="Good habits. Great company." subtitle="A little friendly competition makes the everyday journey go further."/></View>
    {journeys.length===0?<Card style={{gap:12}}>
      <Text accessibilityRole="header" style={styles.section}>Your first ride starts here.</Text>
      <Text style={styles.body}>Manually record a metro journey to start earning XP, collect endpoint stations and join the sample leagues.</Text>
      <Action label="Log your first ride" icon="plus" onPress={()=>router.push('/log')}/>
    </Card>:null}
    <View style={{flexDirection:wide?'row':'column',gap:18}}>
      <Card style={{flex:wide?1:undefined,backgroundColor:theme.dark,borderColor:theme.dark,gap:18}}>
        <View style={[styles.row,{justifyContent:'space-between',flexWrap:'wrap'}]}><Pill text={`LEVEL ${Math.floor(points/100)+1} EXPLORER`} color="#173A26" ink="#B4F5D0"/><Icon name="zap" size={26} color="#00CD6B"/></View>
        <Text style={{fontSize:54,fontWeight:'800',letterSpacing:-2,color:'#fff'}}>{points}<Text style={{fontSize:16,fontWeight:'500',color:'#BCD5C7'}}> XP</Text></Text>
        <Text style={{fontSize:14,lineHeight:22,color:'#D9DEE2'}}>Every journey is progress. Every new station is a little discovery.</Text>
        <LabeledProgress label="Explorer level progress" value={points%100} valueText={`${points%100} of 100 XP toward level ${Math.floor(points/100)+2}`}/>
        <Text style={{fontSize:12,color:'#D1C7C3'}}>{100-points%100} XP to level {Math.floor(points/100)+2}</Text>
        <View style={{gap:8}}>
          <Pressable accessibilityRole="button" accessibilityLabel="How XP works" accessibilityState={Platform.OS==='web'?undefined:{expanded:showXpDetails}} aria-expanded={Platform.OS==='web'?showXpDetails:undefined}
            onPress={()=>setShowXpDetails(value=>!value)}
            style={({pressed})=>({minHeight:48,paddingHorizontal:12,paddingVertical:10,borderWidth:1,borderColor:'#8A929A',borderRadius:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,backgroundColor:pressed?'#3E454D':'transparent'})}>
            <Text style={{fontSize:13,fontWeight:'700',color:'#FFFFFF',flexShrink:1}}>How XP works</Text>
            <Icon name={showXpDetails?'chevron-up':'chevron-down'} size={18} color="#FFFFFF"/>
          </Pressable>
          {showXpDetails?<View style={{gap:6}}>
            <Text style={{fontSize:13,lineHeight:20,color:'#FFFFFF'}}>10 XP per ride + 20 XP per new endpoint.</Text>
            <Text style={{fontSize:12,lineHeight:19,color:'#D9DEE2'}}>An endpoint is where you board or exit. Each station earns its bonus only on your first logged visit; passing through does not count.</Text>
            <Text style={{fontSize:12,lineHeight:19,color:'#D9DEE2'}}>Rides and XP are self-reported, not independently verified.</Text>
          </View>:null}
        </View>
      </Card>
      <Card style={{flex:wide?1:undefined,gap:18}}><View style={styles.row}><View style={[styles.iconBox,{backgroundColor:'#302019'}]}><Icon name="sun" color="#FFC6B0"/></View><Text style={[styles.section,{flexShrink:1}]}>Keep your rhythm.</Text></View><View style={{flexDirection:'row',gap:16}}><View style={{flex:1,gap:5}}><Text style={styles.statValue}>{streak}<Text style={{fontSize:13,fontWeight:'500'}}> {streak===1?'day':'days'}</Text></Text><Text style={styles.muted}>Current streak</Text></View><View style={{flex:1,gap:5}}><Text style={styles.statValue}>{activeDays}</Text><Text style={styles.muted}>Active days, all time</Text></View></View><View style={{height:1,backgroundColor:theme.border}}/><Text style={styles.body}>Your city moves every day. Find your own pace.</Text><Text style={styles.muted}>Streak uses India calendar days. A ride today or yesterday keeps it active.</Text></Card>
    </View>
    {unlocked>0?<View accessibilityLiveRegion="polite" style={{backgroundColor:theme.paleMint,padding:18,borderRadius:16,borderLeftWidth:4,borderLeftColor:ACTIVITY_ORANGE,flexDirection:'row',gap:14,alignItems:'center'}}><Icon name="award" size={27}/><View style={{flex:1,gap:3}}><Text style={{fontWeight:'700',fontSize:15,color:theme.ink}}>A milestone worth celebrating.</Text><Text style={styles.body}>Unlocked: {achievements.filter(a=>a.unlocked).map(a=>a.title).join(' · ')}</Text><Text style={[styles.muted,{color:theme.ink}]}>{unlocked} {unlocked===1?'achievement':'achievements'} currently unlocked from your self-reported rides. Keep exploring.</Text></View></View>:null}
    <View style={{flexDirection:wide?'row':'column',gap:20,alignItems:'stretch'}}>
      <View style={{flex:1.35,gap:14}}><View style={{gap:4}}><SectionTitle>A little friendly competition</SectionTitle><Text style={[styles.muted,{color:theme.ink}]}>ALL-TIME · SAMPLE LEAGUE</Text></View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:7,padding:5,backgroundColor:'#1C211E',borderRadius:13}}>{(['Pune','Friends','Route'] as Scope[]).map(item=><Pressable key={item} accessibilityRole="button" accessibilityLabel={`${item} sample demo league`} accessibilityState={Platform.OS==='web'?undefined:{selected:scope===item}} aria-pressed={Platform.OS==='web'?scope===item:undefined} onPress={()=>setScope(item)} style={({pressed})=>({flex:1,minWidth:72,minHeight:48,paddingHorizontal:8,paddingVertical:10,gap:3,alignItems:'center',justifyContent:'center',borderRadius:9,borderBottomWidth:3,borderBottomColor:scope===item?ACTIVITY_INK:'transparent',backgroundColor:scope===item?theme.surface:pressed?'#242925':'transparent'})}><Text style={{fontWeight:'700',fontSize:13,color:scope===item?ACTIVITY_INK:theme.ink}}>{item}</Text><Text style={{fontSize:10,fontWeight:'700',letterSpacing:0.5,color:theme.ink}}>LEAGUE</Text></Pressable>)}</View>
        {scope==='Route'?<View style={[styles.row,{flexWrap:'wrap'}]}>{LINES.map(l=><Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${l.name} sample demo league`} accessibilityState={Platform.OS==='web'?undefined:{selected:line===l.id}} aria-pressed={Platform.OS==='web'?line===l.id:undefined} onPress={()=>setLine(l.id)} style={({pressed})=>({minHeight:48,flexGrow:1,flexBasis:140,padding:12,borderRadius:10,borderWidth:2,borderColor:line===l.id?l.color:theme.border,flexDirection:'row',gap:6,alignItems:'center',justifyContent:'center',backgroundColor:line===l.id?(l.id==='purple'?theme.palePurple:'#122A30'):pressed?'#1C211E':theme.surface})}>{line===l.id?<Icon name="check" size={16} color={theme.ink}/>:null}<Text style={{flexShrink:1,color:theme.ink,fontWeight:'700',fontSize:13}}>{l.name}</Text></Pressable>)}</View>:null}
        <Card style={{padding:0,overflow:'hidden'}}><View style={{padding:20,gap:5,borderBottomWidth:1,borderBottomColor:theme.border}}><View style={[styles.row,{justifyContent:'space-between',flexWrap:'wrap'}]}><Text accessibilityRole="header" style={[styles.section,{flexShrink:1}]}>{leagueTitle}</Text><Pill text="SAMPLE LEAGUE" ink="#AD79FF"/></View><Text style={styles.muted}>You + {samples.length} fictional profiles · no real public ranking</Text></View>{board.map((entry,i)=><View key={entry.id} accessible={Platform.OS!=='web'} accessibilityLabel={Platform.OS!=='web'?`Position ${i+1}, ${entry.name}${entry.id==='you'?', you':''}, ${entry.points} XP. ${entry.sample?'Fictional sample profile':'Your local, self-reported score'}.`:undefined} style={{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:18,paddingVertical:16,backgroundColor:entry.id==='you'?theme.paleMint:theme.surface,borderBottomColor:theme.border,borderBottomWidth:i<board.length-1?1:0}}><Text style={{width:25,fontWeight:'700',fontSize:14,color:entry.id==='you'?ACTIVITY_INK:i<3?ACTIVITY_INK:theme.muted}}>{String(i+1).padStart(2,'0')}</Text><View style={{width:37,height:37,borderRadius:13,backgroundColor:entry.id==='you'?'#173A26':i%2?theme.palePurple:'#242925',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:14,fontWeight:'700',color:entry.id==='you'?ACTIVITY_INK:theme.ink}}>{Array.from(entry.name.trim())[0]?.toUpperCase() || '?'}</Text></View><View style={{flex:1,minWidth:0,gap:2}}><Text style={{fontSize:14,fontWeight:'700',color:theme.ink}}>{entry.name}{entry.id==='you'?' · you':''}</Text><Text style={{fontSize:12,lineHeight:18,color:entry.id==='you'?theme.ink:theme.muted}}>{entry.sample?'SAMPLE · Fictional profile':scope==='Route'?'Your self-reported route score':'Your local, self-reported score'}</Text></View><Text style={{fontWeight:'800',fontSize:15,color:theme.ink}}>{entry.points}<Text style={{fontSize:10,fontWeight:'500'}}> XP</Text></Text></View>)}<View style={{padding:16,backgroundColor:theme.bg,gap:8}}>
          <Text accessibilityLiveRegion="polite" style={[styles.body,{fontWeight:'700'}]}>Your position: #{rank} of {board.length} · {currentScore} XP · {leagueTitle}.</Text>
          {scope==='Route' && routeJourneys.length===0?<Text style={styles.body}>No rides on {selectedLine.name} yet. Log a journey using at least one segment of this line to start your route score.</Text>:null}
          <Text style={styles.muted}>{scope==='Route'?'Route scores include the full XP of rides using at least one segment of this line. A transfer ride can count in both route leagues; your total XP is counted only once.':'Sample scores are fixed; your score updates with each eligible local ride.'}</Text>
          <Text style={styles.muted}>Equal XP scores are ordered by name.</Text>
        </View></Card>
      </View>
      <View style={{flex:1,gap:14}}><SectionTitle>One week. One small goal.</SectionTitle>{challenges.map(c=><Card key={c.id} style={{gap:16}}><View style={[styles.row,{justifyContent:'space-between'}]}><View style={[styles.iconBox,{backgroundColor:theme.palePurple}]}><Icon name="target" color={theme.purple}/></View><Pill text={c.progress>=c.target?'COMPLETED':'ROLLING 7 DAYS'} color={theme.paleMint} ink={ACTIVITY_INK}/></View><Text style={styles.section}>{c.title}</Text><Text style={styles.body}>{c.description}</Text><LabeledProgress label={`${c.title} progress`} value={c.progress/c.target*100} valueText={`${c.progress} of ${c.target} rides in the last 7 days`}/><Text style={{fontSize:13,fontWeight:'700',color:ACTIVITY_INK}}>{c.progress} / {c.target} rides{c.progress>=c.target?' · Nicely done!':''}</Text></Card>)}<Card style={{gap:12,backgroundColor:'#261E1B',borderColor:'#4D3730'}}><Icon name="shield" color="#FFC6B0"/><Text style={styles.section}>Play fair. Ride for yourself.</Text><Text style={styles.muted}>Manually log rides between different open stations. Wait 1 minute between logs, with a limit of 10 rides per UTC day (reset at 5:30 AM IST). XP is self-reported, not independently verified or tamper-proof.</Text></Card></View>
    </View>
    <View style={{gap:4}}><SectionTitle>The little wins collection</SectionTitle><Text style={styles.muted}>{unlocked} OF {achievements.length} UNLOCKED</Text><Text style={styles.muted}>Based on current activity. The three-day streak badge locks again when your streak breaks.</Text></View><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{achievements.map(a=><Card key={a.id} style={{flex:1,minWidth:180,gap:13,backgroundColor:a.unlocked?'#14281B':theme.surface,borderColor:a.unlocked?'#28583C':theme.border}}><View style={{width:48,height:48,borderRadius:16,backgroundColor:a.unlocked?'#173A26':theme.bg,alignItems:'center',justifyContent:'center'}}><Icon name={a.unlocked?'award':'lock'} size={24} color={a.unlocked?ACTIVITY_INK:'#626A72'}/></View><Text style={{fontWeight:'700',fontSize:15,color:theme.ink}}>{a.title}</Text><Text style={styles.muted}>{a.description}</Text><Text style={{fontWeight:'700',fontSize:10,letterSpacing:1,color:a.unlocked?ACTIVITY_INK:theme.muted}}>{a.unlocked?'UNLOCKED':'TO DISCOVER'}</Text></Card>)}</View>
    <Text style={styles.muted}>Sample league · your progress is saved on this device.</Text>
  </Page></ScrollView>;
}
