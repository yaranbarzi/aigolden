export interface SubtitleItem {
  id: number;
  startTime: string;
  endTime: string;
  sourceText: string;
  translatedText: string;
  status: 'pending' | 'translating' | 'completed' | 'error';
  errorMessage?: string;
}

export interface GlossaryItem {
  id: string;
  source: string;
  target: string;
}

export interface LogItem {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface SavedSession {
  fileName: string;
  totalLines: number;
  translatedCount: number;
  subtitles: SubtitleItem[];
  glossary: GlossaryItem[];
  apiKey: string;
  targetLanguage: string;
  translationStyle: string;
  savedAt: string;
}