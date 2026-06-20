import { Cycle, CyclePrediction } from './cycle.types';

const DAY_MS = 1000 * 60 * 60 * 24;

interface HealthProfileSnapshot {
  lastPeriodDate?: string | null;
  cycleLength?: number | string;
  periodDuration?: number | string;
  stressLevel?: string;
}

// Dùng local time để tránh lệch ngày do UTC offset (UTC+7)
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const start = new Date(ay, am - 1, ad).getTime();
  const end = new Date(by, bm - 1, bd).getTime();
  return Math.round((end - start) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const result = new Date(y, m - 1, d + days);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
}

function calculateMeanAndStdDev(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev };
}

function filterOutliers(lengths: number[]): number[] {
  if (lengths.length < 3) return lengths.filter(l => l >= 15 && l <= 60);
  const { mean, stdDev } = calculateMeanAndStdDev(lengths);
  return lengths.filter(l => l >= mean - 2 * stdDev && l <= mean + 2 * stdDev && l >= 15 && l <= 60);
}

function weightedAverage(values: number[]): number {
  if (!values.length) return 0;
  const totalWeight = values.reduce((sum, _, index) => sum + index + 1, 0);
  const weightedSum = values.reduce((sum, value, index) => sum + value * (index + 1), 0);
  return Math.round(weightedSum / totalWeight);
}

