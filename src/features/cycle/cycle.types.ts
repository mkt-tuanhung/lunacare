export type Cycle = {
  startDate: string;
  endDate?: string;
};

export type CyclePrediction = {
  // Kỳ kinh tiếp theo (tương lai)
  predictedStartDate: string | null;
  predictedEndDate: string | null;
  predictedCycleLength: number | null;
  predictedPeriodLength: number | null;
  // Ngày rụng trứng & cửa sổ thụ thai của chu kỳ HIỆN TẠI đang chạy
  currentOvulationDate: string | null;
  currentFertileWindowStart: string | null;
  currentFertileWindowEnd: string | null;
  currentPmsWindowStart: string | null;
  currentPmsWindowEnd: string | null;
  // Ngày rụng trứng & cửa sổ thụ thai của kỳ TIẾP THEO (để hiển thị trên lịch tháng tới)
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
