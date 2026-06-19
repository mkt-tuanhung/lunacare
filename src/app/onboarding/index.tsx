import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  { id: 'displayName', title: 'Tên thân mật của Vợ là gì?', type: 'text', isRequired: true },
  { id: 'lastPeriodDate', title: 'Kỳ kinh gần nhất của Vợ bắt đầu vào ngày nào?', type: 'date', isRequired: true },
  { id: 'goal', title: 'Mục tiêu chính của Vợ?', options: ['Theo dõi chu kỳ', 'Mong có em bé', 'Tránh thai tự nhiên'], isRequired: true },
  { id: 'cycleLength', title: 'Độ dài chu kỳ thường của Vợ (ngày)?', type: 'number', isRequired: true },
  { id: 'periodDuration', title: 'Vợ thường hành kinh mấy ngày?', type: 'number', isRequired: true },
  { id: 'cycleRegularity', title: 'Chu kỳ của Vợ có đều không?', options: ['Rất đều', 'Dao động ±3 ngày', 'Rất thất thường'], isRequired: false },
  { id: 'birthControl', title: 'Vợ có dùng thuốc tránh thai nội tiết?', options: ['Không', 'Thuốc hàng ngày', 'Cấy que/Vòng'], isRequired: false },
  { id: 'medicalConditions', title: 'Vợ có mắc hội chứng nào sau đây?', options: ['Không có', 'PCOS', 'Lạc nội mạc tử cung'], multi: true, isRequired: false },
  { id: 'flowLevel', title: 'Lượng máu kinh thường thế nào?', options: ['Rất ít', 'Bình thường', 'Rất nhiều'], isRequired: false },
  { id: 'crampsSeverity', title: 'Mức độ đau bụng kinh?', options: ['Không đau', 'Đau nhẹ', 'Đau dữ dội'], isRequired: false },
  { id: 'pmsSeverity', title: 'Hội chứng tiền kinh nguyệt (PMS)?', options: ['Không bị', 'Khó chịu nhẹ', 'Rất mệt mỏi/Cáu gắt'], isRequired: false },
  
  // Các câu hỏi Y khoa chuyên sâu
  { id: 'sexualFrequency', title: 'Tần suất quan hệ tình dục thường xuyên của Vợ?', options: ['Không quan hệ', '1-2 lần/tuần', '3-4 lần/tuần', 'Hàng ngày'], isRequired: false },
  { id: 'contraceptionMethod', title: 'Biện pháp bảo vệ/tránh thai khi quan hệ?', options: ['Không dùng', 'Bao cao su', 'Xuất tinh ngoài', 'Thuốc tránh thai khẩn cấp'], isRequired: false },
  { id: 'recentPregnancy', title: 'Tiền sử thai kỳ (trong 3 tháng qua)?', options: ['Không có', 'Mới sinh con', 'Mới sẩy thai/phá thai'], isRequired: false },
  { id: 'weightChange', title: 'Sự thay đổi cân nặng đột ngột tháng qua?', options: ['Không', 'Giảm cân nhanh', 'Tăng cân nhanh'], isRequired: false },
  
  { id: 'sleepHours', title: 'Vợ ngủ mấy tiếng/đêm?', options: ['< 5 tiếng', '6-7 tiếng', '8+ tiếng'], isRequired: false },
  { id: 'sleepQuality', title: 'Chất lượng giấc ngủ?', options: ['Ngủ sâu', 'Hay thức giấc', 'Mất ngủ'], isRequired: false },
  { id: 'stressLevel', title: 'Mức độ Stress hiện tại của Vợ?', options: ['Thấp', 'Trung bình', 'Rất cao'], isRequired: false },
  { id: 'activityLevel', title: 'Vợ có hay tập thể dục?', options: ['Không tập', 'Tập nhẹ', 'Cường độ cao'], isRequired: false },
  { id: 'diet', title: 'Chế độ ăn của Vợ?', options: ['Bình thường', 'Ăn chay', 'Ăn kiêng nghiêm ngặt/Keto'], isRequired: false },
  { id: 'comfortItems', title: 'Tới tháng Vợ thích làm gì?', options: ['Uống trà ấm', 'Chườm nóng', 'Ăn ngọt', 'Nằm ngủ'], multi: true, isRequired: false },
  { id: 'worstSymptoms', title: 'Triệu chứng ghét nhất?', options: ['Đau lưng', 'Nổi mụn', 'Đau đầu', 'Chướng bụng'], multi: true, isRequired: false },
  { id: 'emotionalSymptoms', title: 'Cảm xúc hay gặp lúc tới tháng?', options: ['Dễ khóc', 'Cáu gắt', 'Trống rỗng'], multi: true, isRequired: false },
  { id: 'partnerRequests', title: 'Vợ muốn chồng mua gì khi đau?', type: 'text', isRequired: false }
];

