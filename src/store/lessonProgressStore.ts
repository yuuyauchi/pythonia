import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressState {
  completedSteps: Set<string>;
  currentChapterId: string | null;
  currentStepId: string | null;
  lastStudyDate: string | null;

  markStepComplete: (stepId: string) => void;
  isStepComplete: (stepId: string) => boolean;
  setCurrentStep: (chapterId: string, stepId: string) => void;
  getChapterProgress: (chapterId: string, steps: string[]) => {
    completed: number;
    total: number;
    percentage: number;
  };
  getTotalProgress: () => { completed: number; total: number };
  updateLastStudyDate: () => void;
  resetProgress: () => void;
}

export const useLessonProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSteps: new Set<string>(),
      currentChapterId: null,
      currentStepId: null,
      lastStudyDate: null,

      markStepComplete: (stepId: string) => {
        set((state) => {
          const newCompletedSteps = new Set(state.completedSteps);
          newCompletedSteps.add(stepId);
          return {
            completedSteps: newCompletedSteps,
            lastStudyDate: new Date().toISOString(),
          };
        });
      },

      isStepComplete: (stepId: string) => {
        return get().completedSteps.has(stepId);
      },

      setCurrentStep: (chapterId: string, stepId: string) => {
        set({
          currentChapterId: chapterId,
          currentStepId: stepId,
          lastStudyDate: new Date().toISOString(),
        });
      },

      getChapterProgress: (chapterId: string, steps: string[]) => {
        const { completedSteps } = get();
        const completed = steps.filter((stepId) =>
          completedSteps.has(stepId)
        ).length;
        const total = steps.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
      },

      getTotalProgress: () => {
        const { completedSteps } = get();
        return {
          completed: completedSteps.size,
          total: completedSteps.size, // Will be calculated based on all chapters in actual usage
        };
      },

      updateLastStudyDate: () => {
        set({ lastStudyDate: new Date().toISOString() });
      },

      resetProgress: () => {
        set({
          completedSteps: new Set<string>(),
          currentChapterId: null,
          currentStepId: null,
          lastStudyDate: null,
        });
      },
    }),
    {
      name: 'lesson-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Custom serialization to handle Set
      partialize: (state) => ({
        completedSteps: Array.from(state.completedSteps),
        currentChapterId: state.currentChapterId,
        currentStepId: state.currentStepId,
        lastStudyDate: state.lastStudyDate,
      }),
      // Custom deserialization to convert array back to Set
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.completedSteps = new Set(
            (state.completedSteps as any) || []
          );
        }
      },
    }
  )
);
