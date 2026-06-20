import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { supabase } from '../../lib/supabase';

export default function LoginWife() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string || 'wife';
  const isHusband = role === 'husband';

  const setProfile = useProfileStore(state => state.setProfile);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        setProfile({ 
          uid: data.user?.id || 'temp_id', 
          displayName: email.split('@')[0], 
          onboardingCompleted: false, 
          healthProfile: null, 
          role: role 
        });

        if (isHusband) {
          router.replace('/auth/scan-qr');
        } else {
          router.replace('/onboarding');
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Lấy 1 cột duy nhất health_profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_onboarded, health_profile, display_name')
          .eq('id', data.user.id)
          .single();

        const isOnboarded = profileData?.is_onboarded || false;
        const allUserData = profileData?.health_profile || {};
        
        setProfile({ 
          uid: data.user.id, 
          displayName: profileData?.display_name || email.split('@')[0], 
          onboardingCompleted: isOnboarded, 
          healthProfile: allUserData.healthProfile || null, 
          role: role,
          isAppLockEnabled: allUserData.appSettings?.isAppLockEnabled,
          appLockPin: allUserData.appSettings?.appLockPin,
          hideNotifications: allUserData.appSettings?.hideNotifications,
        });

        if (allUserData.periodEvents) {
          useCycleStore.getState().setPeriodEvents(allUserData.periodEvents, true);
        }

        if (isHusband) {
          router.replace('/auth/scan-qr');
        } else if (isOnboarded) {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Feather name="arrow-left" size={28} color={colors.text} />
      </Pressable>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.title}>{isRegistering ? 'Đăng ký' : 'Chào mừng trở lại'}</Text>
        <Text style={styles.subtitle}>{isHusband ? 'Tài khoản Đồng hành (Chồng)' : 'Dành riêng cho phái đẹp'}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email của bạn"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Pressable style={styles.primaryBtn} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>{isRegistering ? 'Tạo tài khoản' : 'Đăng nhập'}</Text>}
          </Pressable>
        </View>

        <Pressable onPress={() => setIsRegistering(!isRegistering)} style={{ marginTop: 30 }}>
          <Text style={styles.switchText}>
            {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  backBtn: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 40 },
  
  form: { gap: 15 },
  input: { backgroundColor: colors.card, padding: 20, borderRadius: 20, fontSize: 16, color: colors.text, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  errorText: { color: '#F44336', marginLeft: 10, fontSize: 14 },
  
  primaryBtn: { backgroundColor: colors.primary, padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 10, boxShadow: '0px 8px 16px rgba(255, 141, 161, 0.3)' },
  primaryBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  switchText: { textAlign: 'center', color: colors.primary, fontSize: 16, fontWeight: '600' }
});
