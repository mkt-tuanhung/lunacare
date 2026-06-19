import { View, Text, StyleSheet } from 'react-native';

export default function Reports() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reports</Text>
      <Text>Báo cáo cho bác sĩ...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fdfbfb' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ff6b81' },
});
