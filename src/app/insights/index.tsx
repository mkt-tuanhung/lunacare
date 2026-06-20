import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';

export default function Insights() {
  const router = useRouter();
  const { prediction } = useCycleStore();
  const { profile } = useProfileStore();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!profile?.uid) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.uid)
        .order('log_date', { ascending: false })
        .limit(30); // 30 ngày gần nhất
        
      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [profile?.uid]);

  // Tính toán
  const logsWithSymptoms = logs.filter(l => l.symptoms && l.symptoms.length > 0);
  const logsWithPain = logs.filter(l => typeof l.pain_score === 'number' && l.pain_score > 0);
  const logsWithMood = logs.filter(l => l.moods && l.moods.length > 0);
  
  // Lấy triệu chứng phổ biến nhất
  const symptomCounts: Record<string, number> = {};
  logsWithSymptoms.forEach(l => {
    l.symptoms.forEach((s: string) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  
  // Trung bình đau
  const avgPain = logsWithPain.length > 0 
    ? Math.round(logsWithPain.reduce((sum, l) => sum + l.pain_score, 0) / logsWithPain.length) 
    : 0;

  // Lấy tâm trạng phổ biến
  const moodCounts: Record<string, number> = {};
  logsWithMood.forEach(l => {
    l.moods.forEach((m: string) => {
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chưa đủ dữ liệu';

  // ADVANCED: AI Monthly Letter
  const [showLetter, setShowLetter] = useState(false);
  const currentMonth = new Date().getMonth() + 1;
  const generateMonthlyLetter = () => {
    if (avgPain > 5) {
      return `Tháng ${currentMonth} này, mình thấy cơ thể bạn đã phải chịu đựng khá nhiều cơn đau (trung bình ${avgPain}/10). Triệu chứng "${topSymptoms[0]?.[0] || 'mệt mỏi'}" làm bạn khó chịu nhất. Đừng quá khắt khe với bản thân nhé. Tháng tới, hãy thử chườm ấm nhiều hơn và nhờ chồng massage lưng mỗi tối. Bạn đã làm rất tốt rồi! 🌸`;
    } else if (topMood.toLowerCase().includes('vui') || topMood.toLowerCase().includes('hạnh phúc')) {
      return `Tháng ${currentMonth} khép lại với nhiều niềm vui và sự tích cực! Tâm trạng "${topMood}" xuất hiện nhiều nhất trong nhật ký của bạn. Bạn đã cân bằng công việc và sức khỏe rất tốt. Hãy tiếp tục duy trì lối sống này nhé! 🌟`;
    } else {
      return `Một tháng ${currentMonth} trôi qua với nhiều cảm xúc đan xen. Bạn đã trải qua "${topMood}" khá nhiều, đôi khi bị "${topSymptoms[0]?.[0] || 'căng thẳng'}". Tháng tới, hãy dành thêm 15 phút mỗi ngày để thiền hoặc nghe nhạc nhẹ nhàng. Nhớ rằng việc ưu tiên bản thân chưa bao giờ là ích kỷ. 💖`;
    }
  };

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

        <Text style={styles.sectionTitle}>Xu hướng Gần đây (30 ngày)</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{marginVertical: 20}} />
        ) : (
          <>
            <View style={styles.symptomsCard}>
              <Text style={{fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 15}}>Top Triệu chứng</Text>
              {topSymptoms.length === 0 ? <Text style={{color: colors.textMuted}}>Chưa có dữ liệu triệu chứng</Text> : null}
              {topSymptoms.map(([name, count], index) => {
                const percent = Math.min(100, Math.round((count / logs.length) * 100));
                const colorsArr = [colors.primary, '#FF9800', '#9C27B0'];
                return (
                  <View key={name} style={styles.symptomRow}>
                    <Text style={styles.symptomName}>{name}</Text>
                    <View style={styles.barBg}><View style={[styles.barFill, { width: `${percent}%`, backgroundColor: colorsArr[index] }]} /></View>
                    <Text style={styles.symptomFreq}>{percent}%</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, {backgroundColor: '#FFF8E1'}]}>
                <View style={[styles.iconBox, { backgroundColor: '#FFECB3' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF9800" />
                </View>
                <Text style={styles.statValue}>{avgPain}<Text style={styles.statUnit}>/10</Text></Text>
                <Text style={styles.statLabel}>Mức đau trung bình</Text>
              </View>

              <View style={[styles.statCard, {backgroundColor: '#F3E5F5'}]}>
                <View style={[styles.iconBox, { backgroundColor: '#E1BEE7' }]}>
                  <Feather name="smile" size={24} color="#9C27B0" />
                </View>
                <Text style={[styles.statValue, {fontSize: 18, marginTop: 10}]}>{topMood}</Text>
                <Text style={[styles.statLabel, {marginTop: 5}]}>Tâm trạng chính</Text>
              </View>
            </View>

            {/* ADVANCED: AI Monthly Letter */}
            <Text style={styles.sectionTitle}>Lá Thư Cuối Tháng (AI)</Text>
            <View style={styles.letterCard}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                <MaterialCommunityIcons name="email-open-outline" size={24} color="#E91E63" />
                <Text style={{fontSize: 16, fontWeight: '700', color: '#E91E63', marginLeft: 10}}>Thư gửi từ LunaCare</Text>
              </View>
              {showLetter ? (
                <Text style={styles.letterContent}>{generateMonthlyLetter()}</Text>
              ) : (
                <Pressable style={styles.openLetterBtn} onPress={() => setShowLetter(true)}>
                  <Text style={styles.openLetterText}>Mở thư của tháng {currentMonth}</Text>
                </Pressable>
              )}
            </View>
            {/* ADVANCED: Doctor Visit Prep */}
            <Text style={styles.sectionTitle}>Doctor Visit Prep (Chuẩn bị Khám)</Text>
            <View style={[styles.letterCard, {backgroundColor: '#E3F2FD', borderColor: '#BBDEFB'}]}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                <MaterialCommunityIcons name="doctor" size={24} color="#1976D2" />
                <Text style={{fontSize: 16, fontWeight: '700', color: '#1976D2', marginLeft: 10}}>Tóm tắt & Câu hỏi Gợi ý</Text>
              </View>
              <Text style={[styles.suggestionText, {marginBottom: 10, color: '#0D47A1'}]}>
                <Text style={{fontWeight: 'bold'}}>Triệu chứng nổi bật 30 ngày qua:</Text>
                {"\n"}- Đau trung bình: {avgPain}/10
                {topSymptoms.length > 0 ? topSymptoms.map((s, idx) => `\n- Hay gặp: ${s[0]}`).join('') : '\n- Không có triệu chứng đáng kể'}
              </Text>
              <Text style={{fontSize: 14, fontWeight: 'bold', color: '#1976D2', marginTop: 10, marginBottom: 5}}>Nên hỏi Bác sĩ:</Text>
              <Text style={[styles.suggestionText, {color: '#0D47A1'}]}>
                1. Mức độ đau {avgPain}/10 của em có bình thường không?{"\n"}
                2. Em hay bị {topSymptoms[0]?.[0] || 'mệt mỏi'}, có cần bổ sung vitamin gì không?{"\n"}
                3. Chu kỳ của em dài khoảng {prediction?.predictedCycleLength || 28} ngày, như vậy có ổn định không?
              </Text>
            </View>
          </>
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
  moodText: { fontSize: 15, fontWeight: '500', color: colors.text, marginLeft: 12 },

  letterCard: { backgroundColor: '#FCE4EC', padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: '#F8BBD0' },
  letterContent: { fontSize: 15, color: '#C2185B', lineHeight: 24, fontStyle: 'italic' },
  openLetterBtn: { backgroundColor: '#E91E63', padding: 15, borderRadius: 16, alignItems: 'center' },
  openLetterText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  
  suggestionText: { fontSize: 15, lineHeight: 24 }
});
