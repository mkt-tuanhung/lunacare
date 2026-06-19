import { Cycle, CyclePrediction } from './cycle.types';
import { useProfileStore } from '../../store/useProfileStore';

export async function predictCycleWithAI(cycles: Cycle[]): Promise<CyclePrediction | null> {
  const profileState = useProfileStore.getState();
  const healthProfile = profileState.profile?.healthProfile;
  
  if (!healthProfile) return null;

  const historyStr = cycles.length > 0 
    ? cycles.map(c => `Bắt đầu: ${c.startDate}, Kết thúc: ${c.endDate || 'Chưa rõ'}`).join(' | ')
    : `Chưa có lịch sử. Thông tin tham khảo: Kinh gần nhất ${healthProfile.lastPeriodDate}, chu kỳ ${healthProfile.cycleLength} ngày, kéo dài ${healthProfile.periodDuration} ngày.`;

  const systemPrompt = `
Bạn là một AI phân tích chu kỳ kinh nguyệt thông minh.
Dưới đây là lịch sử chu kỳ và thông tin sức khỏe của người dùng:
- Lịch sử: ${historyStr}
- Goal: ${healthProfile.goal}
- Stress: ${healthProfile.stressLevel}
- Ngủ: ${healthProfile.sleepHours} (${healthProfile.sleepQuality})
- Tránh thai: ${healthProfile.birthControl}
- Bệnh lý: ${healthProfile.medicalConditions?.join(', ')}

Hãy phân tích và tính toán chính xác chu kỳ tiếp theo. Trả lời CHỈ BẰNG 1 CHUỖI JSON HỢP LỆ (KHÔNG chứa markdown code block, KHÔNG có text thừa), với cấu trúc sau:
{
  "predictedStartDate": "YYYY-MM-DD",
  "predictedEndDate": "YYYY-MM-DD",
  "predictedCycleLength": number,
  "predictedPeriodLength": number,
  "ovulationDate": "YYYY-MM-DD",
  "fertileWindowStart": "YYYY-MM-DD",
  "fertileWindowEnd": "YYYY-MM-DD",
  "pmsWindowStart": "YYYY-MM-DD",
  "pmsWindowEnd": "YYYY-MM-DD",
  "confidence": "high" | "medium" | "low",
  "confidenceScore": number,
  "notes": ["lời giải thích ngắn gọn tại sao dự đoán như vậy"]
}
Lưu ý quan trọng: Ngày rụng trứng = predictedStartDate trừ 14 ngày. Khoảng thụ thai = rụng trứng - 5 ngày đến + 1 ngày.
Hôm nay là: ${new Date().toISOString().split('T')[0]}. Hãy đảm bảo kết quả tính toán hợp lý với thời gian hiện tại và loại bỏ các lỗi outlier (ví dụ ngắt quãng 86 ngày) bằng cách giả định người dùng quên log hoặc tính dựa vào ngày log mới nhất.
`;

  try {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    let textResult = "";

    if (API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
          })
        }
      );
      const data = await response.json();
      textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      const prompt = systemPrompt;
      const response = await fetch('https://text.pollinations.ai/prompt/' + encodeURIComponent(prompt), { method: 'GET' });
      textResult = await response.text();
    }

    if (!textResult) return null;

    // Loại bỏ markdown (nếu có)
    const cleanJson = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const prediction: CyclePrediction = JSON.parse(cleanJson);
    return prediction;

  } catch (err) {
    console.error("AI Prediction Error:", err);
    return null;
  }
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function daysBetween(a: string, b: string): number {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  return Math.round((end - start) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function calculateMeanAndStdDev(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev };
}

// Lọc Outlier sử dụng quy tắc 1.5 * IQR (Hoặc giới hạn cứng)
function filterOutliers(lengths: number[]): number[] {
  if (lengths.length < 3) return lengths.filter(l => l >= 15 && l <= 60);
  
  const { mean, stdDev } = calculateMeanAndStdDev(lengths);
  // Giữ lại các chu kỳ nằm trong khoảng Mean ± 2 StdDev
  return lengths.filter(l => l >= mean - 2 * stdDev && l <= mean + 2 * stdDev && l >= 15 && l <= 60);
}

function weightedAverage(values: number[]): number {
  if (!values.length) return 0;
  const totalWeight = values.reduce((sum, _, index) => sum + index + 1, 0);
  const weightedSum = values.reduce((sum, value, index) => sum + value * (index + 1), 0);
  return Math.round(weightedSum / totalWeight);
}

export function predictCycle(cycles: Cycle[]): CyclePrediction {
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Lấy health profile để điều chỉnh thuật toán
  const profileState = useProfileStore.getState();
  const healthProfile = profileState.profile?.healthProfile;

  if (!sorted.length) {
    // NẾU CHƯA CÓ LỊCH SỬ NÀO -> Dự đoán hoàn toàn dựa trên dữ liệu nhập lúc Onboarding
    if (healthProfile?.lastPeriodDate && healthProfile?.cycleLength) {
      const pStartDate = addDays(healthProfile.lastPeriodDate, healthProfile.cycleLength);
      const pEndDate = addDays(pStartDate, healthProfile.periodDuration - 1);
      const ovDate = addDays(pStartDate, -14); // Luteal Phase = 14
      return {
        predictedStartDate: pStartDate,
        predictedEndDate: pEndDate,
        predictedCycleLength: healthProfile.cycleLength,
        predictedPeriodLength: healthProfile.periodDuration,
        ovulationDate: ovDate,
        fertileWindowStart: addDays(ovDate, -5),
        fertileWindowEnd: addDays(ovDate, 1),
        pmsWindowStart: addDays(pStartDate, -7),
        pmsWindowEnd: addDays(pStartDate, -1),
        confidence: "medium",
        confidenceScore: 60,
        notes: ["Dự đoán dựa trên câu trả lời khảo sát ban đầu."]
      };
    }

    return {
      predictedStartDate: null, predictedEndDate: null, predictedCycleLength: null, predictedPeriodLength: null,
      ovulationDate: null, fertileWindowStart: null, fertileWindowEnd: null, pmsWindowStart: null, pmsWindowEnd: null,
      confidence: "low", confidenceScore: 0, notes: ["Chưa đủ dữ liệu dự đoán."]
    };
  }

  // CÓ LỊCH SỬ CHU KỲ
  let rawCycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    rawCycleLengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }
  
  // 1. Áp dụng thuật toán loại bỏ nhiễu
  const cleanCycleLengths = filterOutliers(rawCycleLengths);
  
  // 2. Tính trung bình có trọng số (ưu tiên chu kỳ gần nhất)
  let predictedCycleLength = cleanCycleLengths.length > 0 ? weightedAverage(cleanCycleLengths) : (healthProfile?.cycleLength || 28);
  
  // 3. Hiệu chỉnh thuật toán dựa vào Lối Sống (Lifestyle Adjustments)
  let modifierNotes = [];
  if (healthProfile) {
    if (healthProfile.stressLevel === 'Rất cao') {
      predictedCycleLength += 2; // Stress thường làm trễ kinh
      modifierNotes.push("Chu kỳ có thể trễ hơn do mức độ căng thẳng cao.");
    }
    if (healthProfile.birthControl === 'Thuốc hàng ngày') {
      predictedCycleLength = 28; // Cố định theo vỉ thuốc
      modifierNotes.push("Dự đoán cố định 28 ngày do sử dụng thuốc tránh thai hàng ngày.");
    }
  }

  const periodLengths = sorted.filter(c => c.endDate).map(c => daysBetween(c.startDate, c.endDate as string) + 1);
  const predictedPeriodLength = periodLengths.length > 0 ? weightedAverage(periodLengths) : (healthProfile?.periodDuration || 5);

  const lastCycle = sorted[sorted.length - 1];
  const predictedStartDate = addDays(lastCycle.startDate, predictedCycleLength);
  const predictedEndDate = addDays(predictedStartDate, predictedPeriodLength - 1);

  // 4. Tính toán Pha Hoàng Thể (Luteal Phase Logic)
  const ovulationDate = addDays(predictedStartDate, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const pmsWindowStart = addDays(predictedStartDate, -7);
  const pmsWindowEnd = addDays(predictedStartDate, -1);

  return {
    predictedStartDate,
    predictedEndDate,
    predictedCycleLength,
    predictedPeriodLength,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    pmsWindowStart,
    pmsWindowEnd,
    confidence: cleanCycleLengths.length > 3 ? "high" : "medium",
    confidenceScore: cleanCycleLengths.length > 3 ? 90 : 65,
    notes: modifierNotes.length > 0 ? modifierNotes : ["Dự đoán hoạt động ổn định."]
  };
}
