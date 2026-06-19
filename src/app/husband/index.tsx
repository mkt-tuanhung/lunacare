import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { usePartnerStore } from '../../store/usePartnerStore';
import { useCareStore } from '../../store/useCareStore';
import { useCycleStore } from '../../store/useCycleStore';
import { useState } from 'react';

export default function HusbandCompanion() {
  const router = useRouter();
  const { isPartnerModeEnabled, permissions } = usePartnerStore();
  const { currentSupportLevel, preferences } = useCareStore();
  const { prediction } = useCycleStore();
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Hỏi vợ hôm nay có đau bụng không', done: false },
    { id: 2, title: 'Chuẩn bị nước ấm', done: false },
    { id: 3, title: 'Chủ động rửa bát', done: false },
    { id: 4, title: 'Không trêu quá đà', done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  if (!isPartnerModeEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Góc Của Chồng</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.disconnectedState}>
          <MaterialCommunityIcons name="link-variant-off" size={60} color={colors.textMuted} />
          <Text style={styles.disconnectedTitle}>Chưa Kết Nối</Text>
          <Text style={styles.disconnectedDesc}>Vợ cần bật chế độ Partner Mode để chia sẻ trạng thái chăm sóc với bạn.</Text>
        </View>
      </View>
    );
  }

  const getLevelUI = () => {
    switch(currentSupportLevel) {
      case 'green': return { color: '#4CAF50', text: 'Vợ Đang Ổn', icon: 'leaf', msg: 'Mọi thứ bình thường. Hãy giữ nhịp độ chăm sóc như mọi ngày nhé!' };
      case 'yellow': return { color: '#FFC107', text: 'Vợ Hơi Mệt', icon: 'weather-partly-cloudy', msg: 'Cô ấy có vẻ cần được nghỉ ngơi thêm một chút. Hãy chủ động giúp việc nhà nhé.' };
      case 'orange': return { color: '#FF9800', text: 'Vợ Cần Hỗ Trợ', icon: 'fire', msg: 'Hôm nay cơ thể cô ấy khá khó chịu. Hãy hỏi xem cô ấy cần gì và chuẩn bị đồ ăn ngon nhé.' };
      case 'red': return { color: '#F44336', text: 'Vợ Rất Mệt', icon: 'alert-circle', msg: 'Cô ấy đang rất đau hoặc mệt mỏi. Hãy hủy các kế hoạch không quan trọng và ở bên chăm sóc cô ấy.' };
      default: return { color: colors.textMuted, text: 'Không Rõ', icon: 'help', msg: '' };
    }
  };

  const levelUI = getLevelUI();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Góc Của Chồng</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {permissions.shareSupportLevel && (
          <View style={[styles.statusCard, { backgroundColor: levelUI.color }]}>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons name={levelUI.icon as any} size={32} color="white" />
              <Text style={styles.statusTitle}>{levelUI.text}</Text>
            </View>
            <Text style={styles.statusDesc}>{levelUI.msg}</Text>
          </View>
        )}

        {permissions.shareCyclePhase && prediction?.predictedStartDate && (
          <View style={styles.infoCard}>
            <Feather name="calendar" size={20} color={colors.primary} />
            <Text style={styles.infoCardText}>Kỳ kinh tiếp theo dự kiến vào: <Text style={{fontWeight: '800'}}>{new Date(prediction.predictedStartDate).toLocaleDateString('vi-VN')}</Text></Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Checklist Việc Nhà Hôm Nay</Text>
        <View style={styles.tasksCard}>
          {tasks.map(t => (
            <Pressable key={t.id} style={styles.taskRow} onPress={() => toggleTask(t.id)}>
              <MaterialCommunityIcons 
                name={t.done ? "check-circle" : "circle-outline"} 
                size={24} 
                color={t.done ? colors.primary : colors.textMuted} 
              />
              <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Love Scripts (Gợi ý tin nhắn)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24, marginBottom: 30 }}>
          <View style={styles.scriptCard}>
            <Text style={styles.scriptTone}>Ngọt ngào</Text>
            <Text style={styles.scriptMsg}>"Em nằm nghỉ đi nhé, việc nhà để anh lo. Em cần túi chườm hay nước ấm thì gọi anh."</Text>
            <Pressable style={styles.copyBtn} onPress={() => alert('Đã chép vào bộ nhớ tạm!')}>
              <Feather name="copy" size={16} color={colors.primary} />
              <Text style={styles.copyText}>Copy</Text>
            </Pressable>
          </View>
          <View style={styles.scriptCard}>
            <Text style={styles.scriptTone}>Trưởng thành</Text>
            <Text style={styles.scriptMsg}>"Anh thấy mấy hôm nay em có vẻ dễ mệt hơn. Tối nay em muốn ăn gì nhẹ nhẹ không, anh chuẩn bị cho."</Text>
            <Pressable style={styles.copyBtn} onPress={() => alert('Đã chép vào bộ nhớ tạm!')}>
              <Feather name="copy" size={16} color={colors.primary} />
              <Text style={styles.copyText}>Copy</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Text style={styles.sectionTitle}>Tuyệt Đối Không Nói 🛑</Text>
        <View style={styles.doNotSayCard}>
          {preferences.doNotSay.map(phrase => (
            <View key={phrase} style={styles.badPhraseRow}>
              <Feather name="x-circle" size={20} color="#F44336" />
              <Text style={styles.badPhraseText}>{phrase}</Text>
            </View>
          ))}
          <View style={styles.badPhraseRow}>
            <Feather name="x-circle" size={20} color="#F44336" />
            <Text style={styles.badPhraseText}>Sao hôm nay lười thế?</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sở thích của Vợ</Text>
        <View style={styles.preferencesCard}>
          <Text style={styles.prefLabel}>Đồ ăn vặt yêu thích:</Text>
          <Text style={styles.prefValue}>{preferences.favoriteFoods.join(', ')}</Text>
          
          <Text style={styles.prefLabel}>Đồ giảm đau:</Text>
          <Text style={styles.prefValue}>{preferences.comfortItems.join(', ')}</Text>
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

  disconnectedState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  disconnectedTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 20, marginBottom: 10 },
  disconnectedDesc: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },

  statusCard: { padding: 24, borderRadius: 24, marginBottom: 20, boxShadow: '0px 8px 24px rgba(0,0,0,0.1)' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginLeft: 12 },
  statusDesc: { fontSize: 15, color: 'white', lineHeight: 22, opacity: 0.9 },

  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight + '20', padding: 16, borderRadius: 16, marginBottom: 30 },
  infoCardText: { flex: 1, fontSize: 14, color: colors.primaryDark, marginLeft: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 15 },
  
  tasksCard: { backgroundColor: colors.card, borderRadius: 24, padding: 10, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  taskRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  taskText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 15 },
  taskDone: { textDecorationLine: 'line-through', color: colors.textMuted },

  scriptCard: { width: 280, backgroundColor: colors.card, padding: 20, borderRadius: 24, marginRight: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  scriptTone: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', marginBottom: 10 },
  scriptMsg: { fontSize: 15, color: colors.text, fontStyle: 'italic', lineHeight: 24, marginBottom: 15 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.primaryLight + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  copyText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginLeft: 6 },

  doNotSayCard: { backgroundColor: '#FFEBEE', padding: 20, borderRadius: 24, marginBottom: 30 },
  badPhraseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badPhraseText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#D32F2F', marginLeft: 12 },

  preferencesCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  prefLabel: { fontSize: 14, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  prefValue: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 15 },
});
