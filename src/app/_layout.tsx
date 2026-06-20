import { Stack, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadSeedData } from '../data/seedData';
import { useProfileStore } from '../store/useProfileStore';
import { View, Text } from 'react-native';
import CustomSplash from '../components/CustomSplash';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const profile = useProfileStore((state) => state.profile);

  useEffect(() => {
    setIsReady(true);
    
    // Tắt intro màn hình chờ sau 2.5 giây
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || showSplash) {
    return <CustomSplash />;
  }

  // Bảo vệ route toàn cầu (Global Guard)
  // Nếu chưa có profile mà cố tình truy cập các trang nội bộ (onboarding, home, partner...)
  // thì sẽ bị tự động đá về màn hình Chọn Vai trò.
  // Các màn hình Auth (role, login, scan-qr) được phép truy cập tự do.
  const isAuthRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/auth');
  if (!profile && !isAuthRoute && typeof window !== 'undefined' && window.location.pathname !== '/') {
    return <Redirect href="/auth/role" />;
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
