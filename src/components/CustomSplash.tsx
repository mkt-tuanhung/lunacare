import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function CustomSplash() {
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hiện dần lên (Fade In)
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Hiệu ứng nhịp tim (Heartbeat)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.15,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.15,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue, alignItems: 'center' }}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.appName}>LunaCare</Text>
        <Text style={styles.tagline}>for embeiu</Text>
      </Animated.View>
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#D81B60', // Hồng đậm
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#F06292',
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: 0.5,
  }
});
