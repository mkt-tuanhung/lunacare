import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCycleStore } from '../../store/useCycleStore';

export default function Insights() {
  const router = useRouter();
  const { prediction } = useCycleStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Phân Tích Xu Hướng</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F3' }]}>
              <Feather name="refresh-cw" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{prediction?.predictedCycleLength || 28} <Text style={styles.statUnit}>ngày</Text></Text>
            <Text style={styles.statLabel}>Chu kỳ trung bình</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="droplet" size={20} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{prediction?.predictedPeriodLength || 5} <Text style={styles.statUnit}>ngày</Text></Text>
            <Text style={styles.statLabel}>Hành kinh trung bình</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Độ tin cậy dự đoán</Text>
        <View style={styles.confidenceCard}>
          <View style={styles.confidenceHeader}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#4CAF50" />
            <Text style={styles.confidenceTitle}>Mức độ: {prediction?.confidence === 'high' ? 'Cao' : prediction?.confidence === 'medium' ? 'Trung bình' : 'Thấp'}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${prediction?.confidenceScore || 35}%`, backgroundColor: '#4CAF50' }]} />
          </View>
          {prediction?.notes.map((note, idx) => (
            <Text key={idx} style={styles.confidenceNote}>• {note}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Triệu chứng thường gặp</Text>
        <View style={styles.symptomsCard}>
          <View style={styles.symptomRow}>
            <Text style={styles.symptomName}>Đau bụng kinh</Text>
            <View style={styles.barBg}><View style={[styles.barFill, { width: '80%', backgroundColor: colors.primary }]} /></View>
            <Text style={styles.symptomFreq}>80%</Text>
          </View>
          <View style={styles.symptomRow}>
            <Text style={styles.symptomName}>Đau lưng</Text>
            <View style={styles.barBg}><View style={[styles.barFill, { width: '60%', backgroundColor: '#FF9800' }]} /></View>
            <Text style={styles.symptomFreq}>60%</Text>
          </View>
          <View style={styles.symptomRow}>
            <Text style={styles.symptomName}>Mất ngủ</Text>
            <View style={styles.barBg}><View style={[styles.barFill, { width: '30%', backgroundColor: '#9C27B0' }]} /></View>
            <Text style={styles.symptomFreq}>30%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Xu hướng Tâm trạng</Text>
        <View style={styles.moodCard}>
          <View style={styles.moodItem}>
            <Feather name="frown" size={24} color="#9C27B0" />
            <Text style={styles.moodText}>Dễ cáu gắt vào 3 ngày trước kỳ</Text>
          </View>
          <View style={styles.moodItem}>
            <Feather name="battery-charging" size={24} color="#F44336" />
            <Text style={styles.moodText}>Năng lượng thấp vào ngày 1-2</Text>
          </View>
        </View>

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

  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: colors.card, padding: 20, borderRadius: 24, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statUnit: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  statLabel: { fontSize: 13, color: colors.textMuted },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 15 },
  
  confidenceCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  confidenceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  confidenceTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginLeft: 10 },
  progressBar: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 15 },
  progressFill: { height: '100%', borderRadius: 4 },
  confidenceNote: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 5 },

  symptomsCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  symptomRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  symptomName: { width: 100, fontSize: 14, fontWeight: '600', color: colors.text },
  barBg: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, marginHorizontal: 10 },
  barFill: { height: '100%', borderRadius: 4 },
  symptomFreq: { width: 35, fontSize: 13, fontWeight: '700', color: colors.textMuted, textAlign: 'right' },

  moodCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  moodItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  moodText: { fontSize: 15, fontWeight: '500', color: colors.text, marginLeft: 12 }
});
