import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';

const moods = [
  { label: 'Vui vẻ', icon: 'smile' },
  { label: 'Bình thường', icon: 'meh' },
  { label: 'Buồn bã', icon: 'frown' },
  { label: 'Cáu gắt', icon: 'cloud-lightning' },
  { label: 'Mệt mỏi', icon: 'battery-charging' }
];

const symptoms = [
  { label: 'Đau bụng', icon: 'activity' },
  { label: 'Đau đầu', icon: 'wind' },
  { label: 'Nổi mụn', icon: 'target' },
  { label: 'Thèm ăn', icon: 'coffee' },
  { label: 'Mất ngủ', icon: 'moon' },
  { label: 'Đau lưng', icon: 'layers' }
];

const ovulationSigns = ['Dịch nhầy trong', 'Nhiệt độ tăng', 'Que LH dương tính'];

const flows = ['Nhẹ', 'Vừa', 'Nhiều', 'Rất nhiều'];

export default function LogToday() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [isPeriodDay, setIsPeriodDay] = useState(false);
  
  // New states
  const [waterCups, setWaterCups] = useState(0);
  const [sleepHours, setSleepHours] = useState('');
  const [selectedOvulations, setSelectedOvulations] = useState<string[]>([]);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  
  const toggleOvulation = (s: string) => {
    setSelectedOvulations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const profile = useProfileStore(state => state.profile);

  const handleSave = async () => {
    if (!profile?.uid) {
      alert('Vui lòng đăng nhập để lưu dữ liệu!');
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const payload: any = {
        user_id: profile.uid,
        log_date: today,
        is_period_day: isPeriodDay,
        flow_level: selectedFlow,
        moods: selectedMood ? [selectedMood] : [],
        symptoms: selectedSymptoms,
        water_cups: waterCups,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        ovulation_signs: selectedOvulations,
        notes: ''
      };

      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', profile.uid)
        .eq('log_date', today)
        .single();

      let dbError;
      if (existing) {
        const { error } = await supabase.from('daily_logs').update(payload).eq('id', existing.id);
        dbError = error;
      } else {
        const { error } = await supabase.from('daily_logs').insert([payload]);
        dbError = error;
      }
      
      if (dbError) {
        if (dbError.message.includes('schema cache') || dbError.message.includes('does not exist') || dbError.message.includes('column')) {
            // Thử lại nếu user chưa có cột mới
            delete payload.water_cups;
            delete payload.sleep_hours;
            delete payload.ovulation_signs;
            if (existing) {
              const { error: retryError } = await supabase.from('daily_logs').update(payload).eq('id', existing.id);
              if (retryError) throw retryError;
            } else {
              const { error: retryError } = await supabase.from('daily_logs').insert([payload]);
              if (retryError) throw retryError;
            }
        } else {
            throw dbError;
        }
      }

      alert('Đã lưu Ghi nhận thành công!');
      
      // ĐỒNG BỘ VỚI LỊCH SỬ CHU KỲ (periodEvents) NẾU ĐÁNH DẤU LÀ "CÓ KINH"
      const cycleStore = useCycleStore.getState();
      const todayStr = payload.log_date;
      if (payload.is_period_day) {
        // Kiểm tra xem 7 ngày gần đây có chu kỳ nào đang dở dang không
        const existingEvent = cycleStore.periodEvents.find(e => {
            const diff = Math.abs(new Date(e.startDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 10; // Nếu cách ngày bắt đầu <= 10 ngày thì coi là cùng 1 chu kỳ
        });
        
        if (existingEvent) {
            // Cập nhật endDate nếu log ngày mới hơn
            if (new Date(todayStr) > new Date(existingEvent.endDate || existingEvent.startDate)) {
                cycleStore.updatePeriodEvent(existingEvent.id, { endDate: todayStr });
            }
        } else {
            // Nếu không có chu kỳ nào gần đây -> Tạo chu kỳ mới ngay hôm nay!
            cycleStore.addPeriodEvent({ startDate: todayStr, endDate: todayStr, userId: payload.user_id });
        }
      } else {
        // NẾU NGƯỜI DÙNG BỎ CHECK "CÓ KINH"
        // Kiểm tra xem có chu kỳ nào TRÙNG KHỚP 1 NGÀY này không
        const exactMatch = cycleStore.periodEvents.find(e => e.startDate === todayStr && e.endDate === todayStr);
        if (exactMatch) {
            cycleStore.deletePeriodEvent(exactMatch.id);
        } else {
            // Nếu là chu kỳ nhiều ngày, và người dùng bỏ check ngày cuối cùng -> Thu hẹp chu kỳ
            const endMatch = cycleStore.periodEvents.find(e => e.endDate === todayStr);
            if (endMatch) {
                const prevDay = new Date(todayStr);
                prevDay.setDate(prevDay.getDate() - 1);
                cycleStore.updatePeriodEvent(endMatch.id, { endDate: prevDay.toISOString().split('T')[0] });
            }
        }
      }

      // BẮT BUỘC TÍNH TOÁN LẠI CHU KỲ
      await cycleStore.calculatePrediction();
      
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('schema cache')) {
        alert("Lỗi Bảng Dữ Liệu Supabase: Bảng daily_logs của bạn đang bị thiếu cột (chưa được tạo đúng chuẩn).\n\nVui lòng mở file fix_daily_logs.sql, copy toàn bộ nội dung và chạy trong Supabase SQL Editor để tự động sửa lỗi này!");
      } else {
        alert('Lỗi lưu dữ liệu: ' + err.message);
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ghi nhận hôm nay</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Kinh nguyệt */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F3' }]}>
              <Ionicons name="water-outline" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.sectionTitle}>Kỳ kinh nguyệt</Text>
          </View>

          <Pressable style={[styles.toggleCard, isPeriodDay && styles.toggleCardActive]} onPress={() => setIsPeriodDay(!isPeriodDay)}>
            <Text style={[styles.toggleText, isPeriodDay && styles.toggleTextActive]}>{isPeriodDay ? 'Đang trong kỳ kinh' : 'Không có kinh nguyệt'}</Text>
            {isPeriodDay && <Ionicons name="checkmark-circle" size={20} color={colors.primaryDark} />}
          </Pressable>

          {isPeriodDay && (
            <View style={styles.pillsContainer}>
              {flows.map(f => (
                <Pressable key={f} style={[styles.pill, selectedFlow === f && styles.pillActive]} onPress={() => setSelectedFlow(f)}>
                  <Text style={[styles.pillText, selectedFlow === f && styles.pillTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Tâm trạng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F9F0FF' }]}>
              <Feather name="heart" size={20} color="#9D8DF1" />
            </View>
            <Text style={styles.sectionTitle}>Tâm trạng</Text>
          </View>
          <View style={styles.pillsContainer}>
            {moods.map(m => (
              <Pressable key={m.label} style={[styles.iconPill, selectedMood === m.label && styles.iconPillActive]} onPress={() => setSelectedMood(m.label)}>
                <Feather name={m.icon as any} size={24} color={selectedMood === m.label ? 'white' : colors.textMuted} style={{marginBottom: 8}}/>
                <Text style={[styles.iconPillText, selectedMood === m.label && styles.iconPillTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Triệu chứng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E6FAFC' }]}>
              <Feather name="activity" size={20} color="#00CFE8" />
            </View>
            <Text style={styles.sectionTitle}>Triệu chứng</Text>
          </View>
          <View style={styles.pillsContainer}>
            {symptoms.map(s => (
              <Pressable key={s.label} style={[styles.iconPill, selectedSymptoms.includes(s.label) && styles.iconPillActive]} onPress={() => toggleSymptom(s.label)}>
                <Feather name={s.icon as any} size={24} color={selectedSymptoms.includes(s.label) ? 'white' : colors.textMuted} style={{marginBottom: 8}}/>
                <Text style={[styles.iconPillText, selectedSymptoms.includes(s.label) && styles.iconPillTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Nước & Giấc ngủ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="droplet" size={20} color="#2196F3" />
            </View>
            <Text style={styles.sectionTitle}>Sức khỏe cơ bản</Text>
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nước (số ly):</Text>
            <View style={styles.counterBox}>
              <Pressable style={styles.counterBtn} onPress={() => setWaterCups(Math.max(0, waterCups - 1))}><Feather name="minus" size={20} color={colors.text}/></Pressable>
              <Text style={styles.counterText}>{waterCups}</Text>
              <Pressable style={styles.counterBtn} onPress={() => setWaterCups(waterCups + 1)}><Feather name="plus" size={20} color={colors.text}/></Pressable>
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Ngủ (số giờ):</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="Ví dụ: 7.5"
              value={sleepHours}
              onChangeText={setSleepHours}
            />
          </View>
        </View>

        {/* Rụng trứng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="egg-outline" size={20} color="#FF9800" />
            </View>
            <Text style={styles.sectionTitle}>Dấu hiệu rụng trứng</Text>
          </View>
          <View style={styles.pillsContainer}>
            {ovulationSigns.map(s => (
              <Pressable key={s} style={[styles.pill, selectedOvulations.includes(s) && styles.pillActive]} onPress={() => toggleOvulation(s)}>
                <Text style={[styles.pillText, selectedOvulations.includes(s) && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu & Hoàn tất</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  scrollContent: { padding: 24, paddingBottom: 120 },
  
  section: { marginBottom: 35, backgroundColor: colors.card, padding: 24, borderRadius: 32, boxShadow: '0px 8px 24px rgba(0,0,0,0.04)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  
  toggleCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  toggleCardActive: { backgroundColor: colors.primaryLight + '15', borderColor: colors.primary },
  toggleText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  toggleTextActive: { color: colors.primaryDark, fontWeight: '700' },
  
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, marginHorizontal: -5 },
  
  pill: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.background, borderRadius: 24, margin: 5, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: 'white', fontWeight: '700' },

  iconPill: { width: '30%', backgroundColor: colors.background, borderRadius: 20, paddingVertical: 16, margin: '1.5%', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  iconPillActive: { backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: '0px 4px 12px rgba(255, 141, 161, 0.3)' },
  iconPillText: { color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  iconPillTextActive: { color: 'white', fontWeight: '700' },

  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 10 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  counterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  counterBtn: { padding: 12 },
  counterText: { fontSize: 18, fontWeight: 'bold', width: 30, textAlign: 'center' },
  textInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, width: 100, textAlign: 'center', fontSize: 16 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: colors.border },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 24, alignItems: 'center', boxShadow: '0px 8px 20px rgba(255, 141, 161, 0.35)' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.3 }
});
