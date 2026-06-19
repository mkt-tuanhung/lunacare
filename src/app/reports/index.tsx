import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function Reports() {
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
        <Text style={styles.headerTitle}>Báo cáo sức khỏe</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <FontAwesome5 name="file-medical-alt" size={20} color="#2196F3" />
            </View>
            <Text style={styles.cardTitle}>Tóm tắt 3 tháng qua</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Độ dài chu kỳ trung bình</Text>
            <Text style={styles.statValue}>28 ngày</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Ngày hành kinh trung bình</Text>
            <Text style={styles.statValue}>5 ngày</Text>
          </View>
          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statLabel}>Biến động chu kỳ</Text>
            <Text style={styles.statValue}>± 2 ngày (Đều)</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
              <Feather name="activity" size={20} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Triệu chứng phổ biến</Text>
          </View>
          
          <View style={styles.pillContainer}>
            <View style={styles.pill}><Text style={styles.pillText}>Đau lưng (80%)</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Nổi mụn (50%)</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Cáu gắt (30%)</Text></View>
          </View>
        </View>

        <Pressable style={styles.exportButton}>
          <Feather name="download" size={20} color="white" style={{marginRight: 10}} />
          <Text style={styles.exportButtonText}>Xuất báo cáo PDF cho bác sĩ</Text>
        </Pressable>

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

  card: { backgroundColor: colors.card, padding: 25, borderRadius: 24, marginBottom: 20, boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.04)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  statLabel: { fontSize: 15, color: colors.textMuted },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },

  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { backgroundColor: colors.primaryLight + '30', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  pillText: { color: colors.primaryDark, fontWeight: '600', fontSize: 14 },

  exportButton: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10, boxShadow: '0px 8px 15px rgba(255, 141, 161, 0.3)' },
  exportButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
