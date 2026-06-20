import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { supabase } from '../../lib/supabase';
import { useAlertStore } from '../../store/useAlertStore';

// Định nghĩa lại các câu hỏi để render form (Rút gọn từ Onboarding)
const QUESTIONS = [
  { id: 'cycleLength', title: 'Độ dài chu kỳ thường (ngày)?', type: 'number' },
  { id: 'periodDuration', title: 'Số ngày hành kinh thường?', type: 'number' },
  { id: 'flowLevel', title: 'Lượng máu kinh thường?', options: ['Rất ít', 'Bình thường', 'Rất nhiều'] },
  { id: 'crampsSeverity', title: 'Mức độ đau bụng kinh?', options: ['Không đau', 'Đau nhẹ', 'Đau dữ dội'] },
  { id: 'pmsSeverity', title: 'Hội chứng PMS?', options: ['Không bị', 'Khó chịu nhẹ', 'Rất mệt mỏi/Cáu gắt'] },
  
  // Y khoa
  { id: 'sexualFrequency', title: 'Tần suất quan hệ?', options: ['Không quan hệ', '1-2 lần/tuần', '3-4 lần/tuần', 'Hàng ngày'] },
  { id: 'contraceptionMethod', title: 'Biện pháp tránh thai?', options: ['Không dùng', 'Bao cao su', 'Xuất tinh ngoài', 'Thuốc tránh thai khẩn cấp'] },
  { id: 'recentPregnancy', title: 'Tiền sử thai kỳ (3 tháng qua)?', options: ['Không có', 'Mới sinh con', 'Mới sẩy thai/phá thai'] },
  { id: 'weightChange', title: 'Thay đổi cân nặng đột ngột?', options: ['Không', 'Giảm cân nhanh', 'Tăng cân nhanh'] },
  
  { id: 'sleepHours', title: 'Giờ ngủ/đêm?', options: ['< 5 tiếng', '6-7 tiếng', '8+ tiếng'] },
  { id: 'stressLevel', title: 'Mức độ Stress?', options: ['Thấp', 'Trung bình', 'Rất cao'] },
  { id: 'diet', title: 'Chế độ ăn?', options: ['Bình thường', 'Ăn chay', 'Ăn kiêng nghiêm ngặt/Keto'] },
];

export default function HealthProfileScreen() {
  const router = useRouter();
  const profileStore = useProfileStore();
  const [answers, setAnswers] = useState<any>(profileStore.profile?.healthProfile || {});

  const handleSelect = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSave = async () => {
    // 1. Lưu vào Store Local
    profileStore.setProfile({
      ...profileStore.profile,
      healthProfile: {
        ...profileStore.profile?.healthProfile,
        ...answers
      }
    });

    // 2. Lưu lên Supabase
    if (profileStore.profile?.uid) {
      const { error } = await supabase
        .from('profiles')
        .update({ health_profile: answers })
        .eq('id', profileStore.profile.uid);
      if (error) console.error("Lỗi đồng bộ hồ sơ:", error);
    }

    // 3. Tính toán lại chu kỳ bằng AI và Local Engine do Profile đã thay đổi
    const cycleStore = useCycleStore.getState();
    await cycleStore.calculatePrediction();

    if (Platform.OS === 'web') {
      alert('Đã cập nhật Hồ sơ Sức khỏe & Tính toán lại chu kỳ!');
    } else {
      useAlertStore.getState().showAlert('Thành công', 'Hồ sơ đã được cập nhật và Chu kỳ đã được tính toán lại.');
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Hồ sơ Sức khỏe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Feather name="info" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Chỉnh sửa thông tin bên dưới sẽ giúp AI tính toán lại chu kỳ và đưa ra lời khuyên chính xác nhất cho bạn.</Text>
        </View>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={styles.questionBlock}>
            <Text style={styles.questionTitle}>{q.title}</Text>
            
            {q.type === 'number' ? (
              <TextInput
                style={styles.input}
                value={answers[q.id] ? String(answers[q.id]) : ''}
                keyboardType="numeric"
                onChangeText={(t) => handleSelect(q.id, t)}
              />
            ) : (
              <View style={styles.optionsGrid}>
                {q.options?.map(opt => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <Pressable 
                      key={opt}
                      style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                      onPress={() => handleSelect(q.id, opt)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu & Phân tích lại Chu kỳ</Text>
        </Pressable>
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: 20 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#FCE4EC', padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, color: '#C2185B', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  questionBlock: { marginBottom: 24, backgroundColor: colors.card, padding: 16, borderRadius: 16, boxShadow: '0px 2px 8px rgba(0,0,0,0.03)' },
  questionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, fontSize: 16, color: colors.text },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  optionBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  optionText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  optionTextActive: { color: colors.primaryDark, fontWeight: '700' },
  saveBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 24, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
