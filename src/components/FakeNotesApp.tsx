import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

export default function FakeNotesApp() {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Họp với sếp', date: '10/06/2026', content: 'Chuẩn bị slide báo cáo quý 2.' },
    { id: 2, title: 'Siêu thị', date: '09/06/2026', content: 'Mua sữa, trứng, rau bắp cải.' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ghi chú</Text>
        <Feather name="search" size={24} color="#333" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notes.map(note => (
          <View key={note.id} style={styles.noteCard}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteDate}>{note.date}</Text>
            <Text style={styles.noteContent}>{note.content}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => alert('Chức năng đang bảo trì')}>
        <Feather name="plus" size={30} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  content: { padding: 20 },
  noteCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: {width: 0, height: 2}, elevation: 2 },
  noteTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  noteDate: { fontSize: 12, color: '#999', marginBottom: 10 },
  noteContent: { fontSize: 14, color: '#666', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFCA28', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: {width: 0, height: 2}, elevation: 5 },
});
