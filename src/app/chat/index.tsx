import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { chatWithAI } from '../../lib/ai';
import { useProfileStore } from '../../store/useProfileStore';

export default function ChatAI() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Chào bạn! Mình là Luna AI 🌙\nMình có thể giúp gì cho sức khỏe của bạn hôm nay?', isBot: true },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const profileStore = useProfileStore();

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    
    const textToSent = inputText.trim();
    const newUserMsg = { id: Date.now(), text: textToSent, isBot: false };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Gọi Vercel Backend ChatGPT
      const response = await chatWithAI(textToSent, profileStore.profile?.healthProfile);
      
      const botResponse = { 
        id: Date.now() + 1, 
        text: response.text, 
        isBot: true 
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'Xin lỗi, Luna đang gặp chút sự cố đường truyền. Bạn thử lại nha! 🥺', 
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Luna AI</Text>
          <View style={styles.onlineDot} />
        </View>
        <Pressable style={styles.backButton}>
          <Feather name="more-horizontal" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.chatScroll} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timeStamp}>Hôm nay, 14:00</Text>
        
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageBubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
            {msg.isBot && <View style={styles.botAvatar}><Text style={{fontSize: 16}}>🌙</Text></View>}
            <View style={[styles.messageContent, msg.isBot ? styles.botContent : styles.userContent]}>
              <Text style={[styles.messageText, msg.isBot ? styles.botText : styles.userText]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <View style={styles.botAvatar}><Text style={{fontSize: 16}}>🌙</Text></View>
            <View style={[styles.messageContent, styles.botContent, { paddingVertical: 10, paddingHorizontal: 16 }]}>
              <Text style={[styles.messageText, styles.botText, { fontStyle: 'italic', color: colors.textMuted }]}>
                Luna đang suy nghĩ...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Hỏi Luna về sức khỏe của bạn..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <Pressable onPress={handleSend} style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}>
            <Ionicons name="send" size={18} color="white" style={{marginLeft: 2}} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, height: Platform.OS === 'web' ? '100vh' : '100%', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.card, boxShadow: '0px 4px 10px rgba(0,0,0,0.03)' },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  
  chatScroll: { padding: 20, paddingBottom: 40 },
  timeStamp: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 20, fontWeight: '600' },
  
  messageBubble: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  botBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  
  botAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight + '40', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 'auto', flexShrink: 0 },
  
  messageContent: { padding: 16, borderRadius: 24, flexShrink: 1 },
  botContent: { backgroundColor: colors.card, borderBottomLeftRadius: 4, boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' },
  userContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4, boxShadow: '0px 4px 12px rgba(255, 141, 161, 0.3)' },
  
  messageText: { fontSize: 15, lineHeight: 22, flexWrap: 'wrap' },
  botText: { color: colors.text },
  userText: { color: 'white', fontWeight: '500' },

  inputContainer: { padding: 15, paddingBottom: 30, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: colors.card, borderRadius: 24, padding: 5, paddingLeft: 20, boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
  input: { flex: 1, minHeight: 40, maxHeight: 100, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: colors.text },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', margin: 5 },
});
