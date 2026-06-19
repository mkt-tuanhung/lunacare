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

  // Mọi thứ hoàn tất -> Kiểm tra Role để phân luồng
  if (profile.role === 'husband') {
    return <Redirect href="/husband-dashboard" />;
  }

  // Nếu là Vợ thì vào Trang chủ bình thường
  return <Redirect href="/home" />;
}
