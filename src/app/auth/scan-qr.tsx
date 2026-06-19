import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { colors } from '../../theme/colors';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';

const { width, height } = Dimensions.get('window');

export default function ScanQR() {
  const router = useRouter();
  const setProfile = useProfileStore(state => state.setProfile);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    
    // Giả sử Data từ QR là chuỗi: "LUNA_CONNECT_xxx"
    if (data && data.startsWith('LUNA_CONNECT_')) {
      const wifeId = data.replace('LUNA_CONNECT_', '');
      
      // Ở đây chúng ta sẽ lưu thông tin Husband vào DB và Store
      setProfile({
        uid: 'husband_device_123',
        role: 'husband',
        connectedWifeId: wifeId,
        displayName: 'Chồng Yêu',
        onboardingCompleted: true
      });

      // Chuyển sang Giao diện Độc quyền cho Đàn ông
      router.replace('/husband-dashboard');
    } else {
      alert('Mã QR không hợp lệ!');
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const scannedResults = await BarCodeScanner.scanFromURLAsync(result.assets[0].uri);
        if (scannedResults && scannedResults.length > 0) {
          handleBarCodeScanned({ type: 'qr', data: scannedResults[0].data });
        } else {
          alert('Không tìm thấy mã QR nào trong ảnh này!');
        }
      } catch (error) {
        alert('Lỗi khi đọc ảnh QR!');
      }
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={{color: 'white'}}>Đang yêu cầu quyền Camera...</Text></View>;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white', textAlign: 'center'}}>Không có quyền truy cập Camera. Vui lòng cấp quyền trong Cài đặt.</Text>
        <Pressable onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={{color: colors.primary}}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={28} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Quét mã kết nối</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.scanBoxContainer}>
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Thanh laser chạy dọc */}
            {!scanned && <View style={styles.laserLine} />}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.instructionBox}>
            <FontAwesome5 name="qrcode" size={24} color={colors.primary} />
            <Text style={styles.instructionText}>
              Đưa Camera vào mã QR trên máy của Vợ để kết nối.
            </Text>
          </View>
          
          <Pressable style={styles.uploadBtn} onPress={pickImage}>
            <Feather name="image" size={20} color="white" />
            <Text style={styles.uploadBtnText}>Hoặc Tải ảnh mã QR từ Thư viện</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
  
  scanBoxContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 250, height: 250, backgroundColor: 'transparent' },
  
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.primary },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  
  laserLine: { width: '100%', height: 2, backgroundColor: colors.primary, top: '50%', boxShadow: '0px 0px 10px rgba(255, 141, 161, 1)' },

  footer: { padding: 30, paddingBottom: 50 },
  instructionBox: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 20, alignItems: 'center', gap: 15, marginBottom: 15 },
  instructionText: { flex: 1, fontSize: 14, color: '#333', fontWeight: '600', lineHeight: 22 },
  
  uploadBtn: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  uploadBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
