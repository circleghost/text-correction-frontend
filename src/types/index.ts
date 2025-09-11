// Core application types for AI Text Correction

export interface TextInput {
  content: string;
  type: 'direct' | 'google-docs';
  url?: string;
}

export interface TextCorrection {
  original: string;
  corrected: string;
  position: {
    start: number;
    end: number;
  };
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  confidence?: number;
}

export interface Paragraph {
  id: string;
  text: string;
  correctedText?: string;
  corrections: TextCorrection[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  processingTime?: string;
  error?: string;
}

export interface TextProcessingResult {
  success: boolean;
  data?: {
    correctedText: string;
    corrections: TextCorrection[];
    statistics: {
      totalChars: number;
      correctionCount: number;
      processingTime: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

export interface BatchProcessingResult {
  success: boolean;
  data?: {
    results: Array<{
      paragraphId: string;
      status: 'completed' | 'error';
      correctedText?: string;
      corrections?: TextCorrection[];
      processingTime?: string;
      error?: string;
    }>;
    summary: {
      totalParagraphs: number;
      completedCount: number;
      totalCorrections: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

export interface GoogleDocsImport {
  success: boolean;
  data?: {
    title: string;
    content: string;
    paragraphs: Array<{
      id: string;
      text: string;
      style: string;
    }>;
    metadata: {
      lastModified: string;
      wordCount: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

// Application state types
export interface AppState {
  // Input state
  inputMethod: 'direct' | 'google-docs';
  inputText: string;
  googleDocsUrl: string;
  
  // Processing state
  isProcessing: boolean;
  processingProgress: number;
  currentParagraphIndex: number;
  
  // Results state
  paragraphs: Paragraph[];
  isCompleted: boolean;
  
  // UI state
  showAnimation: boolean;
  animationSpeed: number;
  
  // Error state
  error: string | null;
}

// Component props types
export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
}

export interface ProgressIndicatorProps {
  progress: number;
  currentStep?: string;
  totalSteps?: number;
  isAnimated?: boolean;
}

export interface TextComparisonProps {
  original: string;
  corrected: string;
  corrections: TextCorrection[];
  showAnimation?: boolean;
  onAnimationComplete?: () => void;
}

export interface FlowAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isPlaying?: boolean;
}

// API configuration types
export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

// Theme and styling types
export interface ThemeConfig {
  colors: {
    primary: string;
    success: string;
    error: string;
    warning: string;
  };
  fonts: {
    title: string;
    body: string;
    mono: string;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: string;
  };
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];