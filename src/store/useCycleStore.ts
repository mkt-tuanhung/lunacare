import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeriodEvent, CyclePrediction } from '../features/cycle/cycle.types';
import { predictCycle, predictCycleWithAI } from '../features/cycle/cycle.engine';

interface CycleState {
  periodEvents: PeriodEvent[];
  prediction: CyclePrediction | null;
  isPredicting: boolean;
  addPeriodEvent: (event: Omit<PeriodEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePeriodEvent: (id: string, updates: Partial<PeriodEvent>) => void;
  deletePeriodEvent: (id: string) => void;
  calculatePrediction: () => Promise<void>;
  setPeriodEvents: (events: PeriodEvent[]) => void;
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
  periodEvents: [],
  prediction: null,
  isPredicting: false,
  
  addPeriodEvent: (eventData) => {
    const newEvent: PeriodEvent = {
      ...eventData,
      id: Math.random().toString(36).substring(7),
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
      const { periodEvents } = get();
      const cycles = periodEvents.map(e => ({
        startDate: e.startDate,
        endDate: e.endDate,
      }));
      
      // Gọi AI suy luận
      const aiPrediction = await predictCycleWithAI(cycles);
      
      if (aiPrediction) {
        set({ prediction: aiPrediction, isPredicting: false });
      } else {
        // Fallback thuật toán cũ nếu AI lỗi
        const prediction = predictCycle(cycles);
        set({ prediction, isPredicting: false });
      }
    } catch (error) {
      console.error(error);
      const { periodEvents } = get();
      const cycles = periodEvents.map(e => ({ startDate: e.startDate, endDate: e.endDate }));
      set({ prediction: predictCycle(cycles), isPredicting: false });
    }
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
