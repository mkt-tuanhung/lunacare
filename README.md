# LunaCare - Trợ lý chăm sóc sức khỏe & chu kỳ kinh nguyệt

Đây là ứng dụng web React Native + Expo + TypeScript dành cho việc theo dõi chu kỳ kinh nguyệt (Period Tracker), đồng thời cung cấp chế độ đồng hành cho người chồng (Husband Companion Mode).

## Tính năng chính (MVP)
1. **Onboarding**: Thu thập thông tin chu kỳ ban đầu.
2. **Home Dashboard**: Trạng thái chu kỳ hiện tại, ngày dự kiến kỳ kinh tiếp theo, gọi ý chăm sóc cơ thể.
3. **Calendar**: Giao diện lịch hiển thị các giai đoạn rụng trứng, chu kỳ kinh nguyệt và PMS.
4. **Log Today**: Ghi nhận triệu chứng, tâm trạng, lượng máu, mức độ đau, lượng nước uống.
5. **Insights**: Tổng quan phân tích dữ liệu các chu kỳ trước đó.
6. **Care Center**: Trung tâm gợi ý chăm sóc cho bản thân (dành cho vợ).
7. **Partner Mode**: Hệ thống chia sẻ quyền truy cập thông tin với người chồng.
8. **Husband Companion**: Giao diện nhắc việc và gợi ý hành động chăm sóc vợ dành cho chồng.

## Hướng dẫn cài đặt & chạy dự án

### 1. Cài đặt các thư viện phụ thuộc
Vì dự án cần `zustand` cho quản lý state và `recharts` cho biểu đồ trên web, hãy đảm bảo bạn cài đặt các gói mới:

```bash
cd "/Users/mac/Downloads/du an mo_embeiu/lunacare"
npm install
```

### 2. Khởi chạy ứng dụng trên Web
Ứng dụng được thiết kế ưu tiên cho Web-first:

```bash
npm run web
```
Sau đó, hãy mở URL (thường là `http://localhost:8081`) trên trình duyệt để trải nghiệm ứng dụng.

## Cấu trúc thư mục

- `src/app`: Chứa các màn hình (screens) được định tuyến bởi Expo Router.
- `src/components`: Các UI Component tái sử dụng.
- `src/features`: Các module chức năng (cycle, symptoms, care, partner, v.v.).
- `src/data`: Mock data, Local DB repositories.
- `src/store`: Zustand stores.
- `src/theme`: Theme variables (colors, fonts).

## Kế hoạch phát triển (Roadmap)
- Thay thế Mock Data bằng Supabase & Cloudflare R2 để đồng bộ dữ liệu.
- Phát triển API AI thực tế cho chức năng AI Chat.
- Bổ sung hệ thống Notification cục bộ.
- Triển khai thuật toán mã hóa End-to-End Encryption cho dữ liệu nhạy cảm.
