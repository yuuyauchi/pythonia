import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, parseISO, format } from 'date-fns';

interface StudyHistory {
  date: string; // ISO date string (YYYY-MM-DD)
  stepsCompleted: number;
  timeSpent: number; // in minutes
}

interface ProfileState {
  userName: string;
  studyHistory: StudyHistory[];
  totalStudyTime: number; // in minutes

  setUserName: (name: string) => void;
  recordStudySession: (stepsCompleted: number, timeSpent: number) => void;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getTotalStudyTime: () => number;
  getStudyDaysCount: () => number;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      userName: '',
      studyHistory: [],
      totalStudyTime: 0,

      setUserName: (name: string) => {
        set({ userName: name });
      },

      recordStudySession: (stepsCompleted: number, timeSpent: number) => {
        const today = format(new Date(), 'yyyy-MM-dd');

        set((state) => {
          const existingIndex = state.studyHistory.findIndex(
            (entry) => entry.date === today
          );

          let newHistory;
          if (existingIndex >= 0) {
            // Update existing entry for today
            newHistory = [...state.studyHistory];
            newHistory[existingIndex] = {
              date: today,
              stepsCompleted:
                newHistory[existingIndex].stepsCompleted + stepsCompleted,
              timeSpent: newHistory[existingIndex].timeSpent + timeSpent,
            };
          } else {
            // Add new entry for today
            newHistory = [
              ...state.studyHistory,
              {
                date: today,
                stepsCompleted,
                timeSpent,
              },
            ];
          }

          return {
            studyHistory: newHistory,
            totalStudyTime: state.totalStudyTime + timeSpent,
          };
        });
      },

      getCurrentStreak: () => {
        const { studyHistory } = get();
        if (studyHistory.length === 0) return 0;

        // Sort by date descending
        const sorted = [...studyHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const today = new Date();
        const mostRecent = parseISO(sorted[0].date);
        const daysSinceLastStudy = differenceInDays(today, mostRecent);

        // If more than 1 day since last study, streak is broken
        if (daysSinceLastStudy > 1) return 0;

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
          const currentDate = parseISO(sorted[i].date);
          const previousDate = parseISO(sorted[i - 1].date);
          const diff = differenceInDays(previousDate, currentDate);

          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },

      getLongestStreak: () => {
        const { studyHistory } = get();
        if (studyHistory.length === 0) return 0;

        // Sort by date ascending
        const sorted = [...studyHistory].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
          const currentDate = parseISO(sorted[i].date);
          const previousDate = parseISO(sorted[i - 1].date);
          const diff = differenceInDays(currentDate, previousDate);

          if (diff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }

        return maxStreak;
      },

      getTotalStudyTime: () => {
        return get().totalStudyTime;
      },

      getStudyDaysCount: () => {
        return get().studyHistory.length;
      },

      resetProfile: () => {
        set({
          userName: '',
          studyHistory: [],
          totalStudyTime: 0,
        });
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
