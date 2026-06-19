import { Stack, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadSeedData } from '../data/seedData';
import { useProfileStore } from '../store/useProfileStore';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const profile = useProfileStore((state) => state.profile);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading LunaCare...</Text>
      </View>
    );
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
