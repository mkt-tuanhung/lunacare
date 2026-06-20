import { Cycle, CyclePrediction } from './cycle.types';
import { useProfileStore } from '../../store/useProfileStore';

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

export function predictCycle(cycles: Cycle[], recentLogs: any[] = []): CyclePrediction {
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Lấy health profile để điều chỉnh thuật toán
  const profileState = useProfileStore.getState();
  const healthProfile = profileState.profile?.healthProfile ? { ...profileState.profile.healthProfile } : null;

  // [UPDATE] Làm cho Thuật toán Offline thông minh hơn bằng cách đọc Nhật ký Ghi nhận (Giống AI)
  let dailyAdvice: string[] = [];
  if (healthProfile && recentLogs.length > 0) {
    const latestLog = recentLogs[0];
    
    // Đưa ra lời khuyên dựa trên Nhật ký
    if (latestLog.water_cups !== undefined && latestLog.water_cups !== null) {
      if (latestLog.water_cups < 4) dailyAdvice.push("Hôm nay bạn uống hơi ít nước. Hãy cố gắng bổ sung thêm để cơ thể đào thải tốt hơn nhé.");
      else if (latestLog.water_cups >= 8) dailyAdvice.push("Tuyệt vời! Bạn đang duy trì lượng nước rất tốt cho cơ thể.");
    }
    
    if (latestLog.sleep_hours !== undefined && latestLog.sleep_hours !== null) {
      if (latestLog.sleep_hours < 6) dailyAdvice.push("Bạn có vẻ đang thiếu ngủ. Hãy cố gắng chợp mắt sớm hơn vào tối nay để phục hồi năng lượng.");
      else if (latestLog.sleep_hours >= 7) dailyAdvice.push("Giấc ngủ của bạn đang rất tốt, hãy tiếp tục duy trì nhé.");
    }

    if (latestLog.moods && Array.isArray(latestLog.moods)) {
      if (latestLog.moods.includes('Căng thẳng') || latestLog.moods.includes('Buồn bã') || latestLog.moods.includes('Khó chịu')) {
        dailyAdvice.push("Có vẻ hôm nay tâm trạng bạn không được thoải mái. Hãy dành chút thời gian nghe nhạc hoặc làm điều mình thích để thư giãn nhé.");
      }
      if (latestLog.moods.includes('Vui vẻ') || latestLog.moods.includes('Bình thường') || latestLog.moods.includes('Bình tĩnh')) {
        if (healthProfile.stressLevel === 'Rất cao' || healthProfile.stressLevel === 'Hơi căng thẳng') {
          healthProfile.stressLevel = 'Thấp';
        }
      }
    }
    
    if (latestLog.symptoms && Array.isArray(latestLog.symptoms)) {
        if (latestLog.symptoms.includes('Đau bụng') || latestLog.symptoms.includes('Đau lưng') || latestLog.symptoms.includes('Căng tức ngực')) {
            dailyAdvice.push("Nếu bạn đang bị đau bụng hoặc nhức mỏi, hãy thử chườm ấm hoặc uống một chút trà gừng ấm để xoa dịu nhé.");
        }
        if (latestLog.symptoms.includes('Mụn')) {
            dailyAdvice.push("Nổi mụn có thể do nội tiết tố thay đổi. Hãy chú ý làm sạch da và hạn chế đồ ăn cay nóng trong những ngày này.");
        }
        if (latestLog.symptoms.includes('Đau đầu')) {
            dailyAdvice.push("Bạn đang bị đau đầu. Hãy thử massage nhẹ nhàng vùng thái dương và uống một cốc nước ấm.");
        }
    }
  }

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
        notes: dailyAdvice.length > 0 
          ? [...dailyAdvice, "Dự đoán đã được tinh chỉnh bằng thuật toán Y khoa dựa trên lối sống, bệnh lý và mức độ căng thẳng của bạn."] 
          : ["Dự đoán đã được tinh chỉnh bằng thuật toán Y khoa dựa trên lối sống, bệnh lý và mức độ căng thẳng của bạn."]
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

  // Đưa lời khuyên hàng ngày lên đầu ghi chú
  if (dailyAdvice.length > 0) {
    modifierNotes = [...dailyAdvice, ...modifierNotes];
  }

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
