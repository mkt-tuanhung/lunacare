import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';

export default function EditCycleScreen() {
  const router = useRouter();
  const { periodEvents, updatePeriodEvent, deletePeriodEvent, addPeriodEvent } = useCycleStore();
  const { profile } = useProfileStore();

  const sortedEvents = [...periodEvents].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const adjustDate = (id: string, field: 'startDate' | 'endDate', currentValue: string | undefined, daysToAdd: number) => {
    if (!currentValue && field === 'endDate') {
        // If no end date, initialize it to start date
        const event = periodEvents.find(e => e.id === id);
        if (event) currentValue = event.startDate;
    }
    if (!currentValue) return;

    const date = new Date(currentValue);
    date.setDate(date.getDate() + daysToAdd);
    const newDateStr = date.toISOString().split('T')[0];

    updatePeriodEvent(id, { [field]: newDateStr });
  };

  const handleAddNew = () => {
    const today = new Date().toISOString().split('T')[0];
    addPeriodEvent({
      userId: profile?.uid || 'guest',
      startDate: today,
      endDate: today
    });
  };

  const handleDelete = (id: string) => {
    // Note: Alert.alert is mocked on Web, but works well enough. We can just use confirm on Web.
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm("Bạn có chắc chắn muốn xoá chu kỳ này?")) {
        deletePeriodEvent(id);
      }
    } else {
      Alert.alert("Xác nhận", "Bạn có chắc muốn xoá?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => deletePeriodEvent(id) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chỉnh sửa chu kỳ</Text>
        <Pressable style={styles.backBtn} onPress={handleAddNew}>
          <Feather name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Feather name="info" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Bấm vào các nút +/- để tinh chỉnh ngày bắt đầu và kết thúc của từng chu kỳ.</Text>
        </View>

        {sortedEvents.length === 0 ? (
          <Text style={styles.emptyText}>Bạn chưa ghi nhận chu kỳ nào.</Text>
        ) : (
          sortedEvents.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>Chu kỳ tháng {new Date(event.startDate).getMonth() + 1}</Text>
                <Pressable onPress={() => handleDelete(event.id)}>
                  <Feather name="trash-2" size={20} color="#F44336" />
                </Pressable>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Bắt đầu:</Text>
                <View style={styles.adjuster}>
                  <Pressable style={styles.adjustBtn} onPress={() => adjustDate(event.id, 'startDate', event.startDate, -1)}>
                    <Feather name="minus" size={16} color={colors.text} />
                  </Pressable>
                  <Text style={styles.dateValue}>{new Date(event.startDate).toLocaleDateString('vi-VN')}</Text>
                  <Pressable style={styles.adjustBtn} onPress={() => adjustDate(event.id, 'startDate', event.startDate, 1)}>
                    <Feather name="plus" size={16} color={colors.text} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Kết thúc:</Text>
                <View style={styles.adjuster}>
                  <Pressable style={styles.adjustBtn} onPress={() => adjustDate(event.id, 'endDate', event.endDate, -1)}>
                    <Feather name="minus" size={16} color={colors.text} />
                  </Pressable>
                  <Text style={styles.dateValue}>{event.endDate ? new Date(event.endDate).toLocaleDateString('vi-VN') : 'Đang diễn ra'}</Text>
                  <Pressable style={styles.adjustBtn} onPress={() => adjustDate(event.id, 'endDate', event.endDate, 1)}>
                    <Feather name="plus" size={16} color={colors.text} />
                  </Pressable>
                </View>
              </View>

            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  scrollContent: { padding: 24, paddingBottom: 100 },
  
  infoBox: { flexDirection: 'row', backgroundColor: colors.primaryLight + '20', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center', gap: 10 },
  infoText: { flex: 1, fontSize: 14, color: colors.primaryDark, lineHeight: 20 },
  
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.textMuted, fontSize: 16 },

  eventCard: { backgroundColor: colors.card, padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0', boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  eventTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateLabel: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  
  adjuster: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  adjustBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  dateValue: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 90, textAlign: 'center' }
});
