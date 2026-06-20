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
      
      let baseCycleLength = parseInt(String(healthProfile.cycleLength)) || 28;
      let periodDuration = parseInt(String(healthProfile.periodDuration)) || 5;
      
      // AI Adjustments: Thu hẹp lại để không làm sai lệch quá mức (Tránh ảo giác)
      if (healthProfile.stressLevel === 'Rất cao') baseCycleLength += 2;
      if (healthProfile.contraceptionMethod === 'Thuốc tránh thai khẩn cấp') baseCycleLength += 3;
      if (healthProfile.recentPregnancy === 'Mới sinh con' || healthProfile.recentPregnancy === 'Mới sẩy thai/phá thai') baseCycleLength += 5;
      
      if (baseCycleLength > 60) baseCycleLength = 60;
      if (baseCycleLength < 20) baseCycleLength = 20;

      let pStartDate = addDays(healthProfile.lastPeriodDate, baseCycleLength);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      let loopCount = 0;
      while (new Date(pStartDate).getTime() < today.getTime() && loopCount < 100) { 
          pStartDate = addDays(pStartDate, baseCycleLength);
          loopCount++;
      }
      
      const diffDaysAfterLoop = (new Date(pStartDate).getTime() - today.getTime()) / DAY_MS;
      if (diffDaysAfterLoop > 60) {
          pStartDate = addDays(today.toISOString().slice(0, 10), 0);
      }
      
      const pEndDate = addDays(pStartDate, periodDuration - 1);
      
      // Tính Luteal Phase chuẩn Y khoa (Thường là 14 ngày, chu kỳ ngắn thì 12, dài thì 16)
      let lutealPhase = 14;
      if (baseCycleLength <= 24) lutealPhase = 12;
      else if (baseCycleLength >= 35) lutealPhase = 16;
      
      const ovDate = addDays(pStartDate, -lutealPhase); 
      
      return {
        predictedStartDate: pStartDate,
        predictedEndDate: pEndDate,
        predictedCycleLength: baseCycleLength,
        predictedPeriodLength: periodDuration,
        ovulationDate: ovDate,
        fertileWindowStart: addDays(ovDate, -5),
        fertileWindowEnd: addDays(ovDate, 1),
        pmsWindowStart: addDays(pStartDate, -7),
        pmsWindowEnd: addDays(pStartDate, -1),
        confidence: "medium",
        confidenceScore: 70,
        notes: dailyAdvice.length > 0 ? [...dailyAdvice] : ["Dự đoán dựa trên hồ sơ sức khoẻ ban đầu của bạn."]
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
  
  const cleanCycleLengths = filterOutliers(rawCycleLengths);
  
  // NẾU USER CÓ CHỈNH SỬA CHU KỲ TRONG CÀI ĐẶT: 
  // Kết hợp giữa trung bình lịch sử và cấu hình của user để ra dự đoán chính xác nhất
  let userSetCycle = parseInt(String(healthProfile?.cycleLength)) || 28;
  let historyCycle = cleanCycleLengths.length > 0 ? weightedAverage(cleanCycleLengths) : userSetCycle;
  
  // Tỷ lệ: Nếu chỉ có 1-2 lịch sử -> Tin vào user set 70%, lịch sử 30%
  // Nếu có >= 3 lịch sử -> Tin vào lịch sử 80%, user 20%
  let predictedCycleLength = historyCycle;
  if (cleanCycleLengths.length < 3) {
      predictedCycleLength = Math.round(historyCycle * 0.3 + userSetCycle * 0.7);
  } else {
      predictedCycleLength = Math.round(historyCycle * 0.8 + userSetCycle * 0.2);
  }
  
  let modifierNotes = [];
  if (healthProfile) {
    if (healthProfile.stressLevel === 'Rất cao') predictedCycleLength += 2;
    if (healthProfile.birthControl === 'Thuốc hàng ngày') predictedCycleLength = 28;
  }

  const periodLengths = sorted.filter(c => c.endDate).map(c => daysBetween(c.startDate, c.endDate as string) + 1);
  let userSetPeriod = parseInt(String(healthProfile?.periodDuration)) || 5;
  const predictedPeriodLength = periodLengths.length > 0 ? Math.round(weightedAverage(periodLengths) * 0.8 + userSetPeriod * 0.2) : userSetPeriod;

  const lastCycle = sorted[sorted.length - 1];
  let predictedStartDate = addDays(lastCycle.startDate, predictedCycleLength);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let loopCount = 0;
  while (new Date(predictedStartDate).getTime() < today.getTime() && loopCount < 100) { 
      predictedStartDate = addDays(predictedStartDate, predictedCycleLength);
      loopCount++;
  }
  
  const diffDaysAfterLoop = (new Date(predictedStartDate).getTime() - today.getTime()) / DAY_MS;
  if (diffDaysAfterLoop > 60) {
      predictedStartDate = addDays(today.toISOString().slice(0, 10), 0);
  }

  const predictedEndDate = addDays(predictedStartDate, predictedPeriodLength - 1);

  // Tính Luteal Phase động thay vì fix cứng 14 ngày
  let lutealPhase = 14;
  if (predictedCycleLength <= 24) lutealPhase = 12;
  else if (predictedCycleLength >= 35) lutealPhase = 16;

  const ovulationDate = addDays(predictedStartDate, -lutealPhase);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const pmsWindowStart = addDays(predictedStartDate, -7);
  const pmsWindowEnd = addDays(predictedStartDate, -1);

  // 5. Tính toán Confidence Score dựa theo LunaCare.md (Mục 9.3)
  let fluctuation = 0;
  if (cleanCycleLengths.length >= 2) {
    const max = Math.max(...cleanCycleLengths);
    const min = Math.min(...cleanCycleLengths);
    fluctuation = max - min;
  }

  let confidence: 'low' | 'medium' | 'high' = 'low';
  let confidenceScore = 40;

  if (sorted.length < 3) {
    confidence = 'low';
    confidenceScore = 30;
    modifierNotes.push("Dự đoán có độ tin cậy thấp do chưa đủ dữ liệu 3 chu kỳ.");
  } else if (fluctuation > 9) {
    confidence = 'low';
    confidenceScore = 40;
    modifierNotes.push("Chu kỳ của bạn biến động khá lớn (>9 ngày), độ tin cậy dự đoán thấp.");
  } else if (fluctuation >= 4 && fluctuation <= 9) {
    confidence = 'medium';
    confidenceScore = 65;
  } else {
    confidence = 'high';
    confidenceScore = 90;
  }

  // Tăng confidence Rụng trứng nếu có dấu hiệu LH/BBT
  const hasOvulationSigns = recentLogs.some(log => log.ovulation_signs && log.ovulation_signs.length > 0);
  if (hasOvulationSigns) {
    confidenceScore = Math.min(100, confidenceScore + 10);
    if (confidence === 'low' && confidenceScore >= 50) confidence = 'medium';
    modifierNotes.push("Dự đoán ngày rụng trứng chính xác hơn nhờ các dấu hiệu nhận biết rụng trứng của bạn.");
  }

  // Tăng confidence PMS nếu có nhiều log triệu chứng
  const hasManySymptoms = recentLogs.filter(log => log.symptoms && log.symptoms.length > 0).length >= 3;
  if (hasManySymptoms) {
    confidenceScore = Math.min(100, confidenceScore + 5);
    if (confidence === 'low' && confidenceScore >= 50) confidence = 'medium';
    modifierNotes.push("Dự đoán hội chứng tiền kinh nguyệt (PMS) đáng tin cậy hơn nhờ dữ liệu triệu chứng của bạn.");
  }

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
    confidence,
    confidenceScore,
    notes: modifierNotes.length > 0 ? modifierNotes : ["Dự đoán hoạt động ổn định."]
  };
}
