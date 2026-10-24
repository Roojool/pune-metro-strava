import { Text } from '@/components/Typography';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { useApp } from '@/state/AppState';
import { Action, Card, Heading, Page, Pill, SectionTitle, Icon, Progress, Notice, styles } from '@/components/UI';
import { leaderboardScore } from '@/domain/metro';
import { LINES, getStationName } from '@/data/pune';
import type { LineId } from '@/domain/models';
import { theme } from '@/theme';
import type { LeagueScope, ScoringMetric } from './types';
import {
  calculateBurnSummary,
  calculateLevelProgress,
  calculateRivalMatchup,
  calculateUserEntry,
  getEnrichedSampleLeague,
  rankByMetric,
} from './scoring';
import { WhoBurnedMoreCard } from './WhoBurnedMoreCard';
import { calculatePuneMilestoneProgress, getTopBurnCorridors } from './puneBurnEquivalents';
import { PuneMilestonesCard } from './PuneMilestonesCard';
import { filterJourneysByLine, getLineEmptyStateGuidance, sanitizeParticipantName } from './edgeCases';
import { CorridorBurnCard } from './CorridorBurnCard';
import { generateLeagueShareSummary, handleLeagueShareResult } from './share';
import { DivisionZoneCard } from './DivisionZoneCard';
import { RivalDuelCard } from './RivalDuelCard';
import { calculateDivisionStanding } from './divisions';
import { calculateRivalDuelDetail } from './rivalDuel';
import { calculateHabitMultiplier } from './habitScoring';
import { WeekendChallengeCard } from './WeekendChallengeCard';
import { PersonalBestsCard } from './PersonalBestsCard';
import { calculateWeekendChallenges } from './weekendChallenges';
import { calculatePersonalBests } from './personalBests';
import { StationBurnHeatmapCard } from './StationBurnHeatmapCard';
import { calculateStationDensity } from './stationDensity';
import { LeagueBadgesCard } from './LeagueBadgesCard';
import { calculateLeagueBadges } from './leagueBadges';
import { WeeklyConsistencyCard } from './WeeklyConsistencyCard';
import { calculateWeeklyConsistency } from './weeklyConsistency';
import { CleanAirSavingsCard } from './CleanAirSavingsCard';
import { calculateCleanAirMetrics } from './cleanAirSavings';
import { VerticalAscentCard } from './VerticalAscentCard';
import { calculateVerticalAscent } from './verticalAscent';
import { MonthlyHabitMatrixCard } from './MonthlyHabitMatrixCard';
import { calculateMonthlyHabitMatrix } from './monthlyHabitMatrix';
import { BurnPaceEfficiencyCard } from './BurnPaceEfficiencyCard';
import { calculateBurnPaceEfficiency } from './burnPaceEfficiency';
import { PuneReplenishCard } from './PuneReplenishCard';
import { calculatePuneReplenish } from './puneReplenish';
import { StreakShieldCard } from './StreakShieldCard';
import { calculateStreakShield } from './streakShield';
import { EcoCertificateCard } from './EcoCertificateCard';
import { generateEcoCertificate } from './ecoCertificate';
import { ConcourseStepsCard } from './ConcourseStepsCard';
import { calculateConcourseSteps } from './concourseSteps';

const ACTIVITY_ORANGE = '#00CD6B';
const ACTIVITY_INK = '#00CD6B'; // Readable orange text on the tinted activity cards.

function LabeledProgress({ label, value, valueText }: { label: string; value: number; valueText: string }) {
  const percent = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: valueText }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={valueText}
    >
      <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Progress value={percent} color={ACTIVITY_ORANGE} />
      </View>
    </View>
  );
}

