import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Settings() {
  const router = useRouter();
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [notiEnabled, setNotiEnabled] = useState(true);

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
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.card}>
          <Pressable style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="user" size={22} color={colors.text} />
              <Text style={styles.rowText}>Hồ sơ sức khỏe (20 câu hỏi)</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="database" size={22} color={colors.text} />
              <Text style={styles.rowText}>Sao lưu Supabase</Text>
            </View>
            <Text style={{color: colors.success, fontWeight: '600'}}>Đã bật</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="face-id" size={24} color={colors.text} />
              <Text style={styles.rowText}>Khóa bằng FaceID/Mã PIN</Text>
            </View>
            <Switch value={faceIdEnabled} onValueChange={setFaceIdEnabled} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="trash-2" size={22} color="#F44336" />
              <Text style={[styles.rowText, {color: '#F44336'}]}>Xóa toàn bộ dữ liệu</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Thông báo</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={22} color={colors.text} />
              <Text style={styles.rowText}>Nhắc nhở ngày đèn đỏ</Text>
            </View>
            <Switch value={notiEnabled} onValueChange={setNotiEnabled} trackColor={{ true: colors.primary }} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted, marginBottom: 10, marginLeft: 5, textTransform: 'uppercase', letterSpacing: 0.5 },

  card: { backgroundColor: colors.card, borderRadius: 24, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  rowText: { fontSize: 16, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 55, marginRight: 20 }
});
