import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { colors } from '../constants/theme';

// Import screens
import LessonsStackNavigator from './LessonsStackNavigator';
import PracticeStackNavigator from './PracticeStackNavigator';
import CoursesStackNavigator from './CoursesStackNavigator';
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
        component={LessonsStackNavigator}
        options={{
          title: '学ぶ',
          tabBarLabel: '学ぶ',
          headerShown: false, // Will use stack navigator's header
        }}
      />
      <Tab.Screen
        name="EditorTab"
        component={PracticeStackNavigator}
        options={{
          title: '書く',
          tabBarLabel: '書く',
          headerShown: false, // Will use stack navigator's header
        }}
      />
      <Tab.Screen
        name="HandsOnTab"
        component={CoursesStackNavigator}
        options={{
          title: '作る',
          tabBarLabel: '作る',
          headerShown: false, // Will use stack navigator's header
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
