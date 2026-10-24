import React from 'react';
import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/UI';
import { Sidebar } from '@/components/Sidebar';
import { theme } from '@/theme';
export default function TabLayout(){const desktop=useWindowDimensions().width>=1000;return <SafeAreaView edges={['top']} style={{flex:1,flexDirection:'row',backgroundColor:theme.bg}}>{desktop?<Sidebar/>:null}<View style={{flex:1}}><Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:theme.primary,tabBarInactiveTintColor:theme.muted,tabBarStyle:desktop?{display:'none'}:{minHeight:70,paddingBottom:8,paddingTop:8,backgroundColor:theme.surface,borderTopColor:theme.border},tabBarLabelStyle:{fontSize:10,fontWeight:'700'}}}>
<Tabs.Screen name="index" options={{title:'Home',tabBarAccessibilityLabel:'Home',tabBarIcon:({color})=> <Icon name="grid" color={color} size={21}/>}}/>
<Tabs.Screen name="passport" options={{title:'Passport',tabBarAccessibilityLabel:'Passport',tabBarIcon:({color})=> <Icon name="map" color={color} size={21}/>}}/>
<Tabs.Screen name="leagues" options={{title:'Leagues',tabBarAccessibilityLabel:'Leagues',tabBarIcon:({color})=> <Icon name="award" color={color} size={21}/>}}/>
<Tabs.Screen name="community" options={{title:'Community',tabBarAccessibilityLabel:'Community',tabBarIcon:({color})=> <Icon name="users" color={color} size={21}/>}}/>
<Tabs.Screen name="profile" options={{title:'Profile',tabBarAccessibilityLabel:'Profile',tabBarIcon:({color})=> <Icon name="user" color={color} size={21}/>}}/>
</Tabs></View></SafeAreaView>;}
