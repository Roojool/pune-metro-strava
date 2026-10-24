import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/state/AppState';
import { theme } from '@/theme';
export default function RootLayout(){
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  // Fonts, responsive dimensions and local data are client-owned in this demo.
  return <AppProvider><StatusBar style="dark"/>{mounted?<Stack screenOptions={{headerStyle:{backgroundColor:theme.bg},headerTintColor:theme.ink,contentStyle:{backgroundColor:theme.bg},headerShadowVisible:false}}><Stack.Screen name="(tabs)" options={{headerShown:false}}/><Stack.Screen name="log" options={{title:'Log a metro ride',presentation:'modal'}}/></Stack>:<View style={{flex:1,backgroundColor:theme.bg,alignItems:'center',justifyContent:'center',gap:18}}><Text style={{fontSize:28,fontWeight:'800',color:theme.primary}}>metroquest</Text><ActivityIndicator color={theme.primary}/><Text style={{fontSize:13,color:theme.muted}}>Getting your passport ready…</Text></View>}</AppProvider>;
}
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
