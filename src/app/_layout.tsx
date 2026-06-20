import { Stack, Redirect, useSegments } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { loadSeedData } from '../data/seedData';
import { useProfileStore } from '../store/useProfileStore';
import { View, Text, AppState, StyleSheet, Pressable } from 'react-native';
import CustomSplash from '../components/CustomSplash';
import * as LocalAuthentication from 'expo-local-authentication';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const profile = useProfileStore((state) => state.profile);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để mở LunaCare',
        fallbackLabel: 'Sử dụng mật khẩu',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setIsLocked(false);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (profile?.isAppLockEnabled) {
      setIsLocked(true);
      handleBiometricAuth();
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const currentProfile = useProfileStore.getState().profile;
        if (currentProfile?.isAppLockEnabled) {
          setIsLocked(true);
          handleBiometricAuth();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [profile?.isAppLockEnabled]);

  useEffect(() => {
    setIsReady(true);
    
    // Tắt intro màn hình chờ sau 1.5 giây
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || showSplash) {
    return <CustomSplash />;
  }

  if (isLocked) {
    return (
      <View style={styles.lockContainer}>
        <Feather name="lock" size={60} color={colors.primary} style={{marginBottom: 20}} />
        <Text style={styles.lockTitle}>Ứng dụng đã bị khóa</Text>
        <Text style={styles.lockDesc}>Vui lòng xác thực Face ID / Passcode để tiếp tục sử dụng.</Text>
        <Pressable style={styles.unlockBtn} onPress={handleBiometricAuth}>
          <Text style={styles.unlockBtnText}>Mở khóa</Text>
        </Pressable>
      </View>
    );
  }

  // Bảo vệ route toàn cầu (Global Guard)
  // Nếu chưa có profile mà cố tình truy cập các trang nội bộ (onboarding, home, partner...)
  // thì sẽ bị tự động đá về màn hình Chọn Vai trò.
  // Các màn hình Auth (role, login, scan-qr) được phép truy cập tự do.
  const isAuthRoute = segments[0] === 'auth';
  const isRoot = segments.length === 0;
  
  if (!profile && !isAuthRoute && !isRoot) {
    return <Redirect href="/auth/role" />;
  }

  // Nếu ĐÃ ĐĂNG NHẬP mà lại vô tình mở lại trang auth (VD: share link /auth/role) -> Đá thẳng vào Dashboard
  if (profile && isAuthRoute) {
    if (!profile.onboardingCompleted) {
      return <Redirect href="/onboarding" />;
    } else {
      if (profile.role === 'husband') return <Redirect href="/husband-dashboard" />;
      return <Redirect href="/home" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/role" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/scan-qr" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="home/index" />
      <Stack.Screen name="calendar/index" />
      <Stack.Screen name="log/index" />
      <Stack.Screen name="insights/index" />
      <Stack.Screen name="care/index" />
      <Stack.Screen name="partner/index" />
      <Stack.Screen name="husband-dashboard/index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  lockDesc: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
  },
  unlockBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  unlockBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
