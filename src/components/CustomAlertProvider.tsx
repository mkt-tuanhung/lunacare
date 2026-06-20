import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useAlertStore } from '../store/useAlertStore';
import { colors } from '../theme/colors';

export default function CustomAlertProvider({ children }: { children: React.ReactNode }) {
  const { isVisible, title, message, buttons, hideAlert } = useAlertStore();

  return (
    <>
      {children}
      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <View style={styles.headerDecor} />
            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}
            
            <View style={styles.buttonContainer}>
              {buttons.map((btn, index) => {
                const isPrimary = btn.style !== 'cancel' && btn.style !== 'destructive' && index === buttons.length - 1;
                const isDestructive = btn.style === 'destructive';
                
                return (
                  <Pressable 
                    key={index} 
                    style={[
                      styles.button,
                      isPrimary && styles.buttonPrimary,
                      isDestructive && styles.buttonDestructive,
                      buttons.length > 1 && { flex: 1, marginHorizontal: 5 }
                    ]}
                    onPress={() => {
                      hideAlert();
                      if (btn.onPress) btn.onPress();
                    }}
                  >
                    <Text style={[
                      styles.buttonText,
                      isPrimary && styles.buttonTextPrimary,
                      isDestructive && styles.buttonTextDestructive
                    ]}>
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDestructive: {
    backgroundColor: '#FFEBEE',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
  },
  buttonTextPrimary: {
    color: 'white',
  },
  buttonTextDestructive: {
    color: '#D32F2F',
  },
});
