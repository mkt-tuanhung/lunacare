import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface CarePreferences {
  favoriteFoods: string[];
  comfortItems: string[];
  doNotSay: string[];
}

interface CareState {
  currentSupportLevel: SupportLevel;
  preferences: CarePreferences;
  setSupportLevel: (level: SupportLevel) => void;
  updatePreferences: (prefs: Partial<CarePreferences>) => void;
}

export const useCareStore = create<CareState>()(
  persist(
    (set) => ({
      currentSupportLevel: 'green',
      preferences: {
        favoriteFoods: ['Trà đào', 'Trà sữa', 'Cháo sườn'],
        comfortItems: ['Túi chườm nóng', 'Chăn mỏng'],
        doNotSay: ['Em lại đến tháng à?', 'Đau có tí mà cũng than'],
      },
      setSupportLevel: (level) => set({ currentSupportLevel: level }),
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
    }),
    {
      name: 'lunacare-care-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
