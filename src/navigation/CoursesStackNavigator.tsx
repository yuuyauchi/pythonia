import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesHomeScreen from '../screens/courses/CoursesHomeScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import CourseStepScreen from '../screens/courses/CourseStepScreen';
import SubscriptionScreen from '../screens/courses/SubscriptionScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function CoursesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="CoursesHome"
        component={CoursesHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: 'コース詳細' }}
      />
      <Stack.Screen
        name="CourseStep"
        component={CourseStepScreen}
        options={{ title: '学習中' }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'サブスクリプション' }}
      />
    </Stack.Navigator>
  );
}
