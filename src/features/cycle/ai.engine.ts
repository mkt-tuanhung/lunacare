import { Cycle, CyclePrediction } from './cycle.types';
import { addDays } from './cycle.engine';
import type { HealthProfile } from '../../store/useProfileStore';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export async function predictCycleWithAI(cycles: Cycle[], healthProfile?: HealthProfile | null): Promise<CyclePrediction | null> {
  if (!cycles || cycles.length === 0) return null;

  if (!API_BASE) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL chưa được cấu hình. AI Mode chỉ hoạt động khi có backend URL.');
  }

  try {
    const response = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cycles, healthProfile })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi kết nối Backend Vercel');
    }

    const prediction: CyclePrediction = data;
    
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

    // Backfill current cycle fields nếu AI backend chưa trả về
    // Tính từ chu kỳ cuối cùng trong danh sách
    if (!prediction.currentOvulationDate && prediction.predictedStartDate && prediction.predictedCycleLength) {
      const sortedCycles = [...cycles].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      const lastCycle = sortedCycles[sortedCycles.length - 1];
      if (lastCycle) {
        const curNextPeriod = addDays(lastCycle.startDate, prediction.predictedCycleLength);
        const curOvDate = addDays(curNextPeriod, -14);
        prediction.currentOvulationDate = curOvDate;
        prediction.currentFertileWindowStart = addDays(curOvDate, -5);
        prediction.currentFertileWindowEnd = addDays(curOvDate, 1);
        prediction.currentPmsWindowStart = addDays(curNextPeriod, -7);
        prediction.currentPmsWindowEnd = addDays(curNextPeriod, -1);
      }
    }

    return prediction;

  } catch (err: any) {
    console.error("AI Prediction Error:", err);
    throw new Error(err.message || "Lỗi không xác định từ Backend AI");
  }
}
