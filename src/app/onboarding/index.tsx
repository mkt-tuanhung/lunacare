import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useProfileStore } from '../../store/useProfileStore';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

export default function Onboarding() {
  const setProfile = useProfileStore((state) => state.setProfile);
  const router = useRouter();

  const handleStart = () => {
    setProfile({ displayName: 'Người dùng', onboardingCompleted: true, healthProfile: null });
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="moon" size={80} color={colors.primary} />
      </View>
      
      <Text style={styles.title}>Chào mừng đến với LunaCare</Text>
      <Text style={styles.subtitle}>Người bạn đồng hành thấu hiểu cơ thể phụ nữ. Hãy cùng nhau bắt đầu hành trình chăm sóc bản thân nhé!</Text>
      
      <View style={{ flex: 1 }} />
      
      <Pressable style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Bắt đầu ngay</Text>
        <Feather name="arrow-right" size={20} color="white" style={{marginLeft: 10}} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 30, alignItems: 'center', paddingTop: 120 },
  iconContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.primaryLight + '40', justifyContent: 'center', alignItems: 'center', marginBottom: 40, boxShadow: '0px 10px 20px rgba(255, 141, 161, 0.2)' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  button: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 24, alignItems: 'center', width: '100%', justifyContent: 'center', boxShadow: '0px 8px 12px rgba(255, 107, 139, 0.3)', marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
