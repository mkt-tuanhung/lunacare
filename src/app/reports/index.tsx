import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useProfileStore } from '../../store/useProfileStore';
import { useCycleStore } from '../../store/useCycleStore';
import { supabase } from '../../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAlertStore } from '../../store/useAlertStore';

export default function ReportsScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { prediction } = useCycleStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      if (!profile?.uid) return;
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.uid)
        .order('log_date', { ascending: false })
        .limit(90); // 3 tháng gần nhất
        
      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [profile?.uid]);

  // Medical Intelligence: Tính toán logic y tế
  const logsWithSymptoms = logs.filter(l => l.symptoms && l.symptoms.length > 0);
  const logsWithPain = logs.filter(l => typeof l.pain_score === 'number' && l.pain_score > 0);
  
  const severePainLogs = logsWithPain.filter(l => l.pain_score >= 8);
  const hasEndometriosisWarning = severePainLogs.length >= 3; 
  
  const hasPcosWarning = prediction && prediction.predictedCycleLength && prediction.predictedCycleLength > 45;

  const handleExportPDF = async () => {
    if (!profile) return;
    setGenerating(true);
    
    try {
      const todayDate = new Date().toLocaleDateString('vi-VN');
      
      let logsHtml = '';
      logs.slice(0, 15).forEach(log => {
        logsHtml += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(log.log_date).toLocaleDateString('vi-VN')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${log.is_period_day ? 'Có' : 'Không'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${log.pain_score || 0}/10</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${(log.symptoms || []).join(', ')}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
              h1 { color: #FF4B72; text-align: center; font-size: 28px; border-bottom: 2px solid #FF4B72; padding-bottom: 10px; }
              h2 { color: #2C3E50; font-size: 20px; margin-top: 30px; }
              .header-info { display: flex; justify-content: space-between; margin-top: 20px; background: #FFF0F3; padding: 15px; border-radius: 8px; }
              .info-item { margin-bottom: 5px; }
              .warning-box { background: #FFEBEE; border-left: 4px solid #F44336; padding: 15px; margin-top: 20px; }
              .warning-title { color: #F44336; font-weight: bold; margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
              th { text-align: left; background-color: #f2f2f2; padding: 10px 8px; border-bottom: 2px solid #ddd; }
              .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Báo Cáo Sức Khoẻ Chu Kỳ (LunaCare)</h1>
            
            <div class="header-info">
              <div>
                <div class="info-item"><strong>Họ và tên:</strong> ${profile.displayName || 'Khách'}</div>
                <div class="info-item"><strong>Tuổi / Chiều cao / Cân nặng:</strong> ${profile.healthProfile?.cycleLength || '?'} ngày chu kỳ / Thay đổi cân nặng: ${profile.healthProfile?.weightChange || 'Không rõ'}</div>
              </div>
              <div>
                <div class="info-item"><strong>Ngày xuất báo cáo:</strong> ${todayDate}</div>
                <div class="info-item"><strong>Chu kỳ trung bình:</strong> ${prediction?.predictedCycleLength || '?'} ngày</div>
              </div>
            </div>

            ${(hasEndometriosisWarning || hasPcosWarning) ? `
            <div class="warning-box">
              <div class="warning-title">⚠️ Đề xuất Thăm khám Bác sĩ</div>
              <ul style="margin: 0; padding-left: 20px;">
                ${hasEndometriosisWarning ? '<li>Bạn có nhiều ngày ghi nhận mức độ đau bụng rất cao (>= 8/10). Hãy trao đổi với bác sĩ để tầm soát <b>Lạc nội mạc tử cung</b>.</li>' : ''}
                ${hasPcosWarning ? '<li>Chu kỳ của bạn kéo dài bất thường (> 45 ngày). Hãy trao đổi với bác sĩ để tầm soát <b>Hội chứng buồng trứng đa nang (PCOS)</b>.</li>' : ''}
              </ul>
            </div>
            ` : ''}

            <h2>Ghi chú Gần đây (15 ngày có dữ liệu gần nhất)</h2>
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Hành kinh</th>
                  <th>Mức độ đau</th>
                  <th>Triệu chứng</th>
                </tr>
              </thead>
              <tbody>
                ${logsHtml || '<tr><td colspan="4" style="text-align:center; padding: 10px;">Chưa có dữ liệu</td></tr>'}
              </tbody>
            </table>

            <div class="footer">
              Báo cáo được xuất tự động từ ứng dụng LunaCare.<br/>
              <i>Lưu ý: LunaCare không chẩn đoán bệnh, báo cáo này chỉ dùng để cung cấp dữ liệu tham khảo cho Bác sĩ.</i>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Chia sẻ Báo Cáo Y Tế LunaCare',
          UTI: 'com.adobe.pdf'
        });
      } else {
        useAlertStore.getState().showAlert('Lỗi', 'Thiết bị của bạn không hỗ trợ chia sẻ file PDF.');
      }
    } catch (err) {
      console.error(err);
      useAlertStore.getState().showAlert('Lỗi', 'Không thể tạo file PDF lúc này.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Báo cáo Y Tế</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Tổng hợp thông tin sức khỏe chu kỳ của bạn trong 3 tháng qua để gửi cho Bác sĩ.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.prepCard}>
              <View style={styles.prepHeader}>
                <MaterialCommunityIcons name="doctor" size={28} color="#FF9800" />
                <Text style={styles.prepTitle}>Doctor Visit Prep</Text>
              </View>
              
              <Text style={styles.prepDesc}>Dựa vào dữ liệu của bạn, dưới đây là những câu hỏi bạn nên tham khảo ý kiến bác sĩ:</Text>
              
              <View style={styles.questionBox}>
                <Text style={styles.questionText}>• Chu kỳ của tôi trung bình {prediction?.predictedCycleLength || 28} ngày, như vậy có được xem là bình thường không?</Text>
                
                {hasEndometriosisWarning && (
                  <Text style={[styles.questionText, { color: '#D32F2F', fontWeight: 'bold' }]}>
                    • Tôi thường bị đau bụng dữ dội trong kỳ kinh. Liệu có nguy cơ Lạc nội mạc tử cung không?
                  </Text>
                )}
                
                {hasPcosWarning && (
                  <Text style={[styles.questionText, { color: '#D32F2F', fontWeight: 'bold' }]}>
                    • Gần đây chu kỳ của tôi rất thưa ({'>'}45 ngày). Tôi có cần siêu âm buồng trứng đa nang (PCOS) không?
                  </Text>
                )}
                
                <Text style={styles.questionText}>• Tôi nên bổ sung vitamin hay thực phẩm gì để giảm bớt mệt mỏi trong những ngày này?</Text>
              </View>
            </View>

            <Pressable 
              style={[styles.exportBtn, generating && { opacity: 0.7 }]} 
              onPress={handleExportPDF}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="file-text" size={20} color="white" />
                  <Text style={styles.exportBtnText}>Tạo & Xuất file PDF</Text>
                </>
              )}
            </Pressable>
            <Text style={styles.noteText}>
              Báo cáo bao gồm biểu đồ thống kê mức độ đau, chu kỳ trung bình và log ghi chú triệu chứng chi tiết.
            </Text>
          </>
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
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 25, lineHeight: 22 },
  
  prepCard: { backgroundColor: '#FFF8E1', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#FFECB3' },
  prepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  prepTitle: { fontSize: 18, fontWeight: '700', color: '#FF9800', marginLeft: 10 },
  prepDesc: { fontSize: 14, color: '#5D4037', marginBottom: 15, lineHeight: 20 },
  
  questionBox: { backgroundColor: 'white', padding: 15, borderRadius: 12 },
  questionText: { fontSize: 14, color: colors.text, marginBottom: 10, lineHeight: 22 },
  
  exportBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, boxShadow: '0px 8px 20px rgba(255, 141, 161, 0.35)' },
  exportBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  noteText: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 15, paddingHorizontal: 20, lineHeight: 18 }
});
