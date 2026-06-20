import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useState, useEffect } from 'react';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function Calendar() {
  const router = useRouter();

  const { prediction, periodEvents, setPeriodEvents } = useCycleStore();
  const { profile } = useProfileStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [monthLogs, setMonthLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Edit mode inline
  const [isEditing, setIsEditing] = useState(false);
  const [draftDays, setDraftDays] = useState<Set<string>>(new Set());

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

  const initDraft = () => {
    const draft = new Set<string>();
    periodEvents.forEach(ev => {
      const end = ev.endDate ?? ev.startDate;
      const [sy, sm, sd] = ev.startDate.split('-').map(Number);
      const [ey, em, ed] = end.split('-').map(Number);
      let cur = new Date(sy, sm - 1, sd);
      const endDate = new Date(ey, em - 1, ed);
      while (cur <= endDate) {
        draft.add(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return draft;
  };

  const handleStartEdit = () => {
    setDraftDays(initDraft());
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = () => {
    if (draftDays.size === 0) {
      setPeriodEvents([]);
      setIsEditing(false);
      return;
    }
    const sortedDates = Array.from(draftDays).sort();
    const newEvents: any[] = [];
    let currentStart = sortedDates[0];
    let currentEnd = sortedDates[0];
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (new Date(sortedDates[i]).getTime() - new Date(currentEnd).getTime()) / 86400000;
      if (diff === 1) {
        currentEnd = sortedDates[i];
      } else {
        newEvents.push({ id: Date.now().toString(36) + Math.random().toString(36).substring(2), userId: profile?.uid || 'guest', startDate: currentStart, endDate: currentEnd, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        currentStart = sortedDates[i];
        currentEnd = sortedDates[i];
      }
    }
    newEvents.push({ id: Date.now().toString(36) + Math.random().toString(36).substring(2), userId: profile?.uid || 'guest', startDate: currentStart, endDate: currentEnd, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    setPeriodEvents(newEvents);
    setIsEditing(false);
  };

  const toggleDraftDay = (dateStr: string) => {
    setDraftDays(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const today = new Date();
  const CURRENT_DAY = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : -1;

  let PERIOD_DAYS: number[] = [];
  let FERTILE_DAYS: number[] = [];
  let PMS_DAYS: number[] = [];
  let OVULATION_DAY: number = -1;

  const collectDaysInMonth = (startStr: string, endStr: string): number[] => {
    const result: number[] = [];
    const [sy, sm, sd] = startStr.split('-').map(Number);
    const [ey, em, ed] = endStr.split('-').map(Number);
    for (let cur = new Date(sy, sm - 1, sd), end = new Date(ey, em - 1, ed); cur <= end; cur.setDate(cur.getDate() + 1)) {
      if (cur.getFullYear() === year && cur.getMonth() === month) result.push(cur.getDate());
    }
    return result;
  };

  periodEvents.forEach(ev => {
    PERIOD_DAYS.push(...collectDaysInMonth(ev.startDate, ev.endDate || ev.startDate));
  });

  if (prediction?.predictedStartDate && prediction?.predictedEndDate) {
    PERIOD_DAYS.push(...collectDaysInMonth(prediction.predictedStartDate, prediction.predictedEndDate));

    const fertileStart = prediction.currentFertileWindowStart ?? prediction.fertileWindowStart;
    const fertileEnd = prediction.currentFertileWindowEnd ?? prediction.fertileWindowEnd;
    if (fertileStart && fertileEnd) FERTILE_DAYS.push(...collectDaysInMonth(fertileStart, fertileEnd));

    const ovDate = prediction.currentOvulationDate ?? prediction.ovulationDate;
    if (ovDate) {
      const [oy, om, od] = ovDate.split('-').map(Number);
      if (oy === year && om - 1 === month) OVULATION_DAY = od;
    }
    if (prediction.ovulationDate && prediction.ovulationDate !== (prediction.currentOvulationDate ?? prediction.ovulationDate)) {
      const [oy2, om2, od2] = prediction.ovulationDate.split('-').map(Number);
      if (oy2 === year && om2 - 1 === month) OVULATION_DAY = od2;
    }

    const pmsStart = prediction.currentPmsWindowStart ?? prediction.pmsWindowStart;
    const pmsEnd = prediction.currentPmsWindowEnd ?? prediction.pmsWindowEnd;
    if (pmsStart && pmsEnd) PMS_DAYS.push(...collectDaysInMonth(pmsStart, pmsEnd));
    if (prediction.pmsWindowStart && prediction.pmsWindowEnd &&
        prediction.pmsWindowStart !== (prediction.currentPmsWindowStart ?? prediction.pmsWindowStart)) {
      PMS_DAYS.push(...collectDaysInMonth(prediction.pmsWindowStart, prediction.pmsWindowEnd));
    }
  }

  const getDateStr = (day: number) => {
    const d = new Date(year, month, day);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDayStyle = (day: number, dateStr: string) => {
    if (isEditing) {
      if (draftDays.has(dateStr)) return styles.periodDay;
      if (day === CURRENT_DAY) return styles.currentDay;
      return styles.normalDay;
    }
    if (day === CURRENT_DAY) return styles.currentDay;
    if (PERIOD_DAYS.includes(day)) return styles.periodDay;
    if (day === OVULATION_DAY) return styles.ovulationDay;
    if (FERTILE_DAYS.includes(day)) return styles.fertileDay;
    if (PMS_DAYS.includes(day)) return styles.pmsDay;
    return styles.normalDay;
  };

  const getDayTextStyle = (day: number, dateStr: string) => {
    if (isEditing) {
      if (draftDays.has(dateStr)) return styles.periodDayText;
      if (day === CURRENT_DAY) return styles.currentDayText;
      return styles.normalDayText;
    }
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
    const dateStr = getDateStr(day);
    if (isEditing) {
      toggleDraftDay(dateStr);
      return;
    }
    const log = monthLogs.find(l => l.log_date === dateStr);
    setSelectedDateStr(dateStr);
    setSelectedLog(log || null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Chỉnh sửa kỳ kinh' : 'Lịch chu kỳ'}
        </Text>
        {isEditing ? (
          <Pressable onPress={handleCancelEdit} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Pressable onPress={handleStartEdit} style={styles.backBtn}>
            <Feather name="edit-2" size={22} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {isEditing && (
        <View style={styles.editBanner}>
          <Text style={styles.editBannerText}>Chạm vào ngày để chọn / bỏ chọn ngày kinh</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.scrollContent, isEditing && { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>

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
            {Array.from({ length: startOffset }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.dayCell} />
            ))}
            {days.map(day => {
              const dateStr = getDateStr(day);
              const hasLog = monthLogs.some(l => l.log_date === dateStr);
              const isDraft = isEditing && draftDays.has(dateStr);
              return (
                <Pressable
                  key={day}
                  style={styles.dayCell}
                  onPress={() => handleDayPress(day)}
                >
                  <View style={[styles.dayCircle, getDayStyle(day, dateStr)]}>
                    <Text style={[styles.dayText, getDayTextStyle(day, dateStr)]}>{day}</Text>
                  </View>
                  {!isEditing && PERIOD_DAYS.includes(day) && <View style={styles.bloodDrop} />}
                  {!isEditing && hasLog && !PERIOD_DAYS.includes(day) && <View style={[styles.bloodDrop, { backgroundColor: '#4CAF50' }]} />}
                  {isEditing && isDraft && <View style={styles.bloodDrop} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {!isEditing && (
          <>
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
          </>
        )}

      </ScrollView>

      {/* Nút Lưu cố định khi đang edit */}
      {isEditing && (
        <View style={styles.saveBar}>
          <Pressable onPress={handleCancelEdit} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Huỷ</Text>
          </Pressable>
          <Pressable onPress={handleSaveEdit} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Lưu</Text>
          </Pressable>
        </View>
      )}

      {/* Modal Lịch sử */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nhật ký ngày {selectedDateStr ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('vi-VN') : ''}</Text>
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
                {selectedLog.moods?.length > 0 && (
                  <View style={styles.modalRow}>
                    <Feather name="smile" size={20} color={colors.primary} />
                    <Text style={styles.modalRowText}>Tâm trạng: <Text style={{ fontWeight: '700' }}>{selectedLog.moods.join(', ')}</Text></Text>
                  </View>
                )}
                {selectedLog.symptoms?.length > 0 && (
                  <View style={styles.modalRow}>
                    <Feather name="activity" size={20} color={colors.primary} />
                    <Text style={styles.modalRowText}>Triệu chứng: {selectedLog.symptoms.join(', ')}</Text>
                  </View>
                )}
                {selectedLog.water_cups != null && (
                  <View style={styles.modalRow}>
                    <MaterialCommunityIcons name="cup-water" size={20} color="#2196F3" />
                    <Text style={styles.modalRowText}>Nước: {selectedLog.water_cups} ly</Text>
                  </View>
                )}
                {selectedLog.sleep_hours != null && (
                  <View style={styles.modalRow}>
                    <Feather name="moon" size={20} color="#7B1FA2" />
                    <Text style={styles.modalRowText}>Ngủ {selectedLog.sleep_hours} tiếng</Text>
                  </View>
                )}
                {selectedLog.notes && (
                  <View style={[styles.modalRow, { alignItems: 'flex-start' }]}>
                    <Feather name="file-text" size={20} color={colors.textMuted} />
                    <Text style={[styles.modalRowText, { flex: 1, fontStyle: 'italic', color: colors.textMuted }]}>{selectedLog.notes}</Text>
                  </View>
                )}
                <Pressable
                  style={{ backgroundColor: colors.primaryLight + '20', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 }}
                  onPress={() => { setModalVisible(false); router.push(`/log?date=${selectedDateStr}`); }}
                >
                  <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>Sửa Ghi Chú Ngày Này</Text>
                </Pressable>
              </ScrollView>
            ) : (
              <View style={styles.emptyLogBox}>
                <Feather name="file-minus" size={40} color={colors.border} style={{ marginBottom: 10 }} />
                <Text style={styles.emptyLogText}>Bạn chưa ghi chép gì vào ngày này.</Text>
                <Pressable
                  style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, width: '100%' }}
                  onPress={() => { setModalVisible(false); router.push(`/log?date=${selectedDateStr}`); }}
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

  editBanner: { backgroundColor: colors.primaryLight + '30', paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.primaryLight },
  editBannerText: { fontSize: 13, color: colors.primaryDark, textAlign: 'center', fontWeight: '500' },

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

  saveBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 30, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#F0F0F0', boxShadow: '0px -4px 12px rgba(0,0,0,0.06)' },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  cancelBtnText: { fontSize: 17, fontWeight: '600', color: colors.textMuted },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 36, borderRadius: 24 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: 'white' },

  legendTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 15, marginLeft: 5 },
  legendCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginRight: 15 },
  legendText: { fontSize: 15, fontWeight: '600', color: colors.text },

  emptyLogBox: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  emptyLogText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 300, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalRowText: { fontSize: 16, color: colors.text, flex: 1 },
});
