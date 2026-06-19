import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCareStore, SupportLevel } from '../../store/useCareStore';
import { useCycleStore } from '../../store/useCycleStore';

const SUPPORT_LEVELS: { id: SupportLevel; title: string; color: string; desc: string; icon: any }[] = [
  { id: 'green', title: 'Mức Xanh', color: '#4CAF50', desc: 'Em ổn, chăm sóc bình thường', icon: 'leaf' },
  { id: 'yellow', title: 'Mức Vàng', color: '#FFC107', desc: 'Em hơi mệt, cần nhẹ nhàng', icon: 'weather-partly-cloudy' },
  { id: 'orange', title: 'Mức Cam', color: '#FF9800', desc: 'Em đau/khó chịu, cần hỗ trợ nhiều', icon: 'fire' },
  { id: 'red', title: 'Mức Đỏ', color: '#F44336', desc: 'Em rất đau, cần theo dõi sát', icon: 'alert-circle' },
];

export default function CareCenter() {
  const router = useRouter();
  const { currentSupportLevel, setSupportLevel, preferences } = useCareStore();
  const { prediction } = useCycleStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Trung Tâm Chăm Sóc</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Mức độ cần hỗ trợ hôm nay</Text>
        <Text style={styles.sectionDesc}>Hãy cho chồng biết hôm nay cơ thể bạn đang cảm thấy thế nào để nhận được sự chăm sóc phù hợp nhất nhé.</Text>

        <View style={styles.levelContainer}>
          {SUPPORT_LEVELS.map(level => {
            const isSelected = currentSupportLevel === level.id;
            return (
              <Pressable
                key={level.id}
                style={[
                  styles.levelCard,
                  isSelected && { borderColor: level.color, backgroundColor: level.color + '15' }
                ]}
                onPress={() => setSupportLevel(level.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: level.color }]}>
                  <MaterialCommunityIcons name={level.icon} size={24} color="white" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, { color: isSelected ? level.color : colors.text }]}>{level.title}</Text>
                  <Text style={styles.levelDesc}>{level.desc}</Text>
                </View>
                {isSelected && (
                  <Feather name="check-circle" size={24} color={level.color} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Gợi ý Chăm sóc bản thân</Text>
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <View style={styles.suggestionIconBox}>
              <Feather name="coffee" size={20} color={colors.primary} />
            </View>
            <Text style={styles.suggestionTitle}>Dành riêng cho bạn hôm nay</Text>
          </View>
          <Text style={styles.suggestionText}>
            • Uống một ly trà hoa cúc ấm.{"\n"}
            • Nghe một bản nhạc nhẹ nhàng.{"\n"}
            • Dành 15 phút đi bộ chậm.{"\n"}
            • Tránh ăn đồ cay nóng và dầu mỡ.
          </Text>
        </View>

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Sở thích của bạn</Text>
          <Text style={styles.sectionDesc}>Chồng sẽ thấy danh sách này để mua đồ cho bạn.</Text>
          
          <View style={styles.tagContainer}>
            <Text style={styles.tagLabel}>Món ăn vặt:</Text>
            {preferences.favoriteFoods.map(item => (
              <View key={item} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.tagContainer}>
            <Text style={styles.tagLabel}>Đồ giảm đau:</Text>
            {preferences.comfortItems.map(item => (
              <View key={item} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.partnerBtn} onPress={() => router.push('/partner')}>
          <MaterialCommunityIcons name="shield-account-outline" size={24} color={colors.primary} />
          <Text style={styles.partnerBtnText}>Cài đặt Quyền chia sẻ cho Chồng</Text>
          <Feather name="chevron-right" size={20} color={colors.primary} />
        </Pressable>

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
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8, marginTop: 10 },
  sectionDesc: { fontSize: 14, color: colors.textMuted, marginBottom: 20, lineHeight: 22 },
  
  levelContainer: { marginBottom: 30 },
  levelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  levelDesc: { fontSize: 13, color: colors.textMuted },
  
  suggestionCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: colors.primaryLight + '50' },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  suggestionIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  suggestionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  suggestionText: { fontSize: 15, color: colors.textMuted, lineHeight: 26 },

  preferencesSection: { marginBottom: 30 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 },
  tagLabel: { width: '100%', fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  tag: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  tagText: { fontSize: 14, color: colors.text },

  partnerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight + '20', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryLight },
  partnerBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginLeft: 12 },
});
