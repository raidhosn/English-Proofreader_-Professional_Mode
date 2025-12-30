
export interface ComparisonResult {
  original: string;
  proofread: string;
}

export enum AppScreen {
  SPLASH = 'splash',
  CHAT = 'chat',
  RESULT = 'result'
}

export interface HistoryItem {
  id: string;
  original: string;
  proofread: string;
  timestamp: number;
}
