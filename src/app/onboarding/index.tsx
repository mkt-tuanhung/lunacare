import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../store/useProfileStore';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const setProfile = useProfileStore((state) => state.setProfile);

  const completeOnboarding = () => {
    setProfile({
      id: 'profile-1',
      userId: 'user-1',
      displayName: 'Luna',
      cycleGoal: 'cycle_tracking',
      averageCycleLength: 28,
      averagePeriodLength: 5,
      privacyModeEnabled: true,
      isOnboarded: true,
    });
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.logoIcon}>🌙</Text>
        </View>
        <Text style={styles.header}>LunaCare</Text>
        <Text style={styles.subtitle}>Chăm sóc chu kỳ thông minh</Text>
        <Text style={styles.text}>Theo dõi sức khỏe, tâm trạng và gắn kết tình cảm với người thương một cách tinh tế nhất.</Text>
      </View>
      
      <Pressable style={({pressed}) => [styles.button, pressed && styles.buttonPressed]} onPress={completeOnboarding}>
        <Text style={styles.buttonText}>Bắt đầu hành trình</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 30, justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryLight + '40', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoIcon: { fontSize: 50 },
  header: { fontSize: 36, fontWeight: '800', marginBottom: 8, color: colors.primary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 18, fontWeight: '600', color: colors.secondary, marginBottom: 20 },
  text: { fontSize: 16, textAlign: 'center', color: colors.textMuted, lineHeight: 24, paddingHorizontal: 20 },
  button: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', boxShadow: '0px 8px 12px rgba(255, 107, 139, 0.3)', marginBottom: 20 },
  buttonPressed: { transform: [{ scale: 0.98 }], boxShadow: '0px 2px 4px rgba(255, 107, 139, 0.1)' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 }
});
