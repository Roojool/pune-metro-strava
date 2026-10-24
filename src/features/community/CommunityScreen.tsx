import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Icon, Page, Pill, Notice, SectionTitle, styles } from '@/components/UI';
import type { MutationResult } from '@/domain/models';
import { theme } from '@/theme';
import { communityCardSummary, validateCommunityPost } from './community-card';

export default function CommunityScreen() {
  const router = useRouter();
  const { communities, posts, joined, user, totalJourneys, points, visitedIds, addPost, toggleLike, toggleCommunity, ready, storageError } = useApp();
  const wide = useWindowDimensions().width >= 1200;
  const [selected, setSelected] = useState('purple');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<MutationResult | null>(null);

  if (!ready || storageError) {
    return (
      <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ flexGrow: 1 }}>
        <Page>
          <Heading eyebrow="THE GOOD PART OF GETTING THERE" title="Your people. Your line." subtitle="Little discoveries, shared routines, and a city that feels a bit closer." />
          <Notice error={Boolean(storageError)}>{storageError || 'Loading community discussions…'}</Notice>
          {storageError ? (
            <Action label="Open profile for recovery options" secondary onPress={() => router.push('/profile')} />
          ) : null}
        </Page>
      </ScrollView>
    );
  }

  const community = communities.find(c => c.id === selected) ?? communities[0];
  const feed = posts.filter(p => p.communityId === selected);
  const draft = drafts[selected] ?? '';
  const color = selected === 'purple' ? theme.purple : selected === 'aqua' ? theme.aqua : theme.primary;
  const pale = selected === 'purple' ? theme.palePurple : selected === 'aqua' ? '#E9F6F7' : theme.paleMint;
  const disabled = !ready || !!storageError || pending !== null;
  const cardSummary = communityCardSummary({ totalJourneys, stationsCount: visitedIds.length, points });

  async function perform(key: string, action: () => Promise<MutationResult>) {
    if (pending) return null;
    setPending(key);
    setFeedback(null);
    try {
      const result = await action();
      setFeedback(result);
      return result;
    } catch {
      setFeedback({ ok: false, message: 'This action could not be completed. Your existing local data is unchanged.' });
      return null;
    } finally {
      setPending(null);
    }
  }

  async function publish() {
    const validation = validateCommunityPost(draft);
    if (!validation.ok || !validation.cleanBody) {
      setFeedback({ ok: false, message: validation.message ?? 'Write a post between 1 and 500 characters.' });
      return;
    }
    const result = await perform('post', () => addPost(selected, validation.cleanBody!));
    if (result?.ok) setDrafts(current => ({ ...current, [selected]: '' }));
  }

  async function shareCard() {
    if (pending) return;
    setPending('share');
    setFeedback(null);
    try {
      const result = await Share.share({ title: 'My MetroQuest commuter card', message: cardSummary });
      if (!result || result.action === Share.sharedAction) {
        setFeedback({ ok: true, message: 'Your commuter card was handed to the share dialog.' });
      } else if (result.action === Share.dismissedAction) {
        setFeedback({ ok: false, message: 'Sharing cancelled. Your commuter card remains private.' });
      }
    } catch {
      setFeedback({ ok: false, message: 'Sharing is unavailable here. Your card preview below is ready to copy or screenshot.' });
    } finally {
      setPending(null);
    }
  }

  return <ScrollView style={{ backgroundColor: theme.bg }} keyboardShouldPersistTaps="handled"><Page>
    <Heading eyebrow="THE GOOD PART OF GETTING THERE" title="Your people. Your line." subtitle="Little discoveries, shared routines, and a city that feels a bit closer." />
    <View style={local.routeCards}>
      {communities.map(c => {
        const active = c.id === selected;
        const ink = c.line === 'purple' ? theme.purple : c.line === 'aqua' ? theme.aqua : theme.primary;
        return <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Open ${c.title} discussion`} accessibilityState={{ selected: active, disabled: pending !== null }} disabled={pending !== null} onPress={() => { setSelected(c.id); setFeedback(null); }} style={({ pressed }) => [local.routeCard, { borderColor: active ? ink : theme.border, backgroundColor: active ? '#fff' : theme.bg, opacity: pressed ? 0.8 : 1 }]}>
          <View style={styles.row}><View style={[local.routeIcon, { backgroundColor: `${ink}15` }]}><Icon name={c.line ? 'navigation' : 'compass'} color={ink} /></View><View style={{ flex: 1 }}><Text style={local.routeTitle}>{c.title}</Text><Text style={styles.muted}>{joined.includes(c.id) ? 'Joined on this device' : 'Explore the conversation'}</Text></View><Icon name={active ? 'check-circle' : 'arrow-up-right'} size={17} color={ink} /></View>
          <Text style={[styles.muted, { marginTop: 14 }]}>{c.subtitle}</Text>
        </Pressable>;
      })}
    </View>
    <Card style={{ backgroundColor: theme.dark, borderColor: theme.dark, gap: 18, overflow: 'hidden' }}>
      <View style={[styles.row, { flexWrap: 'wrap', justifyContent: 'space-between' }]}><View style={{ gap: 8, flex: 1, minWidth: 180 }}><Pill text="LOCAL DEMO DISCUSSION" color="#3A3F44" ink="#F1F2F3" /><Text style={local.heroTitle}>{community.title}, together.</Text><Text style={{ color: '#D9DEE2', fontSize: 13, lineHeight: 21 }}>{community.subtitle}</Text></View><View style={{ minWidth: 150 }}><Action label={pending === 'join' ? 'Saving…' : joined.includes(selected) ? 'Joined · leave group' : 'Join this community'} secondary disabled={disabled} onPress={() => { void perform('join', () => toggleCommunity(selected)); }} icon={joined.includes(selected) ? 'check' : 'plus'} /></View></View>
      <View style={[styles.row, { gap: 0 }]}>{[0, 1, 2, 3].map((stop, index) => <React.Fragment key={stop}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: index === 3 ? '#FFFFFF' : color, borderWidth: 2, borderColor: '#FFFFFF' }} />{index < 3 ? <View style={{ height: 2, width: wide ? 68 : 38, backgroundColor: color }} /> : null}</React.Fragment>)}<Text style={{ flex: 1, marginLeft: 14, color: '#D9DEE2', fontSize: 11 }}>A conversation at every stop.</Text></View>
    </Card>
    <Notice>Local demo mode: sample profiles are fictional. Your posts, reactions and group preferences stay on this device. No other commuters are connected.</Notice>
    {storageError ? <Notice error>{storageError}</Notice> : null}
    {feedback ? <View accessibilityLiveRegion="polite"><Notice error={!feedback.ok}>{feedback.message}</Notice></View> : null}
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, width: '100%', gap: 14 }}>
        <SectionTitle aside={`${feed.length} local demo posts`}>The conversation</SectionTitle>
        <Card style={{ gap: 15 }}>
          <View style={styles.row}><View style={[local.avatar, { backgroundColor: theme.paleMint }]}><Text style={[local.initial, { color: theme.primary }]}>{user.name.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={local.author}>{user.name}</Text><Text style={styles.muted}>Posting locally in {community.title}</Text></View><Icon name="lock" size={16} color={theme.muted} /></View>
          <TextInput accessibilityLabel="Write a community post" accessibilityHint="Write 1 to 500 characters. This post stays on your device." value={draft} onChangeText={text => setDrafts(current => ({ ...current, [selected]: text }))} editable={!disabled} multiline textAlignVertical="top" maxLength={500} placeholder="A station tip, a small win, or just a hello…" placeholderTextColor={theme.muted} style={[styles.input, { minHeight: 112, lineHeight: 22 }]} />
          <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Text style={styles.muted}>{draft.length}/500 · local only</Text><Action label={pending === 'post' ? 'Saving post…' : 'Post locally'} disabled={disabled || !draft.trim() || draft.trim().length > 500} icon="send" onPress={() => { void publish(); }} /></View>
        </Card>
        {feed.length === 0 ? <Card style={{ gap: 10 }}><Icon name="message-circle" color={color} size={28} /><Text style={styles.section}>Start a little conversation.</Text><Text style={styles.body}>Share a helpful tip or celebrate your next metro milestone.</Text></Card> : feed.map(post => <Card key={post.id} style={{ gap: 16 }}>
          <View style={[styles.row, { alignItems: 'flex-start' }]}><View style={[local.avatar, { backgroundColor: post.sample ? pale : theme.paleMint }]}><Text style={[local.initial, { color: post.sample ? color : theme.primary }]}>{post.author.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={local.author}>{post.author}</Text><Text style={styles.muted}>{post.sample ? 'Sample conversation · fictional profile' : `Your local post · ${new Date(post.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}`}</Text></View><Icon name={post.sample ? 'message-circle' : 'lock'} size={16} color={theme.muted} /></View>
          <Text style={[styles.body, { lineHeight: 24 }]}>{post.body}</Text>
          <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><Pressable accessibilityRole="button" accessibilityLabel={`${post.liked ? 'Unlike' : 'Like'} post by ${post.author}`} accessibilityState={{ selected: post.liked, disabled }} disabled={disabled} onPress={() => { void perform(post.id, () => toggleLike(post.id)); }} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 10, flexDirection: 'row', gap: 8, alignItems: 'center', borderRadius: 10, backgroundColor: post.liked ? theme.paleMint : pressed ? theme.bg : 'transparent' })}><Icon name="heart" size={18} color={post.liked ? theme.primary : theme.muted} /><Text style={{ fontSize: 12, fontWeight: '700', color: post.liked ? theme.primary : theme.muted }}>{pending === post.id ? 'Saving…' : `${post.likes} ${post.liked ? '· Liked' : '· Like'}`}</Text></Pressable><Text style={[styles.muted, { fontSize: 10 }]}>{post.sample ? 'Sample reactions + yours locally' : 'Local reactions only'}</Text></View>
        </Card>)}
      </View>
      <View style={{ width: wide ? 270 : '100%', gap: 16, marginTop: wide ? 14 : 0 }}>
        <Card style={{ gap: 14, backgroundColor: pale, borderColor: pale }}><View style={styles.row}><Icon name="smile" color={color} /><Text style={styles.section}>Good company.</Text></View><Text style={styles.body}>A place for the small things that make commuting better.</Text><View style={{ gap: 10 }}>{['Share a useful station tip.', 'Celebrate a little milestone.', 'Be kind to a fellow commuter.'].map((tip, index) => <View key={tip} style={[styles.row, { alignItems: 'flex-start' }]}><Text style={{ color, fontWeight: '800', fontSize: 12 }}>{`0${index + 1}`}</Text><Text style={[styles.body, { flex: 1, fontSize: 12 }]}>{tip}</Text></View>)}</View><Text style={styles.muted}>{joined.length} {joined.length === 1 ? 'group' : 'groups'} joined on this device</Text></Card>
        <Card style={{ gap: 14 }}><View style={styles.row}><Icon name="shield" size={18} /><Text style={styles.section}>Keep it thoughtful.</Text></View><Text style={styles.muted}>Leave out exact travel times, home or work locations, ticket codes and other people’s private details. This demo has no live moderation.</Text></Card>
        <Card style={{ gap: 14 }}><View style={styles.row}><Icon name="share-2" size={18} /><Text style={styles.section}>Your commuter card</Text></View><View style={{ backgroundColor: theme.bg, borderRadius: 12, padding: 15, gap: 9 }}><Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary, letterSpacing: 1 }}>METROQUEST · PUNE</Text><Text style={{ color: theme.ink, fontSize: 25, fontWeight: '800' }}>{points} XP</Text><Text style={styles.muted}>{totalJourneys} self-reported rides · {visitedIds.length} stations collected</Text><Pill text="LOCAL DEMO" color={theme.paleMint} ink={theme.primary} /></View><Text style={styles.muted}>Share only these totals. No trip routes, dates or profile name are included.</Text><Action label={pending === 'share' ? 'Opening share…' : 'Share my card'} secondary disabled={disabled} icon="share-2" onPress={() => { void shareCard(); }} /></Card>
      </View>
    </View>
  </Page></ScrollView>;
}

const local = StyleSheet.create({
  routeCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  routeCard: { flex: 1, minWidth: 220, padding: 18, borderWidth: 1.5, borderRadius: 16 },
  routeIcon: { width: 37, height: 37, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  routeTitle: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.8, lineHeight: 35 },
  avatar: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  initial: { fontSize: 16, fontWeight: '800' },
  author: { color: theme.ink, fontSize: 13, fontWeight: '700', lineHeight: 20 },
});
