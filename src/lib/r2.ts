import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// EXPO_PUBLIC_ chỉ dùng cho các key KHÔNG nhạy cảm (endpoint, bucket, public URL)
// SECRET_ACCESS_KEY đúng ra phải để server-side. Vì MVP không có server, ta buộc phải dùng EXPO_PUBLIC_
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT || '';
const R2_BUCKET = process.env.EXPO_PUBLIC_R2_BUCKET || '';
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  // Cloudflare R2 conflict with AWS SDK v3 auto checksums:
  // SDK adds dummy CRC32 checksum for empty payloads when creating presigned URLs.
  // R2 verifies it against the actual payload later and returns 403/400, causing CORS errors.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
export const uploadImageToR2 = async (fileUri: string | Blob, userId: string, folder: string = 'avatars'): Promise<string | null> => {
  if (!R2_ACCESS_KEY_ID || !R2_ENDPOINT) {
    console.warn("Chưa cấu hình Cloudflare R2 trong file .env");
    if (typeof window !== 'undefined') {
      window.alert("Lỗi: Thiếu biến môi trường R2_ACCESS_KEY_ID hoặc R2_ENDPOINT trên Vercel. Vui lòng cấu hình trong Project Settings.");
    }
    return null;
  }
  
  try {
    // 1. Fetch file từ local URI thành Blob HOẶC dùng luôn nếu đã là Blob/File (Web)
    let blob: Blob;
    let ext = 'jpg';

    if (typeof fileUri === 'string') {
      if (fileUri.startsWith('data:')) {
        // Xử lý thủ công data URI để tránh lỗi fetch(dataURI) trên Safari
        const arr = fileUri.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
        ext = mime.split('/')[1] || 'jpg';
      } else {
        const response = await fetch(fileUri);
        blob = await response.blob();
        if (blob.type) {
          ext = blob.type.split('/')[1] || 'jpg';
        }
      }
    } else {
      blob = fileUri as Blob;
      if (blob.type) {
        ext = blob.type.split('/')[1] || 'jpg';
      }
    }

    const fileName = `${folder}/${userId}-${Date.now()}.${ext}`;

    // 3. Tạo command
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      ContentType: blob.type || 'image/jpeg',
    });

    // 4. Lấy Presigned URL (để RN upload native qua fetch, không qua aws-sdk bị lỗi)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // 5. Upload trực tiếp qua URL vừa ký
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type || 'image/jpeg'
      }
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status: ${uploadRes.status}`);
    }

    // 4. Trả về URL
    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL}/${fileName}`;
    }
    
    // Fallback: URL của bucket
    return `${R2_ENDPOINT}/${R2_BUCKET}/${fileName}`;

  } catch (error: any) {
    console.error("Lỗi khi upload ảnh lên R2:", error);
    if (typeof window !== 'undefined') {
      // @ts-ignore - lấy url từ scope trên nếu có để debug
      const url = typeof command !== 'undefined' ? R2_ENDPOINT : 'unknown';
      window.alert("Lỗi R2: " + (error.message || error.toString()) + "\nURL: " + url + "\nCheck CORS OPTIONS method or HTTP/HTTPS.");
    }
    return null;
  }
};
