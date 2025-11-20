export interface TimeData {
  totalAvailable: number; // Usually waking hours (e.g., 16)
  socialMedia: number;
  procrastination: number;
  fear: number; // Hesitation/Worry
}

export interface AdviceResponse {
  analysis: string;
  tips: string[];
  score: number; // 0-100 efficiency score
}

export const DEFAULT_TIME_DATA: TimeData = {
  totalAvailable: 16,
  socialMedia: 3,
  procrastination: 2,
  fear: 2,
};
