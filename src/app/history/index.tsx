import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useProfileStore } from '../../store/useProfileStore';

export default function HistoryScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!profile?.uid) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', profile.uid)
          .order('log_date', { ascending: false });

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [profile?.uid]);

  const renderSymptomBadges = (symptoms: string[]) => {
    if (!symptoms || symptoms.length === 0) return null;
    return (
      <View style={styles.badgeContainer}>
        {symptoms.map(sym => (
          <View key={sym} style={styles.badge}>
            <Text style={styles.badgeText}>{sym}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lịch Sử Ghi Nhận</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <View style={styles.centerBox}>
              <MaterialCommunityIcons name="note-text-outline" size={60} color={colors.textMuted} />
              <Text style={styles.emptyText}>Chưa có ghi nhận nào</Text>
              <Text style={styles.emptySub}>Hãy ghi nhận hàng ngày để theo dõi sức khỏe nhé.</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.dateBox}>
                    <Feather name="calendar" size={16} color={colors.primary} />
                    <Text style={styles.dateText}>{new Date(log.log_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                  </View>
                  {log.is_period_day && (
                    <View style={styles.periodBadge}>
                      <MaterialCommunityIcons name="water" size={14} color="#D32F2F" />
                      <Text style={styles.periodBadgeText}>Có kinh</Text>
                    </View>
                  )}
                </View>

                {log.moods && log.moods.length > 0 && (
                  <View style={styles.infoRow}>
                    <Feather name="smile" size={18} color={colors.textMuted} />
                    <Text style={styles.infoText}>Tâm trạng: <Text style={{fontWeight: '600'}}>{log.moods[0]}</Text></Text>
                  </View>
                )}

                <View style={styles.statsRow}>
                  {log.water_cups !== null && log.water_cups !== undefined && (
                    <View style={styles.statBox}>
                      <MaterialCommunityIcons name="cup-water" size={20} color="#2196F3" />
                      <Text style={styles.statText}>{log.water_cups} ly</Text>
                    </View>
                  )}
                  {log.sleep_hours !== null && log.sleep_hours !== undefined && (
                    <View style={styles.statBox}>
                      <Feather name="moon" size={18} color="#9C27B0" />
                      <Text style={styles.statText}>{log.sleep_hours} giờ</Text>
                    </View>
                  )}
                </View>

                {renderSymptomBadges(log.symptoms)}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  loadingText: { marginTop: 15, fontSize: 16, color: colors.textMuted },
  emptyText: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  emptySub: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },

  scrollContent: { padding: 24, paddingBottom: 100 },
  
  logCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.04)' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 16, fontWeight: '700', color: colors.text },
  periodBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  periodBadgeText: { fontSize: 12, fontWeight: '700', color: '#D32F2F' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  infoText: { fontSize: 15, color: colors.text },

  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statText: { fontSize: 14, fontWeight: '600', color: colors.text },

  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: colors.primaryLight + '30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 13, color: colors.primaryDark, fontWeight: '600' }
});
