import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadSeedData } from '../data/seedData';
import { useProfileStore } from '../store/useProfileStore';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const profile = useProfileStore((state) => state.profile);

  useEffect(() => {
    // Load giả lập dữ liệu local khi app vừa mở
    loadSeedData();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading LunaCare...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="home/index" />
      <Stack.Screen name="calendar/index" />
      <Stack.Screen name="log/index" />
      <Stack.Screen name="insights/index" />
      <Stack.Screen name="care/index" />
      <Stack.Screen name="partner/index" />
    </Stack>
  );
}
