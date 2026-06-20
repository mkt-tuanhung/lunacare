import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useToastStore } from '../store/useToastStore';

// Khởi tạo handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Xin quyền
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
  
  // Lấy token thiết bị nếu cần (Push Notification)
  // token = (await Notifications.getExpoPushTokenAsync()).data;
  // console.log("Push Token: ", token);
  return token;
}

// Lên lịch Sleep Protection (Nhắc ngủ sớm lúc 21:00 trước kỳ)
export async function scheduleSleepProtection() {
  if (Platform.OS === 'web') {
    // Trên Web, dùng In-App Toast
    setTimeout(() => {
      useToastStore.getState().showToast("🌜 Thời điểm vàng: Cố gắng ngủ trước 22:30 để giữ sức khỏe nhé!", "info");
    }, 2000); // Hiện sau 2 giây cho hiệu ứng tốt
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌜 Thời điểm vàng để nghỉ ngơi!",
      body: "Chỉ còn vài ngày nữa là tới kỳ kinh, hãy cố gắng đi ngủ sớm trước 22:30 tối nay để tích trữ năng lượng nhé!",
      data: { type: 'sleep_protection' },
    },
    trigger: {
      seconds: 5, // Testing
    },
  });
  console.log("Đã lên lịch Sleep Protection");
}

// Lên lịch Smart Grocery
export async function scheduleSmartGrocery() {
  if (Platform.OS === 'web') {
    setTimeout(() => {
      useToastStore.getState().showToast("🛒 Smart Grocery: Bạn nên mua thêm Socola đen và Trà gừng!", "warning");
    }, 4000);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🛒 Smart Grocery đã sẵn sàng!",
      body: "Bạn sắp tới kỳ, hệ thống đã chuẩn bị sẵn danh sách đi siêu thị (Socola đen, BVS, trà gừng). Xem ngay!",
      data: { type: 'smart_grocery' },
    },
    trigger: {
      seconds: 10, // Testing
    },
  });
  console.log("Đã lên lịch Smart Grocery");
}
