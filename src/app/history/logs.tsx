import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';

export default function DailyLogsHistoryScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!profile?.uid) return;
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.uid)
        .order('log_date', { ascending: false });
        
      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [profile?.uid]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nhật ký Sức khỏe</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Xem lại toàn bộ ghi chú sức khỏe hằng ngày của bạn</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : logs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="file-text" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>Chưa có ghi chú sức khỏe nào.</Text>
          </View>
        ) : (
          logs.map(log => (
            <Pressable 
              key={log.id} 
              style={styles.logCard}
              onPress={() => router.push(`/log?date=${log.log_date}`)}
            >
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>{new Date(log.log_date).toLocaleDateString('vi-VN')}</Text>
                {log.is_period_day && (
                  <View style={styles.periodBadge}>
                    <Text style={styles.periodBadgeText}>Ngày hành kinh</Text>
                  </View>
                )}
              </View>

              <View style={styles.logBody}>
                {log.moods && log.moods.length > 0 && (
                  <Text style={styles.logItem}>
                    <Text style={{fontWeight: 'bold'}}>Tâm trạng: </Text>{log.moods.join(', ')}
                  </Text>
                )}
                {log.symptoms && log.symptoms.length > 0 && (
                  <Text style={styles.logItem}>
                    <Text style={{fontWeight: 'bold'}}>Triệu chứng: </Text>{log.symptoms.join(', ')}
                  </Text>
                )}
                {log.pain_score > 0 && (
                  <Text style={styles.logItem}>
                    <Text style={{fontWeight: 'bold'}}>Mức độ đau: </Text>{log.pain_score}/10
                  </Text>
                )}
                {log.notes ? (
                  <Text style={styles.logItem} numberOfLines={2}>
                    <Text style={{fontWeight: 'bold', fontStyle: 'italic'}}>Ghi chú: </Text>{log.notes}
                  </Text>
                ) : null}
              </View>

              <View style={styles.editRow}>
                <Text style={styles.editText}>Nhấn để xem / sửa</Text>
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ))
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
  
  scrollContent: { padding: 24, paddingBottom: 100 },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 20 },
  
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 20, marginTop: 40 },
  emptyText: { marginTop: 10, color: colors.textMuted, fontSize: 16 },
  
  logCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 15, boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  logDate: { fontSize: 16, fontWeight: '700', color: colors.primaryDark },
  periodBadge: { backgroundColor: '#FF4B72', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  periodBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  
  logBody: { marginBottom: 15 },
  logItem: { fontSize: 14, color: colors.text, marginBottom: 5, lineHeight: 20 },
  
  editRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  editText: { fontSize: 13, color: colors.primary, fontWeight: '600', marginRight: 5 }
});