export default function DeepOnboarding() {
  const router = useRouter();
  const profileState = useProfileStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const q = QUESTIONS[currentStep];

  const handleNext = async () => {
    setErrorMsg(null);
    if (q.id === 'lastPeriodDate' && answers.lastPeriodDate) {
      const selectedDate = new Date(answers.lastPeriodDate).getTime();
      const today = new Date().getTime();
      if (selectedDate > today) {
        setErrorMsg('Ngày kinh gần nhất không thể nằm ở tương lai!');
        return;
      }
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Hoàn tất Onboarding
      profileState.setProfile({
        ...profileState.profile,
        displayName: answers.displayName || profileState.profile?.displayName || 'Vợ Yêu',
        onboardingCompleted: true,
        healthProfile: answers
      });
      
      // Khởi tạo CycleEngine dựa trên ngày kinh gần nhất
      if (answers.lastPeriodDate && answers.cycleLength) {
        const cycleStore = useCycleStore.getState();
        // Tạo chu kỳ đầu tiên
        const startDate = answers.lastPeriodDate;
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + parseInt(answers.periodDuration || '5') - 1);
        const endDate = endDateObj.toISOString().split('T')[0];
        
        cycleStore.addPeriodEvent({
          userId: profileState.profile?.uid || 'temp_user',
          startDate,
          endDate,
          flowLevel: answers.flowLevel || 'Bình thường',
          symptoms: [],
          moods: [],
          notes: 'Dữ liệu từ Onboarding'
        });
      }

      await profileState.saveProfileToSupabase();
      router.replace('/home');
    }
  };

  const handleSelect = (val: string) => {
    setErrorMsg(null);
    if (q.multi) {
      const current = answers[q.id] || [];
      if (current.includes(val)) {
        setAnswers({...answers, [q.id]: current.filter((x: string) => x !== val)});
      } else {
        setAnswers({...answers, [q.id]: [...current, val]});
      }
    } else {
      setAnswers({...answers, [q.id]: val});
      // Đã XÓA dòng tự động nhảy câu hỏi (setTimeout).
      // Bây giờ người dùng BẮT BUỘC phải bấm nút Tiếp tục.
    }
  };

  const isNextDisabled = () => {
    if (!q.isRequired) return false;
    const val = answers[q.id];
    if (q.multi) return !val || val.length === 0;
    return !val;
  };

  const renderInput = () => {
    if (q.type === 'date') {
      if (Platform.OS === 'web') {
        return (
          // @ts-ignore - Dùng thẻ input HTML native cho web để có Date Picker xịn
          <input 
            type="date"
            style={{ padding: 20, borderRadius: 20, fontSize: 18, border: 'none', backgroundColor: colors.card, boxShadow: '0px 4px 12px rgba(0,0,0,0.04)', outline: 'none', color: colors.text, fontFamily: 'inherit' }}
            value={answers[q.id] || ''}
            onChange={(e: any) => setAnswers({...answers, [q.id]: e.target.value})}
          />
        );
      }
      return (
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD (VD: 2024-05-15)"
          value={answers[q.id] || ''}
          onChangeText={(t) => setAnswers({...answers, [q.id]: t})}
        />
      );
    }

    if (q.type === 'text' || q.type === 'number') {
      return (
        <TextInput
          style={styles.input}
          placeholder="Nhập câu trả lời..."
          keyboardType={q.type === 'number' ? 'numeric' : 'default'}
          value={answers[q.id] || ''}
          onChangeText={(t) => setAnswers({...answers, [q.id]: t})}
          autoFocus
        />
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {q.options?.map(opt => {
          const isSelected = q.multi 
            ? (answers[q.id] || []).includes(opt)
            : answers[q.id] === opt;
            
          return (
            <Pressable 
              key={opt} 
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.backBtn} onPress={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}>
          {currentStep > 0 && <Feather name="arrow-left" size={24} color={colors.textMuted} />}
        </Pressable>

        <Text style={styles.stepCounter}>Câu hỏi {currentStep + 1} / {QUESTIONS.length} {q.isRequired && <Text style={{color: '#F44336'}}>*</Text>}</Text>
        <Text style={styles.questionTitle}>{q.title}</Text>
        
        {errorMsg && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {renderInput()}

      </ScrollView>

      <View style={styles.footer}>
        {!q.isRequired && (
          <Pressable style={styles.skipBtn} onPress={handleNext}>
            <Text style={styles.skipBtnText}>Bỏ qua</Text>
          </Pressable>
        )}
        
        <Pressable 
          style={[styles.nextBtn, isNextDisabled() && styles.nextBtnDisabled, !q.isRequired && { flex: 1 }]} 
          onPress={handleNext}
          disabled={isNextDisabled()}
        >
          <Text style={styles.nextBtnText}>{currentStep === QUESTIONS.length - 1 ? 'Hoàn tất' : 'Tiếp tục'}</Text>
          <Feather name="arrow-right" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progressBar: { height: 6, backgroundColor: colors.border, marginTop: 50, marginHorizontal: 20, borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  
  content: { padding: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: 20 },
  stepCounter: { fontSize: 14, color: colors.primary, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  questionTitle: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 40, lineHeight: 38 },
  
  optionsContainer: { gap: 15 },
  optionBtn: { padding: 20, backgroundColor: colors.card, borderRadius: 20, borderWidth: 2, borderColor: 'transparent', boxShadow: '0px 4px 12px rgba(0,0,0,0.04)' },
  optionBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '20' },
  optionText: { fontSize: 16, color: colors.text, fontWeight: '600' },
  optionTextActive: { color: colors.primaryDark, fontWeight: '800' },
  
  input: { backgroundColor: colors.card, padding: 20, borderRadius: 20, fontSize: 18, fontWeight: '600', color: colors.text, boxShadow: '0px 4px 12px rgba(0,0,0,0.04)' },

  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 12, borderRadius: 12, marginBottom: 20 },
  errorText: { color: '#D32F2F', fontSize: 14, fontWeight: '600', marginLeft: 8 },

  footer: { padding: 24, paddingBottom: 40, backgroundColor: colors.background, flexDirection: 'row', gap: 15 },
  skipBtn: { padding: 20, justifyContent: 'center', alignItems: 'center' },
  skipBtnText: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
  nextBtn: { flex: 1, flexDirection: 'row', backgroundColor: colors.primary, padding: 20, borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, boxShadow: '0px 8px 20px rgba(255, 141, 161, 0.4)' },
  nextBtnDisabled: { backgroundColor: colors.border, boxShadow: 'none' },
  nextBtnText: { color: 'white', fontSize: 18, fontWeight: '700' }
});
