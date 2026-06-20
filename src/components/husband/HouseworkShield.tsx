import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const initialChores = [
  { id: '1', name: 'Rửa bát', points: 10, done: false },
  { id: '2', name: 'Giặt đồ / Phơi đồ', points: 15, done: false },
  { id: '3', name: 'Dọn phòng', points: 20, done: false },
  { id: '4', name: 'Chuẩn bị bữa tối', points: 25, done: false },
  { id: '5', name: 'Đổ rác', points: 5, done: false }
];

export default function HouseworkShield() {
  const [chores, setChores] = useState(initialChores);

  const toggleChore = (id: string) => {
    setChores(chores.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const totalPoints = chores.filter(c => c.done).reduce((sum, c) => sum + c.points, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <FontAwesome5 name="shield-alt" size={18} color="#3B82F6" />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.title}>Lá Chắn Việc Nhà</Text>
          <Text style={styles.subtitle}>Điểm chăm sóc hôm nay: <Text style={{fontWeight: '700', color: '#3B82F6'}}>{totalPoints}</Text></Text>
        </View>
      </View>

      <View style={styles.alertBox}>
        <Feather name="info" size={16} color="#2563EB" style={{marginTop: 2}} />
        <Text style={styles.alertText}>
          Hôm nay vợ đang mệt, hãy chủ động nhận làm những việc này để chia sẻ gánh nặng nhé!
        </Text>
      </View>

      <View style={styles.list}>
        {chores.map(chore => (
          <Pressable key={chore.id} style={styles.choreItem} onPress={() => toggleChore(chore.id)}>
            <View style={[styles.checkbox, chore.done && styles.checkboxDone]}>
              {chore.done && <Feather name="check" size={14} color="white" />}
            </View>
            <Text style={[styles.choreName, chore.done && styles.choreNameDone]}>{chore.name}</Text>
            <View style={styles.pointBadge}>
              <Text style={styles.pointText}>+{chore.points}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  
  alertBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 10, marginBottom: 20 },
  alertText: { flex: 1, marginLeft: 8, fontSize: 13, color: '#1E3A8A', lineHeight: 20 },
  
  list: { gap: 12 },
  choreItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxDone: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  choreName: { flex: 1, fontSize: 15, fontWeight: '500', color: '#334155' },
  choreNameDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  
  pointBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pointText: { fontSize: 12, fontWeight: '700', color: '#2563EB' }
});
