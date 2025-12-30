import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionPlan = 'free' | 'basic' | 'standard' | 'premium';

interface SubscriptionState {
  plan: SubscriptionPlan;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  purchasedCourses: Set<string>;

  // Actions
  subscribe: (plan: SubscriptionPlan) => void;
  unsubscribe: () => void;
  purchaseCourse: (courseId: string) => void;
  hasCourseAccess: (courseId: string) => boolean;
  canAccessCourse: (courseId: string, coursePrice: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      isActive: false,
      startDate: null,
      endDate: null,
      purchasedCourses: new Set<string>(),

      subscribe: (plan: SubscriptionPlan) => {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        set({
          plan,
          isActive: true,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
        });
      },

      unsubscribe: () => {
        set({
          plan: 'free',
          isActive: false,
          startDate: null,
          endDate: null,
        });
      },

      purchaseCourse: (courseId: string) => {
        set((state) => {
          const newPurchasedCourses = new Set(state.purchasedCourses);
          newPurchasedCourses.add(courseId);
          return {
            purchasedCourses: newPurchasedCourses,
          };
        });
      },

      hasCourseAccess: (courseId: string) => {
        const { isActive, purchasedCourses } = get();

        // If user has active subscription, they have access to all courses
        if (isActive) {
          return true;
        }

        // Otherwise, check if they purchased this specific course
        return purchasedCourses.has(courseId);
      },

      canAccessCourse: (courseId: string, coursePrice: number) => {
        const { isActive, purchasedCourses } = get();

        // Free courses (price 0) are always accessible
        if (coursePrice === 0) {
          return true;
        }

        // Active subscription gives access to all
        if (isActive) {
          return true;
        }

        // Check individual purchase
        return purchasedCourses.has(courseId);
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        plan: state.plan,
        isActive: state.isActive,
        startDate: state.startDate,
        endDate: state.endDate,
        purchasedCourses: Array.from(state.purchasedCourses),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.purchasedCourses = new Set(
            (state.purchasedCourses as any) || []
          );
        }
      },
    }
  )
);
