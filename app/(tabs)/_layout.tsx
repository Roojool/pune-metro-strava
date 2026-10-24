import React from 'react';
import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Sidebar } from '@/components/Sidebar';
import { theme } from '@/theme';
export default function TabLayout(){const desktop=useWindowDimensions().width>=1000;return <View style={{flex:1,flexDirection:'row'}}>{desktop?<Sidebar/>:null}<View style={{flex:1}}><Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:theme.primary,tabBarInactiveTintColor:theme.muted,tabBarStyle:desktop?{display:'none'}:{minHeight:70,paddingBottom:8,paddingTop:8,backgroundColor:'#fff',borderTopColor:theme.border},tabBarLabelStyle:{fontSize:10,fontWeight:'700'}}}>
<Tabs.Screen name="index" options={{title:'Home',tabBarIcon:({color})=> <Feather name="grid" color={color} size={21}/>}}/>
<Tabs.Screen name="passport" options={{title:'Passport',tabBarIcon:({color})=> <Feather name="map" color={color} size={21}/>}}/>
<Tabs.Screen name="leagues" options={{title:'Leagues',tabBarIcon:({color})=> <Feather name="award" color={color} size={21}/>}}/>
<Tabs.Screen name="community" options={{title:'Community',tabBarIcon:({color})=> <Feather name="users" color={color} size={21}/>}}/>
<Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:({color})=> <Feather name="user" color={color} size={21}/>}}/>
</Tabs></View></View>;}
