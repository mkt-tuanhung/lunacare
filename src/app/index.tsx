import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';

export default function Index() {
  const [isMounted, setIsMounted] = useState(false);
  const profile = useProfileStore((state) => state.profile);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Nếu chưa có profile (chưa đăng nhập), ép sang màn hình Chọn Vai Trò
  if (!profile) return <Redirect href="/auth/role" />;

  // Đã đăng nhập nhưng chưa làm khảo sát 20 câu -> Ép vào màn khảo sát
  if (!profile.onboardingCompleted) return <Redirect href="/onboarding" />;

  // Mọi thứ hoàn tất -> Vào Trang chủ
  return <Redirect href="/home" />;
}
