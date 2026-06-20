import { Cycle, CyclePrediction } from './cycle.types';
import { useProfileStore } from '../../store/useProfileStore';

export async function predictCycleWithAI(cycles: Cycle[]): Promise<CyclePrediction | null> {
  const profileState = useProfileStore.getState();
  const healthProfile = profileState.profile?.healthProfile;

  if (!cycles || cycles.length === 0) {
    return null;
  }

  try {
    const response = await fetch('/api/predict', {
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
    return prediction;

  } catch (err: any) {
    console.error("AI Prediction Error:", err);
    throw new Error(err.message || "Lỗi không xác định từ Backend AI");
  }
}
