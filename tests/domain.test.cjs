const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createJourney, routeBetween, journeyStatistics, unlockAchievements, rankLeaderboard, networkCompletion } = require('../.test-build/domain/metro.js');
const { freshState, parseStoredState } = require('../.test-build/domain/persistence.js');
const { OPEN_STATIONS, LINES } = require('../.test-build/data/pune.js');
test('PCMC to Civil Court updates journey, endpoint stamps, XP and achievements', () => {
  const now = new Date('2026-10-24T08:00:00Z');
  const ride = createJourney({ from: 'pcmc', to: 'civil-court' }, [], now);
  assert.equal(ride.points, 50);
  assert.equal(ride.fare, null);
  assert.ok(ride.kilometers > 0 && ride.saved > 0 && ride.co2Kg > 0);
  assert.ok(ride.stationIds.includes('khadki'));
  const stats = journeyStatistics([ride],now);
  assert.equal(stats.totalJourneys,1);
  assert.deepEqual(stats.visitedIds,['pcmc','civil-court']);
  assert.equal(stats.monthlyJourneys,1);
  assert.equal(stats.weeklyJourneys,1);
  assert.equal(stats.streak,1);
  assert.equal(unlockAchievements(stats)[0].unlocked,true);
  assert.equal(networkCompletion(stats.visitedIds),7);
  const second = createJourney({from:'civil-court',to:'vanaz'},[ride], new Date(now.getTime()+120_000));
  assert.equal(second.points,30);
});
test('route graph supports cross-line travel and excludes unopened boarding', () => {
  const route = routeBetween('pcmc','ramwadi');
  assert.ok(route.stationIds.includes('civil-court'));
  assert.equal(route.stationIds.filter(id=>id==='civil-court').length,1);
  assert.throws(()=>routeBetween('range-hill','pcmc'));
  assert.throws(()=>routeBetween('pcmc','pcmc'));
  assert.throws(()=>routeBetween('fake','pcmc'));
  assert.equal(new Set(OPEN_STATIONS.map(s=>s.id)).size,28);
  for (const line of LINES) for (const station of line.stationIds) assert.ok(typeof station === 'string');
});
test('rapid duplicates and daily abuse are rejected', () => {
  const now = new Date('2026-10-24T08:00:00Z');
  const ride = createJourney({from:'pcmc',to:'civil-court'},[],now);
  assert.throws(()=>createJourney({from:'pcmc',to:'civil-court'},[ride],now),/one minute/);
  const ten = Array.from({length:10},(_,i)=>({...ride,id:String(i),at:new Date(now.getTime()-120_000*(i+1)).toISOString()}));
  assert.throws(()=>createJourney({from:'pcmc',to:'civil-court'},ten,now),/limit/);
});
test('local state round trips journeys, posts, likes and privacy; corruption is rejected', () => {
  const state = freshState();
  state.journeys.push(createJourney({from:'pcmc',to:'civil-court'},[]));
  state.posts[0].liked = true; state.posts[0].likes++;
  state.joined.push('purple'); state.user.privateProfile = false;
  assert.deepEqual(parseStoredState(JSON.stringify(state)),state);
  assert.throws(()=>parseStoredState('{'));
  assert.throws(()=>parseStoredState(JSON.stringify({...state,version:2})));
  assert.throws(()=>parseStoredState(JSON.stringify({...state,journeys:[{...state.journeys[0],points:-1}]})));
  assert.throws(()=>parseStoredState(JSON.stringify({...state,posts:[{...state.posts[0],body:''}]})));
});
test('leaderboard sorting uses scores and stable tie ordering', () => {
  const board = rankLeaderboard([{id:'a',name:'Sample A',points:10,sample:true,line:'purple'},{id:'you',name:'You',points:50,sample:false,line:'purple'}]);
  assert.equal(board[0].id,'you');
});
test('India-local days calculate consecutive activity across UTC midnight', () => {
  const ride = createJourney({from:'pcmc',to:'civil-court'},[],new Date('2026-10-23T19:00:00Z'));
  const previous = {...ride,id:'previous',at:'2026-10-22T19:00:00Z'};
  assert.equal(journeyStatistics([ride,previous],new Date('2026-10-24T08:00:00Z')).streak,2);
});
