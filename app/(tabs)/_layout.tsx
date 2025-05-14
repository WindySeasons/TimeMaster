import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#25292e',
                },
            }}>
            <Tabs.Screen name="index" options={{
                title: 'Home', tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="cardLibrary" options={{
                title: '卡片库',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'albums' : 'albums-outline'} color={color} size={24} />
                ),
            }} />

            <Tabs.Screen name="summary" options={{
                title: '总结',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="about" options={{
                title: 'About',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24} />
                ),
            }} />


        </Tabs>
    );
}
