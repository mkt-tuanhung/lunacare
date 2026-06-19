import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [hideNotifications, setHideNotifications] = useState(true);

  const handleDeleteData = () => {
    Alert.alert(
      "Xóa toàn bộ dữ liệu",
      "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: async () => {
          await AsyncStorage.clear();
          alert('Đã xóa toàn bộ dữ liệu! Vui lòng tải lại trang (F5) để bắt đầu lại từ đầu.');
        } }
      ]
    );
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
            <Switch value={isPinEnabled} onValueChange={setIsPinEnabled} trackColor={{ false: '#E0E0E0', true: colors.primary }} />
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
        </View>

        <Text style={styles.sectionTitle}>Dữ liệu của bạn</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => alert('Đã tạo file PDF!')}>
            <View style={styles.rowIcon}><Feather name="download" size={20} color={colors.text} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Xuất dữ liệu</Text>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.row} onPress={handleDeleteData}>
            <View style={styles.rowIcon}><Feather name="trash-2" size={20} color="#F44336" /></View>
            <Text style={[styles.rowTitle, { flex: 1, color: '#F44336' }]}>Xóa toàn bộ dữ liệu</Text>
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
            LunaCare chỉ cung cấp thông tin tham khảo và hỗ trợ theo dõi sức khỏe. Ứng dụng không chẩn đoán bệnh, không kê đơn, không thay thế tư vấn y tế chuyên môn. Nếu bạn đau dữ dội, ra máu nhiều bất thường, nghi ngờ mang thai hoặc có triệu chứng khiến bạn lo lắng, hãy liên hệ bác sĩ hoặc cơ sở y tế.
          </Text>
        </View>

        <Text style={styles.versionText}>LunaCare v1.2.0 - Core Engine</Text>
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
