import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

const guidelines = [
  { 
    id: 1, 
    situation: 'Vợ đang cáu gắt', 
    bad: 'Lại đến tháng à?', 
    good: 'Anh thấy em mệt, anh giúp gì được không?' 
  },
  { 
    id: 2, 
    situation: 'Vợ kêu đau', 
    bad: 'Có gì đâu mà đau', 
    good: 'Em nằm nghỉ đi, anh lấy nước ấm nhé?' 
  },
  { 
    id: 3, 
    situation: 'Vợ thèm ăn', 
    bad: 'Ăn nhiều thế', 
    good: 'Em muốn ăn gì, anh đặt cho' 
  },
  { 
    id: 4, 
    situation: 'Vợ buồn / nhạy cảm', 
    bad: 'Em nhạy cảm quá', 
    good: 'Anh nghe em nói, không phán xét' 
  },
  { 
    id: 5, 
    situation: 'Vợ mệt mỏi lười biếng', 
    bad: 'Sao hôm nay lười thế', 
    good: 'Việc này để anh làm cho' 
  }
];

export default function DoNotSayGuide() {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Feather name="alert-triangle" size={20} color="#F59E0B" />
        </View>
        <View>
          <Text style={styles.title}>Cẩm Nang "Cấm Kỵ"</Text>
          <Text style={styles.subtitle}>Những câu tuyệt đối không nên nói</Text>
        </View>
      </View>

      <View style={styles.list}>
        {guidelines.map(guide => (
          <Pressable 
            key={guide.id} 
            style={[styles.guideItem, expandedId === guide.id && styles.guideItemExpanded]}
            onPress={() => setExpandedId(expandedId === guide.id ? null : guide.id)}
          >
            <View style={styles.guideHeader}>
              <Text style={styles.situation}>Tình huống: {guide.situation}</Text>
              <Feather name={expandedId === guide.id ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
            </View>
            
            {expandedId === guide.id && (
              <View style={styles.guideContent}>
                <View style={styles.badBox}>
                  <Feather name="x-circle" size={16} color="#EF4444" style={{marginTop: 2}} />
                  <View style={{flex: 1, marginLeft: 8}}>
                    <Text style={styles.badLabel}>Không nên nói:</Text>
                    <Text style={styles.badText}>"{guide.bad}"</Text>
                  </View>
                </View>
                <View style={styles.goodBox}>
                  <Feather name="check-circle" size={16} color="#10B981" style={{marginTop: 2}} />
                  <View style={{flex: 1, marginLeft: 8}}>
                    <Text style={styles.goodLabel}>Nên nói:</Text>
                    <Text style={styles.goodText}>"{guide.good}"</Text>
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  list: { gap: 10 },
  guideItem: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, backgroundColor: '#F8FAFC' },
  guideItemExpanded: { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' },
  guideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  situation: { fontSize: 15, fontWeight: '600', color: '#334155' },
  
  guideContent: { marginTop: 15, gap: 10 },
  badBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8 },
  badLabel: { fontSize: 12, fontWeight: '700', color: '#DC2626', marginBottom: 2 },
  badText: { fontSize: 14, color: '#7F1D1D', fontStyle: 'italic' },
  
  goodBox: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8 },
  goodLabel: { fontSize: 12, fontWeight: '700', color: '#059669', marginBottom: 2 },
  goodText: { fontSize: 14, color: '#064E3B', fontWeight: '500' }
});
