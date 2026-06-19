import { create } from 'zustand';

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  cycleGoal: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  privacyModeEnabled: boolean;
  isOnboarded: boolean;
}

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => set((state) => ({ 
    profile: state.profile ? { ...state.profile, ...updates } : null 
  }))
}));
