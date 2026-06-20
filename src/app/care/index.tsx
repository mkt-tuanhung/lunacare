import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Linking } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCareStore, SupportLevel } from '../../store/useCareStore';
import { useCycleStore } from '../../store/useCycleStore';

const SUPPORT_LEVELS: { id: SupportLevel; title: string; color: string; desc: string; icon: any }[] = [
  { id: 'green', title: 'Mức Xanh', color: '#4CAF50', desc: 'Em ổn, chăm sóc bình thường', icon: 'leaf' },
  { id: 'yellow', title: 'Mức Vàng', color: '#FFC107', desc: 'Em hơi mệt, cần nhẹ nhàng', icon: 'weather-partly-cloudy' },
  { id: 'orange', title: 'Mức Cam', color: '#FF9800', desc: 'Em đau/khó chịu, cần hỗ trợ nhiều', icon: 'fire' },
  { id: 'red', title: 'Mức Đỏ', color: '#F44336', desc: 'Em rất đau, cần theo dõi sát', icon: 'alert-circle' },
];

export default function CareCenter() {
  const router = useRouter();
  const { currentSupportLevel, setSupportLevel, preferences, updatePreferences } = useCareStore();
  const { prediction } = useCycleStore();
  
  const [isTravelMode, setIsTravelMode] = useState(false);
  
  let careSuggestion = "Hôm nay bạn đang ở giai đoạn bình thường. Hãy uống đủ nước và duy trì vận động nhé!";
  let isPmsOrPeriod = false;
  let isPrePms = false;
  let isOvulationPhase = false;

  if (prediction) {
    const today = new Date().toISOString().split('T')[0];
    if (prediction.predictedStartDate && today >= prediction.pmsWindowStart! && today <= prediction.pmsWindowEnd!) {
      careSuggestion = "Bạn sắp đến kỳ kinh (giai đoạn PMS). Cơ thể có thể dễ mệt mỏi và cáu gắt. Hãy ưu tiên ngủ sớm, uống trà ấm và tránh các cuộc nói chuyện căng thẳng.";
      isPmsOrPeriod = true;
    } else if (prediction.predictedStartDate) {
      const diff = (new Date(prediction.predictedStartDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 0 && diff <= 3) {
        isPrePms = true;
      }
    }
    
    if (today >= prediction.fertileWindowStart! && today <= prediction.fertileWindowEnd!) {
      careSuggestion = "Bạn đang trong cửa sổ thụ thai! Năng lượng của bạn có thể đang ở mức cao nhất. Rất thích hợp để tập luyện cường độ cao hoặc làm việc sáng tạo.";
      isOvulationPhase = true;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Trung Tâm Chăm Sóc</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {isPmsOrPeriod && (
          <View style={[styles.section, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9', borderWidth: 1 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#C8E6C9' }]}>
                <MaterialCommunityIcons name="cart-outline" size={24} color="#2E7D32" />
              </View>
              <Text style={[styles.sectionTitle, {color: '#2E7D32', marginTop: 0}]}>Smart Grocery</Text>
            </View>
            <Text style={[styles.suggestionText, {marginBottom: 10}]}>Bạn sắp tới kỳ, hệ thống đã chuẩn bị sẵn danh sách đi siêu thị cho bạn (hoặc chồng):</Text>
            <Text style={{lineHeight: 24, fontSize: 15, color: '#1B5E20'}}>• Băng vệ sinh / Tampon{"\n"}• Trà gừng ấm{"\n"}• Socola đen ({'>'}70% cacao){"\n"}• Túi sưởi (nếu đã cũ){"\n"}• Trái cây tươi (Chuối, bơ, cam)</Text>
          </View>
        )}

        {/* ADVANCED: Sleep Protection */}
        {isPrePms && (
          <View style={[styles.section, { backgroundColor: '#E1BEE7', borderColor: '#CE93D8', borderWidth: 1 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#CE93D8' }]}>
                <MaterialCommunityIcons name="sleep" size={24} color="#6A1B9A" />
              </View>
              <Text style={[styles.sectionTitle, {color: '#6A1B9A', marginTop: 0}]}>Sleep Protection</Text>
            </View>
            <Text style={[styles.suggestionText, {marginBottom: 10, color: '#4A148C'}]}>Bạn còn khoảng 2-3 ngày nữa là tới kỳ. Đây là thời điểm vàng để cơ thể tích trữ năng lượng. Hãy cố gắng đi ngủ trước 22:30 tối nay nhé!</Text>
          </View>
        )}

        {/* ADVANCED: Cycle-Based Planning */}
        {isOvulationPhase && (
          <View style={[styles.section, { backgroundColor: '#E0F7FA', borderColor: '#80DEEA', borderWidth: 1 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#80DEEA' }]}>
                <MaterialCommunityIcons name="map-marker-path" size={24} color="#00838F" />
              </View>
              <Text style={[styles.sectionTitle, {color: '#00838F', marginTop: 0}]}>Cycle-Based Planning</Text>
            </View>
            <Text style={[styles.suggestionText, {marginBottom: 10, color: '#006064'}]}>Năng lượng của bạn đang ở mức ĐỈNH CAO! Gợi ý lịch trình tuần này:{"\n"}• Đi chơi xa / Du lịch ngắn ngày.{"\n"}• Hẹn hò lãng mạn.{"\n"}• Tham gia các hoạt động thể thao cường độ cao.</Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFE0B2' }]}>
              <MaterialCommunityIcons name="airplane-takeoff" size={24} color="#E65100" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.sectionTitle, {color: '#E65100', marginTop: 0}]}>Period Travel Mode</Text>
              <Text style={{fontSize: 12, color: '#E65100', marginTop: 2}}>Nhắc nhở nếu lịch đi chơi trùng ngày kinh</Text>
            </View>
          </View>
          {isTravelMode ? (
            <View>
              <Text style={{fontSize: 15, color: '#E65100', fontWeight: 'bold', marginBottom: 5}}>Phát hiện chuyến đi vào tuần tới!</Text>
              <Text style={styles.suggestionText}>Kỳ kinh của bạn dự kiến rơi vào đúng những ngày bạn đi du lịch. Đừng quên mang theo Care Kit (BVS, thuốc giảm đau, quần áo thoải mái) nhé!</Text>
              <Pressable style={{marginTop: 15, alignSelf: 'flex-start'}} onPress={() => setIsTravelMode(false)}>
                <Text style={{color: '#E65100', fontWeight: 'bold', textDecorationLine: 'underline'}}>Tắt Travel Mode</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={{backgroundColor: '#FFCC80', padding: 12, borderRadius: 12, alignItems: 'center'}} onPress={() => setIsTravelMode(true)}>
              <Text style={{color: '#E65100', fontWeight: 'bold'}}>Bật Travel Mode (Test)</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Mức độ cần hỗ trợ hôm nay</Text>
        <Text style={styles.sectionDesc}>Hãy cho chồng biết hôm nay cơ thể bạn đang cảm thấy thế nào để nhận được sự chăm sóc phù hợp nhất nhé.</Text>

        <View style={styles.levelContainer}>
          {SUPPORT_LEVELS.map(level => {
            const isSelected = currentSupportLevel === level.id;
            return (
              <Pressable
                key={level.id}
                style={[
                  styles.levelCard,
                  isSelected && { borderColor: level.color, backgroundColor: level.color + '15' }
                ]}
                onPress={() => setSupportLevel(level.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: level.color }]}>
                  <MaterialCommunityIcons name={level.icon} size={24} color="white" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, { color: isSelected ? level.color : colors.text }]}>{level.title}</Text>
                  <Text style={styles.levelDesc}>{level.desc}</Text>
                </View>
                {isSelected && (
                  <Feather name="check-circle" size={24} color={level.color} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Gợi ý Chăm sóc bản thân</Text>
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <View style={styles.suggestionIconBox}>
              <Feather name="coffee" size={20} color={colors.primary} />
            </View>
            <Text style={styles.suggestionTitle}>Dành riêng cho bạn hôm nay</Text>
          </View>
          <Text style={styles.suggestionText}>
            • Uống một ly trà hoa cúc ấm.{"\n"}
            • Nghe một bản nhạc nhẹ nhàng.{"\n"}
            • Dành 15 phút đi bộ chậm.{"\n"}
            • Tránh ăn đồ cay nóng và dầu mỡ.
          </Text>
        </View>

        {/* ADVANCED: Work Mode */}
        {(currentSupportLevel === 'orange' || currentSupportLevel === 'red') && (
          <View style={[styles.suggestionCard, {backgroundColor: '#E3F2FD', borderColor: '#90CAF9'}]}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.suggestionIconBox, {backgroundColor: '#BBDEFB'}]}>
                <Feather name="briefcase" size={20} color="#1565C0" />
              </View>
              <Text style={[styles.suggestionTitle, {color: '#1565C0'}]}>Work Mode: Chế độ làm việc nhẹ nhàng</Text>
            </View>
            <Text style={[styles.suggestionText, {color: '#0D47A1'}]}>
              Bạn đang ở mức Cần Hỗ Trợ/Đau. LunaCare khuyên bạn:
              {"\n"}• Hủy/dời các cuộc họp không quá quan trọng.
              {"\n"}• Chuyển sang làm việc online/work-from-home nếu có thể.
              {"\n"}• Đừng cố sức ép bản thân hoàn thành deadline gắt gao hôm nay.
            </Text>
          </View>
        )}

        {/* ADVANCED: Emergency SOS */}
        {currentSupportLevel === 'red' && (
          <Pressable style={styles.sosButton} onPress={() => Linking.openURL(`tel:0987654321`)}>
            <Feather name="phone-call" size={24} color="white" />
            <Text style={styles.sosButtonText}>S.O.S: Gọi điện ngay cho Chồng</Text>
          </Pressable>
        )}

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Sở thích của bạn</Text>
          <Text style={styles.sectionDesc}>Chồng sẽ thấy danh sách này để mua đồ cho bạn.</Text>
          
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Món ăn vặt:</Text>
          <TextInput
            style={styles.textInput}
            value={preferences.favoriteFoods.join(', ')}
            onChangeText={(text) => updatePreferences({ favoriteFoods: text.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="VD: Trà gừng, socola đen..."
            multiline
          />
          
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 15 }}>Đồ giảm đau / Yêu thích:</Text>
          <TextInput
            style={styles.textInput}
            value={preferences.comfortItems.join(', ')}
            onChangeText={(text) => updatePreferences({ comfortItems: text.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="VD: Túi chườm nóng, nến thơm..."
            multiline
          />
        </View>

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Custom Rules (Quy tắc tự động)</Text>
          <Text style={styles.sectionDesc}>LunaCare sẽ tự động nhắc nhở Chồng dựa theo quy tắc bạn đặt ra.</Text>
          <TextInput
            style={styles.textInput}
            value={preferences.doNotSay ? preferences.doNotSay.join('\n') : ''}
            onChangeText={(text) => updatePreferences({ doNotSay: text.split('\n').filter(Boolean) })}
            placeholder='VD: "Ngày đầu kỳ luôn nhắc chồng mua cháo sườn"'
            multiline
          />
        </View>

        <Pressable style={styles.partnerBtn} onPress={() => router.push('/partner')}>
          <MaterialCommunityIcons name="shield-account-outline" size={24} color={colors.primary} />
          <Text style={styles.partnerBtnText}>Cài đặt Quyền chia sẻ cho Chồng</Text>
          <Feather name="chevron-right" size={20} color={colors.primary} />
        </Pressable>

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
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8, marginTop: 10 },
  sectionDesc: { fontSize: 14, color: colors.textMuted, marginBottom: 20, lineHeight: 22 },
  
  levelContainer: { marginBottom: 30 },
  levelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  levelDesc: { fontSize: 13, color: colors.textMuted },
  
  suggestionCard: { backgroundColor: colors.card, padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: colors.primaryLight + '50' },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  section: { padding: 20, borderRadius: 24, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  suggestionIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  suggestionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  suggestionText: { fontSize: 15, color: colors.textMuted, lineHeight: 26 },

  preferencesSection: { marginBottom: 30 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 },
  textInput: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, fontSize: 15, minHeight: 60, textAlignVertical: 'top' },

  partnerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight + '20', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryLight },
  partnerBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginLeft: 12 },

  sosButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D32F2F', padding: 18, borderRadius: 24, marginTop: -15, marginBottom: 30, boxShadow: '0px 8px 20px rgba(211, 47, 47, 0.4)' },
  sosButtonText: { fontSize: 16, fontWeight: '800', color: 'white', marginLeft: 10, letterSpacing: 0.5 },
});
