import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';

// Components
import CareKit from '../../components/husband/CareKit';
import DoNotSayGuide from '../../components/husband/DoNotSayGuide';
import HouseworkShield from '../../components/husband/HouseworkShield';
import LoveScript from '../../components/husband/LoveScript';

const { width } = Dimensions.get('window');

// Tone màu trầm tĩnh, nam tính, tin cậy
const husbandTheme = {
  bg: '#F8FAFC', // Slate 50
  primary: '#3B82F6', // Blue 500
  dark: '#0F172A', // Slate 900
  card: '#FFFFFF',
  text: '#334155', // Slate 700
  muted: '#94A3B8' // Slate 400
};

export default function HusbandDashboard() {
  const router = useRouter();
  const profile = useProfileStore(state => state.profile);

  // Giả lập trạng thái của vợ dựa trên dữ liệu
  const isPeriod = true; 
  const currentTab = 'overview'; // Could use state for tabs, but scrolling is better for now

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={husbandTheme.dark} />
        </Pressable>
        <Text style={styles.headerTitle}>Partner Mode</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        
        {/* Lời chào & Trạng thái nhanh */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greeting}>Chào Chồng Yêu 👋</Text>
            <Text style={styles.subGreeting}>Hôm nay vợ cần sự tinh tế của bạn.</Text>
          </View>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-tie" size={24} color={husbandTheme.primary} />
          </View>
        </View>

        {/* Cảnh báo trạng thái */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Tình trạng hiện tại</Text>
            <View style={[styles.badge, isPeriod ? styles.badgeDanger : styles.badgeSafe]}>
              <Text style={styles.badgeText}>{isPeriod ? '🔴 Đang Tới Tháng' : '🟢 Bình thường'}</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Feather name="droplet" size={24} color={isPeriod ? '#EF4444' : husbandTheme.primary} />
              <Text style={styles.metricLabel}>Ngày 2</Text>
              <Text style={styles.metricSub}>Của chu kỳ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metric}>
              <Feather name="frown" size={24} color="#F59E0B" />
              <Text style={styles.metricLabel}>Mức Cam</Text>
              <Text style={styles.metricSub}>Support Level</Text>
            </View>
          </View>
          
          <View style={styles.aiTipBox}>
            <FontAwesome5 name="magic" size={14} color="#8B5CF6" />
            <Text style={styles.aiTipText}>
              Phân tích AI: Hôm nay vợ dễ cáu gắt và đau mỏi lưng. Nên chủ động làm việc nhà và tránh tranh cãi.
            </Text>
          </View>
        </View>

        {/* Các module Premium của Husband Mode */}
        
        <CareKit />
        
        <HouseworkShield />
        
        <LoveScript />
        
        <DoNotSayGuide />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: husbandTheme.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: husbandTheme.dark },
  
  scrollView: { flex: 1, padding: 20 },
  
  greetingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 10 },
  greeting: { fontSize: 24, fontWeight: '800', color: husbandTheme.dark, marginBottom: 5 },
  subGreeting: { fontSize: 14, color: husbandTheme.muted },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', borderWidth: 1, borderColor: '#E2E8F0' },
  
  statusCard: { backgroundColor: husbandTheme.card, borderRadius: 24, padding: 24, marginBottom: 30, boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.08)' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: husbandTheme.dark },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeDanger: { backgroundColor: '#FEE2E2' },
  badgeSafe: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
  
  metricRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginBottom: 15 },
  metric: { alignItems: 'center', flex: 1 },
  metricLabel: { fontSize: 18, fontWeight: '800', color: husbandTheme.dark, marginTop: 10, marginBottom: 4 },
  metricSub: { fontSize: 12, color: husbandTheme.muted },
  divider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
  
  aiTipBox: { flexDirection: 'row', backgroundColor: '#F5F3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
  aiTipText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#6D28D9', lineHeight: 20, fontWeight: '500' }
});
