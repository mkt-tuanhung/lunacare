import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';

export default function LoginWife() {
  const router = useRouter();
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Bắt ép vào thẳng Onboarding 20 câu hỏi sau khi đăng ký
        setProfile({ uid: 'temp_wife_id', displayName: email.split('@')[0], onboardingCompleted: false, healthProfile: null, role: 'wife' });
        router.replace('/onboarding');
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Kiểm tra xem đã làm Onboarding chưa
        setProfile({ uid: data.user?.id, displayName: email.split('@')[0], onboardingCompleted: false, healthProfile: null, role: 'wife' });
        router.replace('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Chức năng này yêu cầu cài đặt Google OAuth trong Supabase Dashboard
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setErrorMsg('Chưa cấu hình Google OAuth trên Supabase');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Feather name="arrow-left" size={28} color={colors.text} />
      </Pressable>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.title}>{isRegistering ? 'Đăng ký' : 'Chào mừng trở lại'}</Text>
        <Text style={styles.subtitle}>Dành riêng cho phái đẹp</Text>

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

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Hoặc</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.googleBtn} onPress={handleGoogleLogin}>
          <FontAwesome5 name="google" size={18} color="#DB4437" />
          <Text style={styles.googleBtnText}>Đăng nhập với Google</Text>
        </Pressable>

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

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 15, color: colors.textMuted, fontWeight: '600' },

  googleBtn: { flexDirection: 'row', backgroundColor: 'white', padding: 18, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 15, boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
  googleBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },

  switchText: { textAlign: 'center', color: colors.primary, fontSize: 16, fontWeight: '600' }
});
