export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    const { cycles, healthProfile } = req.body;

    const systemPrompt = `Bạn là Chuyên gia Sản phụ khoa AI. Nhiệm vụ của bạn là phân tích dữ liệu kinh nguyệt và sức khỏe của người dùng để dự đoán chu kỳ tiếp theo, rụng trứng và đưa ra chẩn đoán chính xác.

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
5. Thuốc Tránh Thai Hàng Ngày: Nếu người dùng dùng "Thuốc hàng ngày", chu kỳ gần như chắc chắn bị khóa chặt ở mức 28 ngày do tác dụng của thuốc giả dược.
6. LỜI KHUYÊN HÀNG NGÀY: Dựa vào thông tin sức khỏe, hãy viết 1 ĐẾN 2 câu ngắn gọn chẩn đoán tình trạng sức khỏe hiện tại và đưa ra lời khuyên thiết thực. Lưu lời khuyên này vào phần tử ĐẦU TIÊN của mảng "notes". BẮT BUỘC PHẢI VIẾT LỜI KHUYÊN NÀY BẰNG TIẾNG VIỆT 100%.

TUYỆT ĐỐI KHÔNG ĐƯỢC DỊCH CÁC KEY CỦA JSON SANG TIẾNG VIỆT. GIỮ NGUYÊN TÊN KEY BẰNG TIẾNG ANH NHƯ MẪU DƯỚI ĐÂY!`;

    const prompt = `
DỮ LIỆU ĐẦU VÀO THỰC TẾ:
- Lịch sử chu kỳ:
${JSON.stringify(cycles, null, 2)}

- Hồ sơ Sức khỏe:
${JSON.stringify(healthProfile, null, 2)}

Xin hãy xuất JSON Dự đoán chu kỳ cho vòng lặp kế tiếp dựa trên các quy tắc đã cho. Đảm bảo tuân thủ cấu trúc JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: "json_object" }, // Ép OpenAI trả về JSON chuẩn
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data?.error?.message || response.statusText}`);
    }

    const textResult = data.choices?.[0]?.message?.content;
    if (!textResult) {
      throw new Error('OpenAI returned empty response');
    }
    const prediction = JSON.parse(textResult);

    return res.status(200).json(prediction);
  } catch (error: any) {
    console.error('API Predict Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
