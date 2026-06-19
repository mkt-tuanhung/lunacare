import { View, Text, StyleSheet } from 'react-native';

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text>Thiết lập bảo mật, xuất/xóa dữ liệu...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fdfbfb' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ff6b81' },
});
