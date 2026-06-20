import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Clipboard } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlertStore } from '../../store/useAlertStore';

const tones = [
  { id: 'sweet', label: 'Ngọt ngào', icon: 'heart' },
  { id: 'funny', label: 'Hài hước', icon: 'smile' },
  { id: 'scared', label: 'Sợ vợ', icon: 'alert-circle' },
  { id: 'mature', label: 'Trưởng thành', icon: 'briefcase' }
];

export default function LoveScript() {
  const [selectedTone, setSelectedTone] = useState('sweet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const generateScript = () => {
    setIsGenerating(true);
    setGeneratedScript(null);

    // Giả lập gọi API Gemini để sinh văn bản
    setTimeout(() => {
      setIsGenerating(false);
      if (selectedTone === 'sweet') {
        setGeneratedScript('Vợ yêu à, anh thấy mấy hôm nay em dễ mệt. Tối nay em muốn ăn gì nhẹ nhẹ không, anh đặt cho nhé. Nghỉ ngơi đi, việc nhà cứ để anh lo nha ❤️');
      } else if (selectedTone === 'funny') {
        setGeneratedScript('Nóc nhà của anh ơi! Nghe đồn hôm nay bão đổ bộ vào khu vực bụng dưới của em. Để anh xung phong làm bao cát cho em xả giận nhé! Trà sữa trân châu đường đen 100% đá 200% đường đang trên đường tới!');
      } else if (selectedTone === 'scared') {
        setGeneratedScript('Dạ... thưa sếp... em biết hôm nay sếp mệt. Sếp cứ nằm nghỉ ngơi xem phim ạ. Quần áo em phơi rồi, bát em rửa rồi. Sếp cần chườm nóng hay uống nước ấm thì cứ hú em một tiếng, em có mặt ngay lập tức ạ 🥺');
      } else {
        setGeneratedScript('Anh biết những ngày này rất khó chịu. Em đừng cố quá, cứ thoải mái nghỉ ngơi. Anh đã thu xếp xong việc nhà rồi. Em cần gì thì bảo anh nhé.');
      }
    }, 1500);
  };

  const copyToClipboard = () => {
    if (generatedScript) {
      Clipboard.setString(generatedScript);
      useAlertStore.getState().showAlert('Đã copy', 'Bạn có thể dán tin nhắn này vào Zalo/Messenger gửi cho vợ nhé!');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="robot-outline" size={24} color="#8B5CF6" />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.title}>AI Love Script</Text>
          <Text style={styles.subtitle}>Để AI gợi ý tin nhắn tinh tế gửi Vợ</Text>
        </View>
      </View>

      <Text style={styles.label}>Chọn phong cách (Tone):</Text>
      <View style={styles.toneGrid}>
        {tones.map(tone => (
          <Pressable 
            key={tone.id} 
            style={[styles.toneBtn, selectedTone === tone.id && styles.toneBtnActive]}
            onPress={() => setSelectedTone(tone.id)}
          >
            <Feather 
              name={tone.icon as any} 
              size={16} 
              color={selectedTone === tone.id ? 'white' : '#64748B'} 
              style={{marginRight: 6}}
            />
            <Text style={[styles.toneText, selectedTone === tone.id && styles.toneTextActive]}>{tone.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.generateBtn} onPress={generateScript} disabled={isGenerating}>
        {isGenerating ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Feather name="zap" size={18} color="white" style={{marginRight: 8}} />
            <Text style={styles.generateText}>Nhờ AI viết tin nhắn</Text>
          </>
        )}
      </Pressable>

      {generatedScript && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{generatedScript}</Text>
          <Pressable style={styles.copyBtn} onPress={copyToClipboard}>
            <Feather name="copy" size={16} color="#8B5CF6" style={{marginRight: 6}} />
            <Text style={styles.copyText}>Copy tin nhắn</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 10 },
  
  toneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  toneBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  toneBtnActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  toneText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  toneTextActive: { color: 'white' },
  
  generateBtn: { flexDirection: 'row', backgroundColor: '#8B5CF6', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  generateText: { color: 'white', fontSize: 16, fontWeight: '600' },
  
  resultBox: { marginTop: 20, backgroundColor: '#F5F3FF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#DDD6FE' },
  resultText: { fontSize: 15, color: '#4C1D95', lineHeight: 24, fontStyle: 'italic', marginBottom: 15 },
  
  copyBtn: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', backgroundColor: '#EDE9FE', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  copyText: { color: '#8B5CF6', fontSize: 14, fontWeight: '600' }
});
