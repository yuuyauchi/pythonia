import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { colors } from '../constants/theme';

// Import screens
import LessonsHomeScreen from '../screens/lessons/LessonsHomeScreen';
import EditorScreen from '../screens/editor/EditorScreen';
import HandsOnPlaceholderScreen from '../screens/handsOn/HandsOnPlaceholderScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tab.Screen
        name="LessonsTab"
        component={LessonsHomeScreen}
        options={{
          title: '学ぶ',
          tabBarLabel: '学ぶ',
          headerShown: false, // Will use stack navigator's header
        }}
      />
      <Tab.Screen
        name="EditorTab"
        component={EditorScreen}
        options={{
          title: '書く',
          tabBarLabel: '書く',
        }}
      />
      <Tab.Screen
        name="HandsOnTab"
        component={HandsOnPlaceholderScreen}
        options={{
          title: '作る',
          tabBarLabel: '作る',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'プロフィール',
          tabBarLabel: 'プロフィール',
        }}
      />
    </Tab.Navigator>
  );
}
