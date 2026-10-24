import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle, type StyleProp, type ColorValue } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/theme';
export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color = theme.primary }: { name: IconName; size?: number; color?: ColorValue }) {
  return <Feather name={name} size={size} color={color} />;
}
export function Page({ children }: { children: React.ReactNode }) { return <View style={styles.page}><View style={styles.topline}><Text style={styles.wordmark}>metro<Text style={{ color: theme.primary }}>quest</Text><Text style={styles.city}> / PUNE</Text></Text><Pill text="LOCAL DEMO" color={theme.paleMint} ink={theme.primary} /></View>{children}<Text style={styles.footer}>A little less traffic. A little more adventure.</Text></View>; }
export function Heading({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) { return <View style={{ gap: 8, marginBottom: 10 }}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text accessibilityRole="header" style={styles.h1}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>; }
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.card, style]}>{children}</View>; }
export function Pill({ text, color = theme.palePurple, ink = theme.purple }: { text: string; color?: string; ink?: string }) { return <View style={{ borderRadius: 8, backgroundColor: color, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' }}><Text style={{ fontSize: 10, letterSpacing: 0.7, fontWeight: '800', color: ink }}>{text}</Text></View>; }
export function Stat({ label, value, emoji, icon, hint }: { label: string; value: string; emoji?: string; icon?: IconName; hint?: string }) { return <Card style={{ flex: 1, minWidth: 138, gap: 12 }}><View style={styles.row}>{icon ? <View style={styles.iconBox}><Icon name={icon} size={18} /></View> : <Text>{emoji}</Text>}<Text style={[styles.muted,{flex:1}]}>{label}</Text></View><Text style={styles.statValue}>{value}</Text>{hint ? <Text style={styles.muted}>{hint}</Text> : null}</Card>; }
export function Action({ label, onPress, secondary = false, disabled = false, icon }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: IconName }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [{ minHeight: 48, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: secondary ? theme.paleMint : theme.primary, flexDirection: 'row', gap: 9, justifyContent: 'center', alignItems: 'center', opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }]}>{icon ? <Icon name={icon} size={18} color={secondary ? theme.primary : '#fff'} /> : null}<Text style={{ color: secondary ? theme.primary : '#fff', fontWeight: '700', fontSize: 14 }}>{label}</Text></Pressable>; }
export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: string }) { return <View style={[styles.row, { justifyContent: 'space-between', marginTop: 12, marginBottom: 2 }]}><Text accessibilityRole="header" style={styles.section}>{children}</Text>{aside ? <Text style={styles.muted}>{aside}</Text> : null}</View>; }
export function Progress({ value, color = theme.primary }: { value: number; color?: string }) { return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.min(100, Math.max(0, value))) }} style={{ height: 7, backgroundColor: theme.border, borderRadius: 10, overflow: 'hidden' }}><View style={{ width: `${Math.min(100, Math.max(0,value))}%`, height: 7, borderRadius: 10, backgroundColor: color }} /></View>; }
export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <View accessibilityRole={error ? 'alert' : undefined} style={{ backgroundColor: error ? '#FFF0ED' : theme.paleMint, padding: 14, borderRadius: 12 }}><Text style={{ color: error ? '#A33123' : theme.primary, fontSize: 13, lineHeight: 20 }}>{children}</Text></View>; }
export const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 22, paddingBottom: 32, gap: 16 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 },
  wordmark: { fontSize: 21, fontWeight: '800', color: theme.ink, letterSpacing: -0.8 }, city: { fontSize: 10, letterSpacing: 1.5, color: theme.muted },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8, color: theme.primary, textTransform: 'uppercase' },
  h1: { fontSize: 34, fontWeight: '800', color: theme.ink, letterSpacing: -1.3, lineHeight: 40 },
  subtitle: { fontSize: 14, color: theme.muted, lineHeight: 22, maxWidth: 680 },
  card: { backgroundColor: theme.surface, borderRadius: 19, padding: 22, borderColor: theme.border, borderWidth: 1 },
  muted: { fontSize: 12, color: theme.muted, lineHeight: 19 },
  section: { fontSize: 18, fontWeight: '700', color: theme.ink, letterSpacing: -0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { fontSize: 14, color: theme.ink, lineHeight: 22 },
  statValue: { fontSize: 30, fontWeight: '800', color: theme.ink, letterSpacing: -1 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: theme.paleMint, justifyContent: 'center', alignItems: 'center' },
  footer: { fontSize: 11, color: theme.muted, textAlign: 'center', marginTop: 22, lineHeight: 18 },
  input: { minHeight: 48, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.ink },
});
