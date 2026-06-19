import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileStore } from './useProfileStore';

export interface PartnerPermissions {
  shareCyclePhase: boolean;
  sharePeriodPrediction: boolean;
  shareMoodLevel: boolean;
  shareSymptoms: boolean;
  shareCareSuggestions: boolean;
  shareSupportLevel: boolean;
}

interface PartnerState {
  isPartnerModeEnabled: boolean;
  permissions: PartnerPermissions;
  togglePartnerMode: (enabled: boolean) => void;
  updatePermissions: (perms: Partial<PartnerPermissions>) => void;
}

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set, get) => ({
      isPartnerModeEnabled: false,
      permissions: {
        shareCyclePhase: true,
        sharePeriodPrediction: true,
        shareMoodLevel: false,
        shareSymptoms: false,
        shareCareSuggestions: true,
        shareSupportLevel: true,
      },
      togglePartnerMode: (enabled) => set({ isPartnerModeEnabled: enabled }),
      updatePermissions: (perms) => {
        set((state) => ({ permissions: { ...state.permissions, ...perms } }));
        const profileStore = useProfileStore.getState();
        profileStore.updateHealthProfile({ partnerPermissions: { ...get().permissions, ...perms } } as any);
        profileStore.saveProfileToSupabase();
      },
    }),
    {
      name: 'lunacare-partner-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
