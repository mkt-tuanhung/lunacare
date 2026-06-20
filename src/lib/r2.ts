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
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const uploadAvatarToR2 = async (fileUri: string, userId: string): Promise<string | null> => {
  if (!R2_ACCESS_KEY_ID || !R2_ENDPOINT) {
    console.warn("Chưa cấu hình Cloudflare R2 trong file .env");
    return null;
  }
  
  try {
    // 1. Fetch file từ local URI thành Blob
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    // 2. Tạo tên file duy nhất
    const ext = fileUri.split('.').pop() || 'jpg';
    const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

    // 3. Tạo command
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      ContentType: blob.type || 'image/jpeg',
      ACL: 'public-read', // R2 hỗ trợ ACL
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
    return null;
  }
};
