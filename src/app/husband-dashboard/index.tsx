import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';

const { width } = Dimensions.get('window');

// Đổi theme sang tone Xanh Nam Tính
const husbandTheme = {
  bg: '#F5F9FF',
  primary: '#2196F3',
  dark: '#0D47A1',
  card: '#FFFFFF',
  text: '#1E293B',
  muted: '#64748B'
};

export default function HusbandDashboard() {
  const router = useRouter();
  const profile = useProfileStore(state => state.profile);

  // Giả lập trạng thái của vợ dựa trên dữ liệu (Thực tế sẽ tính bằng thuật toán)
  const isPeriod = true; 

  const handleRemind = (action: string) => {
    alert(`Đã gửi thông báo nhắc Vợ: "${action}" thành công! (Pinh pinh)`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: husbandTheme.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Chào Chồng Yêu,</Text>
          <Text style={styles.subGreeting}>Hôm nay vợ bạn cảm thấy thế nào?</Text>
        </View>
        <View style={styles.avatar}>
          <FontAwesome5 name="user-tie" size={24} color={husbandTheme.primary} />
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Tình trạng của Vợ</Text>
          <View style={[styles.badge, isPeriod ? styles.badgeDanger : styles.badgeSafe]}>
            <Text style={styles.badgeText}>{isPeriod ? 'Đang Tới Tháng' : 'Bình thường'}</Text>
          </View>
        </View>
        
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Feather name="droplet" size={24} color={isPeriod ? '#F44336' : husbandTheme.primary} />
            <Text style={styles.metricLabel}>Ngày 2</Text>
            <Text style={styles.metricSub}>Của chu kỳ</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Feather name="frown" size={24} color="#FF9800" />
            <Text style={styles.metricLabel}>Mệt mỏi</Text>
            <Text style={styles.metricSub}>Cảm xúc hiện tại</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Tương tác Nhanh</Text>
      <View style={styles.actionGrid}>
        <Pressable style={styles.actionBtn} onPress={() => handleRemind('Uống nhiều nước ấm nhé!')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="water" size={28} color={husbandTheme.primary} />
          </View>
          <Text style={styles.actionText}>Nhắc uống nước</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => handleRemind('Đi ngủ sớm đi vợ ơi!')}>
          <View style={[styles.actionIcon, { backgroundColor: '#EDE7F6' }]}>
            <Ionicons name="moon" size={28} color="#673AB7" />
          </View>
          <Text style={styles.actionText}>Nhắc đi ngủ</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => handleRemind('Anh đang về, mua gì không?')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FBE9E7' }]}>
            <Ionicons name="fast-food" size={28} color="#FF5722" />
          </View>
          <Text style={styles.actionText}>Hỏi đồ ăn</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => handleRemind('Anh yêu em ❤️')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="heart" size={28} color="#F44336" />
          </View>
          <Text style={styles.actionText}>Gửi tình yêu</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Gợi ý Chăm sóc (AI)</Text>
      <View style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <FontAwesome5 name="lightbulb" size={24} color="#FFC107" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Mẹo cho hôm nay</Text>
          <Text style={styles.tipDesc}>
            Vợ bạn đang ở ngày thứ 2 của chu kỳ và dễ bị đau bụng. Hãy chủ động pha một ly trà gừng ấm hoặc chườm túi nóng cho cô ấy nhé! Đừng cãi lý lúc này.
          </Text>
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  greeting: { fontSize: 24, fontWeight: '800', color: husbandTheme.dark, marginBottom: 5 },
  subGreeting: { fontSize: 14, color: husbandTheme.muted },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' },
  
  statusCard: { backgroundColor: husbandTheme.card, borderRadius: 24, padding: 24, marginBottom: 30, boxShadow: '0px 8px 20px rgba(33, 150, 243, 0.1)' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: husbandTheme.text },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeDanger: { backgroundColor: '#FFEBEE' },
  badgeSafe: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#F44336' },
  
  metricRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: husbandTheme.bg, padding: 15, borderRadius: 16 },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 18, fontWeight: '800', color: husbandTheme.dark, marginTop: 10, marginBottom: 4 },
  metricSub: { fontSize: 12, color: husbandTheme.muted },
  divider: { width: 1, height: 40, backgroundColor: '#CBD5E1' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: husbandTheme.dark, marginBottom: 15, marginLeft: 5 },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  actionBtn: { width: (width - 48 - 15) / 2, backgroundColor: husbandTheme.card, padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 15, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  actionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { fontSize: 14, fontWeight: '700', color: husbandTheme.text },

  tipCard: { flexDirection: 'row', backgroundColor: husbandTheme.card, padding: 20, borderRadius: 20, alignItems: 'flex-start', gap: 15, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  tipIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center' },
  tipTitle: { fontSize: 16, fontWeight: '800', color: husbandTheme.text, marginBottom: 5 },
  tipDesc: { fontSize: 14, color: husbandTheme.muted, lineHeight: 22 },
});
