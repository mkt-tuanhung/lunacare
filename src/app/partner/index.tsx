import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePartnerStore } from '../../store/usePartnerStore';

export default function PartnerMode() {
  const router = useRouter();
  const { isPartnerModeEnabled, permissions, togglePartnerMode, updatePermissions } = usePartnerStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chế độ Người Đồng Hành</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.masterToggleCard}>
          <View style={styles.masterInfo}>
            <Text style={styles.masterTitle}>Kích hoạt Partner Mode</Text>
            <Text style={styles.masterDesc}>Cho phép Chồng kết nối và nhận gợi ý chăm sóc bạn.</Text>
          </View>
          <Switch
            value={isPartnerModeEnabled}
            onValueChange={togglePartnerMode}
            trackColor={{ false: '#E0E0E0', true: colors.primary }}
          />
        </View>

        {isPartnerModeEnabled && (
          <View style={styles.permissionsSection}>
            <Text style={styles.sectionTitle}>Quản lý Quyền Truy Cập</Text>
            <Text style={styles.sectionDesc}>LunaCare đề cao sự riêng tư của bạn. Hãy chọn những thông tin bạn thoải mái chia sẻ với Chồng.</Text>

            <View style={styles.permissionCard}>
              <View style={styles.permRow}>
                <View style={styles.permIconBox}><Feather name="heart" size={20} color={colors.text} /></View>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>Mức độ cần hỗ trợ & Gợi ý</Text>
                  <Text style={styles.permDesc}>Chia sẻ mức Xanh/Vàng/Cam/Đỏ để nhận được sự chăm sóc phù hợp.</Text>
                </View>
                <Switch 
                  value={permissions.shareSupportLevel} 
                  onValueChange={(val) => updatePermissions({ shareSupportLevel: val, shareCareSuggestions: val })}
                  trackColor={{ false: '#E0E0E0', true: colors.primary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.permRow}>
                <View style={styles.permIconBox}><Feather name="calendar" size={20} color={colors.text} /></View>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>Giai đoạn Chu kỳ</Text>
                  <Text style={styles.permDesc}>Cho phép chồng biết bạn sắp đến kỳ hay đang hành kinh.</Text>
                </View>
                <Switch 
                  value={permissions.shareCyclePhase} 
                  onValueChange={(val) => updatePermissions({ shareCyclePhase: val, sharePeriodPrediction: val })}
                  trackColor={{ false: '#E0E0E0', true: colors.primary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.permRow}>
                <View style={styles.permIconBox}><Feather name="smile" size={20} color={colors.text} /></View>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>Tâm trạng (Mood)</Text>
                  <Text style={styles.permDesc}>Chia sẻ tâm trạng tổng quan của bạn hôm nay.</Text>
                </View>
                <Switch 
                  value={permissions.shareMoodLevel} 
                  onValueChange={(val) => updatePermissions({ shareMoodLevel: val })}
                  trackColor={{ false: '#E0E0E0', true: colors.primary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.permRow}>
                <View style={styles.permIconBox}><Feather name="activity" size={20} color={colors.text} /></View>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>Chi tiết Triệu chứng</Text>
                  <Text style={styles.permDesc}>Chia sẻ các triệu chứng cụ thể (Khuyên dùng: Tắt để giữ riêng tư).</Text>
                </View>
                <Switch 
                  value={permissions.shareSymptoms} 
                  onValueChange={(val) => updatePermissions({ shareSymptoms: val })}
                  trackColor={{ false: '#E0E0E0', true: colors.primary }}
                />
              </View>
            </View>

            <Pressable style={styles.inviteBtn} onPress={() => alert('Mã kết nối: LUNA-1234. Gửi mã này cho chồng để liên kết!')}>
              <MaterialCommunityIcons name="link-variant" size={24} color="white" />
              <Text style={styles.inviteBtnText}>Lấy Mã Kết Nối</Text>
            </Pressable>

          </View>
        )}

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
  
  masterToggleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  masterInfo: { flex: 1, paddingRight: 20 },
  masterTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  masterDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  
  permissionsSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: colors.textMuted, marginBottom: 20, lineHeight: 22 },

  permissionCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  permRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  permIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  permInfo: { flex: 1, paddingRight: 10 },
  permTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  permDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },

  inviteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 18, borderRadius: 24 },
  inviteBtnText: { fontSize: 16, fontWeight: '800', color: 'white', marginLeft: 10 },
});
