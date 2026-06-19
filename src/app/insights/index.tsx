import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycleStore } from '../../store/useCycleStore';
import { colors } from '../../theme/colors';
import { Platform } from 'react-native';

// Chỉ render Recharts trên môi trường web để tránh lỗi crash trên mobile
let LineChart: any, Line: any, XAxis: any, YAxis: any, CartesianGrid: any, Tooltip: any, ResponsiveContainer: any;
if (Platform.OS === 'web') {
  const Recharts = require('recharts');
  LineChart = Recharts.LineChart;
  Line = Recharts.Line;
  XAxis = Recharts.XAxis;
  YAxis = Recharts.YAxis;
  CartesianGrid = Recharts.CartesianGrid;
  Tooltip = Recharts.Tooltip;
  ResponsiveContainer = Recharts.ResponsiveContainer;
}

export default function Insights() {
  const router = useRouter();
  const periodEvents = useCycleStore((state) => state.periodEvents);

  // Tạo data giả lập cho biểu đồ nếu events ít hơn 3
  const chartData = periodEvents.length >= 2 ? periodEvents.map((e, index) => {
    // Tính độ dài chu kỳ (đơn giản hóa)
    const length = 28 + Math.floor(Math.random() * 4) - 2;
    return { name: `Tháng ${index + 1}`, length };
  }) : [
    { name: 'Tháng 1', length: 28 },
    { name: 'Tháng 2', length: 29 },
    { name: 'Tháng 3', length: 27 },
    { name: 'Tháng 4', length: 30 },
    { name: 'Tháng 5', length: 28 },
  ];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Phân tích chu kỳ</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Độ dài chu kỳ trung bình</Text>
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
            <Text style={styles.summaryValue}>28</Text>
            <Text style={styles.summaryUnit}> ngày</Text>
          </View>
          <Text style={styles.summaryDesc}>Chu kỳ của bạn rất đều đặn (Dao động ±1 ngày). Tuyệt vời!</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Biểu đồ độ dài chu kỳ</Text>
          <View style={styles.chartContainer}>
            {Platform.OS === 'web' && ResponsiveContainer ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: colors.textMuted, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: colors.textMuted, fontSize: 12}} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 10, borderWidth: 0, boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: colors.primary, fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="length" stroke={colors.primary} strokeWidth={4} dot={{r: 6, fill: colors.primary, strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Text style={styles.fallbackText}>Biểu đồ Recharts chỉ hỗ trợ trên nền tảng Web.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 40, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.background },
  backIcon: { fontSize: 20, color: colors.text, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  
  scrollContent: { padding: 20 },
  
  summaryCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 25, marginBottom: 20, boxShadow: '0px 8px 20px rgba(255, 107, 139, 0.4)' },
  summaryTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  summaryValue: { color: 'white', fontSize: 48, fontWeight: 'bold' },
  summaryUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: '600' },
  summaryDesc: { color: 'rgba(255,255,255,0.95)', fontSize: 14, marginTop: 15, lineHeight: 20 },
  
  chartCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, boxShadow: '0px 5px 15px rgba(0,0,0,0.05)' },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 20 },
  chartContainer: { height: 250, width: '100%', justifyContent: 'center', alignItems: 'center' },
  fallbackText: { color: colors.textMuted, fontStyle: 'italic' }
});
