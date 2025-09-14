// API service for text correction backend communication

import { supabase } from '@/config/supabase';
import type {
  TextProcessingResult,
  BatchProcessingResult,
  GoogleDocsImport,
} from '@/types';

class APIService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // 根據環境變量配置 API 基礎 URL
    // 開發環境: http://localhost:3001/api/v1
    // 生產環境: /api/v1 (由 Caddy 代理)
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    this.timeout = 30000; // 30 seconds
    
    console.log('🔧 API Service initialized:', {
      baseURL: this.baseURL,
      environment: import.meta.env.MODE,
      timeout: this.timeout
    });
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Auth session error:', error.message);
      } else if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('🔐 Added auth token to request headers');
      } else {
        console.log('ℹ️ No auth token available - making anonymous request');
      }
    } catch (error) {
      console.warn('Failed to get auth session:', error);
    }

    return headers;
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
      // Get auth headers including JWT token
      const authHeaders = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...authHeaders,
          ...options.headers, // Allow override if needed
        },
      });

      const duration = Date.now() - startTime;
      clearTimeout(timeoutId);

      console.log(`⏱️ Response Time: ${duration}ms`);
      console.log('📊 Status:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        
        // Handle authentication errors
        if (response.status === 401) {
          console.warn('🔐 Authentication required - user needs to log in');
          // You can add custom logic here to redirect to login or show a message
          const errorData = await response.json().catch(() => ({ message: 'Authentication required' }));
          console.groupEnd();
          throw new Error(`Authentication required: ${errorData.message || 'Please log in to continue'}`);
        }
        
        // Handle quota exceeded
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({ message: 'Rate limit exceeded' }));
          console.groupEnd();
          throw new Error(`Usage limit exceeded: ${errorData.message || 'Please try again later'}`);
        }
        
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

  // Usage tracking APIs
  async getCurrentUsage(period: 'day' | 'week' | 'month' | 'all' = 'month'): Promise<{
    success: boolean;
    data: {
      totalRequests: number;
      totalCharacters: number;
      totalTokens: number;
      monthlyRequests: number;
      monthlyCharacters: number;
      dailyRequests: number;
      dailyCharacters: number;
      averageProcessingTime?: number;
      totalErrors: number;
      lastActivity?: Date;
    };
  }> {
    return this.makeRequest(`/usage/current?period=${period}`);
  }

  async getUsageHistory(options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    actionType?: 'correction_request' | 'text_processed' | 'api_call';
  } = {}): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      actionType: string;
      textLength: number;
      tokensUsed?: number;
      createdAt: Date;
      processingTimeMs?: number;
      errorCode?: string;
      featureUsed?: string;
      metadata?: any;
    }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.startDate) params.append('startDate', options.startDate.toISOString());
    if (options.endDate) params.append('endDate', options.endDate.toISOString());
    if (options.actionType) params.append('actionType', options.actionType);

    return this.makeRequest(`/usage/history?${params.toString()}`);
  }

  async getQuotaStatus(): Promise<{
    success: boolean;
    data: Array<{
      type: 'monthly_corrections' | 'monthly_characters' | 'monthly_requests' | 'daily_requests';
      limit: number;
      used: number;
      remaining: number;
      resetDate: Date;
      tier: 'free' | 'premium' | 'enterprise' | 'admin';
      percentageUsed: number;
      isExceeded: boolean;
    }>;
  }> {
    return this.makeRequest('/usage/quota/status');
  }

  async getUsageTrends(period: 'day' | 'week' | 'month' = 'month', groupBy: 'day' | 'week' | 'month' = 'day'): Promise<{
    success: boolean;
    data: Array<{
      period: string;
      totalRequests: number;
      totalCharacters: number;
      totalTokens: number;
      averageProcessingTime: number;
      errorCount: number;
    }>;
  }> {
    return this.makeRequest(`/usage/trends?period=${period}&groupBy=${groupBy}`);
  }
}

// Export singleton instance
export const apiService = new APIService();

// Export class for testing or custom instances
export default APIService;