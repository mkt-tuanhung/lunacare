import { useCycleStore } from '../store/useCycleStore';
import { useProfileStore } from '../store/useProfileStore';

export function loadSeedData() {
  const { setProfile } = useProfileStore.getState();
  const { setPeriodEvents } = useCycleStore.getState();

  // Khởi tạo Profile mặc định
  setProfile({
    id: 'profile-1',
    userId: 'user-1',
    displayName: 'Luna',
    cycleGoal: 'cycle_tracking',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    privacyModeEnabled: true,
    isOnboarded: true,
  });

  // Tạo một số dữ liệu chu kỳ giả định (quá khứ đến hiện tại)
  const today = new Date();
  
  // Tính toán ngược lại các chu kỳ trước
  const format = (d: Date) => d.toISOString().split('T')[0];
  
  // Kỳ gần nhất: cách đây 20 ngày
  const lastPeriodStart = new Date(today);
  lastPeriodStart.setDate(today.getDate() - 20);
  
  const lastPeriodEnd = new Date(lastPeriodStart);
  lastPeriodEnd.setDate(lastPeriodStart.getDate() + 4);

  // Kỳ trước đó: cách lastPeriodStart 28 ngày
  const prevPeriodStart = new Date(lastPeriodStart);
  prevPeriodStart.setDate(prevPeriodStart.getDate() - 28);
  
  const prevPeriodEnd = new Date(prevPeriodStart);
  prevPeriodEnd.setDate(prevPeriodStart.getDate() + 5);

  // Kỳ trước nữa: cách prevPeriodStart 30 ngày
  const prevPrevPeriodStart = new Date(prevPeriodStart);
  prevPrevPeriodStart.setDate(prevPrevPeriodStart.getDate() - 30);
  
  const prevPrevPeriodEnd = new Date(prevPrevPeriodStart);
  prevPrevPeriodEnd.setDate(prevPrevPeriodStart.getDate() + 4);

  setPeriodEvents([
    {
      id: 'event-3',
      userId: 'user-1',
      startDate: format(prevPrevPeriodStart),
      endDate: format(prevPrevPeriodEnd),
      isConfirmed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-2',
      userId: 'user-1',
      startDate: format(prevPeriodStart),
      endDate: format(prevPeriodEnd),
      isConfirmed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-1',
      userId: 'user-1',
      startDate: format(lastPeriodStart),
      endDate: format(lastPeriodEnd),
      isConfirmed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]);
}
