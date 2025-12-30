import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LessonsHomeScreen from '../screens/lessons/LessonsHomeScreen';
import ChapterDetailScreen from '../screens/lessons/ChapterDetailScreen';
import StepScreen from '../screens/lessons/StepScreen';
import { colors } from '../constants/theme';

export type LessonsStackParamList = {
  LessonsHome: undefined;
  ChapterDetail: { chapterId: string };
  Step: { chapterId: string; stepId: string; stepIndex: number };
};

const Stack = createNativeStackNavigator<LessonsStackParamList>();

export default function LessonsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="LessonsHome"
        component={LessonsHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChapterDetail"
        component={ChapterDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Step"
        component={StepScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
