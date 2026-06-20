import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RoleSelection() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../../../assets/images/icon.png')} 
          style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 20 }} 
          resizeMode="cover"
        />
        <Text style={styles.title}>For Embeiu</Text>
        <Text style={styles.subtitle}>Hãy chọn vai trò của bạn để bắt đầu</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Nút Người Vợ */}
        <Pressable 
          style={[styles.card, { backgroundColor: colors.primaryLight + '20', borderColor: colors.primary }]}
          onPress={() => router.push('/auth/login')}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="female" size={30} color="white" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, { color: colors.primaryDark }]}>Tôi là Vợ</Text>
            <Text style={styles.cardDesc}>Tạo tài khoản & theo dõi sức khỏe của bản thân</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.primary} />
        </Pressable>

        {/* Nút Người Chồng */}
        <Pressable 
          style={[styles.card, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}
          onPress={() => router.push('/auth/scan-qr')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#2196F3' }]}>
            <FontAwesome5 name="male" size={30} color="white" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, { color: '#0D47A1' }]}>Tôi là Chồng</Text>
            <Text style={styles.cardDesc}>Quét mã QR để kết nối & chăm sóc vợ yêu</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#2196F3" />
        </Pressable>
      </View>
      
      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center' },
  
  cardContainer: { gap: 20, marginTop: 40 },
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    boxShadow: '0px 8px 16px rgba(0,0,0,0.05)',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 5 },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18, paddingRight: 10 },
});
