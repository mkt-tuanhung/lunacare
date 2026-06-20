import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface PinPadProps {
  title?: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: string;
}

export default function PinPad({ title = 'Nhập mã PIN', subtitle = 'Vui lòng nhập mã PIN 4 số', onComplete, onCancel, error }: PinPadProps) {
  const [pin, setPin] = useState<string>('');
  const [localError, setLocalError] = useState<string | undefined>('');

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (pin.length === 4) {
      // Delay nhỏ để hiển thị được dấu chấm thứ 4 trước khi submit
      const timer = setTimeout(() => {
        onComplete(pin);
        setPin(''); 
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pin, onComplete]);

  const handlePress = (digit: string) => {
    if (localError) setLocalError('');
    if (pin.length < 4) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    if (localError) setLocalError('');
    if (pin.length > 0) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      setPin(prev => prev.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      {onCancel && (
        <Pressable onPress={onCancel} style={styles.closeBtn}>
          <Feather name="x" size={28} color={colors.text} />
        </Pressable>
      )}

      <View style={styles.header}>
        <Feather name="lock" size={40} color={colors.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {localError ? <Text style={styles.errorText}>{localError}</Text> : <View style={{ height: 20 }} />}
      </View>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled, !!localError && styles.dotError]} />
        ))}
      </View>

      <View style={styles.padContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Pressable key={num} style={styles.keyBtn} onPress={() => handlePress(num.toString())}>
            <Text style={styles.keyText}>{num}</Text>
          </Pressable>
        ))}
        <View style={styles.keyBtn} />
        <Pressable style={styles.keyBtn} onPress={() => handlePress('0')}>
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <Pressable style={styles.keyBtn} onPress={handleDelete}>
          <Feather name="delete" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotError: {
    backgroundColor: '#F44336',
  },
  padContainer: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 40,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
  }
});
