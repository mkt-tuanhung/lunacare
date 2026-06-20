import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { useState, useEffect } from 'react';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function Calendar() {
  const router = useRouter();

  const { prediction, periodEvents } = useCycleStore();
  const { profile } = useProfileStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [monthLogs, setMonthLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { togglePeriodDay } = useCycleStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    async function fetchMonthLogs() {
      if (!profile?.uid) return;
      
      const startDate = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];
      const endDate = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.uid)
        .gte('log_date', startDate)
        .lte('log_date', endDate);
        
      if (data) setMonthLogs(data);
    }
    fetchMonthLogs();
  }, [year, month, profile?.uid]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const today = new Date();
  const CURRENT_DAY = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : -1;

  // Tính toán mảng ngày cho tháng hiện tại
  let PERIOD_DAYS: number[] = [];
  let FERTILE_DAYS: number[] = [];
  let PMS_DAYS: number[] = [];
  let OVULATION_DAY: number = -1;

  // Helper: thu thập tất cả ngày trong khoảng [startStr, endStr] thuộc tháng đang xem
  const collectDaysInMonth = (startStr: string, endStr: string): number[] => {
    const result: number[] = [];
    const [sy, sm, sd] = startStr.split('-').map(Number);
    const [ey, em, ed] = endStr.split('-').map(Number);
    const rangeStart = new Date(sy, sm - 1, sd);
    const rangeEnd = new Date(ey, em - 1, ed);
    // duyệt từng ngày trong range, chỉ lấy ngày thuộc tháng/năm đang xem
    for (let cur = new Date(rangeStart); cur <= rangeEnd; cur.setDate(cur.getDate() + 1)) {
      if (cur.getFullYear() === year && cur.getMonth() === month) {
        result.push(cur.getDate());
      }
    }
    return result;
  };

  // Render các ngày kinh nguyệt thực tế (hỗ trợ cross-month)
  periodEvents.forEach(ev => {
    const endStr = ev.endDate || ev.startDate;
    PERIOD_DAYS.push(...collectDaysInMonth(ev.startDate, endStr));
  });

  // Render dự đoán (Tương lai)
  if (prediction && prediction.predictedStartDate && prediction.predictedEndDate) {
    PERIOD_DAYS.push(...collectDaysInMonth(prediction.predictedStartDate, prediction.predictedEndDate));

    if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
      FERTILE_DAYS.push(...collectDaysInMonth(prediction.fertileWindowStart, prediction.fertileWindowEnd));
    }

    if (prediction.ovulationDate) {
      const [oy, om, od] = prediction.ovulationDate.split('-').map(Number);
      if (oy === year && om - 1 === month) {
        OVULATION_DAY = od;
      }
    }

    if (prediction.pmsWindowStart && prediction.pmsWindowEnd) {
      PMS_DAYS.push(...collectDaysInMonth(prediction.pmsWindowStart, prediction.pmsWindowEnd));
    }
  }

  const getDayStyle = (day: number) => {
    if (day === CURRENT_DAY) return styles.currentDay;
    if (PERIOD_DAYS.includes(day)) return styles.periodDay;
    if (day === OVULATION_DAY) return styles.ovulationDay;
    if (FERTILE_DAYS.includes(day)) return styles.fertileDay;
    if (PMS_DAYS.includes(day)) return styles.pmsDay;
    return styles.normalDay;
  };

  const getDayTextStyle = (day: number) => {
    if (day === CURRENT_DAY) return styles.currentDayText;
    if (PERIOD_DAYS.includes(day)) return styles.periodDayText;
    if (day === OVULATION_DAY) return styles.ovulationDayText;
    if (FERTILE_DAYS.includes(day)) return styles.fertileDayText;
    if (PMS_DAYS.includes(day)) return styles.pmsDayText;
    return styles.normalDayText;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayPress = (day: number) => {
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    togglePeriodDay(dateStr);
  };

  const handleDayLongPress = (day: number) => {
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    
    const log = monthLogs.find(l => l.log_date === dateStr);
    setSelectedLog(log || null);
    setModalVisible(true);
  };

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
            
            {days.map(day => {
              const hasLog = monthLogs.some(l => {
                const d2 = new Date(year, month, day);
                const ds = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
                return l.log_date === ds;
              });
              return (
                <Pressable 
                  key={day} 
                  style={styles.dayCell} 
                  onPress={() => handleDayPress(day)}
                  onLongPress={() => handleDayLongPress(day)}
                  delayLongPress={300}
                >
                  <View style={[styles.dayCircle, getDayStyle(day)]}>
                    <Text style={[styles.dayText, getDayTextStyle(day)]}>{day}</Text>
                  </View>
                  {PERIOD_DAYS.includes(day) && <View style={styles.bloodDrop} />}
                  {hasLog && !PERIOD_DAYS.includes(day) && <View style={[styles.bloodDrop, { backgroundColor: '#4CAF50' }]} />}
                </Pressable>
              );
            })}
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

        <Pressable style={styles.actionCard} onPress={() => router.push('/calendar/edit')}>
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

      {/* Modal Lịch sử */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nhật ký ngày {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('vi-VN') : ''}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            {selectedLog ? (
              <ScrollView>
                {selectedLog.is_period_day && (
                  <View style={styles.modalRow}>
                    <MaterialCommunityIcons name="water" size={20} color="#D32F2F" />
                    <Text style={styles.modalRowText}>Đang hành kinh (Lượng máu: {selectedLog.flow_level || 'Bình thường'})</Text>
                  </View>
                )}
                
                {selectedLog.moods && selectedLog.moods.length > 0 && (
                  <View style={styles.modalRow}>
                    <Feather name="smile" size={20} color={colors.primary} />
                    <Text style={styles.modalRowText}>Tâm trạng: <Text style={{fontWeight: '700'}}>{selectedLog.moods.join(', ')}</Text></Text>
                  </View>
                )}
                
                {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
                  <View style={styles.modalRow}>
                    <Feather name="activity" size={20} color={colors.primary} />
                    <Text style={styles.modalRowText}>Triệu chứng: {selectedLog.symptoms.join(', ')}</Text>
                  </View>
                )}

                {selectedLog.water_cups !== null && (
                  <View style={styles.modalRow}>
                    <MaterialCommunityIcons name="cup-water" size={20} color="#2196F3" />
                    <Text style={styles.modalRowText}>Nước: {selectedLog.water_cups} ly</Text>
                  </View>
                )}
                
                {selectedLog.sleep_hours !== null && (
                  <View style={styles.modalRow}>
                    <Feather name="moon" size={20} color="#7B1FA2" />
                    <Text style={styles.modalRowText}>Ngủ {selectedLog.sleep_hours} tiếng</Text>
                  </View>
                )}

                {selectedLog.notes && (
                  <View style={[styles.modalRow, {alignItems: 'flex-start'}]}>
                    <Feather name="file-text" size={20} color={colors.textMuted} />
                    <Text style={[styles.modalRowText, {flex: 1, fontStyle: 'italic', color: colors.textMuted}]}>{selectedLog.notes}</Text>
                  </View>
                )}

                <Pressable 
                  style={{ backgroundColor: colors.primaryLight + '20', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 }}
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/log?date=${selectedDateStr}`);
                  }}
                >
                  <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>Sửa Ghi Chú Ngày Này</Text>
                </Pressable>
              </ScrollView>
            ) : (
              <View style={styles.emptyLogBox}>
                <Feather name="file-minus" size={40} color={colors.border} style={{marginBottom: 10}}/>
                <Text style={styles.emptyLogText}>Bạn chưa ghi chép gì vào ngày này.</Text>
                
                <Pressable 
                  style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, width: '100%' }}
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/log?date=${selectedDateStr}`);
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Ghi Nhận Ngay</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
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

  pmsDay: { backgroundColor: '#EDE7F6' },
  pmsDayText: { color: '#6A1B9A', fontWeight: '700' },

  emptyLogBox: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  emptyLogText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  legendTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 15, marginLeft: 5 },
  legendCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginRight: 15 },
  legendText: { fontSize: 15, fontWeight: '600', color: colors.text },

  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight + '20', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.primaryLight },
  actionIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primaryLight + '20', justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  actionDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20, paddingRight: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 300, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  
  toggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, marginBottom: 20, gap: 10 },
  toggleBtnInactive: { backgroundColor: '#FF4B72' },
  toggleBtnActive: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  toggleBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },

  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalRowText: { fontSize: 16, color: colors.text, flex: 1 }
});
