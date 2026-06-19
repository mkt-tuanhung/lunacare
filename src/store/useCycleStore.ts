import { create } from 'zustand';
import { PeriodEvent, CyclePrediction } from '../features/cycle/cycle.types';
import { predictCycle } from '../features/cycle/cycle.engine';

interface CycleState {
  periodEvents: PeriodEvent[];
  prediction: CyclePrediction | null;
  addPeriodEvent: (event: Omit<PeriodEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePeriodEvent: (id: string, updates: Partial<PeriodEvent>) => void;
  deletePeriodEvent: (id: string) => void;
  calculatePrediction: () => void;
  setPeriodEvents: (events: PeriodEvent[]) => void;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  periodEvents: [],
  prediction: null,
  
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

  calculatePrediction: () => {
    const { periodEvents } = get();
    // Chuyển PeriodEvent thành định dạng Cycle cho engine
    const cycles = periodEvents.map(e => ({
      startDate: e.startDate,
      endDate: e.endDate,
    }));
    const prediction = predictCycle(cycles);
    set({ prediction });
  },

  setPeriodEvents: (events) => {
    set({ periodEvents: events });
    get().calculatePrediction();
  }
}));
