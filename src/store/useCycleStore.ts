import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileStore } from './useProfileStore';
import { PeriodEvent, CyclePrediction } from '../features/cycle/cycle.types';
import { predictCycle } from '../features/cycle/cycle.engine';
import { predictCycleWithAI } from '../features/cycle/ai.engine';
import { supabase } from '../lib/supabase';

interface CycleState {
  periodEvents: PeriodEvent[];
  prediction: CyclePrediction | null;
  isPredicting: boolean;
  isAiModeEnabled: boolean;
  addPeriodEvent: (event: Omit<PeriodEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePeriodEvent: (id: string, updates: Partial<PeriodEvent>) => void;
  deletePeriodEvent: (id: string) => void;
  calculatePrediction: () => Promise<void>;
  setPeriodEvents: (events: PeriodEvent[]) => void;
  toggleAiMode: (enabled: boolean) => void;
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
  periodEvents: [],
  prediction: null,
  isPredicting: false,
  isAiModeEnabled: false,
  
  addPeriodEvent: (eventData) => {
    const newEvent: PeriodEvent = {
      ...eventData,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const newEvents = [...state.periodEvents, newEvent];
      return { periodEvents: newEvents };
    });
    get().calculatePrediction();
  },

  updatePeriodEvent: (id, updates) => {
    set((state) => {
      const newEvents = state.periodEvents.map(e => 
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      return { periodEvents: newEvents };
    });
    get().calculatePrediction();
  },

  deletePeriodEvent: (id) => {
    set((state) => {
      const newEvents = state.periodEvents.filter(e => e.id !== id);
      return { periodEvents: newEvents };
    });
    get().calculatePrediction();
  },

  calculatePrediction: async () => {
    set({ isPredicting: true });
    try {
      const { periodEvents, isAiModeEnabled } = get();
      const cycles = periodEvents.map(e => ({
        startDate: e.startDate,
        endDate: e.endDate,
      }));
      
      // Tải nhật ký gần nhất để cho Thuật toán tham khảo
      let recentLogs: any[] = [];
      const profileStore = useProfileStore.getState();
      if (profileStore.profile?.uid) {
        const { data } = await supabase.from('daily_logs').select('*').eq('user_id', profileStore.profile.uid).order('log_date', { ascending: false }).limit(1);
        if (data) recentLogs = data;
      }

      let finalPrediction: CyclePrediction | null = null;

      if (isAiModeEnabled) {
        finalPrediction = await predictCycleWithAI(cycles);
      }
      
      if (!finalPrediction) {
        // Chạy thuật toán nội bộ
        finalPrediction = predictCycle(cycles, recentLogs);
      }
      
      set({ prediction: finalPrediction, isPredicting: false });
      
      // Sync prediction to Supabase for husband
      profileStore.updateHealthProfile({ prediction: finalPrediction });
      profileStore.saveProfileToSupabase();
      
    } catch (error: any) {
      console.error(error);
      const { periodEvents } = get();
      const cycles = periodEvents.map(e => ({ startDate: e.startDate, endDate: e.endDate }));
      
      let recentLogs: any[] = [];
      const profileStore = useProfileStore.getState();
      if (profileStore.profile?.uid) {
        const { data } = await supabase.from('daily_logs').select('*').eq('user_id', profileStore.profile.uid).order('log_date', { ascending: false }).limit(1);
        if (data) recentLogs = data;
      }
      
      const fallbackPrediction = predictCycle(cycles, recentLogs);
      // Báo cho người dùng biết AI đang bị lỗi gì
      fallbackPrediction.notes = [`[Hệ thống AI tạm ngắt]: ${error.message || 'Lỗi kết nối'}.`, ...fallbackPrediction.notes];
      
      set({ prediction: fallbackPrediction, isPredicting: false });
    }
  },

  toggleAiMode: (enabled: boolean) => {
    set({ isAiModeEnabled: enabled });
    get().calculatePrediction();
  },

  setPeriodEvents: (events) => {
    set({ periodEvents: events });
    get().calculatePrediction();
  }
    }),
    {
      name: 'lunacare-cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
