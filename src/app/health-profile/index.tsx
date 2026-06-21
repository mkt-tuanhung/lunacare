import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { supabase } from '../../lib/supabase';
import { useAlertStore } from '../../store/useAlertStore';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToR2 } from '../../lib/r2';
import { ActivityIndicator, Image, Switch } from 'react-native';

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
  const { profile, updateAvatarUrl } = profileStore;
  const [answers, setAnswers] = useState<any>(profile?.healthProfile || {});
  const [isUploading, setIsUploading] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const uri = result.assets[0].uri;
        const uploadedUrl = await uploadImageToR2(uri, profile?.uid || 'guest', 'avatars');
        if (uploadedUrl) {
          updateAvatarUrl(uploadedUrl);
        } else {
          useAlertStore.getState().showAlert("Lỗi", "Không thể upload ảnh lên Cloudflare R2 lúc này.");
        }
      }
    } catch (error) {
      console.error(error);
      useAlertStore.getState().showAlert("Lỗi", "Có lỗi xảy ra khi chọn ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

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

    // 2. Lưu lên Supabase đúng chuẩn (gói gọn cả appSettings và periodEvents)
    if (profileStore.profile?.uid) {
      profileStore.saveProfileToSupabase(useCycleStore.getState().periodEvents);
    }

    if (Platform.OS === 'web') {
      alert('Đã cập nhật Hồ sơ Sức khỏe!');
    } else {
      useAlertStore.getState().showAlert('Thành công', 'Hồ sơ đã được cập nhật!');
    }
    
    // 3. Trở về trang chủ NGAY LẬP TỨC để show animation
    router.replace('/home');

    // 4. Bắt đầu kích hoạt tính toán (isPredicting = true) ở dưới background, Home screen sẽ render animation
    setTimeout(() => {
      const cycleStore = useCycleStore.getState();
      cycleStore.calculatePrediction();
    }, 100);
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
        
        {/* Section: Tài khoản & Cá nhân hoá */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tài khoản & Cá nhân hoá</Text>
        </View>
        <View style={styles.accountBlock}>
          
          {/* Avatar */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarMock}><Text style={{fontSize: 24}}>👱‍♀️</Text></View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.userName}>{profile?.name || 'Người dùng'}</Text>
              <Pressable style={styles.changeAvatarBtn} onPress={handlePickAvatar}>
                <Feather name="camera" size={14} color="white" />
                <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Mật khẩu */}
          <Pressable style={styles.settingRow} onPress={() => useAlertStore.getState().showAlert("Bảo mật", "Tính năng đổi mật khẩu đang được cập nhật.")}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="lock" size={18} color="#1976D2" />
              </View>
              <Text style={styles.settingText}>Đổi mật khẩu</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </Pressable>

          <View style={styles.divider} />

          {/* PIN */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FCE4EC' }]}>
                <Feather name="shield" size={18} color="#C2185B" />
              </View>
              <View>
                <Text style={styles.settingText}>Khóa ứng dụng (Mã PIN)</Text>
                <Text style={styles.settingSubtext}>Yêu cầu mã PIN khi mở ứng dụng</Text>
              </View>
            </View>
            <Switch 
              value={isPinEnabled} 
              onValueChange={(val) => {
                setIsPinEnabled(val);
                if (val) useAlertStore.getState().showAlert("Mã PIN", "Vui lòng nhập mã PIN để bật tính năng này (Đang cập nhật).");
              }} 
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={isPinEnabled ? colors.primary : '#FFF'}
            />
          </View>
        </View>

        {/* Section: Hồ sơ sức khoẻ */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Hồ sơ Sức khỏe</Text>
        </View>
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
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  accountBlock: { backgroundColor: colors.card, padding: 16, borderRadius: 16, marginBottom: 24, boxShadow: '0px 2px 8px rgba(0,0,0,0.03)' },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarMock: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFECB3' },
  userName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  changeAvatarBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', alignItems: 'center', gap: 6 },
  changeAvatarText: { color: 'white', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  settingText: { fontSize: 15, fontWeight: '600', color: colors.text },
  settingSubtext: { fontSize: 12, color: colors.textMuted, marginTop: 2 }
});
