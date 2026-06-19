export type Cycle = {
  startDate: string;
  endDate?: string;
};

export type CyclePrediction = {
  predictedStartDate: string | null;
  predictedEndDate: string | null;
  predictedCycleLength: number | null;
  predictedPeriodLength: number | null;
  ovulationDate: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  pmsWindowStart: string | null;
  pmsWindowEnd: string | null;
  confidence: "low" | "medium" | "high";
  confidenceScore: number;
  notes: string[];
};

export type PeriodEvent = {
  id: string;
  userId: string;
  startDate: string;
  endDate?: string;
  flowLevel?: string;
  symptoms?: string[];
  moods?: string[];
  notes?: string;
  isConfirmed?: boolean;
  createdAt: string;
  updatedAt: string;
};
