import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToastStore } from '../store/useToastStore';

export default function ToastNotification() {
  const { isVisible, message, type, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 50, // Trượt xuống
        useNativeDriver: true,
        bounciness: 10,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32', icon: 'check-circle' };
      case 'error': return { bg: '#FFEBEE', border: '#F44336', text: '#C62828', icon: 'alert-circle' };
      case 'warning': return { bg: '#FFF8E1', border: '#FFC107', text: '#F57F17', icon: 'alert-triangle' };
      default: return { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0', icon: 'info' };
    }
  };

  const colors = getColors();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <Pressable onPress={hideToast} style={[styles.toast, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Feather name={colors.icon as any} size={24} color={colors.text} style={{ marginRight: 10 }} />
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // Đảm bảo nổi lên trên cùng (rất quan trọng cho Web)
    alignItems: 'center',
    paddingHorizontal: 20,
    ...Platform.select({
      web: { position: 'fixed' as any }
    })
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  }
});
