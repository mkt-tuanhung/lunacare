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
  
  // Nhóm 5: Partner Sync
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
  } | null;
  setProfile: (profile: any) => void;
  updateHealthProfile: (data: Partial<HealthProfile>) => void;
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
  saveProfileToSupabase: async () => {
    const { profile } = get();
    if (!profile || !profile.uid) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: profile.uid, // UUID từ Supabase Auth
          display_name: profile.displayName,
          health_profile: profile.healthProfile,
          is_onboarded: true
        });
        
      if (error) throw error;
      console.log("✅ Đã cập nhật Health Profile lên Supabase thành công!");
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
