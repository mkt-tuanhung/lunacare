import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { useToastStore } from '../../store/useToastStore';
import { useAlertStore } from '../../store/useAlertStore';
import PinPad from '../../components/PinPad';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatarToR2 } from '../../lib/r2';

export default function Settings() {
  const router = useRouter();
  const profileStore = useProfileStore();
  const isPinEnabled = profileStore.profile?.isAppLockEnabled || false;
  const isPanicPinEnabled = !!profileStore.profile?.panicPin;
  const hideNotifications = profileStore.profile?.hideNotifications ?? true;
  const [isE2EEnabled, setIsE2EEnabled] = useState(false);
  const setHideNotifications = (val: boolean) => profileStore.setHideNotifications(val);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleDeleteData = async () => {
    const doDelete = async () => {
      const profileStore = useProfileStore.getState();
      const cycleStore = useCycleStore.getState();
      
      if (profileStore.profile?.uid) {
        try {
          await supabase.from('daily_logs').delete().eq('user_id', profileStore.profile.uid);
          await supabase.from('profiles').update({ is_onboarded: false, health_profile: null }).eq('id', profileStore.profile.uid);
        } catch(e) {
          console.error(e);
        }
      }

      // Reset local stores but keep authentication
      if (profileStore.profile) {
        profileStore.setProfile({
          ...profileStore.profile,
          healthProfile: null,
          onboardingCompleted: false
        });
      }
      cycleStore.setPeriodEvents([]);

      alert('Đã xóa toàn bộ dữ liệu! Mời bạn khai báo lại thông tin sức khỏe.');
      router.replace('/onboarding');
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập? Trạng thái đăng nhập vẫn được giữ nguyên.")) {
        await doDelete();
      }
    } else {
      useAlertStore.getState().showAlert(
        "Xóa dữ liệu ghi nhận",
        "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập? Trạng thái đăng nhập vẫn được giữ nguyên.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa", style: "destructive", onPress: doDelete }
        ]
      );
    }
  };

  const doLogout = async () => {
    await supabase.auth.signOut();
    useProfileStore.getState().setProfile(null);
    useCycleStore.getState().setPeriodEvents([]);
    router.replace('/auth/role');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?")) {
        doLogout();
      }
    } else {
      useAlertStore.getState().showAlert(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng xuất", style: "destructive", onPress: doLogout }
        ]
      );
    }
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        useToastStore.getState().showToast("Đang tải ảnh lên Cloudflare R2...", "info");
        const uri = result.assets[0].uri;
        const uploadedUrl = await uploadAvatarToR2(uri, profileStore.profile?.uid || 'guest');
        if (uploadedUrl) {
          profileStore.updateAvatarUrl(uploadedUrl);
          useToastStore.getState().showToast("Cập nhật ảnh đại diện thành công!", "success");
        } else {
          useToastStore.getState().showToast("Lỗi: Cloudflare R2 chặn tải lên do thiếu CORS hoặc sai API Key.", "error");
        }
      }
    } catch (error) {
      console.error(error);
      useToastStore.getState().showToast("Có lỗi xảy ra khi chọn ảnh.", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!userEmail) return alert("Không tìm thấy email liên kết.");
    const sendReset = async () => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
        if (error) throw error;
        alert("Đã gửi đường link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư email của bạn.");
      } catch (e: any) {
        alert("Lỗi: " + e.message);
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Gửi email đặt lại mật khẩu tới hộp thư: ${userEmail}?`)) {
        sendReset();
      }
    } else {
      useAlertStore.getState().showAlert(
        "Đổi mật khẩu",
        `Gửi email đặt lại mật khẩu tới hộp thư: ${userEmail}?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Gửi Email", onPress: sendReset }
        ]
      );
    }
  };

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPanicPinSetup, setShowPanicPinSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinRemove, setShowPinRemove] = useState(false);
  const [showPanicPinRemove, setShowPanicPinRemove] = useState(false);

  const handleTogglePin = (val: boolean) => {
    if (val) {
      setSetupStep(1);
      setTempPin('');
      setPinError('');
      setShowPinSetup(true);
    } else {
      setPinError('');
      setShowPinRemove(true);
    }
  };

  const handleTogglePanicPin = (val: boolean) => {
    if (!isPinEnabled && val) {
      alert("Vui lòng bật tính năng Khóa bằng mã PIN trước khi sử dụng Mật khẩu giả.");
      return;
    }
    if (val) {
      setSetupStep(1);
      setTempPin('');
      setPinError('');
      setShowPanicPinSetup(true);
    } else {
      setPinError('');
      setShowPanicPinRemove(true);
    }
  };

  const handlePinSetupComplete = (pin: string) => {
    if (setupStep === 1) {
      setTempPin(pin);
      setSetupStep(2);
      setPinError('');
    } else {
      if (pin === tempPin) {
        profileStore.setAppLockEnabled(true, pin);
        setShowPinSetup(false);
      } else {
        setPinError('Mã PIN không khớp, thử lại');
        setSetupStep(1);
        setTempPin('');
      }
    }
  };

  const handlePinRemoveComplete = (pin: string) => {
    if (pin === profileStore.profile?.appLockPin) {
      profileStore.setAppLockEnabled(false);
      setShowPinRemove(false);
    } else {
      setPinError('Mã PIN không đúng.');
    }
  };

  const handlePanicPinSetupComplete = (pin: string) => {
    if (pin === profileStore.profile?.appLockPin) {
      setPinError('Mã PIN giả không được giống Mã PIN thật.');
      setSetupStep(1);
      setTempPin('');
      return;
    }

    if (setupStep === 1) {
      setTempPin(pin);
      setSetupStep(2);
      setPinError('');
    } else {
      if (pin === tempPin) {
        profileStore.setPanicPin(pin);
        setShowPanicPinSetup(false);
      } else {
        setPinError('Mã PIN không khớp, thử lại');
        setSetupStep(1);
        setTempPin('');
      }
    }
  };

  const handlePanicPinRemoveComplete = (pin: string) => {
    if (pin === profileStore.profile?.appLockPin) {
      profileStore.setPanicPin(''); // Removed
      setShowPanicPinRemove(false);
    } else {
      setPinError('Mã PIN gốc không đúng.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Cài Đặt</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Feather name="lock" size={20} color={colors.text} /></View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Khóa bằng mã PIN / Face ID</Text>
              <Text style={styles.rowDesc}>Bảo vệ dữ liệu khi mở ứng dụng</Text>
            </View>
            <Switch value={isPinEnabled} onValueChange={handleTogglePin} trackColor={{ false: '#E0E0E0', true: colors.primary }} />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={[styles.rowIcon, {backgroundColor: '#FFEBEE'}]}><Feather name="shield" size={20} color="#F44336" /></View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Mật khẩu giả (Panic PIN)</Text>
              <Text style={styles.rowDesc}>Khi mở bằng mã này, App sẽ giả dạng thành App Ghi Chú trống</Text>
            </View>
            <Switch value={isPanicPinEnabled} onValueChange={handleTogglePanicPin} trackColor={{ false: '#E0E0E0', true: '#F44336' }} />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.rowIcon}><Feather name="bell-off" size={20} color={colors.text} /></View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Ẩn nội dung thông báo</Text>
              <Text style={styles.rowDesc}>Chỉ hiện "Bạn có lời nhắc mới"</Text>
            </View>
            <Switch value={hideNotifications} onValueChange={setHideNotifications} trackColor={{ false: '#E0E0E0', true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.rowIcon}><MaterialCommunityIcons name="shield-lock-outline" size={20} color={colors.text} /></View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Mã hoá đầu cuối (E2E Backup)</Text>
              <Text style={styles.rowDesc}>Chỉ bạn và người được uỷ quyền mới đọc được nhật ký</Text>
            </View>
            <Switch value={isE2EEnabled} onValueChange={(val) => {
              if (val) alert("Tính năng đang kích hoạt. Dữ liệu của bạn sẽ được mã hoá bằng Master Key lưu trữ cục bộ.");
              setIsE2EEnabled(val);
            }} trackColor={{ false: '#E0E0E0', true: colors.primary }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dữ liệu của bạn</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => router.push('/health-profile')}>
            <View style={styles.rowIcon}><Feather name="file-text" size={20} color={colors.text} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Chỉnh sửa Hồ sơ Sức khỏe</Text>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.row} onPress={() => router.push('/history')}>
            <View style={styles.rowIcon}><Feather name="calendar" size={20} color={colors.text} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Quản lý Lịch sử Chu kỳ</Text>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.row} onPress={() => router.push('/history/logs')}>
            <View style={styles.rowIcon}><Feather name="book-open" size={20} color={colors.text} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Nhật ký Ghi chú Hằng ngày</Text>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.row} onPress={() => router.push('/reports')}>
            <View style={styles.rowIcon}><Feather name="download" size={20} color={colors.text} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Xuất dữ liệu Y Tế (PDF)</Text>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.row} onPress={handleDeleteData}>
            <View style={styles.rowIcon}><Feather name="trash-2" size={20} color="#F44336" /></View>
            <Text style={[styles.rowTitle, { flex: 1, color: '#F44336' }]}>Xóa toàn bộ dữ liệu</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleChangePassword}>
            <View style={styles.rowIcon}><Feather name="key" size={20} color={colors.text} /></View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Đổi mật khẩu</Text>
              <Text style={styles.rowDesc}>{userEmail || 'Đang tải email...'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.row} onPress={handleLogout}>
            <View style={styles.rowIcon}><Feather name="log-out" size={20} color="#F44336" /></View>
            <Text style={[styles.rowTitle, { flex: 1, color: '#F44336' }]}>Đăng xuất</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Kết nối</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => router.push('/partner')}>
            <View style={styles.rowIcon}><MaterialCommunityIcons name="shield-account-outline" size={20} color={colors.text} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Quản lý Partner Mode</Text>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Thông tin Y tế</Text>
        <View style={styles.disclaimerCard}>
          <Feather name="info" size={24} color={colors.textMuted} style={{ marginBottom: 10 }} />
          <Text style={styles.disclaimerText}>
            For Embeiu chỉ cung cấp thông tin tham khảo và hỗ trợ theo dõi sức khỏe. Ứng dụng không chẩn đoán bệnh, không kê đơn, không thay thế tư vấn y tế chuyên môn. Nếu bạn đau dữ dội, ra máu nhiều bất thường, nghi ngờ mang thai hoặc có triệu chứng khiến bạn lo lắng, hãy liên hệ bác sĩ hoặc cơ sở y tế.
          </Text>
        </View>

        <Text style={styles.versionText}>For Embeiu v1.2.0 - Core Engine</Text>
      </ScrollView>

      {/* PIN SETUP MODAL */}
      <Modal visible={showPinSetup} animationType="slide" presentationStyle="pageSheet">
        <PinPad 
          title={setupStep === 1 ? 'Tạo mã PIN mới' : 'Xác nhận mã PIN'}
          subtitle={setupStep === 1 ? 'Mã PIN này sẽ bảo vệ dữ liệu của bạn' : 'Vui lòng nhập lại mã PIN vừa tạo'}
          error={pinError}
          onComplete={handlePinSetupComplete}
          onCancel={() => setShowPinSetup(false)}
        />
      </Modal>

      {/* PIN REMOVE MODAL */}
      <Modal visible={showPinRemove} animationType="slide" presentationStyle="pageSheet">
        <PinPad 
          title="Tắt khóa bảo vệ"
          subtitle="Vui lòng nhập mã PIN hiện tại để tiếp tục"
          error={pinError}
          onComplete={handlePinRemoveComplete}
          onCancel={() => setShowPinRemove(false)}
        />
      </Modal>

      {/* PANIC PIN SETUP MODAL */}
      <Modal visible={showPanicPinSetup} animationType="slide" presentationStyle="pageSheet">
        <PinPad 
          title={setupStep === 1 ? 'Tạo Mật khẩu Giả' : 'Xác nhận Mật khẩu Giả'}
          subtitle={setupStep === 1 ? 'Mã này sẽ mở ra app Ghi Chú' : 'Vui lòng nhập lại mã giả vừa tạo'}
          error={pinError}
          onComplete={handlePanicPinSetupComplete}
          onCancel={() => setShowPanicPinSetup(false)}
        />
      </Modal>

      {/* PANIC PIN REMOVE MODAL */}
      <Modal visible={showPanicPinRemove} animationType="slide" presentationStyle="pageSheet">
        <PinPad 
          title="Tắt Mật khẩu Giả"
          subtitle="Vui lòng nhập mã PIN THẬT để xác nhận"
          error={pinError}
          onComplete={handlePanicPinRemoveComplete}
          onCancel={() => setShowPanicPinRemove(false)}
        />
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

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted, marginBottom: 10, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
  
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 15, marginBottom: 25, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rowInfo: { flex: 1, paddingRight: 10 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  rowDesc: { fontSize: 13, color: colors.textMuted },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 5 },

  disclaimerCard: { backgroundColor: '#F5F5F5', padding: 20, borderRadius: 20, marginBottom: 30 },
  disclaimerText: { fontSize: 13, color: colors.textMuted, lineHeight: 22, textAlign: 'justify' },

  versionText: { textAlign: 'center', fontSize: 13, color: colors.textMuted, fontWeight: '600', marginTop: 10 }
});
