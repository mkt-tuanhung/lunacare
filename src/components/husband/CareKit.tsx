import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const initialItems = [
  { id: '1', name: 'Băng vệ sinh / Tampon', checked: false, category: 'Vệ sinh' },
  { id: '2', name: 'Túi chườm nóng', checked: false, category: 'Giảm đau' },
  { id: '3', name: 'Trà gừng / Nước ấm', checked: false, category: 'Đồ uống' },
  { id: '4', name: 'Socola đen / Đồ ăn nhẹ', checked: false, category: 'Đồ ăn' },
  { id: '5', name: 'Thuốc giảm đau (nếu vợ yêu cầu)', checked: false, category: 'Giảm đau' }
];

export default function CareKit() {
  const [items, setItems] = useState(initialItems);

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completedCount = items.filter(i => i.checked).length;
  const progress = completedCount / items.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Feather name="shopping-bag" size={20} color="#E91E63" />
        </View>
        <View>
          <Text style={styles.title}>Care Kit Chuẩn Bị</Text>
          <Text style={styles.subtitle}>{completedCount}/{items.length} món đã sẵn sàng</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.list}>
        {items.map(item => (
          <Pressable key={item.id} style={styles.itemRow} onPress={() => toggleItem(item.id)}>
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked && <Feather name="check" size={14} color="white" />}
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
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
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FCE4EC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginBottom: 20 },
  progressBarFill: { height: '100%', backgroundColor: '#E91E63', borderRadius: 3 },
  
  list: { gap: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  itemName: { fontSize: 15, fontWeight: '500', color: '#334155' },
  itemNameChecked: { textDecorationLine: 'line-through', color: '#94A3B8' },
  itemCategory: { fontSize: 12, color: '#94A3B8', marginTop: 2 }
});
