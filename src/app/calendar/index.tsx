import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { useState } from 'react';
import { useCycleStore } from '../../store/useCycleStore';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function Calendar() {
  const router = useRouter();

  const { prediction, periodEvents } = useCycleStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const today = new Date();
  const CURRENT_DAY = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : -1;

  // Tính toán mảng ngày cho tháng hiện tại
  let PERIOD_DAYS: number[] = [];
  let FERTILE_DAYS: number[] = [];
  let OVULATION_DAY: number = -1;

  // Render các ngày kinh nguyệt thực tế
  periodEvents.forEach(ev => {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (start.getFullYear() === year && start.getMonth() === month) {
      for (let d = start.getDate(); d <= Math.min(end.getDate(), daysInMonth); d++) {
        PERIOD_DAYS.push(d);
      }
    }
  });

  // Render dự đoán (Tương lai)
  if (prediction) {
    const pStart = new Date(prediction.predictedStartDate);
    const pEnd = new Date(prediction.predictedEndDate);
    if (pStart.getFullYear() === year && pStart.getMonth() === month) {
      for (let d = pStart.getDate(); d <= Math.min(pEnd.getDate(), daysInMonth); d++) {
        PERIOD_DAYS.push(d);
      }
    }

    if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
      const fStart = new Date(prediction.fertileWindowStart);
      const fEnd = new Date(prediction.fertileWindowEnd);
      if (fStart.getFullYear() === year && fStart.getMonth() === month) {
        for (let d = fStart.getDate(); d <= Math.min(fEnd.getDate(), daysInMonth); d++) {
          FERTILE_DAYS.push(d);
        }
      }
    }

    if (prediction.ovulationDate) {
      const oDay = new Date(prediction.ovulationDate);
      if (oDay.getFullYear() === year && oDay.getMonth() === month) {
        OVULATION_DAY = oDay.getDate();
      }
    }
  }

  const getDayStyle = (day: number) => {
    if (day === CURRENT_DAY) return styles.currentDay;
    if (PERIOD_DAYS.includes(day)) return styles.periodDay;
    if (day === OVULATION_DAY) return styles.ovulationDay;
    if (FERTILE_DAYS.includes(day)) return styles.fertileDay;
    return styles.normalDay;
  };

  const getDayTextStyle = (day: number) => {
    if (day === CURRENT_DAY) return styles.currentDayText;
    if (PERIOD_DAYS.includes(day)) return styles.periodDayText;
    if (day === OVULATION_DAY) return styles.ovulationDayText;
    if (FERTILE_DAYS.includes(day)) return styles.fertileDayText;
    return styles.normalDayText;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lịch chu kỳ</Text>
        <Pressable style={styles.backBtn}>
          <Feather name="calendar" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.monthSelector}>
          <Pressable onPress={handlePrevMonth}>
            <Feather name="chevron-left" size={24} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.monthText}>Tháng {month + 1}, {year}</Text>
          <Pressable onPress={handleNextMonth}>
            <Feather name="chevron-right" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {/* Pad empty days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.dayCell} />
            ))}
            
            {days.map(day => (
              <Pressable key={day} style={styles.dayCell}>
                <View style={[styles.dayCircle, getDayStyle(day)]}>
                  <Text style={[styles.dayText, getDayTextStyle(day)]}>{day}</Text>
                </View>
                {PERIOD_DAYS.includes(day) && <View style={styles.bloodDrop} />}
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.legendTitle}>Chú thích</Text>
        <View style={styles.legendCard}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Ngày đèn đỏ</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#E0F7FA' }]} />
            <Text style={styles.legendText}>Cửa sổ thụ thai</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#00BCD4' }]} />
            <Text style={styles.legendText}>Ngày rụng trứng</Text>
          </View>
        </View>

        <Pressable style={styles.actionCard} onPress={() => alert('Sẽ cập nhật ở phiên bản tới nhé!')}>
          <View style={styles.actionIconBox}>
            <FontAwesome5 name="pen" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Chỉnh sửa chu kỳ</Text>
            <Text style={styles.actionDesc}>Cập nhật lại ngày bắt đầu hoặc kết thúc nếu có sai lệch.</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textMuted} />
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  scrollContent: { padding: 24, paddingBottom: 60 },

  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  monthText: { fontSize: 20, fontWeight: '800', color: colors.text },

  calendarCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 30, boxShadow: '0px 8px 24px rgba(0,0,0,0.04)' },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  weekdayText: { width: '14.2%', textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.textMuted },
  
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 16, fontWeight: '600' },
  
  bloodDrop: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#F44336', position: 'absolute', bottom: -5 },

  normalDay: { backgroundColor: 'transparent' },
  normalDayText: { color: colors.text },
  
  currentDay: { borderWidth: 2, borderColor: colors.primary, backgroundColor: 'transparent' },
  currentDayText: { color: colors.primary, fontWeight: '800' },
  
  periodDay: { backgroundColor: colors.primary },
  periodDayText: { color: 'white', fontWeight: '800' },
  
  fertileDay: { backgroundColor: '#E0F7FA' },
  fertileDayText: { color: '#006064' },
  
  ovulationDay: { backgroundColor: '#00BCD4' },
  ovulationDayText: { color: 'white', fontWeight: '800' },

  legendTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 15, marginLeft: 5 },
  legendCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginRight: 15 },
  legendText: { fontSize: 15, fontWeight: '600', color: colors.text },

  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight + '20', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.primaryLight },
  actionIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  actionDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
