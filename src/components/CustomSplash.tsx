import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function CustomSplash() {
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const logoOpacityValue = useRef(new Animated.Value(0)).current;
  const textOpacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo hiện lên vừa phải
    Animated.timing(logoOpacityValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Dòng chữ "for embeiu" hiện lên thật chậm, rõ dần dần (2s)
    Animated.timing(textOpacityValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Hiệu ứng nhịp tim (Heartbeat) - Nhẹ nhàng hơn
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.08,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.08,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: logoOpacityValue, alignItems: 'center' }}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: textOpacityValue }]}>
        for embeiu
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Hồng nhạt rất tình cảm (Lavender Blush)
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 35,
    marginBottom: 24,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  tagline: {
    fontSize: 24,
    color: '#D81B60',
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: 0.8,
  }
});
