import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeHomeScreen from '../screens/practice/PracticeHomeScreen';
import PracticeDetailScreen from '../screens/practice/PracticeDetailScreen';
import PracticeStepScreen from '../screens/practice/PracticeStepScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function PracticeStackNavigator() {
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
        name="PracticeHome"
        component={PracticeHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PracticeDetail"
        component={PracticeDetailScreen}
        options={({ route }: any) => ({
          title: 'プロジェクト詳細',
        })}
      />
      <Stack.Screen
        name="PracticeStep"
        component={PracticeStepScreen}
        options={({ route }: any) => ({
          title: '実践',
        })}
      />
    </Stack.Navigator>
  );
}
