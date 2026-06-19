import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import QRCode from 'react-native-qrcode-svg';

export default function WifePartnerScreen() {
  const router = useRouter();
  const profile = useProfileStore(state => state.profile);

  // Giả lập một mã bí mật từ UID của vợ (Thực tế sẽ fetch từ Database `pairing_code`)
  const pairingCode = profile?.uid ? `LUNA_CONNECT_${profile.uid}` : 'ERROR_NO_UID';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Gắn kết Trái tim</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Quét để kết nối</Text>
          <Text style={styles.qrDesc}>
            Bảo Chồng tải app, chọn mục "Tôi là Chồng" và đưa Camera lên quét mã QR này nhé.
          </Text>
          
          <View style={styles.qrBox}>
            {profile?.uid ? (
              <QRCode
                value={pairingCode}
                size={220}
                color={colors.primary}
                backgroundColor="transparent"
              />
            ) : (
              <Text>Lỗi tải mã</Text>
            )}
          </View>
          
          <Text style={styles.codeText}>{pairingCode}</Text>
          
          <View style={styles.statusBox}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Đang chờ Chồng kết nối...</Text>
          </View>
        </View>

        <Pressable style={styles.btnShare}>
          <Feather name="share" size={20} color="white" />
          <Text style={styles.btnShareText}>Chia sẻ mã qua Zalo</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  content: { padding: 24, alignItems: 'center' },
  qrCard: { backgroundColor: colors.card, width: '100%', borderRadius: 30, padding: 30, alignItems: 'center', boxShadow: '0px 10px 30px rgba(255, 141, 161, 0.2)' },
  qrTitle: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 10 },
  qrDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  
  qrBox: { width: 250, height: 250, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 15px rgba(0,0,0,0.05)', marginBottom: 20 },
  codeText: { fontSize: 16, fontWeight: '700', color: colors.textMuted, letterSpacing: 2, marginBottom: 30 },

  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryLight + '30', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  statusText: { color: colors.primaryDark, fontWeight: '600' },

  btnShare: { flexDirection: 'row', backgroundColor: colors.primary, width: '100%', padding: 20, borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30, boxShadow: '0px 8px 16px rgba(255, 141, 161, 0.3)' },
  btnShareText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
