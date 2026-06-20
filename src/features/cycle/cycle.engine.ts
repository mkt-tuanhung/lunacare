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

  if (sorted.length < 2) {
    // CHƯA ĐỦ DỮ LIỆU LỊCH SỬ (Dưới 2 chu kỳ -> không tính được cycle length)
    if (healthProfile?.lastPeriodDate && healthProfile?.cycleLength) {
      let predictedCycleLength = parseInt(String(healthProfile.cycleLength)) || 28;
      let predictedPeriodLength = parseInt(String(healthProfile.periodDuration)) || 5;

      let pStartDate = addDays(healthProfile.lastPeriodDate, predictedCycleLength);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      let loopCount = 0;
      while (new Date(pStartDate).getTime() < today.getTime() && loopCount < 100) { 
          pStartDate = addDays(pStartDate, predictedCycleLength);
          loopCount++;
      }
      
      const pEndDate = addDays(pStartDate, predictedPeriodLength - 1);
      
      // Theo PRD 9.2:
      // Ovulation date = next period start - 14 ngày.
      const ovDate = addDays(pStartDate, -14); 
      
      // Fertile window = ovulation date - 5 ngày đến ovulation date + 1 ngày.
      const fertileStart = addDays(ovDate, -5);
      const fertileEnd = addDays(ovDate, 1);
      
      // PMS window = next period start - 7 ngày đến next period start - 1 ngày.
      const pmsStart = addDays(pStartDate, -7);
      const pmsEnd = addDays(pStartDate, -1);
      
      return {
        predictedStartDate: pStartDate,
        predictedEndDate: pEndDate,
        predictedCycleLength,
        predictedPeriodLength,
        ovulationDate: ovDate,
        fertileWindowStart: fertileStart,
        fertileWindowEnd: fertileEnd,
        pmsWindowStart: pmsStart,
        pmsWindowEnd: pmsEnd,
        confidence: "low",
        confidenceScore: 30, // Dưới 3 chu kỳ -> Low
        notes: dailyAdvice.length > 0 ? [...dailyAdvice] : ["Dự đoán dựa trên dữ liệu khai báo ban đầu."]
      };
    }

    return {
      predictedStartDate: null, predictedEndDate: null, predictedCycleLength: null, predictedPeriodLength: null,
      ovulationDate: null, fertileWindowStart: null, fertileWindowEnd: null, pmsWindowStart: null, pmsWindowEnd: null,
      confidence: "low", confidenceScore: 0, notes: ["Chưa đủ dữ liệu dự đoán."]
    };
  }

  // PRD 9.1:
  // 1. Lấy lịch sử kỳ kinh. (Đã lấy ở trên)
  // 2. Tính độ dài từng chu kỳ.
  let rawCycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    rawCycleLengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }
  
  // 3. Loại outlier.
  const cleanCycleLengths = filterOutliers(rawCycleLengths);
  
  // 4. Dùng weighted average, chu kỳ gần nhất có trọng số cao hơn.
  let predictedCycleLength = cleanCycleLengths.length > 0 
    ? weightedAverage(cleanCycleLengths) 
    : (parseInt(String(healthProfile?.cycleLength)) || 28);
    
  // Tính độ dài ngày hành kinh trung bình
  const periodLengths = sorted.filter(c => c.endDate).map(c => daysBetween(c.startDate, c.endDate as string) + 1);
  const predictedPeriodLength = periodLengths.length > 0 ? weightedAverage(periodLengths) : (parseInt(String(healthProfile?.periodDuration)) || 5);

  const lastCycle = sorted[sorted.length - 1];
  
  // PRD 9.2: Next period start = last period start + predicted cycle length.
  let predictedStartDate = addDays(lastCycle.startDate, predictedCycleLength);
  
  // Nếu ngày dự đoán nằm trong quá khứ, chạy loop để lấy chu kỳ tiếp theo trong tương lai
  const today = new Date();
  today.setHours(0,0,0,0);
  let loopCount = 0;
  while (new Date(predictedStartDate).getTime() < today.getTime() && loopCount < 100) { 
      predictedStartDate = addDays(predictedStartDate, predictedCycleLength);
      loopCount++;
  }

  const predictedEndDate = addDays(predictedStartDate, predictedPeriodLength - 1);

  // PRD 9.2: Ovulation date ≈ next period start - 14 ngày.
  const ovulationDate = addDays(predictedStartDate, -14);
  
  // PRD 9.2: Fertile window = ovulation date - 5 ngày đến ovulation date + 1 ngày.
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  
  // PRD 9.2: PMS window = next period start - 7 ngày đến next period start - 1 ngày.
  const pmsWindowStart = addDays(predictedStartDate, -7);
  const pmsWindowEnd = addDays(predictedStartDate, -1);

  // PRD 9.3: Confidence
  // 5. Tính độ biến động.
  let fluctuation = 0;
  if (cleanCycleLengths.length >= 2) {
    const max = Math.max(...cleanCycleLengths);
    const min = Math.min(...cleanCycleLengths);
    fluctuation = max - min;
  }

  let confidence: 'low' | 'medium' | 'high' = 'low';
  let confidenceScore = 40;
  let modifierNotes = [];

  if (sorted.length < 3) {
    confidence = 'low';
    confidenceScore = 30;
    modifierNotes.push("Dự đoán có độ tin cậy thấp do có dưới 3 chu kỳ.");
  } else if (fluctuation > 9) {
    confidence = 'low';
    confidenceScore = 40;
    modifierNotes.push("Chu kỳ của bạn biến động lớn (>9 ngày), độ tin cậy thấp.");
  } else if (fluctuation >= 4 && fluctuation <= 9) {
    confidence = 'medium';
    confidenceScore = 65;
  } else {
    confidence = 'high';
    confidenceScore = 90;
  }

  // Tăng confidence rụng trứng nếu có dữ liệu LH/BBT
  const hasOvulationSigns = recentLogs.some(log => log.ovulation_signs && log.ovulation_signs.length > 0);
  if (hasOvulationSigns) {
    confidenceScore = Math.min(100, confidenceScore + 10);
    if (confidence === 'low' && confidenceScore >= 50) confidence = 'medium';
    modifierNotes.push("Dự đoán ngày rụng trứng chính xác hơn nhờ dữ liệu nhận biết rụng trứng.");
  }

  // Tăng confidence PMS nếu có nhiều log triệu chứng
  const hasManySymptoms = recentLogs.filter(log => log.symptoms && log.symptoms.length > 0).length >= 3;
  if (hasManySymptoms) {
    confidenceScore = Math.min(100, confidenceScore + 5);
    if (confidence === 'low' && confidenceScore >= 50) confidence = 'medium';
  }

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
    notes: modifierNotes.length > 0 ? modifierNotes : ["Dự đoán hoạt động dựa trên lịch sử của bạn."]
  };
}
