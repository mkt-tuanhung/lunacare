import { Cycle, CyclePrediction } from './cycle.types';
import { useProfileStore } from '../../store/useProfileStore';

const systemPrompt = `Bạn là Chuyên gia Sản phụ khoa AI. Nhiệm vụ của bạn là phân tích dữ liệu kinh nguyệt và sức khỏe của người dùng để dự đoán chu kỳ tiếp theo, rụng trứng và đưa ra chẩn đoán chính xác.

ĐẦU VÀO SẼ LÀ:
1. Lịch sử các chu kỳ gần đây (Ngày bắt đầu, Ngày kết thúc)
2. Thông tin sức khỏe cá nhân (Chu kỳ trung bình, Ngày hành kinh, Các triệu chứng bất thường, Biện pháp tránh thai, Mức độ Căng thẳng)

YÊU CẦU ĐẦU RA (BẮT BUỘC TRẢ VỀ CHUẨN JSON, KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI):
{
  "predictedStartDate": "YYYY-MM-DD",
  "predictedEndDate": "YYYY-MM-DD",
  "predictedCycleLength": số_ngày,
  "predictedPeriodLength": số_ngày,
  "ovulationDate": "YYYY-MM-DD",
  "fertileWindowStart": "YYYY-MM-DD",
  "fertileWindowEnd": "YYYY-MM-DD",
  "pmsWindowStart": "YYYY-MM-DD",
  "pmsWindowEnd": "YYYY-MM-DD",
  "confidence": "high" | "medium" | "low",
  "confidenceScore": điểm_từ_0_đến_100,
  "notes": ["Lời khuyên 1", "Lời khuyên 2"]
}

QUY TẮC PHÂN TÍCH (LÂM SÀNG):
1. Ưu tiên Lịch sử thực tế: Độ dài chu kỳ dự đoán phải dựa vào trung bình 3-6 tháng gần nhất. Tuy nhiên nếu có 1 tháng đột biến (nhiễu), hãy loại bỏ tháng đó và dùng số liệu ổn định.
2. Rụng Trứng: Rụng trứng thường diễn ra vào khoảng 14 ngày TRƯỚC ngày bắt đầu của chu kỳ TỚI (Không phải đếm xuôi từ ngày bắt đầu chu kỳ này).
3. Cửa sổ Thụ Thai: 5 ngày trước rụng trứng và 1 ngày sau rụng trứng.
4. Tiền kinh nguyệt (PMS): 7 ngày trước ngày kinh dự kiến.
5. Thuốc Tránh Thai Hàng Ngày: Nếu người dùng dùng "Thuốc hàng ngày", chu kỳ gần như chắc chắn bị khóa chặt ở mức 28 ngày do tác dụng của thuốc giả dược. AI phải ghi nhận điều này.
6. LỜI KHUYÊN HÀNG NGÀY: Dựa vào "Ghi nhận sức khỏe hằng ngày" gần nhất và "Thông tin sức khỏe", hãy viết 1 ĐẾN 2 câu ngắn gọn chẩn đoán tình trạng sức khỏe hiện tại và đưa ra lời khuyên thiết thực. Lưu lời khuyên này vào phần tử ĐẦU TIÊN của mảng "notes". BẮT BUỘC PHẢI VIẾT LỜI KHUYÊN NÀY BẰNG TIẾNG VIỆT 100%.

TUYỆT ĐỐI KHÔNG ĐƯỢC DỊCH CÁC KEY CỦA JSON SANG TIẾNG VIỆT. GIỮ NGUYÊN TÊN KEY BẰNG TIẾNG ANH NHƯ MẪU DƯỚI ĐÂY!
`;

export async function predictCycleWithAI(cycles: Cycle[]): Promise<CyclePrediction | null> {
  const profileState = useProfileStore.getState();
  const healthProfile = profileState.profile?.healthProfile;

  if (!cycles || cycles.length === 0) {
    return null;
  }

  const prompt = `
DỮ LIỆU ĐẦU VÀO THỰC TẾ:
- Lịch sử chu kỳ:
${JSON.stringify(cycles, null, 2)}

- Hồ sơ Sức khỏe:
${JSON.stringify(healthProfile, null, 2)}

Xin hãy xuất JSON Dự đoán chu kỳ cho vòng lặp kế tiếp dựa trên các quy tắc đã cho. Đảm bảo tuân thủ cấu trúc JSON.
`;

  try {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    let textResult = "";
    let fetchErrorMsg = "";

    if (API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + prompt }] }],
            generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        fetchErrorMsg = `Google API Error ${response.status}: ${data?.error?.message || 'Unknown error'}`;
      } else {
        textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    } else {
      // Fallback Engine nếu không có API key (Pollinations AI)
      const fetchResponse = await fetch('https://text.pollinations.ai/prompt/' + encodeURIComponent(systemPrompt + prompt), { method: 'GET' });
      textResult = await fetchResponse.text();
    }

    if (!textResult) {
      throw new Error(fetchErrorMsg || "Không nhận được phản hồi từ AI");
    }

    // Loại bỏ markdown (nếu có)
    const match = textResult.match(/\{[\s\S]*\}/);
    const cleanJson = match ? match[0] : textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const prediction: CyclePrediction = JSON.parse(cleanJson);
    
    // VALIDATE KẾT QUẢ CỦA AI NẾU NÓ QUÁ VÔ LÝ
    if ((prediction.predictedCycleLength ?? 0) > 55 || (prediction.predictedCycleLength ?? 0) < 20) {
       prediction.predictedCycleLength = healthProfile?.cycleLength || 28;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const predictedStart = new Date(prediction.predictedStartDate || today);
    predictedStart.setHours(0,0,0,0);
    const DAY_MS = 1000 * 60 * 60 * 24;
    const diffDays = (predictedStart.getTime() - today.getTime()) / DAY_MS;
    if (diffDays > 55 || diffDays < -55) {
       throw new Error(`AI dự đoán ngày quá vô lý (lệch ${diffDays} ngày)`);
    }

    console.log("AI Prediction Success", prediction);
    return prediction;

  } catch (err: any) {
    console.error("AI Prediction Error:", err);
    const fetchErrorMsg = err.message || "Lỗi không xác định từ máy chủ AI";
    throw new Error(fetchErrorMsg);
  }
}
