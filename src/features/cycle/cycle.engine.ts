import { Cycle, CyclePrediction } from './cycle.types';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';

export async function predictCycleWithAI(cycles: Cycle[]): Promise<CyclePrediction | null> {
  const profileState = useProfileStore.getState();
  const healthProfile = profileState.profile?.healthProfile;
  
  if (!healthProfile) return null;

  let recentLogsStr = "Chưa có ghi nhận hằng ngày.";
  if (profileState.profile?.uid) {
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profileState.profile.uid)
      .order('log_date', { ascending: false })
      .limit(7);
      
    if (logs && logs.length > 0) {
      recentLogsStr = logs.map(l => `Ngày ${l.log_date}: Kinh nguyệt ${l.is_period_day}, Tâm trạng: ${l.moods?.join(',')}, Triệu chứng: ${l.symptoms?.join(',')}`).join(' | ');
    }
  }

  const historyStr = cycles.length > 0 
    ? cycles.map(c => `Bắt đầu: ${c.startDate}, Kết thúc: ${c.endDate || 'Chưa rõ'}`).join(' | ')
    : `Chưa có lịch sử. Thông tin tham khảo: Kinh gần nhất ${healthProfile.lastPeriodDate}, chu kỳ ${healthProfile.cycleLength} ngày, kéo dài ${healthProfile.periodDuration} ngày.`;

  const systemPrompt = `
Bạn là một AI chuyên gia Y Tế phụ sản phân tích chu kỳ kinh nguyệt thông minh. Nhiệm vụ của bạn là dự đoán chu kỳ KẾ TIẾP (gần nhất ở hiện tại/tương lai) của người dùng và đưa ra CHẨN ĐOÁN SỨC KHỎE DỰA TRÊN TRIỆU CHỨNG HÀNG NGÀY.
Dưới đây là lịch sử chu kỳ và thông tin sức khỏe:
- Lịch sử chu kỳ đã ghi nhận: ${historyStr}
- Độ dài chu kỳ trung bình người dùng khai báo: ${healthProfile.cycleLength} ngày.
- Số ngày hành kinh trung bình khai báo: ${healthProfile.periodDuration} ngày.
- Goal: ${healthProfile.goal}
- Stress: ${healthProfile.stressLevel}
- Ngủ: ${healthProfile.sleepHours} (${healthProfile.sleepQuality})
- Tránh thai (cơ bản): ${healthProfile.birthControl}
- Phương pháp tránh thai lúc quan hệ: ${healthProfile.contraceptionMethod}
- Tần suất quan hệ: ${healthProfile.sexualFrequency}
- Tiền sử thai kỳ gần đây: ${healthProfile.recentPregnancy}
- Thay đổi cân nặng: ${healthProfile.weightChange}
- Bệnh lý: ${healthProfile.medicalConditions?.join(', ')}

Ghi nhận sức khỏe hằng ngày (7 ngày gần nhất):
${recentLogsStr}

Hôm nay là: ${new Date().toISOString().split('T')[0]}.

QUY TẮC BẮT BUỘC (CRITICAL RULES):
1. KHÔNG BAO GIỜ dự đoán chu kỳ kế tiếp cách hiện tại hoặc cách chu kỳ cuối cùng hàng trăm/nghìn ngày. Nếu lần ghi nhận gần nhất cách đây vài tháng hoặc vài năm, bạn PHẢI tự động "tua" (cộng thêm các chu kỳ 28-30 ngày) cho đến khi ra được ngày bắt đầu chu kỳ gần với "Hôm nay" nhất.
2. NẾU người dùng KHÔNG CÓ lịch sử (Chưa rõ), hãy dùng thông tin khai báo ban đầu để tính toán chu kỳ kế tiếp từ "Kinh gần nhất".
3. LƯU Ý: Tính toán rụng trứng và chu kỳ phải có CƠ SỞ KHOA HỌC. Nếu có dùng thuốc tránh thai khẩn cấp, cân nặng giảm nhanh, mới sẩy thai/sinh con -> Bắt buộc phải điều chỉnh độ dài chu kỳ dài ra và lùi ngày rụng trứng lại thay vì dùng 28 ngày cố định.
4. QUAN TRỌNG: "predictedCycleLength" PHẢI LÀ SỐ THỰC TẾ (từ 21 đến 55 ngày), tuyệt đối không được trả về các số vô lý như 86, 100, hay 1000. Nếu không chắc chắn, hãy dùng ${healthProfile.cycleLength} ngày.
5. QUAN TRỌNG: "predictedStartDate" PHẢI LÀ NGÀY TƯƠNG LAI GẦN NHẤT so với Hôm nay, KHÔNG ĐƯỢC xa hơn Hôm nay quá 55 ngày.
6. LỜI KHUYÊN HÀNG NGÀY: Dựa vào "Ghi nhận sức khỏe hằng ngày" gần nhất và "Thông tin sức khỏe", hãy viết 1 ĐẾN 2 câu ngắn gọn chẩn đoán tình trạng sức khỏe hiện tại và đưa ra lời khuyên thiết thực. Lưu lời khuyên này vào phần tử ĐẦU TIÊN của mảng "notes". BẮT BUỘC PHẢI VIẾT LỜI KHUYÊN NÀY BẰNG TIẾNG VIỆT 100%.

TUYỆT ĐỐI KHÔNG ĐƯỢC DỊCH CÁC KEY CỦA JSON SANG TIẾNG VIỆT. GIỮ NGUYÊN TÊN KEY BẰNG TIẾNG ANH NHƯ MẪU DƯỚI ĐÂY!
Trả lời CHỈ BẰNG 1 CHUỖI JSON HỢP LỆ (KHÔNG chứa markdown code block \`\`\`, KHÔNG có text thừa ngoài JSON), cấu trúc như sau:
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
`;

  try {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    let textResult = "";

    if (API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
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
    const match = textResult.match(/\{[\s\S]*\}/);
    const cleanJson = match ? match[0] : textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const prediction: CyclePrediction = JSON.parse(cleanJson);
    
    // VALIDATE KẾT QUẢ CỦA AI NẾU NÓ QUÁ VÔ LÝ
    if (prediction.predictedCycleLength > 55 || prediction.predictedCycleLength < 20) {
       prediction.predictedCycleLength = healthProfile.cycleLength || 28;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const predictedStart = new Date(prediction.predictedStartDate);
    predictedStart.setHours(0,0,0,0);
    const DAY_MS = 1000 * 60 * 60 * 24;
    const diffDays = (predictedStart.getTime() - today.getTime()) / DAY_MS;
    if (diffDays > 55 || diffDays < -55) {
       console.error(`AI dự đoán ngày quá vô lý (lệch ${diffDays} ngày). Bắt buộc Fallback.`);
       return null; // Trả về null để Store tự động kích hoạt thuật toán Local (Fallback)
    }

    console.log("AI Prediction Success", prediction);
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
      
      // FIX LỖI: parse sang số nguyên để không bị cộng chuỗi "28" + 2 = "282"
      let baseCycleLength = parseInt(String(healthProfile.cycleLength)) || 28;
      let periodDuration = parseInt(String(healthProfile.periodDuration)) || 5;
      
      // 1. ĐIỀU CHỈNH ĐỘ DÀI CHU KỲ DỰA TRÊN CÂU HỎI CHUYÊN SÂU
      if (healthProfile.stressLevel === 'Rất cao') {
        baseCycleLength += 3;
      } else if (healthProfile.stressLevel === 'Hơi căng thẳng') {
        baseCycleLength += 1;
      }
      
      if (healthProfile.birthControl === 'Thuốc hàng ngày' || healthProfile.contraceptionMethod === 'Thuốc hàng ngày') {
        baseCycleLength = 28;
      } else if (healthProfile.birthControl === 'Cấy que' || healthProfile.birthControl === 'Tiêm') {
        baseCycleLength += 5;
      }
      
      // Yếu tố mới: Thuốc tránh thai khẩn cấp làm lùi rụng trứng mạnh
      if (healthProfile.contraceptionMethod === 'Thuốc tránh thai khẩn cấp') {
        baseCycleLength += 10; 
      }
      
      // Yếu tố mới: Sinh con hoặc Sẩy thai
      if (healthProfile.recentPregnancy === 'Mới sinh con' || healthProfile.recentPregnancy === 'Mới sẩy thai/phá thai') {
        baseCycleLength += 14; // Thường làm rối loạn chu kỳ nặng
      }
      
      // Yếu tố mới: Thay đổi cân nặng
      if (healthProfile.weightChange === 'Giảm cân nhanh') {
        baseCycleLength += 5; // Giảm leptin -> Trễ rụng trứng
      } else if (healthProfile.weightChange === 'Tăng cân nhanh') {
        baseCycleLength += 3;
      }

      if (healthProfile.medicalConditions?.includes('PCOS (Đa nang buồng trứng)')) {
        baseCycleLength += 7;
      }
      
      if (healthProfile.activityLevel === 'Tập cường độ cao (VĐV)') {
        baseCycleLength += 2;
      }

      if (healthProfile.diet?.includes('Ăn kiêng nghiêm ngặt/Keto')) {
        baseCycleLength += 2;
      }

      // Giới hạn max/min hợp lý
      if (baseCycleLength > 55) baseCycleLength = 55; // Nới lỏng lên 55 do các yếu tố sẩy thai/thuốc khẩn cấp
      if (baseCycleLength < 21) baseCycleLength = 21;

      let pStartDate = addDays(healthProfile.lastPeriodDate, baseCycleLength);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      let loopCount = 0;
      while (new Date(pStartDate).getTime() < today.getTime() && loopCount < 100) { 
          pStartDate = addDays(pStartDate, baseCycleLength);
          loopCount++;
      }
      
      // NẾU TUA QUÁ ĐÀ
      const diffDaysAfterLoop = (new Date(pStartDate).getTime() - today.getTime()) / DAY_MS;
      if (diffDaysAfterLoop > 45) {
          pStartDate = addDays(today.toISOString().slice(0, 10), 0);
      }
      
      const pEndDate = addDays(pStartDate, periodDuration - 1);
      
      // 2. ĐIỀU CHỈNH NGÀY RỤNG TRỨNG (Pha Hoàng Thể)
      let lutealPhase = 14;
      if (baseCycleLength <= 24) lutealPhase = 12;
      if (baseCycleLength >= 35) lutealPhase = 16;
      
      if (healthProfile.medicalConditions?.includes('Tuyến giáp')) {
        lutealPhase -= 2;
      }
      
      if (healthProfile.recentPregnancy === 'Mới sẩy thai/phá thai') {
        lutealPhase -= 2; // Suy hoàng thể thường gặp sau sẩy thai
      }

      const ovDate = addDays(pStartDate, -lutealPhase); 
      
      return {
        predictedStartDate: pStartDate,
        predictedEndDate: pEndDate,
        predictedCycleLength: baseCycleLength,
        predictedPeriodLength: healthProfile.periodDuration,
        ovulationDate: ovDate,
        fertileWindowStart: addDays(ovDate, -5),
        fertileWindowEnd: addDays(ovDate, 1),
        pmsWindowStart: addDays(pStartDate, -7),
        pmsWindowEnd: addDays(pStartDate, -1),
        confidence: "medium",
        confidenceScore: 70,
        notes: ["Dự đoán đã được tinh chỉnh bằng thuật toán Y khoa dựa trên lối sống, bệnh lý và mức độ căng thẳng của bạn."]
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
  let predictedCycleLength = cleanCycleLengths.length > 0 ? weightedAverage(cleanCycleLengths) : (parseInt(String(healthProfile?.cycleLength)) || 28);
  
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
  const predictedPeriodLength = periodLengths.length > 0 ? weightedAverage(periodLengths) : (parseInt(String(healthProfile?.periodDuration)) || 5);

  const lastCycle = sorted[sorted.length - 1];
  let predictedStartDate = addDays(lastCycle.startDate, predictedCycleLength);
  
  // Xử lý Outlier cực nặng (Ví dụ: Nhập 1 chu kỳ từ 3 năm trước, thuật toán chay sẽ tính ra ngày hôm nay là ngày thứ 1000 của chu kỳ)
  // Nếu ngày dự đoán < ngày hôm nay -> Người dùng đã quên nhập trong 1 thời gian dài -> Tự động tua (Fast-forward) chu kỳ đến hiện tại
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let loopCount = 0;
  // Giới hạn max 100 tháng = khoảng 8 năm để tránh lặp vô hạn nếu có lỗi dữ liệu
  while (new Date(predictedStartDate).getTime() < today.getTime() && loopCount < 100) { 
      predictedStartDate = addDays(predictedStartDate, predictedCycleLength);
      loopCount++;
  }
  
  // NẾU TUA QUÁ ĐÀ (Do dữ liệu bị nhập sai lịch sử trước đó quá nhiều)
  // Bắt buộc Reset lại ngày dự đoán về một khoảng thời gian hợp lý so với hôm nay
  const diffDaysAfterLoop = (new Date(predictedStartDate).getTime() - today.getTime()) / DAY_MS;
  if (diffDaysAfterLoop > 45) {
      console.warn("Thuật toán tua quá đà do lỗi lịch sử. Ép reset về ngày hôm nay + số ngày hợp lý.");
      // Chốt luôn: Bắt đầu lại một chu kỳ mới tính từ ngày hôm nay (hoặc bù trừ nhẹ)
      predictedStartDate = addDays(today.toISOString().slice(0, 10), 0);
  }

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
