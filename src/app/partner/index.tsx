import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function PartnerMode() {
  const router = useRouter();
  const [partnerLinked, setPartnerLinked] = useState(false);

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
        <Text style={styles.headerTitle}>Chế độ gắn kết</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {!partnerLinked ? (
          <View style={styles.linkCard}>
            <View style={styles.heartsContainer}>
              <Ionicons name="heart" size={50} color={colors.primary} />
              <Ionicons name="link" size={30} color={colors.textMuted} style={{marginHorizontal: 10}} />
              <Ionicons name="heart-outline" size={50} color={colors.primaryLight} />
            </View>
            <Text style={styles.linkTitle}>Kết nối với người ấy</Text>
            <Text style={styles.linkDesc}>Chia sẻ một phần trạng thái của bạn để anh ấy thấu hiểu và chăm sóc bạn tốt hơn mỗi ngày. Dữ liệu nhạy cảm vẫn được giữ kín!</Text>
            
            <Pressable style={styles.primaryButton} onPress={() => setPartnerLinked(true)}>
              <Text style={styles.primaryButtonText}>Tạo mã liên kết</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View style={styles.connectedCard}>
              <Feather name="check-circle" size={40} color={colors.success} style={{marginBottom: 10}} />
              <Text style={styles.connectedTitle}>Đã kết nối thành công!</Text>
              <Text style={styles.connectedDesc}>Chồng bạn giờ đây sẽ nhận được các gọi ý chăm sóc cho bạn.</Text>
            </View>

            <Text style={styles.sectionTitle}>Quyền truy cập của Chồng</Text>
            
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Gợi ý hành động</Text>
                <Text style={styles.toggleDesc}>Gợi ý anh ấy nên làm gì hôm nay.</Text>
              </View>
              <Ionicons name="toggle" size={40} color={colors.primary} />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Tâm trạng của bạn</Text>
                <Text style={styles.toggleDesc}>Chia sẻ cảm xúc hiện tại.</Text>
              </View>
              <Ionicons name="toggle" size={40} color={colors.primary} />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Dữ liệu chu kỳ</Text>
                <Text style={styles.toggleDesc}>Chỉ báo ngày dự kiến bắt đầu.</Text>
              </View>
              <Ionicons name="toggle" size={40} color={colors.textMuted} />
            </View>
          </View>
        )}

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

  linkCard: { backgroundColor: colors.card, padding: 30, borderRadius: 32, alignItems: 'center', marginTop: 20, boxShadow: '0px 12px 24px rgba(255, 141, 161, 0.1)' },
  heartsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  linkTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 10 },
  linkDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 24, boxShadow: '0px 8px 20px rgba(255, 141, 161, 0.35)', width: '100%', alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.3 },

  connectedCard: { backgroundColor: '#E8F5E9', padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 35 },
  connectedTitle: { fontSize: 18, fontWeight: '800', color: '#2E7D32', marginBottom: 8 },
  connectedDesc: { fontSize: 14, color: '#4CAF50', textAlign: 'center', lineHeight: 22 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20, letterSpacing: -0.5 },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 20, borderRadius: 20, marginBottom: 15, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  toggleDesc: { fontSize: 13, color: colors.textMuted }
});
