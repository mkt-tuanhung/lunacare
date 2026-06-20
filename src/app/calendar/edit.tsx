import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function EditCycleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { periodEvents, setPeriodEvents } = useCycleStore();
  const { profile } = useProfileStore();

  // Khởi tạo mảng Draft từ periodEvents hiện tại
  const initialDraft = useMemo(() => {
    const draft = new Set<string>();
    periodEvents.forEach(ev => {
      let current = new Date(ev.startDate);
      const end = new Date(ev.endDate ?? ev.startDate);
      while (current <= end) {
        draft.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    return draft;
  }, [periodEvents]);

  const [draftDays, setDraftDays] = useState<Set<string>>(initialDraft);

  // Sinh ra mảng các tháng (vd: 6 tháng trước -> 3 tháng sau)
  const monthsData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -6; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      data.push({
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return data;
  }, []);

  const toggleDay = (dateStr: string) => {
    setDraftDays(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (draftDays.size === 0) {
      setPeriodEvents([]);
      router.back();
      return;
    }

    const sortedDates = Array.from(draftDays).sort();
    
    const newEvents: any[] = [];
    let currentStart = sortedDates[0];
    let currentEnd = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentEnd);
      const currDate = new Date(sortedDates[i]);
      
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Liền kề -> Nối tiếp
        currentEnd = sortedDates[i];
      } else {
        // Cắt đứt -> Lưu cụm trước và bắt đầu cụm mới
        newEvents.push({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          userId: profile?.uid || 'guest',
          startDate: currentStart,
          endDate: currentEnd,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        currentStart = sortedDates[i];
        currentEnd = sortedDates[i];
      }
    }

    // Đẩy cụm cuối cùng vào
    newEvents.push({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      userId: profile?.uid || 'guest',
      startDate: currentStart,
      endDate: currentEnd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setPeriodEvents(newEvents);
    router.back();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar (Cố định kiểu iOS) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}></View>
        <Text style={styles.headerTitle}>Chỉnh sửa kỳ kinh</Text>
        <View style={styles.headerRight}></View>
      </View>

      <View style={styles.weekdaysHeader}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {monthsData.map((m, idx) => {
          const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
          const firstDayOfMonth = new Date(m.year, m.month, 1).getDay();
          const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

          const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <View key={`${m.year}-${m.month}`} style={styles.monthContainer}>
              <View style={styles.monthTitleRow}>
                <Text style={styles.monthTitleText}>Tháng {m.month + 1}</Text>
              </View>
              
              <View style={styles.daysGrid}>
                {Array.from({ length: startOffset }).map((_, i) => (
                  <View key={`pad-${i}`} style={styles.dayCell} />
                ))}
                
                {days.map(day => {
                  const dateStr = new Date(Date.UTC(m.year, m.month, day)).toISOString().split('T')[0];
                  const isSelected = draftDays.has(dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <Pressable key={day} style={styles.dayCell} onPress={() => toggleDay(dateStr)}>
                      {isToday && <Text style={styles.todayLabel}>HÔM NAY</Text>}
                      <Text style={[styles.dayNum, isSelected && { color: colors.primary, fontWeight: '700' }]}>{day}</Text>
                      
                      <View style={[styles.circle, isSelected ? styles.circleSelected : styles.circleEmpty]}>
                        {isSelected && <Feather name="check" size={14} color="white" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.bottomBtn}>
          <Text style={styles.cancelText}>Huỷ</Text>
        </Pressable>
        <Pressable onPress={handleSave} style={styles.bottomBtn}>
          <Text style={styles.saveText}>Lưu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  headerLeft: { width: 50 },
  headerRight: { width: 50, alignItems: 'flex-end' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  
  weekdaysHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  weekdayText: { width: '14.28%', textAlign: 'center', fontSize: 12, fontWeight: '500', color: colors.textMuted },
  
  scrollContent: { paddingBottom: 100 },

  monthContainer: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 20 },
  monthTitleRow: { alignItems: 'center', paddingVertical: 15 },
  monthTitleText: { fontSize: 18, fontWeight: '700', color: colors.text },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', height: 75, justifyContent: 'center' },
  
  todayLabel: { fontSize: 10, fontWeight: '800', color: colors.text, position: 'absolute', top: 5 },
  dayNum: { fontSize: 17, fontWeight: '500', color: colors.text, marginBottom: 8, marginTop: 10 },
  
  circle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  circleEmpty: { borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: 'transparent' },
  circleSelected: { backgroundColor: '#FF4B72', borderWidth: 0 },

  bottomBar: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 15,
    borderTopWidth: 1, borderTopColor: '#F0F0F0'
  },
  bottomBtn: { padding: 10 },
  cancelText: { fontSize: 17, fontWeight: '500', color: '#FF4B72' },
  saveText: { fontSize: 17, fontWeight: '700', color: '#FF4B72' }
});
