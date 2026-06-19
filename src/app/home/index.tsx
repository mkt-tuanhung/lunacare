import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Home() {
  const prediction = useCycleStore((state) => state.prediction);
  const profile = useProfileStore((state) => state.profile);
  const router = useRouter();

  // Lấy width nhưng giới hạn kích thước tối đa cho web (ví dụ max width của mobile screen)
  const windowWidth = Dimensions.get('window').width;
  const screenWidth = Math.min(windowWidth, 400); // Giới hạn width như trên điện thoại

  // Tính số ngày tới kỳ tiếp theo
  let daysLeft = null;
  if (prediction?.predictedStartDate) {
    const start = new Date(prediction.predictedStartDate).getTime();
    const now = new Date().getTime();
    daysLeft = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      
      {/* Header Profile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Chào {profile?.displayName || 'bạn'} ✨</Text>
          <Text style={styles.subGreeting}>Hôm nay bạn cảm thấy thế nào?</Text>
        </View>
        <Pressable style={styles.profileAvatar} onPress={() => router.push('/settings')}>
          <Ionicons name="person" size={20} color={colors.primaryDark} />
        </Pressable>
      </View>
      
      {/* Main Cycle Card - Flo Style */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Dự đoán chu kỳ</Text>
          <Pressable onPress={() => router.push('/calendar')} style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>

        {prediction ? (
          <View style={styles.circleContainer}>
            <View style={styles.largeCircle}>
              <View style={styles.innerCircle}>
                {daysLeft !== null && daysLeft <= 0 && daysLeft >= -7 ? (
                  <View style={{alignItems: 'center'}}>
                    <Text style={[styles.daysNumber, { fontSize: 40 }]}>Ngày {-daysLeft + 1}</Text>
                    <Text style={styles.daysText}>Của chu kỳ</Text>
                  </View>
                ) : (
                  <View style={{alignItems: 'center'}}>
                    <Text style={styles.daysNumber}>{daysLeft !== null && daysLeft > 0 ? daysLeft : 0}</Text>
                    <Text style={styles.daysText}>Ngày nữa tới kỳ</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.cycleFooter}>
              <Text style={styles.cycleFooterText}>Kỳ tiếp theo dự kiến: <Text style={{fontWeight: '700', color: colors.primaryDark}}>{prediction.predictedStartDate}</Text></Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="moon" size={40} color={colors.primaryLight} style={{marginBottom: 15}} />
            <Text style={styles.emptyText}>Chưa đủ dữ liệu để dự đoán. Vui lòng ghi nhận thêm chu kỳ của bạn nhé.</Text>
          </View>
        )}
      </View>

      {/* Log Action Button */}
      <Pressable style={({pressed}) => [styles.primaryButton, pressed && styles.pressed]} onPress={() => router.push('/log')}>
        <Ionicons name="add-circle" size={24} color="white" style={{marginRight: 8}} />
        <Text style={styles.primaryButtonText}>Ghi nhận hôm nay</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Chăm Sóc & Đồng Hành</Text>
      <View style={styles.quickActions}>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/care')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Feather name="heart" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.actionText}>Tự Chăm Sóc</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/partner')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <MaterialCommunityIcons name="shield-account-outline" size={24} color="#FF9800" />
          </View>
          <Text style={styles.actionText}>Cấp Quyền</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/husband')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <FontAwesome5 name="user-tie" size={20} color="#2196F3" />
          </View>
          <Text style={styles.actionText}>Góc Cho Chồng</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/ai')}>
          <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons name="robot-outline" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.actionText}>Trợ lý AI</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Tương tác Nhanh</Text>
      
      {/* Features Grid */}
      <View style={styles.grid}>
        <Pressable style={({pressed}) => [styles.gridItem, pressed && styles.pressed]} onPress={() => router.push('/calendar')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#E8F3F1' }]}>
            <Feather name="calendar" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.gridText}>Lịch</Text>
        </Pressable>
        
        <Pressable style={({pressed}) => [styles.gridItem, pressed && styles.pressed]} onPress={() => router.push('/insights')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#F9F0FF' }]}>
            <Feather name="pie-chart" size={24} color="#9D8DF1" />
          </View>
          <Text style={styles.gridText}>Phân tích</Text>
        </Pressable>

        <Pressable style={({pressed}) => [styles.gridItem, pressed && styles.pressed]} onPress={() => router.push('/care')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F5' }]}>
            <MaterialCommunityIcons name="flower-tulip-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.gridText}>Chăm sóc</Text>
        </Pressable>

        <Pressable style={({pressed}) => [styles.gridItem, pressed && styles.pressed]} onPress={() => router.push('/partner')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF5E6' }]}>
            <Feather name="heart" size={24} color="#FF9F43" />
          </View>
          <Text style={styles.gridText}>Gắn kết</Text>
        </Pressable>

        <Pressable style={({pressed}) => [styles.gridItem, pressed && styles.pressed]} onPress={() => router.push('/reports')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#E6FAFC' }]}>
            <Feather name="file-text" size={24} color="#00CFE8" />
          </View>
          <Text style={styles.gridText}>Báo cáo</Text>
        </Pressable>

        <Pressable style={({pressed}) => [styles.gridItem, pressed && styles.pressed]} onPress={() => router.push('/settings')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#F4F5F7' }]}>
            <Feather name="settings" size={24} color="#6B7280" />
          </View>
          <Text style={styles.gridText}>Cài đặt</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 30 },
  greeting: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subGreeting: { fontSize: 16, color: colors.textMuted, fontWeight: '500' },
  profileAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  
  mainCard: { 
    backgroundColor: colors.card, 
    borderRadius: 32, 
    padding: 24, 
    marginBottom: 30, 
    boxShadow: '0px 12px 24px rgba(255, 141, 161, 0.12)'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  iconButton: { padding: 8, backgroundColor: colors.background, borderRadius: 20 },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap' },
  actionBtn: { alignItems: 'center', width: '23%' },
  actionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  
  circleContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  largeCircle: {
    width: 240, height: 240,
    borderRadius: 120,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center',
    boxShadow: '0px 8px 16px rgba(255, 141, 161, 0.2)'
  },
  innerCircle: {
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: colors.card,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.primaryLight + '50'
  },
  daysNumber: { fontSize: 56, fontWeight: '800', color: colors.primaryDark, includeFontPadding: false },
  daysText: { fontSize: 15, color: colors.textMuted, fontWeight: '600', marginTop: -5 },
  
  cycleFooter: { marginTop: 24, backgroundColor: colors.background, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  cycleFooterText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },

  emptyContainer: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  
  primaryButton: { 
    flexDirection: 'row',
    backgroundColor: colors.primary, 
    paddingVertical: 18, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 35,
    boxShadow: '0px 8px 20px rgba(255, 141, 161, 0.35)'
  },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.3 },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 20, letterSpacing: -0.5 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { 
    width: '31%', 
    backgroundColor: colors.card, 
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 24, 
    marginBottom: 16, 
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)'
  },
  iconWrapper: {
    width: 50, height: 50,
    borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12
  },
  gridText: { fontSize: 13, fontWeight: '600', color: colors.text, textAlign: 'center' },
  
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.9 }
});