// healthProfile is passed in by the caller (useCycleStore) — never read from store inside a pure function
export function predictCycle(
  cycles: Cycle[],
  recentLogs: any[] = [],
  healthProfile: HealthProfileSnapshot | null = null
): CyclePrediction {
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  let dailyAdvice: string[] = [];
  if (healthProfile && recentLogs.length > 0) {
    const latestLog = recentLogs[0];

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
    // Ưu tiên dùng startDate của chu kỳ thực tế nếu có (dù chỉ 1 chu kỳ)
    // Fallback sang lastPeriodDate từ healthProfile nếu chưa có chu kỳ nào
    const baseDate = sorted.length === 1
      ? sorted[0].startDate
      : (healthProfile?.lastPeriodDate ?? null);

    if (baseDate) {
      const predictedCycleLength = parseInt(String(healthProfile?.cycleLength)) || 28;
      const predictedPeriodLength = parseInt(String(healthProfile?.periodDuration)) || 5;

      // Tính chu kỳ hiện tại từ baseDate (chu kỳ thực tế gần nhất)
      const curNextPeriod = addDays(baseDate, predictedCycleLength);
      const curOvDate = addDays(curNextPeriod, -14);
      const curFertileStart = addDays(curOvDate, -5);
      const curFertileEnd = addDays(curOvDate, 1);
      const curPmsStart = addDays(curNextPeriod, -7);
      const curPmsEnd = addDays(curNextPeriod, -1);

      // Tìm kỳ tiếp theo luôn ở tương lai (tính từ curNextPeriod, không từ baseDate)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let pStartDate = curNextPeriod;
      let loopCount = 0;
      while (new Date(pStartDate).getTime() <= today.getTime() && loopCount < 100) {
        pStartDate = addDays(pStartDate, predictedCycleLength);
        loopCount++;
      }

      const pEndDate = addDays(pStartDate, predictedPeriodLength - 1);
      const ovDate = addDays(pStartDate, -14);
      const fertileStart = addDays(ovDate, -5);
      const fertileEnd = addDays(ovDate, 1);
      const pmsStart = addDays(pStartDate, -7);
      const pmsEnd = addDays(pStartDate, -1);

      return {
        predictedStartDate: pStartDate,
        predictedEndDate: pEndDate,
        predictedCycleLength,
        predictedPeriodLength,
        currentOvulationDate: curOvDate,
        currentFertileWindowStart: curFertileStart,
        currentFertileWindowEnd: curFertileEnd,
        currentPmsWindowStart: curPmsStart,
        currentPmsWindowEnd: curPmsEnd,
        ovulationDate: ovDate,
        fertileWindowStart: fertileStart,
        fertileWindowEnd: fertileEnd,
        pmsWindowStart: pmsStart,
        pmsWindowEnd: pmsEnd,
        confidence: 'low',
        confidenceScore: 30,
        notes: dailyAdvice.length > 0 ? [...dailyAdvice] : ['Dự đoán dựa trên dữ liệu khai báo ban đầu.'],
      };
    }

    return {
      predictedStartDate: null, predictedEndDate: null, predictedCycleLength: null, predictedPeriodLength: null,
      currentOvulationDate: null, currentFertileWindowStart: null, currentFertileWindowEnd: null,
      currentPmsWindowStart: null, currentPmsWindowEnd: null,
      ovulationDate: null, fertileWindowStart: null, fertileWindowEnd: null, pmsWindowStart: null, pmsWindowEnd: null,
      confidence: 'low', confidenceScore: 0, notes: ['Chưa đủ dữ liệu dự đoán.'],
    };
  }

  let rawCycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    rawCycleLengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }

  const cleanCycleLengths = filterOutliers(rawCycleLengths);

  const predictedCycleLength = cleanCycleLengths.length > 0
    ? weightedAverage(cleanCycleLengths)
    : (parseInt(String(healthProfile?.cycleLength)) || 28);

  const periodLengths = sorted.filter(c => c.endDate).map(c => daysBetween(c.startDate, c.endDate as string) + 1);
  const predictedPeriodLength = periodLengths.length > 0
    ? weightedAverage(periodLengths)
    : (parseInt(String(healthProfile?.periodDuration)) || 5);

  const lastCycle = sorted[sorted.length - 1];

  // Tính ngày rụng trứng & cửa sổ thụ thai của chu kỳ HIỆN TẠI đang chạy
  // (tính từ lastCycle.startDate, không phải từ predictedStartDate)
  const currentNextPeriodFromLast = addDays(lastCycle.startDate, predictedCycleLength);
  const currentOvulationDate = addDays(currentNextPeriodFromLast, -14);
  const currentFertileWindowStart = addDays(currentOvulationDate, -5);
  const currentFertileWindowEnd = addDays(currentOvulationDate, 1);
  const currentPmsWindowStart = addDays(currentNextPeriodFromLast, -7);
  const currentPmsWindowEnd = addDays(currentNextPeriodFromLast, -1);

  // Tính kỳ kinh TIẾP THEO (luôn ở tương lai so với hôm nay)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let predictedStartDate = currentNextPeriodFromLast;
  let loopCount = 0;
  while (new Date(predictedStartDate).getTime() <= today.getTime() && loopCount < 100) {
    predictedStartDate = addDays(predictedStartDate, predictedCycleLength);
    loopCount++;
  }

  const predictedEndDate = addDays(predictedStartDate, predictedPeriodLength - 1);
  const ovulationDate = addDays(predictedStartDate, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const pmsWindowStart = addDays(predictedStartDate, -7);
  const pmsWindowEnd = addDays(predictedStartDate, -1);

  let fluctuation = 0;
  if (cleanCycleLengths.length >= 2) {
    fluctuation = Math.max(...cleanCycleLengths) - Math.min(...cleanCycleLengths);
  }

  let confidence: 'low' | 'medium' | 'high' = 'low';
  let confidenceScore = 40;
  let modifierNotes: string[] = [];

  if (sorted.length < 3) {
    confidence = 'low';
    confidenceScore = 30;
    modifierNotes.push('Dự đoán có độ tin cậy thấp do có dưới 3 chu kỳ.');
  } else if (fluctuation > 9) {
    confidence = 'low';
    confidenceScore = 40;
    modifierNotes.push('Chu kỳ của bạn biến động lớn (>9 ngày), độ tin cậy thấp.');
  } else if (fluctuation >= 4) {
    confidence = 'medium';
    confidenceScore = 65;
  } else {
    confidence = 'high';
    confidenceScore = 90;
  }

  const hasOvulationSigns = recentLogs.some(log => log.ovulation_signs && log.ovulation_signs.length > 0);
  if (hasOvulationSigns) {
    confidenceScore = Math.min(100, confidenceScore + 10);
    if (confidence === 'low' && confidenceScore >= 50) confidence = 'medium';
    modifierNotes.push('Dự đoán ngày rụng trứng chính xác hơn nhờ dữ liệu nhận biết rụng trứng.');
  }

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
    currentOvulationDate,
    currentFertileWindowStart,
    currentFertileWindowEnd,
    currentPmsWindowStart,
    currentPmsWindowEnd,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    pmsWindowStart,
    pmsWindowEnd,
    confidence,
    confidenceScore,
    notes: modifierNotes.length > 0 ? modifierNotes : ['Dự đoán hoạt động dựa trên lịch sử của bạn.'],
  };
}
