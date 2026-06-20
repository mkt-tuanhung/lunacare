import { Stack, Redirect, useSegments } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { loadSeedData } from '../data/seedData';
import { useProfileStore } from '../store/useProfileStore';
import { View, Text, AppState, StyleSheet, Pressable, Modal } from 'react-native';
import CustomSplash from '../components/CustomSplash';
import PinPad from '../components/PinPad';
import FakeNotesApp from '../components/FakeNotesApp';
import ToastNotification from '../components/ToastNotification';
import CustomAlertProvider from '../components/CustomAlertProvider';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [showFakeNotes, setShowFakeNotes] = useState(false);
  const appState = useRef(AppState.currentState);
  const profile = useProfileStore((state) => state.profile);

  const [pinError, setPinError] = useState('');

  const handleUnlock = (pin: string) => {
    const currentProfile = useProfileStore.getState().profile;
    if (pin === currentProfile?.appLockPin) {
      setIsLocked(false);
      setPinError('');
    } else if (currentProfile?.panicPin && pin === currentProfile.panicPin) {
      setIsLocked(false);
      setShowFakeNotes(true);
      setPinError('');
    } else {
      setPinError('Mã PIN không đúng, thử lại');
    }
  };

  useEffect(() => {
    if (profile?.isAppLockEnabled) {
      setIsLocked(true);
      setPinError('');
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const currentProfile = useProfileStore.getState().profile;
        if (currentProfile?.isAppLockEnabled) {
          setIsLocked(true);
          setPinError('');
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
      <Modal visible={isLocked} animationType="fade">
        <PinPad 
          title="Ứng dụng đã bị khóa"
          subtitle="Vui lòng nhập mã PIN để mở khóa"
          error={pinError}
          onComplete={handleUnlock}
        />
      </Modal>
    );
  }

  if (showFakeNotes) {
    return <FakeNotesApp />;
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
    <CustomAlertProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <ToastNotification />
      </View>
    </CustomAlertProvider>
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
