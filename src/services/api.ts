// API service for text correction backend communication

import type {
  TextProcessingResult,
  BatchProcessingResult,
  GoogleDocsImport,
  TextCorrection,
} from '@/types';

class APIService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
    this.timeout = 30000; // 30 seconds
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  // Text correction API
  async correctText(text: string, options?: {
    language?: string;
    preserveFormatting?: boolean;
    correctionLevel?: 'basic' | 'standard' | 'advanced';
  }): Promise<TextProcessingResult> {
    return this.makeRequest<TextProcessingResult>('/text/correct', {
      method: 'POST',
      body: JSON.stringify({
        text,
        options: {
          language: 'zh-TW',
          preserveFormatting: true,
          correctionLevel: 'standard',
          ...options,
        },
      }),
    });
  }

  // Batch paragraph correction API
  async correctParagraphs(paragraphs: Array<{
    id: string;
    text: string;
  }>, options?: {
    language?: string;
    concurrent?: number;
  }): Promise<BatchProcessingResult> {
    return this.makeRequest<BatchProcessingResult>('/text/batch-correct', {
      method: 'POST',
      body: JSON.stringify({
        paragraphs,
        options: {
          language: 'zh-TW',
          concurrent: 3,
          ...options,
        },
      }),
    });
  }

  // Google Docs import API
  async importGoogleDoc(docUrl: string): Promise<GoogleDocsImport> {
    return this.makeRequest<GoogleDocsImport>('/google-docs/import', {
      method: 'POST',
      body: JSON.stringify({
        docUrl,
      }),
    });
  }

  // Health check API
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const apiService = new APIService();

// Export class for testing or custom instances
export default APIService;