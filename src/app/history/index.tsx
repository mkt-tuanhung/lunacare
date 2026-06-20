import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCycleStore } from '../../store/useCycleStore';
import { PeriodEvent } from '../../features/cycle/cycle.types';
import { useToastStore } from '../../store/useToastStore';
import { useAlertStore } from '../../store/useAlertStore';

export default function HistoryEditScreen() {
  const router = useRouter();
  const { periodEvents, updatePeriodEvent, deletePeriodEvent } = useCycleStore();
  const { showToast } = useToastStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const sortedEvents = [...periodEvents].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const handleEdit = (event: PeriodEvent) => {
    setEditingId(event.id);
    setEditStart(event.startDate);
    setEditEnd(event.endDate || '');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editStart) {
      useAlertStore.getState().showAlert('Lỗi', 'Ngày bắt đầu không được để trống.');
      return;
    }
    
    updatePeriodEvent(editingId, {
      startDate: editStart,
      endDate: editEnd || undefined
    });
    
    setEditingId(null);
    showToast('Đã cập nhật kỳ kinh thành công!', 'success');
  };

  const handleDelete = (id: string) => {
    useAlertStore.getState().showAlert(
      'Xóa kỳ kinh',
      'Bạn có chắc chắn muốn xóa dữ liệu của kỳ kinh này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            deletePeriodEvent(id);
            showToast('Đã xóa kỳ kinh', 'info');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lịch sử Chu kỳ</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Quản lý dữ liệu các kỳ kinh đã qua</Text>
        
        {sortedEvents.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="calendar" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>Chưa có dữ liệu kỳ kinh nào.</Text>
          </View>
        ) : (
          sortedEvents.map(event => (
            <View key={event.id} style={styles.eventCard}>
              {editingId === event.id ? (
                <View style={styles.editMode}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ngày bắt đầu (YYYY-MM-DD):</Text>
                    <TextInput
                      style={styles.input}
                      value={editStart}
                      onChangeText={setEditStart}
                      placeholder="VD: 2023-10-01"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ngày kết thúc (YYYY-MM-DD):</Text>
                    <TextInput
                      style={styles.input}
                      value={editEnd}
                      onChangeText={setEditEnd}
                      placeholder="VD: 2023-10-05"
                    />
                  </View>
                  <View style={styles.actionRow}>
                    <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => setEditingId(null)}>
                      <Text style={styles.btnText}>Hủy</Text>
                    </Pressable>
                    <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSaveEdit}>
                      <Text style={[styles.btnText, {color: 'white'}]}>Lưu lại</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.viewMode}>
                  <View style={styles.dateInfo}>
                    <View style={styles.dateCircle}>
                      <Text style={styles.dateDay}>{new Date(event.startDate).getDate()}</Text>
                      <Text style={styles.dateMonth}>Thg {new Date(event.startDate).getMonth() + 1}</Text>
                    </View>
                    <View style={styles.dateRange}>
                      <Text style={styles.dateRangeText}>
                        Từ: <Text style={{fontWeight: 'bold'}}>{event.startDate}</Text>
                      </Text>
                      {event.endDate ? (
                        <Text style={styles.dateRangeText}>
                          Đến: <Text style={{fontWeight: 'bold'}}>{event.endDate}</Text>
                        </Text>
                      ) : (
                        <Text style={[styles.dateRangeText, {color: colors.primaryDark}]}>Đang diễn ra</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable style={styles.iconBtn} onPress={() => handleEdit(event)}>
                      <Feather name="edit-2" size={20} color={colors.text} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => handleDelete(event.id)}>
                      <Feather name="trash-2" size={20} color="#E53935" />
                    </Pressable>
                  </View>
                </View>
              )}
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
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  scrollContent: { padding: 24, paddingBottom: 100 },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 20 },
  
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 20, marginTop: 40 },
  emptyText: { marginTop: 10, color: colors.textMuted, fontSize: 16 },
  
  eventCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 15, boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
  
  viewMode: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { flexDirection: 'row', alignItems: 'center' },
  dateCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dateDay: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  dateMonth: { fontSize: 12, fontWeight: '600', color: colors.primaryDark },
  dateRange: { justifyContent: 'center' },
  dateRangeText: { fontSize: 15, color: colors.text, marginBottom: 2 },
  
  actions: { flexDirection: 'row' },
  iconBtn: { padding: 10, marginLeft: 5, backgroundColor: colors.background, borderRadius: 10 },
  
  editMode: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 5 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16, color: colors.text },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginLeft: 10 },
  cancelBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary },
  btnText: { fontSize: 14, fontWeight: '600', color: colors.text }
});
