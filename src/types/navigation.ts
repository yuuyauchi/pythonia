import { NavigatorScreenParams } from '@react-navigation/native';
import { StepType } from './lesson';

// Bottom Tab Navigator param list
export type RootTabParamList = {
  LessonsTab: NavigatorScreenParams<LessonsStackParamList>;
  EditorTab: undefined;
  HandsOnTab: undefined;
  ProfileTab: undefined;
};

// Lessons Stack Navigator param list
export type LessonsStackParamList = {
  LessonsHome: undefined;
  ChapterDetail: {
    chapterId: string;
    chapterTitle: string;
  };
  Step: {
    chapterId: string;
    stepId: string;
    stepType: StepType;
    contentId: string;
    stepIndex: number;
    totalSteps: number;
  };
};

// Navigation prop types for type-safe navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