export default function LeaguesScreen() {
  const router = useRouter();
  const { points, achievements, challenges, journeys, user, streak, activeDays, ready, storageError } = useApp();
  const [scope, setScope] = useState<LeagueScope>('Pune');
  const [line, setLine] = useState<LineId>('purple');
  const [metric, setMetric] = useState<ScoringMetric>('xp');
  const [showXpDetails, setShowXpDetails] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const wide = useWindowDimensions().width >= 1180;

  if (!ready || storageError) {
    return (
      <ScrollView style={{ backgroundColor: theme.bg }}>
        <Page>
          <Heading title="Your leagues" subtitle="Local, self-reported progress and sample competition." />
          <Notice error={!!storageError}>
            {storageError ?? <Text style={{ color: theme.ink }}>Loading your saved XP, achievements and leagues…</Text>}
          </Notice>
          {storageError ? (
            <Action label="Open profile for recovery options" secondary onPress={() => router.push('/profile')} />
          ) : null}
        </Page>
      </ScrollView>
    );
  }

  const selectedLine = LINES.find(l => l.id === line)!;
  const routeJourneys = filterJourneysByLine(journeys, line);
  const relevantJourneys = scope === 'Route' ? routeJourneys : journeys;
  const currentScore = scope === 'Route' ? leaderboardScore(routeJourneys) : points;
  const lineGuidance = getLineEmptyStateGuidance(line);

  // Enriched sample competitors with active burn and eco metrics
  const allSampleEntries = getEnrichedSampleLeague();
  const samples =
    scope === 'Friends'
      ? allSampleEntries.slice(0, 3)
      : scope === 'Route'
      ? allSampleEntries.filter(e => e.line === line)
      : allSampleEntries;

  const displayName = user.name.trim() ? sanitizeParticipantName(user.name) : 'You';
  const current = calculateUserEntry(displayName, currentScore, relevantJourneys, line);
  const board = rankByMetric([...samples, current], metric);
  const rank = board.findIndex(e => e.id === 'you') + 1;
  const unlocked = achievements.filter(a => a.unlocked).length;
  const latestJourney = journeys[0];
  const leagueTitle = scope === 'Route' ? `${selectedLine.name} league` : scope === 'Friends' ? 'Friends preview' : 'Pune explorers';

  const burnSummary = calculateBurnSummary(relevantJourneys);
  const puneMilestoneProgress = calculatePuneMilestoneProgress(burnSummary.calories);
  const rivalMatchup = calculateRivalMatchup(current, board, metric);
  const levelProgress = calculateLevelProgress(points);
  const topCorridors = getTopBurnCorridors(relevantJourneys);
  const divisionStanding = calculateDivisionStanding(rank, board.length, board, metric, points);
  const rivalDuel = calculateRivalDuelDetail(current, board, metric);
  const habitInfo = calculateHabitMultiplier(streak);
  const weekendChallenges = calculateWeekendChallenges(relevantJourneys);
  const personalBests = calculatePersonalBests(journeys);
  const stationDensity = calculateStationDensity(relevantJourneys, scope === 'Route' ? line : undefined);
  const leagueBadges = calculateLeagueBadges(journeys);
  const weeklyConsistency = calculateWeeklyConsistency(relevantJourneys);
  const cleanAirMetrics = calculateCleanAirMetrics(relevantJourneys);
  const verticalAscent = calculateVerticalAscent(relevantJourneys);
  const monthlyHabitMatrix = calculateMonthlyHabitMatrix(relevantJourneys);
  const burnPaceEfficiency = calculateBurnPaceEfficiency(relevantJourneys);
  const puneReplenish = calculatePuneReplenish(relevantJourneys);
  const streakShield = calculateStreakShield(journeys, streak);
  const ecoCertificate = generateEcoCertificate(relevantJourneys, user.name);
  const concourseSteps = calculateConcourseSteps(relevantJourneys);

  const handleShareCertificate = async (text: string) => {
    try {
      if (Platform.OS !== 'web' || (typeof navigator !== 'undefined' && typeof navigator.share === 'function')) {
        await Share.share({ title: 'My Pune Metro Clean Air Certificate', message: text });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareNotice('Certificate copied to clipboard!');
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.bg }}>
      <Page>
        <View style={{ gap: 8 }}>
          <Text style={[styles.eyebrow, { color: ACTIVITY_INK }]}>YOUR EVERYDAY METRO PROGRESS</Text>
          <Heading
            title="Make Pune Metro a habit."
            subtitle="Turn the rides you take around Pune into local XP, active exercise, and one small weekly goal."
          />
        </View>

        {journeys.length === 0 ? (
          <Card style={{ gap: 12 }}>
            <Text accessibilityRole="header" style={styles.section}>Your first ride starts here.</Text>
            <Text style={styles.body}>
              Manually record a metro journey to start earning XP, collect endpoint stations, burn active calories and join the sample leagues.
            </Text>
            <Action label="Log your first ride" icon="plus" onPress={() => router.push('/log')} />
          </Card>
        ) : null}

        {/* Top 2 Cards: Level Explorer + Habit Rhythm */}
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 18 }}>
          <Card style={{ flex: wide ? 1 : undefined, backgroundColor: theme.dark, borderColor: theme.dark, gap: 18 }}>
            <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
              <Pill text={`LEVEL ${levelProgress.level} EXPLORER`} color="#173A26" ink="#B4F5D0" />
              <Icon name="zap" size={26} color="#00CD6B" />
            </View>
            <Text style={{ fontSize: 54, fontWeight: '800', letterSpacing: -2, color: '#fff' }}>
              {points}
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#BCD5C7' }}> XP</Text>
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 22, color: '#D9DEE2' }}>
              {levelProgress.title} · Every journey is progress. Every new station is a little discovery.
            </Text>
            <LabeledProgress
              label="Explorer level progress"
              value={levelProgress.percent}
              valueText={`${levelProgress.progressInLevel} of 100 XP toward level ${levelProgress.nextLevel}`}
            />
            <Text style={{ fontSize: 12, color: '#D1C7C3' }}>
              {levelProgress.xpToNextLevel} XP to level {levelProgress.nextLevel}
            </Text>
            <View style={{ gap: 8 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="How XP works"
                accessibilityState={Platform.OS === 'web' ? undefined : { expanded: showXpDetails }}
                aria-expanded={Platform.OS === 'web' ? showXpDetails : undefined}
                onPress={() => setShowXpDetails(value => !value)}
                style={({ pressed }) => ({
                  minHeight: 48,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: '#8A929A',
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  backgroundColor: pressed ? '#3E454D' : 'transparent',
                })}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF', flexShrink: 1 }}>How XP works</Text>
                <Icon name={showXpDetails ? 'chevron-up' : 'chevron-down'} size={18} color="#FFFFFF" />
              </Pressable>
              {showXpDetails ? (
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, lineHeight: 20, color: '#FFFFFF' }}>
                    10 XP per ride + 20 XP per new endpoint.
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 19, color: '#D9DEE2' }}>
                    An endpoint is where you board or exit. Each station earns its bonus only on your first logged visit; passing through does not count.
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 19, color: '#D9DEE2' }}>
                    Who Burned More: Active commute calories are calculated from station stairs, platform walks (~45 kcal baseline) and transit stabilization (~12 kcal/km).
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 19, color: '#D9DEE2' }}>
                    Rides and XP are self-reported, not independently verified.
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>

          <Card style={{ flex: wide ? 1 : undefined, gap: 18 }}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: '#302019' }]}>
                <Icon name="sun" color="#FFC6B0" />
              </View>
              <Text style={[styles.section, { flexShrink: 1 }]}>Keep your rhythm.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={styles.statValue}>
                  {streak}
                  <Text style={{ fontSize: 13, fontWeight: '500' }}> {streak === 1 ? 'day' : 'days'}</Text>
                </Text>
                <Text style={styles.muted}>Current streak</Text>
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={styles.statValue}>{activeDays}</Text>
                <Text style={styles.muted}>Active days, all time</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Pill
                text={habitInfo.bonusPercentageText}
                color={habitInfo.effectiveMultiplier > 1 ? '#173A26' : theme.surface}
                ink={habitInfo.effectiveMultiplier > 1 ? '#B4F5D0' : theme.muted}
              />
              {habitInfo.isWeekend ? (
                <Pill text="WEEKEND ECO BONUS" color="#1F2A1E" ink="#78D692" />
              ) : null}
            </View>
            <Text style={styles.muted}>Streak uses India calendar days. {habitInfo.fairPlayNotice}</Text>
            <View style={{ height: 1, backgroundColor: theme.border }} />
            {latestJourney ? (
              <View style={{ gap: 12 }}>
                <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                  <Text style={[styles.eyebrow, { color: ACTIVITY_INK, flexShrink: 1 }]}>LATEST RIDE · SELF-REPORTED</Text>
                  <Pill text={`+${latestJourney.points} XP`} color={theme.paleMint} ink={ACTIVITY_INK} />
                </View>
                <Text style={[styles.body, { fontWeight: '700' }]}>
                  {getStationName(latestJourney.from)} → {getStationName(latestJourney.to)}
                </Text>
                <Text style={styles.muted}>This ride’s XP is included in your total. Only boarding and exit stations count toward your Passport.</Text>
                <Action label="View my Passport" secondary icon="map" onPress={() => router.push('/passport')} />
              </View>
            ) : (
              <Text style={styles.body}>An errand, a visit or your usual trip: log the Pune Metro rides you actually take.</Text>
            )}
          </Card>
        </View>

        {/* Strava-Style Showcase: Who Burned More? */}
        <WhoBurnedMoreCard
          summary={burnSummary}
          rivalMatchup={rivalMatchup}
          metric={metric}
          onLogRide={() => router.push('/log')}
        />

        {/* Head-to-Head Rival Duel */}
        {rivalDuel ? <RivalDuelCard duel={rivalDuel} /> : null}

        {/* Authentic Pune Cultural Burn Milestones */}
        <PuneMilestonesCard
          progress={puneMilestoneProgress}
          totalCalories={burnSummary.calories}
        />

        {/* All-Time Personal Bests & Commuter Records */}
        <PersonalBestsCard summary={personalBests} />

        {/* Weekly Transit Rhythm & Consistency Profile */}
        <WeeklyConsistencyCard profile={weeklyConsistency} />

        {/* Pune Metro Commuter Mastery Badges */}
        <LeagueBadgesCard summary={leagueBadges} />

        {/* Pune Clean Air Initiative & Eco Savings */}
        <CleanAirSavingsCard metrics={cleanAirMetrics} />

        {/* Station Concourse Vertical Climb */}
        <VerticalAscentCard summary={verticalAscent} />

        {/* Monthly Calendar Habit Matrix */}
        <MonthlyHabitMatrixCard summary={monthlyHabitMatrix} />

        {/* Commute Pace & Burn Rate Efficiency */}
        <BurnPaceEfficiencyCard summary={burnPaceEfficiency} />

        {/* Post-Burn Hydration & Food Replenish */}
        <PuneReplenishCard summary={puneReplenish} />

        {/* Commuter Streak Shield & Rest Day Protection */}
        <StreakShieldCard summary={streakShield} />

        {/* Clean Air Commuter Sustainability Certificate */}
        <EcoCertificateCard certificate={ecoCertificate} onShare={handleShareCertificate} />

        {/* Station Concourse Physical Pedometer Steps */}
        <ConcourseStepsCard summary={concourseSteps} />

        {/* Milestone Celebration Banner */}
        {unlocked > 0 ? (
          <View
            accessibilityLiveRegion="polite"
            style={{
              backgroundColor: theme.paleMint,
              padding: 18,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: ACTIVITY_ORANGE,
              flexDirection: 'row',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <Icon name="award" size={27} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: theme.ink }}>A milestone worth celebrating.</Text>
              <Text style={styles.body}>
                Unlocked: {achievements.filter(a => a.unlocked).map(a => a.title).join(' · ')}
              </Text>
              <Text style={[styles.muted, { color: theme.ink }]}>
                {unlocked} {unlocked === 1 ? 'achievement' : 'achievements'} currently unlocked from your self-reported rides. Keep exploring.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Leaderboard + Weekly Challenges Grid */}
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20, alignItems: 'stretch' }}>
          <View style={{ flex: 1.35, gap: 14 }}>
            <View style={{ gap: 4 }}>
              <SectionTitle>A little friendly competition</SectionTitle>
              <Text style={[styles.muted, { color: theme.ink }]}>ALL-TIME · SAMPLE LEAGUE</Text>
            </View>

            {/* Scope Switcher: Pune / Friends / Route */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, padding: 5, backgroundColor: '#1C211E', borderRadius: 13 }}>
              {(['Pune', 'Friends', 'Route'] as LeagueScope[]).map(item => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`${item} sample demo league`}
                  accessibilityState={Platform.OS === 'web' ? undefined : { selected: scope === item }}
                  aria-pressed={Platform.OS === 'web' ? scope === item : undefined}
                  onPress={() => setScope(item)}
                  style={({ pressed }) => ({
                    flex: 1,
                    minWidth: 72,
                    minHeight: 48,
                    paddingHorizontal: 8,
                    paddingVertical: 10,
                    gap: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 9,
                    borderBottomWidth: 3,
                    borderBottomColor: scope === item ? ACTIVITY_INK : 'transparent',
                    backgroundColor: scope === item ? theme.surface : pressed ? '#242925' : 'transparent',
                  })}
                >
                  <Text style={{ fontWeight: '700', fontSize: 13, color: scope === item ? ACTIVITY_INK : theme.ink }}>{item}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: theme.ink }}>LEAGUE</Text>
                </Pressable>
              ))}
            </View>

            {/* Line Switcher when scope is Route */}
            {scope === 'Route' ? (
              <View style={[styles.row, { flexWrap: 'wrap' }]}>
                {LINES.map(l => (
                  <Pressable
                    key={l.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${l.name} sample demo league`}
                    accessibilityState={Platform.OS === 'web' ? undefined : { selected: line === l.id }}
                    aria-pressed={Platform.OS === 'web' ? line === l.id : undefined}
                    onPress={() => setLine(l.id)}
                    style={({ pressed }) => ({
                      minHeight: 48,
                      flexGrow: 1,
                      flexBasis: 140,
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: line === l.id ? l.color : theme.border,
                      flexDirection: 'row',
                      gap: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: line === l.id ? (l.id === 'purple' ? theme.palePurple : '#122A30') : pressed ? '#1C211E' : theme.surface,
                    })}
                  >
                    {line === l.id ? <Icon name="check" size={16} color={theme.ink} /> : null}
                    <Text style={{ flexShrink: 1, color: theme.ink, fontWeight: '700', fontSize: 13 }}>{l.name}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {/* Metric Selector Tabs: XP / Calories (Who Burned More) / CO2 Saved */}
            <View
              accessible
              accessibilityRole="tablist"
              accessibilityLabel="Leaderboard scoring metric"
              style={{
                flexDirection: 'row',
                gap: 6,
                backgroundColor: '#111513',
                padding: 4,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#232A25',
              }}
            >
              {[
                { id: 'xp' as ScoringMetric, label: 'XP Points', icon: 'zap' as const },
                { id: 'calories' as ScoringMetric, label: '🔥 Calories', icon: 'activity' as const },
                { id: 'eco' as ScoringMetric, label: '🌿 CO₂ Saved', icon: 'wind' as const },
              ].map(tab => {
                const active = metric === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="tab"
                    accessibilityLabel={`Rank by ${tab.label}`}
                    accessibilityState={{ selected: active }}
                    aria-selected={active}
                    onPress={() => setMetric(tab.id)}
                    style={({ pressed }) => ({
                      flex: 1,
                      minHeight: 48,
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      borderRadius: 8,
                      backgroundColor: active ? '#1A2920' : pressed ? '#181E1A' : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? ACTIVITY_INK : 'transparent',
                    })}
                  >
                    <Icon name={tab.icon} size={14} color={active ? ACTIVITY_INK : '#8A928D'} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : '#A8ABA9' }}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Division Tier & Promotion/Relegation Cutoffs */}
            <DivisionZoneCard standing={divisionStanding} />

            {/* Main Leaderboard Table Card */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={{ padding: 20, gap: 5, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                  <Text accessibilityRole="header" style={[styles.section, { flexShrink: 1 }]}>
                    {leagueTitle}
                  </Text>
                  <Pill text="SAMPLE LEAGUE" ink="#AD79FF" />
                </View>
                <Text style={styles.muted}>
                  You + {samples.length} fictional profiles · ranked by {metric === 'calories' ? 'active commute burn' : metric === 'eco' ? 'CO₂ saved' : 'XP'}
                </Text>
              </View>

              {board.map((entry, i) => {
                const isYou = entry.id === 'you';
                const scoreDisplay =
                  metric === 'calories'
                    ? `${entry.caloriesBurned} kcal`
                    : metric === 'eco'
                    ? `${entry.co2SavedKg} kg`
                    : `${entry.points} XP`;

                const a11yEntryLabel = Platform.OS !== 'web'
                  ? `Position ${i + 1}, ${entry.name}${isYou ? ', you' : ''}, ${scoreDisplay}. ${entry.sample ? 'Fictional sample profile' : 'Your local, self-reported score'}.`
                  : undefined;

                return (
                  <View
                    key={entry.id}
                    accessible={Platform.OS !== 'web'}
                    accessibilityLabel={a11yEntryLabel}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingHorizontal: 18,
                      paddingVertical: 16,
                      backgroundColor: isYou ? theme.paleMint : theme.surface,
                      borderBottomColor: theme.border,
                      borderBottomWidth: i < board.length - 1 ? 1 : 0,
                    }}
                  >
                    <Text
                      style={{
                        width: 25,
                        fontWeight: '700',
                        fontSize: 14,
                        color: isYou ? ACTIVITY_INK : i < 3 ? ACTIVITY_INK : theme.muted,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </Text>

                    <View
                      style={{
                        width: 37,
                        height: 37,
                        borderRadius: 13,
                        backgroundColor: isYou ? '#173A26' : i % 2 ? theme.palePurple : '#242925',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isYou ? ACTIVITY_INK : theme.ink }}>
                        {Array.from(entry.name.trim())[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>
                        {entry.name}{isYou ? ' · you' : ''}
                      </Text>
                      <Text style={{ fontSize: 12, lineHeight: 18, color: isYou ? theme.ink : theme.muted }}>
                        {entry.sample
                          ? 'SAMPLE · Fictional profile'
                          : scope === 'Route'
                          ? 'Your self-reported route score'
                          : 'Your local, self-reported score'}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      {metric === 'calories' ? (
                        <Text style={{ fontWeight: '800', fontSize: 15, color: theme.ink }}>
                          {entry.caloriesBurned}
                          <Text style={{ fontSize: 10, fontWeight: '500' }}> kcal</Text>
                        </Text>
                      ) : metric === 'eco' ? (
                        <Text style={{ fontWeight: '800', fontSize: 15, color: theme.ink }}>
                          {entry.co2SavedKg}
                          <Text style={{ fontSize: 10, fontWeight: '500' }}> kg</Text>
                        </Text>
                      ) : (
                        <Text style={{ fontWeight: '800', fontSize: 15, color: theme.ink }}>
                          {entry.points}
                          <Text style={{ fontSize: 10, fontWeight: '500' }}> XP</Text>
                        </Text>
                      )}
                      <Text style={{ fontSize: 10, color: theme.muted }}>
                        {entry.ridesCount} {entry.ridesCount === 1 ? 'ride' : 'rides'}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <View style={{ padding: 16, backgroundColor: theme.bg, gap: 8 }}>
                <Text accessibilityLiveRegion="polite" style={[styles.body, { fontWeight: '700' }]}>
                  Your position: #{rank} of {board.length} · {currentScore} XP · {leagueTitle}.
                </Text>
                {scope === 'Route' && routeJourneys.length === 0 ? (
                  <View style={{ gap: 6, backgroundColor: '#17221A', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#233829' }}>
                    <Text style={styles.body}>
                      No rides on {selectedLine.name} yet. Log a journey using at least one segment of this line to start your route score.
                    </Text>
                    <Text style={[styles.muted, { color: '#BCD5C7' }]}>
                      {lineGuidance.guidance}
                    </Text>
                    <Text style={[styles.muted, { color: ACTIVITY_INK, fontWeight: '700' }]}>
                      Key stations: {lineGuidance.suggestedStations.join(' · ')}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.muted}>
                  {scope === 'Route'
                    ? 'Route scores include the full XP of rides using at least one segment of this line. A transfer ride can count in both route leagues; your total XP is counted only once.'
                    : 'Sample scores are fixed; your score updates with each eligible local ride.'}
                </Text>
                <Text style={styles.muted}>Equal scores are ordered by secondary performance and name.</Text>
                <Action
                  label={isSharing ? 'Opening share options…' : 'Share my league standing'}
                  secondary
                  icon="share-2"
                  disabled={isSharing}
                  onPress={async () => {
                    setIsSharing(true);
                    const summary = generateLeagueShareSummary({
                      rank,
                      totalParticipants: board.length,
                      leagueTitle,
                      points: currentScore,
                      caloriesBurned: burnSummary.calories,
                      level: levelProgress.level,
                      milestoneName: puneMilestoneProgress.currentMilestone.name,
                      isZeroState: relevantJourneys.length === 0,
                    });
                    try {
                      if (Platform.OS !== 'web' || (typeof navigator !== 'undefined' && typeof navigator.share === 'function')) {
                        const rawResult = await Share.share({ title: 'My MetroQuest Pune Leagues Card', message: summary });
                        const feedback = handleLeagueShareResult(rawResult);
                        setShareNotice(feedback.message);
                      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        await navigator.clipboard.writeText(summary);
                        setShareNotice('Summary copied to clipboard!');
                      } else {
                        setShareNotice('Sharing is not supported on this platform.');
                      }
                    } catch {
                      setShareNotice('Sharing was cancelled.');
                    } finally {
                      setIsSharing(false);
                    }
                  }}
                />
                {shareNotice ? <Notice>{shareNotice}</Notice> : null}
              </View>
            </Card>
          </View>

          {/* Right Column: Weekly Challenge + Fair Play */}
          <View style={{ flex: 1, gap: 14 }}>
            <SectionTitle>One week. One small goal.</SectionTitle>
            {challenges.map(c => {
              const complete = c.progress >= c.target;
              const remaining = Math.max(0, c.target - c.progress);
              return (
                <Card key={c.id} style={{ gap: 16 }}>
                  <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                    <View style={[styles.iconBox, { backgroundColor: theme.palePurple }]}>
                      <Icon name="target" color={theme.purple} />
                    </View>
                    <Pill text={complete ? 'COMPLETED' : 'ROLLING 7 DAYS'} color={theme.paleMint} ink={ACTIVITY_INK} />
                  </View>
                  <Text style={styles.section}>{c.title}</Text>
                  <Text style={styles.body}>{c.description}</Text>
                  <LabeledProgress
                    label={`${c.title} progress`}
                    value={(c.progress / c.target) * 100}
                    valueText={`${c.progress} of ${c.target} rides in the last 7 days`}
                  />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: ACTIVITY_INK }}>
                    {c.progress} / {c.target} rides{complete ? ' · Nicely done!' : ''}
                  </Text>
                  <Text style={styles.body}>
                    {complete
                      ? 'Goal reached for this rolling window. Explore the local demo communities for your metro line.'
                      : `${remaining} more ${remaining === 1 ? 'ride' : 'rides'} to reach your goal. Log a journey after you take it.`}
                  </Text>
                  <Text style={styles.muted}>
                    Your self-reported rides on this device count. Progress can decrease as rides leave the last 7 days.
                  </Text>
                  <Action
                    label={complete ? 'Explore route communities' : 'Log a completed ride'}
                    icon={complete ? 'users' : 'plus'}
                    onPress={() => router.push(complete ? '/community' : '/log')}
                  />
                </Card>
              );
            })}

            {/* Weekend Pune Metro Transit Missions */}
            <WeekendChallengeCard challenges={weekendChallenges} />

            {/* Top Pune Metro Corridor Active Burn */}
            <CorridorBurnCard corridors={topCorridors} />

            {/* Station Exertion & Stair Climb Heatmap */}
            <StationBurnHeatmapCard summary={stationDensity} />

            <Card style={{ gap: 12, backgroundColor: '#261E1B', borderColor: '#4D3730' }}>
              <Icon name="shield" color="#FFC6B0" />
              <Text style={styles.section}>Play fair. Ride for yourself.</Text>
              <Text style={styles.muted}>
                Manually log rides between different open stations. Wait 1 minute between logs, with a limit of 10 rides per UTC day (reset at 5:30 AM IST). XP is self-reported, not independently verified or tamper-proof.
              </Text>
            </Card>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={{ gap: 4 }}>
          <SectionTitle>The little wins collection</SectionTitle>
          <Text style={styles.muted}>{unlocked} OF {achievements.length} UNLOCKED</Text>
          <Text style={styles.muted}>Based on current activity. The three-day streak badge locks again when your streak breaks.</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {achievements.map(a => (
            <Card
              key={a.id}
              style={{
                flex: 1,
                minWidth: 180,
                gap: 13,
                backgroundColor: a.unlocked ? '#14281B' : theme.surface,
                borderColor: a.unlocked ? '#28583C' : theme.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: a.unlocked ? '#173A26' : theme.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={a.unlocked ? 'award' : 'lock'} size={24} color={a.unlocked ? ACTIVITY_INK : '#626A72'} />
              </View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: theme.ink }}>{a.title}</Text>
              <Text style={styles.muted}>{a.description}</Text>
              <Text style={{ fontWeight: '700', fontSize: 10, letterSpacing: 1, color: a.unlocked ? ACTIVITY_INK : theme.muted }}>
                {a.unlocked ? 'UNLOCKED' : 'TO DISCOVER'}
              </Text>
            </Card>
          ))}
        </View>

        <Text style={styles.muted}>Sample league · your progress is saved on this device.</Text>
      </Page>
    </ScrollView>
  );
}
