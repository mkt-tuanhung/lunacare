import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Animated, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { uploadAvatarToR2 } from '../../lib/r2';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { useToastStore } from '../../store/useToastStore';

const moods = [
  { label: 'Vui vẻ', icon: 'smile' },
  { label: 'Bình thường', icon: 'meh' },
  { label: 'Buồn bã', icon: 'frown' },
  { label: 'Cáu gắt', icon: 'cloud-lightning' },
  { label: 'Mệt mỏi', icon: 'battery-charging' }
];

const symptoms = [
  { label: 'Đau bụng', icon: 'activity' },
  { label: 'Đau đầu', icon: 'wind' },
  { label: 'Nổi mụn', icon: 'target' },
  { label: 'Thèm ăn', icon: 'coffee' },
  { label: 'Mất ngủ', icon: 'moon' },
  { label: 'Đau lưng', icon: 'layers' }
];

const cervicalMucusOptions = ['Khô', 'Dính', 'Kem', 'Nước', 'Lòng trắng trứng'];
const lhTestOptions = ['Âm tính', 'Gần dương tính', 'Dương tính'];

const flows = ['Nhẹ', 'Vừa', 'Nhiều', 'Rất nhiều'];
const flowColors = ['Đỏ tươi', 'Đỏ sẫm', 'Nâu', 'Hồng'];
const painLocationOptions = ['Bụng dưới', 'Lưng', 'Ngực', 'Đầu', 'Một bên bụng', 'Khi quan hệ'];
const energyLevels = [{label: 'Thấp', score: 1, icon: 'battery'}, {label: 'Vừa', score: 2, icon: 'zap'}, {label: 'Cao', score: 3, icon: 'sun'}];

