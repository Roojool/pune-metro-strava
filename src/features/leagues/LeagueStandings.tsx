import React from 'react';
import { Platform, View } from 'react-native';
import { Text } from '@/components/Typography';
import type { LeaderboardEntry } from '@/domain/models';
import { theme } from '@/theme';
import { standingLabel } from './standingsModel';

export function LeagueStandings({ board, title, route }: {
  board: LeaderboardEntry[]; title: string; route: boolean;
}) {
  return <View role={Platform.OS === 'web' ? 'list' : undefined}
    accessibilityLabel={Platform.OS === 'web' ? `${title} sample standings` : undefined}>
    {board.map((entry, index) => {
      const yours = !entry.sample;
      return <View key={entry.id} role={Platform.OS === 'web' ? 'listitem' : undefined}
        accessible={Platform.OS !== 'web'}
        accessibilityLabel={standingLabel(entry, index + 1, board.length)}
        style={{ backgroundColor: yours ? theme.paleMint : theme.surface,
          borderBottomColor: theme.border, borderBottomWidth: index < board.length - 1 ? 1 : 0 }}>
        {/* The row label includes every visible value; omit decorative initials and repeated text. */}
        <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 16 }}>
          <Text style={{ width: 25, flexShrink: 0, fontWeight: '700', fontSize: 14,
            color: yours || index < 3 ? theme.primary : theme.muted }}>{String(index + 1).padStart(2, '0')}</Text>
          <View style={{ width: 37, height: 37, flexShrink: 0, borderRadius: 13,
            backgroundColor: yours ? '#173A26' : index % 2 ? theme.palePurple : '#242925',
            alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: yours ? theme.primary : theme.ink }}>
              {Array.from(entry.name.trim())[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 12, rowGap: 4 }}>
              <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: 120, minWidth: 0,
                fontSize: 14, fontWeight: '700', color: theme.ink }}>{entry.name}{yours ? ' · you' : ''}</Text>
              <Text style={{ maxWidth: '100%', fontWeight: '800', fontSize: 15, color: theme.ink }}>
                {entry.points}<Text style={{ fontSize: 10, fontWeight: '500' }}> XP</Text>
              </Text>
            </View>
            <Text style={{ fontSize: 12, lineHeight: 18, color: yours ? theme.ink : theme.muted }}>
              {entry.sample ? 'SAMPLE · Fictional profile' : route ? 'Your self-reported route score' : 'Your local, self-reported score'}
            </Text>
          </View>
        </View>
      </View>;
    })}
  </View>;
}
