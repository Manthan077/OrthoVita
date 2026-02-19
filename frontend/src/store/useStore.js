import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useStore = create(
  persist(
    (set) => ({
      // User state
      user: null,
      rehabDay: 1,
      confirmedInjury: null,
      rehabPlan: null,
      sessionHistory: [],
      lastLoginDate: null,

      // Exercise state
      currentExercise: null,
      isActive: false,
      reps: 0,
      accuracy: 100,
      feedback: '',
      sessionStartTime: null,
      sessionData: [],
      badPostureCount: 0,

      // Actions
      setUser: (user) => set((state) => {
        const today = getDateKey();
        const isNewDay = state.lastLoginDate !== today;
        return {
          user,
          lastLoginDate: today,
          rehabDay: isNewDay ? state.rehabDay + 1 : state.rehabDay
        };
      }),
      setInjury: (injury) => set({ confirmedInjury: injury }),
      setRehabPlan: (plan) => set({ rehabPlan: plan }),
      incrementRehabDay: () => set((state) => ({ rehabDay: state.rehabDay + 1 })),

      setExercise: (exercise) => set({ 
        currentExercise: exercise, 
        reps: 0, 
        accuracy: 100,
        sessionData: [],
        sessionStartTime: null,
        badPostureCount: 0
      }),
      
      startSession: () => set({ 
        isActive: true, 
        sessionStartTime: Date.now(),
        reps: 0,
        sessionData: [],
        badPostureCount: 0
      }),
      
      stopSession: () => set((state) => {
        const duration = Math.floor((Date.now() - state.sessionStartTime) / 1000);
        const avgAccuracy = state.sessionData.length > 0
          ? Math.round(state.sessionData.reduce((sum, d) => sum + d.accuracy, 0) / state.sessionData.length)
          : 0;
        const avgAngle = state.sessionData.length > 0
          ? Math.round(state.sessionData.reduce((sum, d) => sum + (d.angle || 0), 0) / state.sessionData.length)
          : 0;
        const badPosturePercent = state.sessionData.length > 0
          ? Math.round((state.badPostureCount / state.sessionData.length) * 100)
          : 0;

        const session = {
          exercise: state.currentExercise,
          reps: state.reps,
          avgAccuracy,
          avgAngle,
          badPosturePercent,
          duration,
          timestamp: Date.now(),
          day: state.rehabDay,
          date: getDateKey()
        };

        return {
          isActive: false,
          sessionHistory: [...state.sessionHistory, session]
        };
      }),
      
      updateStats: (reps, accuracy, feedback, angle) => set((state) => {
        const newSessionData = [...state.sessionData, { reps, accuracy, angle: angle || 0, timestamp: Date.now() }];
        const avgAccuracy = Math.round(newSessionData.reduce((sum, d) => sum + d.accuracy, 0) / newSessionData.length);
        
        return {
          reps,
          accuracy: avgAccuracy,
          feedback,
          sessionData: newSessionData,
          badPostureCount: accuracy < 70 ? state.badPostureCount + 1 : state.badPostureCount
        };
      }),

      resetSession: () => set({
        currentExercise: null,
        isActive: false,
        reps: 0,
        accuracy: 100,
        feedback: '',
        sessionStartTime: null,
        sessionData: [],
        badPostureCount: 0
      })
    }),
    {
      name: 'orthovita-storage',
      partialize: (state) => ({
        user: state.user,
        rehabDay: state.rehabDay,
        confirmedInjury: state.confirmedInjury,
        rehabPlan: state.rehabPlan,
        sessionHistory: state.sessionHistory,
        lastLoginDate: state.lastLoginDate
      })
    }
  )
);
