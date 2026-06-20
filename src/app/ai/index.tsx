import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { chatWithAI } from '../../lib/ai';
import { useState, useRef } from 'react';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isAlert?: boolean;
};

export default function AIAssistant() {
  const router = useRouter();
  const profile = useProfileStore(state => state.profile);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Chào bạn, mình là For Embeiu AI. Mình có thể giúp gì cho sức khỏe và chu kỳ của bạn hôm nay?', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const context = {
      displayName: profile?.displayName,
      stressLevel: profile?.healthProfile?.stressLevel,
      worstSymptoms: profile?.healthProfile?.worstSymptoms
    };

    const aiResponse = await chatWithAI(userMsg.text, context);
    
    const aiMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      text: aiResponse.text, 
      sender: 'ai',
      isAlert: aiResponse.isAlert
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>For Embeiu AI</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.disclaimerBanner}>
        <Feather name="shield" size={16} color="#4CAF50" />
        <Text style={styles.disclaimerText}>AI không cung cấp chẩn đoán y tế.</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperAI]}>
            {msg.sender === 'ai' && (
              <View style={styles.avatarAI}>
                <MaterialCommunityIcons name="robot-outline" size={20} color="white" />
              </View>
            )}
            <View style={[styles.messageBubble, msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAI, msg.isAlert && styles.bubbleAlert]}>
              <Text style={[styles.messageText, msg.sender === 'user' ? styles.textUser : styles.textAI]}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageWrapper, styles.messageWrapperAI]}>
            <View style={styles.avatarAI}>
              <MaterialCommunityIcons name="robot-outline" size={20} color="white" />
            </View>
            <View style={[styles.messageBubble, styles.bubbleAI]}>
              <Text style={[styles.messageText, styles.textAI, { fontStyle: 'italic', color: colors.textMuted }]}>AI đang gõ...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Hỏi AI về chu kỳ hoặc cách chăm sóc..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
          />
          <Pressable style={[styles.sendBtn, (!inputText.trim() || isTyping) && { opacity: 0.5 }]} onPress={handleSend} disabled={!inputText.trim() || isTyping}>
            <Feather name="send" size={20} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: colors.background },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  disclaimerBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#C8E6C9' },
  disclaimerText: { fontSize: 12, color: '#2E7D32', fontWeight: '600', marginLeft: 6 },

  scrollContent: { padding: 20, paddingBottom: 40 },

  messageWrapper: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  messageWrapperUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageWrapperAI: { alignSelf: 'flex-start', justifyContent: 'flex-start' },

  avatarAI: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10, alignSelf: 'flex-end' },

  messageBubble: { padding: 16, borderRadius: 20 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F0F0F0', boxShadow: '0px 2px 8px rgba(0,0,0,0.03)' },
  bubbleAlert: { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' },

  messageText: { fontSize: 15, lineHeight: 22 },
  textUser: { color: 'white' },
  textAI: { color: colors.text },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 20, paddingBottom: 40, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  textInput: { flex: 1, backgroundColor: colors.background, minHeight: 48, maxHeight: 100, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: '#E0E0E0' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10, boxShadow: '0px 4px 12px rgba(255, 141, 161, 0.3)' }
});
