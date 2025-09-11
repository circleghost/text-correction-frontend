// API service for text correction backend communication

import type {
  TextProcessingResult,
  BatchProcessingResult,
  GoogleDocsImport,
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
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    console.group(`%c🚀 API Request [${requestId}]`, 'color: #4CAF50; font-weight: bold;');
    console.log('📤 URL:', url);
    console.log('📝 Method:', options.method || 'GET');
    
    if (options.body) {
      try {
        const bodyData = JSON.parse(options.body as string);
        console.log('📦 Request Body:', bodyData);
      } catch {
        console.log('📦 Request Body:', options.body);
      }
    }
    
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;
      clearTimeout(timeoutId);

      console.log(`⏱️ Response Time: ${duration}ms`);
      console.log('📊 Status:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        console.groupEnd();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📥 Response Data:', responseData);
      console.groupEnd();
      
      return responseData;
    } catch (error) {
      const duration = Date.now() - startTime;
      clearTimeout(timeoutId);
      
      console.error(`❌ Request Failed after ${duration}ms:`, error);
      console.groupEnd();
      
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
    console.log(`%c📝 Starting batch correction for ${paragraphs.length} paragraphs`, 'color: #2196F3; font-weight: bold;');
    
    const result = await this.makeRequest<BatchProcessingResult>('/text/batch-correct', {
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

    console.log(`%c✅ Batch correction completed`, 'color: #4CAF50; font-weight: bold;', result);
    return result;
  }

  // Google Docs import API
  async importGoogleDoc(docUrl: string): Promise<GoogleDocsImport> {
    return this.makeRequest<GoogleDocsImport>('/google-docs/import', {
      method: 'POST',
      body: JSON.stringify({
        url: docUrl,
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