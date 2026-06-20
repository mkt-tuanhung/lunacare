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
  setPeriodEvents: (events: PeriodEvent[], skipSync?: boolean) => void;
  toggleAiMode: (enabled: boolean) => void;
  syncEventsToSupabase: () => Promise<void>;
  togglePeriodDay: (dateStr: string) => void;
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
    get().syncEventsToSupabase();
  },

  updatePeriodEvent: (id, updates) => {
    set((state) => {
      const newEvents = state.periodEvents.map(e => 
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      return { periodEvents: newEvents };
    });
    get().calculatePrediction();
    get().syncEventsToSupabase();
  },

  deletePeriodEvent: (id) => {
    set((state) => {
      const newEvents = state.periodEvents.filter(e => e.id !== id);
      return { periodEvents: newEvents };
    });
    get().calculatePrediction();
    get().syncEventsToSupabase();
  },

  togglePeriodDay: (dateStr) => {
    set((state) => {
      const { periodEvents } = state;
      const matchingEvent = periodEvents.find(e => dateStr >= e.startDate && dateStr <= e.endDate);

      const d = new Date(dateStr);
      const prevDate = new Date(d); prevDate.setDate(d.getDate() - 1);
      const nextDate = new Date(d); nextDate.setDate(d.getDate() + 1);
      const prevStr = prevDate.toISOString().split('T')[0];
      const nextStr = nextDate.toISOString().split('T')[0];

      if (matchingEvent) {
        // Remove this day
        if (dateStr === matchingEvent.startDate && dateStr === matchingEvent.endDate) {
          return { periodEvents: periodEvents.filter(e => e.id !== matchingEvent.id) };
        } else if (dateStr === matchingEvent.startDate) {
          return { periodEvents: periodEvents.map(e => e.id === matchingEvent.id ? { ...e, startDate: nextStr } : e) };
        } else if (dateStr === matchingEvent.endDate) {
          return { periodEvents: periodEvents.map(e => e.id === matchingEvent.id ? { ...e, endDate: prevStr } : e) };
        } else {
          // Split
          const newEvent = { ...matchingEvent, id: Date.now().toString(36) + Math.random().toString(36).substring(2), startDate: nextStr };
          const updatedEvents = periodEvents.map(e => e.id === matchingEvent.id ? { ...e, endDate: prevStr } : e);
          return { periodEvents: [...updatedEvents, newEvent] };
        }
      } else {
        // Add this day
        const prevEvent = periodEvents.find(e => e.endDate === prevStr);
        const nextEvent = periodEvents.find(e => e.startDate === nextStr);

        if (prevEvent && nextEvent) {
          // Merge
          const mergedEvent = { ...prevEvent, endDate: nextEvent.endDate };
          return { periodEvents: [...periodEvents.filter(e => e.id !== prevEvent.id && e.id !== nextEvent.id), mergedEvent] };
        } else if (prevEvent) {
          return { periodEvents: periodEvents.map(e => e.id === prevEvent.id ? { ...e, endDate: dateStr } : e) };
        } else if (nextEvent) {
          return { periodEvents: periodEvents.map(e => e.id === nextEvent.id ? { ...e, startDate: dateStr } : e) };
        } else {
          // New event
          const profileStore = useProfileStore.getState();
          const newEvent: PeriodEvent = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            userId: profileStore.profile?.uid || 'guest',
            startDate: dateStr,
            endDate: dateStr,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { periodEvents: [...periodEvents, newEvent] };
        }
      }
    });
    get().calculatePrediction();
    get().syncEventsToSupabase();
  },

  calculatePrediction: async () => {
    set({ isPredicting: true });
    
    // Add artificial delay for UX (like Flo app animation)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

  setPeriodEvents: (events, skipSync = false) => {
    set({ periodEvents: events });
    get().calculatePrediction();
    if (!skipSync) get().syncEventsToSupabase();
  },

  syncEventsToSupabase: async () => {
    const profileStore = useProfileStore.getState();
    if (!profileStore.profile?.uid) return;
    
    try {
      await profileStore.saveProfileToSupabase();
    } catch (e) {
      console.error("Lỗi khi lưu Chu kỳ lên Supabase:", e);
    }
  }
    }),
    {
      name: 'lunacare-cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
