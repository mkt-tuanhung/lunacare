import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CareCenter() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Chăm sóc bản thân</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.welcomeCard}>
          <MaterialCommunityIcons name="flower-tulip" size={40} color={colors.primary} style={{marginBottom: 10}} />
          <Text style={styles.welcomeTitle}>Hãy ưu tiên bản thân nhé!</Text>
          <Text style={styles.welcomeText}>Dựa vào chu kỳ hiện tại, năng lượng của bạn có thể đang ở mức thấp. Hãy dành thời gian nghỉ ngơi nhiều hơn.</Text>
        </View>

        <Text style={styles.sectionTitle}>Gợi ý cho hôm nay</Text>

        <View style={styles.suggestionCard}>
          <View style={[styles.iconBox, { backgroundColor: '#E6FAFC' }]}>
            <Feather name="coffee" size={20} color="#00CFE8" />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>Uống trà hoa cúc ấm</Text>
            <Text style={styles.suggestionDesc}>Giúp giảm co thắt và thư giãn tinh thần hiệu quả.</Text>
          </View>
        </View>

        <View style={styles.suggestionCard}>
          <View style={[styles.iconBox, { backgroundColor: '#F9F0FF' }]}>
            <Feather name="moon" size={20} color="#9D8DF1" />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>Ngủ đủ 8 tiếng</Text>
            <Text style={styles.suggestionDesc}>Tránh thức khuya để cơ thể phục hồi năng lượng tối đa.</Text>
          </View>
        </View>

        <View style={styles.suggestionCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF0F5' }]}>
            <Feather name="music" size={20} color={colors.primary} />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>Nghe nhạc thư giãn</Text>
            <Text style={styles.suggestionDesc}>Bật một bản nhạc Lofi nhẹ nhàng để làm dịu tâm trạng.</Text>
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

  welcomeCard: { backgroundColor: colors.card, padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 35, boxShadow: '0px 12px 24px rgba(255, 141, 161, 0.1)' },
  welcomeTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10 },
  welcomeText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20, letterSpacing: -0.5 },

  suggestionCard: { flexDirection: 'row', backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 15, alignItems: 'center', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suggestionContent: { flex: 1 },
  suggestionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  suggestionDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 }
});
