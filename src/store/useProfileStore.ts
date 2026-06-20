import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface HealthProfile {
  // Nhóm 1: Dữ liệu kinh nguyệt
  goal: string;
  lastPeriodDate: string | null;
  periodDuration: number;
  cycleLength: number;
  cycleRegularity: string;
  
  // Nhóm 2: Tiền sử Y tế
  birthControl: string;
  medicalConditions: string[];
  flowLevel: string;
  crampsSeverity: string;
  pmsSeverity: string;
  
  // Nhóm 3: Thói quen & Môi trường
  sleepHours: string;
  sleepQuality: string;
  stressLevel: string;
  activityLevel: string;
  diet: string;
  
  // Nhóm 4: Cá nhân hóa
  comfortItems: string[];
  worstSymptoms: string[];
  emotionalSymptoms: string[];
  partnerRequests: string;
  
  // Nhóm 5: Tiền sử Y khoa & Tình dục (Chuyên sâu)
  sexualFrequency?: string;
  contraceptionMethod?: string;
  recentPregnancy?: string;
  weightChange?: string;

  // Nhóm 6: Partner Sync
  supportLevel?: string;
  prediction?: any;
}

interface ProfileState {
  profile: {
    uid?: string;
    displayName: string;
    onboardingCompleted: boolean;
    healthProfile: HealthProfile | null;
    role?: string;
    partnerId?: string; // ID của vợ nếu người này là chồng
    isAppLockEnabled?: boolean;
    appLockPin?: string;
    hideNotifications?: boolean;
  } | null;
  setProfile: (profile: any) => void;
  updateHealthProfile: (data: Partial<HealthProfile>) => void;
  setAppLockEnabled: (enabled: boolean, pin?: string) => void;
  setHideNotifications: (hide: boolean) => void;
  saveProfileToSupabase: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateHealthProfile: (data) => set((state) => {
    if (!state.profile) return state;
    return {
      profile: {
        ...state.profile,
        healthProfile: {
          ...(state.profile.healthProfile as HealthProfile),
          ...data
        }
      }
    };
  }),
  setAppLockEnabled: (enabled, pin) => {
    set((state) => {
      if (!state.profile) return state;
      return {
        profile: {
          ...state.profile,
          isAppLockEnabled: enabled,
          appLockPin: pin !== undefined ? pin : state.profile.appLockPin
        }
      };
    });
    get().saveProfileToSupabase();
  },
  setHideNotifications: (hide) => {
    set((state) => {
      if (!state.profile) return state;
      return {
        profile: {
          ...state.profile,
          hideNotifications: hide
        }
      };
    });
    get().saveProfileToSupabase();
  },
  saveProfileToSupabase: async () => {
    const { profile } = get();
    if (!profile || !profile.uid) return;
    
    // Lấy state của cycleStore (Tránh circular dependency)
    const { useCycleStore } = require('./useCycleStore');
    
    const allUserData = {
      healthProfile: profile.healthProfile,
      appSettings: {
        isAppLockEnabled: profile.isAppLockEnabled,
        appLockPin: profile.appLockPin,
        hideNotifications: profile.hideNotifications
      },
      periodEvents: useCycleStore.getState().periodEvents
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: profile.uid, // UUID từ Supabase Auth
          display_name: profile.displayName,
          is_onboarded: true,
          health_profile: allUserData
        });
        
      if (error) throw error;
      console.log("✅ Đã cập nhật All User Data lên Supabase thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu lên Supabase:", error);
    }
  }
  }),
  {
    name: 'lunacare-profile-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
