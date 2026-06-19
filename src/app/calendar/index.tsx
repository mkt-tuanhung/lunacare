import { View, Text, StyleSheet } from 'react-native';

export default function Calendar() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>
      <Text>Hiển thị lịch và các ngày dự kiến...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fdfbfb' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ff6b81' },
});
