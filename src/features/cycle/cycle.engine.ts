import { Cycle, CyclePrediction } from './cycle.types';

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

function getCycleLengths(cycles: Cycle[]): number[] {
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const lengths: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);

    if (diff >= 15 && diff <= 60) {
      lengths.push(diff);
    }
  }

  return lengths;
}

function getPeriodLengths(cycles: Cycle[]): number[] {
  return cycles
    .filter(cycle => cycle.endDate)
    .map(cycle => daysBetween(cycle.startDate, cycle.endDate as string) + 1)
    .filter(length => length >= 1 && length <= 14);
}

function weightedAverage(values: number[]): number {
  if (!values.length) return 0;

  const totalWeight = values.reduce((sum, _, index) => sum + index + 1, 0);

  const weightedSum = values.reduce((sum, value, index) => {
    return sum + value * (index + 1);
  }, 0);

  return Math.round(weightedSum / totalWeight);
}

function calculateConfidence(lengths: number[]): {
  confidence: "low" | "medium" | "high";
  score: number;
  notes: string[];
} {
  const notes: string[] = [];

  if (lengths.length < 3) {
    notes.push("Cần thêm ít nhất 3 chu kỳ để dự đoán chính xác hơn.");
    return { confidence: "low", score: 35, notes };
  }

  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const variability = max - min;

  if (variability <= 3) {
    return { confidence: "high", score: 85, notes };
  }

  if (variability <= 9) {
    notes.push("Chu kỳ có dao động nhẹ, dự đoán ở mức trung bình.");
    return { confidence: "medium", score: 65, notes };
  }

  notes.push("Chu kỳ dao động nhiều, dự đoán chỉ mang tính tham khảo.");
  return { confidence: "low", score: 45, notes };
}

export function predictCycle(cycles: Cycle[]): CyclePrediction {
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  if (!sorted.length) {
    return {
      predictedStartDate: null,
      predictedEndDate: null,
      predictedCycleLength: null,
      predictedPeriodLength: null,
      ovulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      pmsWindowStart: null,
      pmsWindowEnd: null,
      confidence: "low",
      confidenceScore: 0,
      notes: ["Chưa có dữ liệu kỳ kinh."]
    };
  }

  const cycleLengths = getCycleLengths(sorted);
  const periodLengths = getPeriodLengths(sorted);

  const predictedCycleLength =
    cycleLengths.length > 0 ? weightedAverage(cycleLengths) : 28;

  const predictedPeriodLength =
    periodLengths.length > 0 ? weightedAverage(periodLengths) : 5;

  const confidenceResult = calculateConfidence(cycleLengths);

  const lastCycle = sorted[sorted.length - 1];

  const predictedStartDate = addDays(lastCycle.startDate, predictedCycleLength);
  const predictedEndDate = addDays(predictedStartDate, predictedPeriodLength - 1);

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
    confidence: confidenceResult.confidence,
    confidenceScore: confidenceResult.score,
    notes: confidenceResult.notes
  };
}
