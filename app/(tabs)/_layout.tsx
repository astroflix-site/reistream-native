import { Tabs, router } from 'expo-router';
import { Bookmark, Compass, Home, Search, User, Menu } from 'lucide-react-native';
import { TouchableOpacity, View, Image } from 'react-native';
import React from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF0000',
        tabBarInactiveTintColor: '#999999',
        headerShown: true,
        headerTransparent: true,
        headerTitle: () => null,
        headerLeft: () => (
          <TouchableOpacity className="ml-4 p-2 bg-black/20 rounded-full">
            <Menu size={24} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/search')}
            className="mr-4 p-2 bg-black/20 rounded-full"
          >
            <Search size={24} color="white" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
