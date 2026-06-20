import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Switch, Alert, Image, Platform, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useCycleStore } from '../../store/useCycleStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatarToR2 } from '../../lib/r2';

const { width } = Dimensions.get('window');

// ---------------- Helper: Format Date ----------------
const getDayName = (d: Date) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[d.getDay()];
};

// ---------------- Component: Week Calendar ----------------
const WeekCalendar = ({ 
  currentDate, 
  periodEvents, 
  prediction 
}: { 
  currentDate: Date, 
  periodEvents: any[], 
  prediction: any 
}) => {
  const weekDays = useMemo(() => {
    const days = [];
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  const todayStr = currentDate.toISOString().split('T')[0];

  const getDayStyle = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    
    let isPeriod = false;
    for (const e of periodEvents) {
      if (dStr >= e.startDate && dStr <= e.endDate) {
        isPeriod = true;
        break;
      }
    }

    let isFertile = false;
    let isOvulation = false;
    if (prediction && prediction.fertileWindowStart && prediction.fertileWindowEnd) {
      if (dStr >= prediction.fertileWindowStart && dStr <= prediction.fertileWindowEnd) {
        isFertile = true;
        if (dStr === prediction.ovulationDate) isOvulation = true;
      }
    }

    let isToday = dStr === todayStr;

    return { isPeriod, isFertile, isOvulation, isToday };
  };

  return (
    <View style={styles.weekCalendarContainer}>
      <Text style={styles.monthHeader}>Tháng {currentDate.getMonth() + 1}</Text>
      <View style={styles.weekRow}>
        {weekDays.map((date, idx) => {
          const { isPeriod, isFertile, isOvulation, isToday } = getDayStyle(date);
          return (
            <View key={idx} style={styles.dayCol}>
              <Text style={[styles.dayName, isToday && { fontWeight: 'bold', color: colors.text }]}>{getDayName(date)}</Text>
              <View style={[
                styles.dayCircle,
                isToday && styles.dayCircleToday,
                isPeriod && { backgroundColor: '#FF4B72' },
                isFertile && !isPeriod && { backgroundColor: isOvulation ? '#00B8D4' : '#E0F7FA' },
              ]}>
                <Text style={[
                  styles.dayDate,
                  (isPeriod || isOvulation) && { color: 'white', fontWeight: 'bold' },
                  isToday && !isPeriod && !isOvulation && { color: colors.primaryDark, fontWeight: 'bold' }
                ]}>
                  {date.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ---------------- Component: Bottom NavBar ----------------
const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomNavContainer}>
      <Pressable style={styles.navItem} onPress={() => router.push('/home')}>
        <Ionicons name={pathname === '/home' ? "calendar" : "calendar-outline"} size={24} color={pathname === '/home' ? colors.primary : colors.textMuted} />
        <Text style={[styles.navText, pathname === '/home' && { color: colors.primary, fontWeight: '600' }]}>Hôm nay</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/insights')}>
        <MaterialCommunityIcons name={pathname === '/insights' ? "chart-arc" : "chart-arc"} size={24} color={pathname === '/insights' ? colors.primary : colors.textMuted} />
        <Text style={[styles.navText, pathname === '/insights' && { color: colors.primary, fontWeight: '600' }]}>Phân tích</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/chat')}>
        <MaterialCommunityIcons name={pathname === '/chat' ? "robot" : "robot-outline"} size={24} color={pathname === '/chat' ? colors.primary : colors.textMuted} />
        <Text style={[styles.navText, pathname === '/chat' && { color: colors.primary, fontWeight: '600' }]}>Trợ lý AI</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/partner')}>
        <FontAwesome5 name={pathname === '/partner' ? "user-friends" : "user-friends"} size={20} color={pathname === '/partner' ? colors.primary : colors.textMuted} />
        <Text style={[styles.navText, pathname === '/partner' && { color: colors.primary, fontWeight: '600' }]}>Bạn tình</Text>
      </Pressable>
    </View>
  );
};


// ---------------- Main Screen ----------------
export default function Home() {
  const { periodEvents, prediction, isPredicting, calculatePrediction, isAiModeEnabled, toggleAiMode } = useCycleStore();
  const { profile, updateAvatarUrl } = useProfileStore();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPredicting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    }
  }, [isPredicting, scaleAnim]);

  useEffect(() => {
    if (prediction?.predictedStartDate) {
      const start = new Date(prediction.predictedStartDate).getTime();
      const diff = (start - new Date().getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 55 || diff < -55) calculatePrediction();
    }
  }, [prediction?.predictedStartDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const todayStr = today.toISOString().split('T')[0];

  // Logic tính toán trạng thái (Phase)
  let statusTitle = 'Đang tải...';
  let statusSub = '';
  let statusValue = '';
  let circleColors = ['#F5F7FA', '#E4E7EB']; // Default
  
  const sortedEvents = [...periodEvents].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const latestEvent = sortedEvents.length > 0 ? sortedEvents[0] : null;

  if (isPredicting) {
    statusTitle = 'Đang cập nhật thông tin dự đoán...';
    circleColors = ['#FF8A80', '#FF5252'];
  } else if (prediction) {
    let isBleeding = false;
    let bleedingDay = 0;

    if (latestEvent && todayStr >= latestEvent.startDate && todayStr <= latestEvent.endDate) {
      isBleeding = true;
      bleedingDay = Math.round((todayTime - new Date(latestEvent.startDate).getTime()) / (1000*60*60*24)) + 1;
    }

    if (isBleeding) {
      statusTitle = 'Kỳ kinh nguyệt';
      statusSub = 'Ngày';
      statusValue = bleedingDay.toString();
      circleColors = ['#FF758F', '#FF4B72']; // Pink-Red
    } else if (todayStr <= prediction.ovulationDate) {
      // Giai đoạn nang noãn (Trước rụng trứng)
      const isFertile = prediction.fertileWindowStart && todayStr >= prediction.fertileWindowStart && todayStr <= prediction.fertileWindowEnd;

      if (todayStr === prediction.ovulationDate) {
        statusTitle = 'Ngày rụng trứng';
        statusSub = 'Cơ hội thụ thai Cao';
        statusValue = 'Cao';
        circleColors = ['#00E5FF', '#00B8D4']; // Teal
      } else {
        const ovulDate = new Date(prediction.ovulationDate);
        const diffToOvul = Math.round((ovulDate.getTime() - todayTime) / (1000*60*60*24));
        statusTitle = 'Rụng trứng sau';
        statusValue = `${diffToOvul} ngày`;
        statusSub = isFertile ? 'Cơ hội thụ thai: Cao' : 'Cơ hội thụ thai: Thấp (i)';
        circleColors = isFertile ? ['#4DD0E1', '#00BCD4'] : ['#FFCDD2', '#F48FB1']; // Teal cho Dễ thụ thai, Hồng nhạt cho Thấp
      }
    } else {
      // Giai đoạn hoàng thể (Sau rụng trứng)
      const nextStart = new Date(prediction.predictedStartDate).getTime();
      if (todayTime > nextStart) {
        // Trễ kinh
        const delayDays = Math.round((todayTime - nextStart) / (1000*60*60*24));
        statusTitle = 'Trễ kinh';
        statusSub = 'ngày';
        statusValue = delayDays.toString();
        circleColors = ['#FFB74D', '#F57C00']; // Orange
      } else {
        // Bình thường - Sắp tới kỳ
        const daysToNext = Math.round((nextStart - todayTime) / (1000*60*60*24));
        statusTitle = 'Kỳ kinh dự kiến sau';
        statusSub = 'ngày';
        statusValue = daysToNext.toString();
        circleColors = ['#E1BEE7', '#CE93D8']; // Purple nhạt
      }
    }
  }

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const uri = result.assets[0].uri;
        const uploadedUrl = await uploadAvatarToR2(uri, profile?.uid || 'guest');
        if (uploadedUrl) {
          updateAvatarUrl(uploadedUrl);
        } else {
          Alert.alert("Lỗi", "Không thể upload ảnh lên Cloudflare R2 lúc này.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        
        {/* Top App Bar */}
        <View style={styles.topAppBar}>
          <Pressable style={styles.profileBtn} onPress={handlePickAvatar} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarMock}><Text style={{fontSize: 20}}>👱‍♀️</Text></View>
            )}
          </Pressable>
          <Image source={require('../../assets/images/iump_decor.png')} style={styles.appLogo} resizeMode="contain" />
          <Pressable style={styles.notiBtn}>
            <Feather name="bell" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* 1. Week Calendar */}
        <WeekCalendar currentDate={today} periodEvents={periodEvents} prediction={prediction} />

        {/* 2. Hero Circle */}
        <View style={styles.heroSection}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={circleColors}
              style={styles.heroCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.heroTitle, isPredicting && { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }]}>{statusTitle}</Text>
              {statusValue !== '' && !isPredicting && (
                <View style={styles.heroValueContainer}>
                  <Text style={[styles.heroValue, statusValue === 'Cao' && { fontSize: 50, marginBottom: 10 }]}>{statusValue}</Text>
                  {statusSub !== '' && <Text style={styles.heroSub}>{statusSub}</Text>}
                </View>
              )}
            </LinearGradient>
          </Animated.View>
          
          <Pressable style={styles.editPeriodBtn} onPress={() => router.push('/calendar')}>
            <Text style={styles.editPeriodText}>Sửa kỳ kinh</Text>
          </Pressable>
        </View>

        {/* 3. Daily Insights (Horizontal Scroll) */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Thông tin hàng ngày • Hôm nay</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
            {/* Sửa chu kỳ */}
            <Pressable style={[styles.insightCard, { backgroundColor: '#FFF0F3', borderColor: '#FFE4E8' }]} onPress={() => router.push('/calendar')}>
              <Text style={styles.insightTitle}>Thay đổi{'\n'}chu kỳ</Text>
              <View style={[styles.addIcon, { backgroundColor: '#FF4B72' }]}>
                <Feather name="edit-2" size={18} color="white" />
              </View>
            </Pressable>

            {/* AI Dự báo */}
            {prediction?.notes && prediction.notes.length > 0 && (
              <Pressable style={[styles.insightCard, { backgroundColor: '#F3E5F5', borderColor: '#E1BEE7', minWidth: 160 }]} onPress={() => router.push('/chat')}>
                <Text style={[styles.insightTitle, { color: '#6A1B9A' }]}>AI dự báo{'\n'}hôm nay</Text>
                <MaterialCommunityIcons name="robot-outline" size={32} color="#9C27B0" style={{ alignSelf: 'center', marginTop: 10 }} />
                <Text style={{ fontSize: 11, color: '#6A1B9A', marginTop: 8, textAlign: 'center', opacity: 0.8 }} numberOfLines={3}>
                  {prediction.notes[0]}
                </Text>
              </Pressable>
            )}

            {/* Cycle Day */}
            {latestEvent && (
              <View style={[styles.insightCard, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' }]}>
                <Text style={[styles.insightTitle, { color: '#1565C0' }]}>Ngày của{'\n'}chu kỳ</Text>
                <Text style={{ fontSize: 40, fontWeight: '800', color: '#1976D2', textAlign: 'center', marginTop: 10 }}>
                  {Math.round((todayTime - new Date(latestEvent.startDate).getTime()) / (1000*60*60*24)) + 1}
                </Text>
              </View>
            )}
            
            {/* AI Mode Toggle */}
            <View style={[styles.insightCard, { backgroundColor: '#FFF8E1', borderColor: '#FFECB3' }]}>
              <Text style={[styles.insightTitle, { color: '#F57F17' }]}>Chế độ AI{'\n'}(Thông minh)</Text>
              <View style={{ alignItems: 'center', marginTop: 15 }}>
                <Switch
                  value={isAiModeEnabled}
                  onValueChange={(val) => {
                    if (val) Alert.alert("Bật AI Mode", "Đã bật chế độ phân tích nâng cao của AI");
                    toggleAiMode(val);
                  }}
                  trackColor={{ false: '#d1d1d1', true: '#FFCA28' }}
                  thumbColor={isAiModeEnabled ? '#FF8F00' : '#f4f3f4'}
                />
              </View>
            </View>

          </ScrollView>
        </View>

      </ScrollView>

      {/* Floating Action Button (Dấu cộng bay) */}
      <Pressable style={styles.fab} onPress={() => router.push('/log')}>
        <Ionicons name="add" size={30} color="white" />
      </Pressable>

      {/* 4. Bottom Tab Bar */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  topAppBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 45 : 30, paddingBottom: 5 },
  profileBtn: { padding: 4, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  avatarMock: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F3F1', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 36, height: 36, borderRadius: 18 },
  appLogo: { 
    height: 32, 
    width: 100, 
    shadowColor: '#FF4B72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  notiBtn: { padding: 4 },

  weekCalendarContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  monthHeader: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 15 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  dayCol: { alignItems: 'center', width: 40 },
  dayName: { fontSize: 12, color: colors.textMuted, marginBottom: 8, fontWeight: '500' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayCircleToday: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.background },
  dayDate: { fontSize: 16, color: colors.text, fontWeight: '500' },

  heroSection: { alignItems: 'center', paddingVertical: 25 },
  heroCircle: { 
    width: 280, height: 280, borderRadius: 140, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10
  },
  heroTitle: { color: 'white', fontSize: 18, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 },
  heroValueContainer: { alignItems: 'center', marginTop: 10 },
  heroValue: { color: 'white', fontSize: 72, fontWeight: '800', lineHeight: 80, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
  heroSub: { color: 'white', fontSize: 18, fontWeight: '600', marginTop: -5, opacity: 0.9 },
  
  editPeriodBtn: { 
    marginTop: -20, backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, 
    borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, zIndex: 10 
  },
  editPeriodText: { color: colors.primary, fontWeight: '700', fontSize: 16 },

  insightsSection: { marginTop: 10, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: 20, marginBottom: 15 },
  insightCard: { 
    width: 140, minHeight: 160, borderRadius: 20, padding: 15, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  insightTitle: { fontSize: 16, fontWeight: '700', color: colors.text, lineHeight: 22 },
  addIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 'auto' },

  fab: { 
    position: 'absolute', bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, 
    backgroundColor: '#00B8D4', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00B8D4', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, zIndex: 50
  },

  bottomNavContainer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    height: 85, backgroundColor: 'white', 
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', 
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1, borderTopColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 15
  },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 65 },
  navText: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '600' }
});
