import { predictCycle, addDays } from './cycle.engine';
import { Cycle } from './cycle.types';

describe('Cycle Prediction Engine', () => {
  it('should return nulls if no cycles provided', () => {
    const result = predictCycle([]);
    expect(result.confidence).toBe('low');
    expect(result.predictedStartDate).toBeNull();
  });

  it('should predict correctly for regular 28 day cycle', () => {
    const today = new Date();
    const cycle1Start = addDays(today.toISOString(), -56);
    const cycle2Start = addDays(cycle1Start, 28);
    const cycle3Start = addDays(cycle2Start, 28);
    
    const cycles: Cycle[] = [
      { startDate: cycle1Start.split('T')[0] },
      { startDate: cycle2Start.split('T')[0] },
      { startDate: cycle3Start.split('T')[0] }
    ];

    const result = predictCycle(cycles);
    const expectedNext = addDays(cycle3Start, 28).split('T')[0];

    expect(result.predictedStartDate).toBe(expectedNext);
    expect(result.confidence).toBe('high');
  });
});
