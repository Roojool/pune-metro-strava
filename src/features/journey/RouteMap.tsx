import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { LINES, getStationName } from '@/data/pune';

const ORANGE = '#FC4C02';
const points = new Map<string, { x: number; y: number }>();
for (const line of LINES) {
  const interchange = line.stationIds.indexOf('civil-court');
  line.stationIds.forEach((id, index) => {
    if (line.id === 'purple') points.set(id, { x: 180, y: index <= interchange ? 24 + index * 15.6 : 180 + (index - interchange) * 21 });
    else points.set(id, { x: index <= interchange ? 16 + index * 20.5 : 180 + (index - interchange) * 21.4, y: 180 });
  });
}
const pathPoints = (stationIds: string[]) => stationIds.map(id => points.get(id)).filter((point): point is { x: number; y: number } => Boolean(point)).map(point => `${point.x},${point.y}`).join(' ');

export default function RouteMap({ stationIds }: { stationIds: string[] }) {
  const from = stationIds[0];
  const to = stationIds[stationIds.length - 1];
  return <View style={{ gap: 8, width: '100%' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Text style={{ fontSize: 10, letterSpacing: 1.3, fontWeight: '700', color: '#B8C2C8' }}>PUNE METRO · ROUTE MAP</Text><Text style={{ color: '#FF9B70', fontSize: 10, fontWeight: '700' }}>SCHEMATIC</Text></View>
    <View accessible accessibilityLabel={`Schematic metro route from ${getStationName(from ?? '')} to ${getStationName(to ?? '')}. Not a GPS recording.`} style={{ backgroundColor: '#282F35', borderRadius: 14, overflow: 'hidden' }}>
      <Svg width="100%" height={244} viewBox="0 0 360 270" aria-hidden>
        {[45,90,135,180,225].map(y => <Line key={`h${y}`} x1="0" x2="360" y1={y} y2={y} stroke="#333C43" strokeWidth="1" />)}
        {[45,90,135,180,225,270,315].map(x => <Line key={`v${x}`} x1={x} x2={x} y1="0" y2="270" stroke="#333C43" strokeWidth="1" />)}
        {LINES.map(line => <Polyline key={line.id} points={pathPoints(line.stationIds)} fill="none" stroke={line.id === 'purple' ? '#8870B1' : '#4C9CAC'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />)}
        {stationIds.length > 1 ? <Polyline points={pathPoints(stationIds)} fill="none" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {[...points.entries()].map(([id,point]) => <Circle key={id} cx={point.x} cy={point.y} r={id === 'civil-court' ? 6 : 2.5} fill={stationIds.includes(id) ? ORANGE : '#CDD4D8'} stroke="#282F35" strokeWidth={id === 'civil-court' ? 2 : 0} />)}
        {[from,to].filter((id,index,list) => id && list.indexOf(id) === index).map(id => { const point=points.get(id); return point ? <Circle key={`end-${id}`} cx={point.x} cy={point.y} r="7" fill={ORANGE} stroke="#fff" strokeWidth="3" /> : null; })}
        <SvgText x="194" y="27" fill="#E7ECEF" fontSize="11" fontWeight="600">PCMC</SvgText>
        <SvgText x="194" y="248" fill="#E7ECEF" fontSize="11" fontWeight="600">Swargate</SvgText>
        <SvgText x="15" y="164" fill="#E7ECEF" fontSize="11" fontWeight="600">Vanaz</SvgText>
        <SvgText x="294" y="164" fill="#E7ECEF" fontSize="11" fontWeight="600">Ramwadi</SvgText>
        <SvgText x="194" y="201" fill="#E7ECEF" fontSize="10" fontWeight="600">Civil Court</SvgText>
        <SvgText x="20" y="244" fill="#A7B4BC" fontSize="9">Purple + Aqua network</SvgText>
      </Svg>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><View style={{ width: 15, height: 3, backgroundColor: ORANGE, borderRadius: 3 }} /><Text style={{ color: '#B8C2C8', fontSize: 10, lineHeight: 16, flex: 1 }}>{getStationName(from ?? '')} → {getStationName(to ?? '')} · schematic, not GPS</Text></View>
  </View>;
}
