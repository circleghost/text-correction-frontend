// Configuration management for environment variables

interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  requestTimeout: number;
  
  // Application Information
  appName: string;
  appDescription: string;
  appVersion: string;
  
  // Feature Flags
  enableAnimations: boolean;
  enableGoogleDocs: boolean;
  enableExportFeatures: boolean;
  
  // API Limits
  maxTextLength: number;
  maxParagraphs: number;
  
  // Development Settings
  debugMode: boolean;
  mockApi: boolean;
  
  // UI Configuration
  animationSpeed: number;
  theme: 'light' | 'dark';
}

// Helper function to parse boolean environment variables
function parseBool(value: string | undefined, defaultValue: boolean = false): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Helper function to parse number environment variables
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Create configuration object from environment variables
export const config: AppConfig = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  requestTimeout: parseNumber(import.meta.env.VITE_REQUEST_TIMEOUT, 30000),
  
  // Application Information
  appName: import.meta.env.VITE_APP_NAME || 'ÄlyPeck',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'ÄlyPeck AI 錯字檢查器，啄木鳥級精準找出繁中錯字',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  enableAnimations: parseBool(import.meta.env.VITE_ENABLE_ANIMATIONS, true),
  enableGoogleDocs: parseBool(import.meta.env.VITE_ENABLE_GOOGLE_DOCS, true),
  enableExportFeatures: parseBool(import.meta.env.VITE_ENABLE_EXPORT_FEATURES, true),
  
  // API Limits
  maxTextLength: parseNumber(import.meta.env.VITE_MAX_TEXT_LENGTH, 10000),
  maxParagraphs: parseNumber(import.meta.env.VITE_MAX_PARAGRAPHS, 20),
  
  // Development Settings
  debugMode: parseBool(import.meta.env.VITE_DEBUG_MODE, false),
  mockApi: parseBool(import.meta.env.VITE_MOCK_API, false),
  
  // UI Configuration
  animationSpeed: parseNumber(import.meta.env.VITE_ANIMATION_SPEED, 80),
  theme: (import.meta.env.VITE_THEME as 'light' | 'dark') || 'light',
};

// Validation function to check required configuration
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.apiBaseUrl) {
    errors.push('API base URL is required');
  }
  
  if (config.maxTextLength <= 0) {
    errors.push('Max text length must be greater than 0');
  }
  
  if (config.maxParagraphs <= 0) {
    errors.push('Max paragraphs must be greater than 0');
  }
  
  if (config.requestTimeout <= 0) {
    errors.push('Request timeout must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Development helper to log configuration (only in debug mode)
if (config.debugMode) {
  console.group('🔧 Application Configuration');
  console.log('API Base URL:', config.apiBaseUrl);
  console.log('Features:', {
    animations: config.enableAnimations,
    googleDocs: config.enableGoogleDocs,
    export: config.enableExportFeatures,
  });
  console.log('Limits:', {
    maxTextLength: config.maxTextLength,
    maxParagraphs: config.maxParagraphs,
  });
  console.log('Development:', {
    debugMode: config.debugMode,
    mockApi: config.mockApi,
  });
  console.groupEnd();
}