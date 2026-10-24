import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/state/AppState';
import { theme } from '@/theme';
export default function RootLayout(){ return <AppProvider><StatusBar style="dark"/><Stack screenOptions={{headerStyle:{backgroundColor:theme.bg},headerTintColor:theme.ink,contentStyle:{backgroundColor:theme.bg},headerShadowVisible:false}}><Stack.Screen name="(tabs)" options={{headerShown:false}}/><Stack.Screen name="log" options={{title:'Log a metro ride',presentation:'modal'}}/></Stack></AppProvider>; }