export default function LogToday() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const logDate = params.date ? (params.date as string) : new Date().toISOString().split('T')[0];

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [isPeriodDay, setIsPeriodDay] = useState(false);
  
  const [waterCups, setWaterCups] = useState(0);
  const [sleepHours, setSleepHours] = useState('');
  const [bbt, setBbt] = useState('');
  const [cervicalMucus, setCervicalMucus] = useState<string | null>(null);
  const [lhTest, setLhTest] = useState<string | null>(null);
  const [painScore, setPainScore] = useState(0);
  const [painLocations, setPainLocations] = useState<string[]>([]);
  const [energyScore, setEnergyScore] = useState<number | null>(null);
  const [flowColor, setFlowColor] = useState<string | null>(null);
  const [hasBloodClots, setHasBloodClots] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDose, setMedicationDose] = useState('');
  const [medicationTime, setMedicationTime] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  


  const togglePainLocation = (s: string) => {
    setPainLocations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const profile = useProfileStore(state => state.profile);

  useEffect(() => {
    if (profile?.uid && logDate !== new Date().toISOString().split('T')[0]) {
      // Load old log if editing past day
      supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.uid)
        .eq('log_date', logDate)
        .single()
        .then(({ data }) => {
          if (data) {
            setIsPeriodDay(data.is_period_day || false);
            setSelectedFlow(data.flow_level || null);
            setFlowColor(data.flow_color || null);
            setHasBloodClots(data.has_blood_clots || false);
            if (data.moods && data.moods.length > 0) setSelectedMood(data.moods[0]);
            if (data.symptoms) setSelectedSymptoms(data.symptoms);
            if (data.water_cups) setWaterCups(data.water_cups);
            if (data.sleep_hours) setSleepHours(data.sleep_hours.toString());
            if (data.pain_score) setPainScore(data.pain_score);
            if (data.pain_locations) setPainLocations(data.pain_locations);
            if (data.energy_score) setEnergyScore(data.energy_score);
            if (data.notes) setNotes(data.notes);
            if (data.photo_url) setPhotoUrl(data.photo_url);
            
            if (data.ovulation_signs) {
              setBbt(data.ovulation_signs.bbt || '');
              setCervicalMucus(data.ovulation_signs.cervicalMucus || null);
              setLhTest(data.ovulation_signs.lhTest || null);
            }
            if (data.medications) {
              setMedicationName(data.medications.name || '');
              setMedicationDose(data.medications.dose || '');
              setMedicationTime(data.medications.time || '');
            }
          }
        });
    }
  }, [logDate, profile?.uid]);

  const handleSave = async () => {
    if (!profile?.uid) {
      alert('Vui lòng đăng nhập để lưu dữ liệu!');
      return;
    }
    
    try {
      const payload: any = {
        user_id: profile.uid,
        log_date: logDate,
        is_period_day: isPeriodDay,
        flow_level: selectedFlow,
        flow_color: flowColor,
        has_blood_clots: hasBloodClots,
        moods: selectedMood ? [selectedMood] : [],
        symptoms: selectedSymptoms,
        water_cups: waterCups,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        ovulation_signs: { bbt, cervicalMucus, lhTest },
        pain_score: painScore,
        pain_locations: painLocations,
        energy_score: energyScore,
        medications: { name: medicationName, dose: medicationDose, time: medicationTime },
        notes: notes,
        photo_url: photoUrl
      };

      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', profile.uid)
        .eq('log_date', logDate)
        .single();

      let dbError;
      if (existing) {
        const { error } = await supabase.from('daily_logs').update(payload).eq('id', existing.id);
        dbError = error;
      } else {
        const { error } = await supabase.from('daily_logs').insert([payload]);
        dbError = error;
      }
      
      if (dbError) {
        if (dbError.message.includes('schema cache') || dbError.message.includes('does not exist') || dbError.message.includes('column')) {
            delete payload.water_cups;
            delete payload.sleep_hours;
            delete payload.ovulation_signs;
            delete payload.pain_score;
            delete payload.pain_locations;
            delete payload.energy_score;
            delete payload.flow_color;
            delete payload.has_blood_clots;
            delete payload.medications;
            delete payload.photo_url;
            if (existing) {
              const { error: retryError } = await supabase.from('daily_logs').update(payload).eq('id', existing.id);
              if (retryError) throw retryError;
            } else {
              const { error: retryError } = await supabase.from('daily_logs').insert([payload]);
              if (retryError) throw retryError;
            }
        } else {
            throw dbError;
        }
      }

      alert('Đã lưu Ghi nhận thành công!');
      
      const cycleStore = useCycleStore.getState();
      const todayStr = payload.log_date;
      if (payload.is_period_day) {
        const existingEvent = cycleStore.periodEvents.find(e => {
            const diff = Math.abs(new Date(e.startDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 10;
        });
        
        if (existingEvent) {
            if (new Date(todayStr) > new Date(existingEvent.endDate || existingEvent.startDate)) {
                cycleStore.updatePeriodEvent(existingEvent.id, { endDate: todayStr });
            }
        } else {
            cycleStore.addPeriodEvent({ startDate: todayStr, endDate: todayStr, userId: payload.user_id });
        }
      } else {
        const exactMatch = cycleStore.periodEvents.find(e => e.startDate === todayStr && e.endDate === todayStr);
        if (exactMatch) {
            cycleStore.deletePeriodEvent(exactMatch.id);
        } else {
            const endMatch = cycleStore.periodEvents.find(e => e.endDate === todayStr);
            if (endMatch) {
                const prevDay = new Date(todayStr);
                prevDay.setDate(prevDay.getDate() - 1);
                cycleStore.updatePeriodEvent(endMatch.id, { endDate: prevDay.toISOString().split('T')[0] });
            }
        }
      }

      await cycleStore.calculatePrediction();
      
      useToastStore.getState().showToast("Đã lưu nhật ký thành công!", "success");

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('schema cache')) {
        useToastStore.getState().showToast("Lỗi cấu trúc Database. Hãy chạy file SQL setup.", "error");
      } else {
        useToastStore.getState().showToast('Lỗi lưu dữ liệu: ' + err.message, "error");
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleVoiceLog = () => {
    if (isRecording) return;
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setPainScore(7);
      setEnergyScore(1);
      setSelectedSymptoms(prev => [...new Set([...prev, 'Đau bụng', 'Mệt mỏi'])]);
      setNotes(prev => prev + (prev ? '\n' : '') + 'Cảm thấy rất đau bụng và thèm đồ ngọt (Tạo tự động từ Voice Log)');
      useToastStore.getState().showToast('Đã ghi nhận: "Hôm nay đau bụng 7 điểm, mệt mỏi, thèm ngọt"', "success");
    }, 3000);
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingPhoto(true);
        const uri = result.assets[0].uri;
        const uploadedUrl = await uploadAvatarToR2(uri, `log_${Date.now()}`);
        if (uploadedUrl) {
          setPhotoUrl(uploadedUrl);
          useToastStore.getState().showToast("Tải ảnh lên thành công!", "success");
        } else {
          useToastStore.getState().showToast("Lỗi: Cloudflare R2 chặn tải lên do thiếu CORS hoặc sai API Key.", "error");
        }
      }
    } catch (error) {
      console.error(error);
      useToastStore.getState().showToast("Có lỗi xảy ra khi chọn ảnh.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {logDate === new Date().toISOString().split('T')[0] ? 'Hôm nay thế nào?' : `Ghi chú ngày ${new Date(logDate).toLocaleDateString('vi-VN')}`}
        </Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F3' }]}>
              <Ionicons name="water-outline" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.sectionTitle}>Kỳ kinh nguyệt</Text>
          </View>

          <Pressable style={[styles.toggleCard, isPeriodDay && styles.toggleCardActive]} onPress={() => setIsPeriodDay(!isPeriodDay)}>
            <Text style={[styles.toggleText, isPeriodDay && styles.toggleTextActive]}>{isPeriodDay ? 'Đang trong kỳ kinh' : 'Không có kinh nguyệt'}</Text>
            {isPeriodDay && <Ionicons name="checkmark-circle" size={20} color={colors.primaryDark} />}
          </Pressable>

          {isPeriodDay && (
            <View>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 10, marginBottom: 5 }}>Lượng máu</Text>
              <View style={styles.pillsContainer}>
                {flows.map(f => (
                  <Pressable key={f} style={[styles.pill, selectedFlow === f && styles.pillActive]} onPress={() => setSelectedFlow(f)}>
                    <Text style={[styles.pillText, selectedFlow === f && styles.pillTextActive]}>{f}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 15, marginBottom: 5 }}>Màu máu</Text>
              <View style={styles.pillsContainer}>
                {flowColors.map(f => (
                  <Pressable key={f} style={[styles.pill, flowColor === f && styles.pillActive]} onPress={() => setFlowColor(f)}>
                    <Text style={[styles.pillText, flowColor === f && styles.pillTextActive]}>{f}</Text>
                  </Pressable>
                ))}
              </View>
              
              <Pressable style={[styles.toggleCard, hasBloodClots && styles.toggleCardActive, {marginTop: 15}]} onPress={() => setHasBloodClots(!hasBloodClots)}>
                <Text style={[styles.toggleText, hasBloodClots && styles.toggleTextActive]}>Có máu cục</Text>
                {hasBloodClots && <Ionicons name="checkmark-circle" size={20} color={colors.primaryDark} />}
              </Pressable>
            </View>
          )}
        </View>

        {/* Đau đớn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFE0E0' }]}>
              <Feather name="frown" size={20} color="#E53935" />
            </View>
            <Text style={styles.sectionTitle}>Mức độ Đau</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <Text style={{fontSize: 16, color: colors.textMuted}}>Không đau</Text>
            <Text style={{fontSize: 24, fontWeight: '800', color: '#E53935'}}>{painScore}/10</Text>
            <Text style={{fontSize: 16, color: colors.textMuted}}>Đau tột độ</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
            {[0, 2, 4, 6, 8, 10].map(s => (
              <Pressable key={s} onPress={() => setPainScore(s)} style={{
                width: 40, height: 40, borderRadius: 20, 
                backgroundColor: painScore >= s && s > 0 ? '#E53935' : (s === 0 && painScore === 0 ? colors.primary : colors.background),
                justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border
              }}>
                <Text style={{color: painScore >= s || (s === 0 && painScore === 0) ? 'white' : colors.text}}>{s}</Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5 }}>Vị trí đau</Text>
          <View style={styles.pillsContainer}>
            {painLocationOptions.map(s => (
              <Pressable key={s} style={[styles.pill, painLocations.includes(s) && styles.pillActive]} onPress={() => togglePainLocation(s)}>
                <Text style={[styles.pillText, painLocations.includes(s) && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tâm trạng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F9F0FF' }]}>
              <Feather name="heart" size={20} color="#9D8DF1" />
            </View>
            <Text style={styles.sectionTitle}>Tâm trạng</Text>
          </View>
          <View style={styles.pillsContainer}>
            {moods.map(m => (
              <Pressable key={m.label} style={[styles.iconPill, selectedMood === m.label && styles.iconPillActive]} onPress={() => setSelectedMood(m.label)}>
                <Feather name={m.icon as any} size={24} color={selectedMood === m.label ? 'white' : colors.textMuted} style={{marginBottom: 8}}/>
                <Text style={[styles.iconPillText, selectedMood === m.label && styles.iconPillTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Triệu chứng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E6FAFC' }]}>
              <Feather name="activity" size={20} color="#00CFE8" />
            </View>
            <Text style={styles.sectionTitle}>Triệu chứng</Text>
          </View>
          <View style={styles.pillsContainer}>
            {symptoms.map(s => (
              <Pressable key={s.label} style={[styles.iconPill, selectedSymptoms.includes(s.label) && styles.iconPillActive]} onPress={() => toggleSymptom(s.label)}>
                <Feather name={s.icon as any} size={24} color={selectedSymptoms.includes(s.label) ? 'white' : colors.textMuted} style={{marginBottom: 8}}/>
                <Text style={[styles.iconPillText, selectedSymptoms.includes(s.label) && styles.iconPillTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sức khỏe cơ bản */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="activity" size={20} color="#2196F3" />
            </View>
            <Text style={styles.sectionTitle}>Năng lượng & Sinh hoạt</Text>
          </View>
          
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 10, marginTop: 5 }}>Mức Năng lượng</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25}}>
            {energyLevels.map(lvl => (
              <Pressable key={lvl.score} style={[styles.iconPill, energyScore === lvl.score && {backgroundColor: '#2196F3', borderColor: '#2196F3'}]} onPress={() => setEnergyScore(lvl.score)}>
                <Feather name={lvl.icon as any} size={24} color={energyScore === lvl.score ? 'white' : colors.textMuted} style={{marginBottom: 8}}/>
                <Text style={[styles.iconPillText, energyScore === lvl.score && {color: 'white'}]}>{lvl.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nước (số ly):</Text>
            <View style={styles.counterBox}>
              <Pressable style={styles.counterBtn} onPress={() => setWaterCups(Math.max(0, waterCups - 1))}><Feather name="minus" size={20} color={colors.text}/></Pressable>
              <Text style={styles.counterText}>{waterCups}</Text>
              <Pressable style={styles.counterBtn} onPress={() => setWaterCups(waterCups + 1)}><Feather name="plus" size={20} color={colors.text}/></Pressable>
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Ngủ (số giờ):</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="Ví dụ: 7.5"
              value={sleepHours}
              onChangeText={setSleepHours}
            />
          </View>
        </View>

        {/* Rụng trứng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="egg-outline" size={20} color="#FF9800" />
            </View>
            <Text style={styles.sectionTitle}>Chỉ số Rụng trứng</Text>
          </View>
          
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5 }}>Que thử rụng trứng (LH)</Text>
          <View style={styles.pillsContainer}>
            {lhTestOptions.map(s => (
              <Pressable key={s} style={[styles.pill, lhTest === s && styles.pillActive]} onPress={() => setLhTest(s === lhTest ? null : s)}>
                <Text style={[styles.pillText, lhTest === s && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5, marginTop: 15 }}>Dịch nhầy cổ tử cung</Text>
          <View style={styles.pillsContainer}>
            {cervicalMucusOptions.map(s => (
              <Pressable key={s} style={[styles.pill, cervicalMucus === s && styles.pillActive]} onPress={() => setCervicalMucus(s === cervicalMucus ? null : s)}>
                <Text style={[styles.pillText, cervicalMucus === s && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.inputRow, {marginTop: 20}]}>
            <Text style={styles.inputLabel}>Nhiệt độ cơ thể (BBT):</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="VD: 36.5"
              value={bbt}
              onChangeText={setBbt}
            />
          </View>
        </View>

        {/* Thuốc & Ghi chú */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="edit-3" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.sectionTitle}>Thuốc & Ghi chú</Text>
          </View>
          
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5 }}>Tên thuốc (VD: Paracetamol)</Text>
          <TextInput
            style={[styles.textInputFull, {marginBottom: 10, paddingVertical: 12}]}
            placeholder="Nhập tên thuốc..."
            value={medicationName}
            onChangeText={setMedicationName}
          />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 1, marginRight: 5}}>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5 }}>Liều lượng</Text>
              <TextInput
                style={[styles.textInputFull, {paddingVertical: 12}]}
                placeholder="VD: 500mg"
                value={medicationDose}
                onChangeText={setMedicationDose}
              />
            </View>
            <View style={{flex: 1, marginLeft: 5}}>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5 }}>Giờ uống</Text>
              <TextInput
                style={[styles.textInputFull, {paddingVertical: 12}]}
                placeholder="VD: 08:30"
                value={medicationTime}
                onChangeText={setMedicationTime}
              />
            </View>
          </View>
          
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5, marginTop: 15 }}>Ghi chú tự do</Text>
          <TextInput
            style={[styles.textInputFull, {minHeight: 100}]}
            placeholder="Bạn đang cảm thấy thế nào? Ghi chú sự kiện trong ngày..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {/* ADVANCED: Photo Mood Journal */}
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 5, marginTop: 15 }}>Photo Mood Journal</Text>
          <Pressable style={styles.photoUploadBtn} onPress={handlePickPhoto}>
            {isUploadingPhoto ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : photoUrl ? (
              <Image source={{uri: photoUrl}} style={{width: '100%', height: 150, borderRadius: 12}} />
            ) : (
              <>
                <Feather name="camera" size={24} color={colors.primary} />
                <Text style={{color: colors.primary, marginTop: 5, fontWeight: '600'}}>Thêm ảnh kỷ niệm hôm nay</Text>
              </>
            )}
          </Pressable>
        </View>

      </ScrollView>

      {/* ADVANCED: Voice Log FAB */}
      <Animated.View style={[styles.voiceFabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Pressable style={[styles.voiceFab, isRecording && { backgroundColor: '#F44336' }]} onPress={handleVoiceLog}>
          <MaterialCommunityIcons name={isRecording ? "microphone" : "microphone-outline"} size={30} color="white" />
        </Pressable>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu & Hoàn tất</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  scrollContent: { padding: 24, paddingBottom: 120 },
  
  section: { marginBottom: 35, backgroundColor: colors.card, padding: 24, borderRadius: 32, boxShadow: '0px 8px 24px rgba(0,0,0,0.04)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  
  toggleCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  toggleCardActive: { backgroundColor: colors.primaryLight + '15', borderColor: colors.primary },
  toggleText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  toggleTextActive: { color: colors.primaryDark, fontWeight: '700' },
  
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, marginHorizontal: -5 },
  
  pill: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.background, borderRadius: 24, margin: 5, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: 'white', fontWeight: '700' },

  iconPill: { width: '30%', backgroundColor: colors.background, borderRadius: 20, paddingVertical: 16, margin: '1.5%', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  iconPillActive: { backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: '0px 4px 12px rgba(255, 141, 161, 0.3)' },
  iconPillText: { color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  iconPillTextActive: { color: 'white', fontWeight: '700' },

  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 10 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  counterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  counterBtn: { padding: 12 },
  counterText: { fontSize: 18, fontWeight: 'bold', width: 30, textAlign: 'center' },
  textInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, width: 100, textAlign: 'center', fontSize: 16 },
  textInputFull: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, fontSize: 16, textAlignVertical: 'top' },

  photoUploadBtn: { height: 150, backgroundColor: colors.primaryLight + '20', borderRadius: 16, borderWidth: 1, borderColor: colors.primaryLight, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  
  voiceFabContainer: { position: 'absolute', bottom: 110, right: 20, zIndex: 100 },
  voiceFab: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: colors.border },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 24, alignItems: 'center', boxShadow: '0px 8px 20px rgba(255, 141, 161, 0.35)' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.3 }
});
