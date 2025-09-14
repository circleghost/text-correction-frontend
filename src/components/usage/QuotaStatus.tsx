import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface QuotaInfo {
  type: 'monthly_corrections' | 'monthly_characters' | 'monthly_requests' | 'daily_requests';
  limit: number;
  used: number;
  remaining: number;
  resetDate: Date;
  tier: 'free' | 'premium' | 'enterprise' | 'admin';
  percentageUsed: number;
  isExceeded: boolean;
}

const QuotaStatus: React.FC = () => {
  const [quotas, setQuotas] = useState<QuotaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotaStatus();
  }, []);

  const fetchQuotaStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuotaStatus();
      setQuotas(response.data.map(quota => ({
        ...quota,
        resetDate: new Date(quota.resetDate)
      })));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch quota status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quota status');
    } finally {
      setLoading(false);
    }
  };

  const formatQuotaType = (type: QuotaInfo['type']): string => {
    const typeMap = {
      monthly_corrections: '每月校正次數',
      monthly_characters: '每月字元數',
      monthly_requests: '每月請求數',
      daily_requests: '每日請求數'
    };
    return typeMap[type];
  };

  const getTierColor = (tier: QuotaInfo['tier']): string => {
    const tierColors = {
      free: 'text-gray-400',
      premium: 'text-blue-400',
      enterprise: 'text-purple-400',
      admin: 'text-gold-400'
    };
    return tierColors[tier];
  };

  const getProgressBarColor = (percentageUsed: number, isExceeded: boolean): string => {
    if (isExceeded) return 'bg-red-500';
    if (percentageUsed >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatResetDate = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 1) return '明天重置';
    if (days <= 7) return `${days} 天後重置`;
    
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    }) + ' 重置';
  };

  if (loading) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700/50 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700/50 rounded"></div>
                <div className="h-2 bg-gray-700/50 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>無法載入配額資訊</span>
        </div>
        <p className="text-gray-400 mt-2 text-sm">{error}</p>
        <button
          onClick={fetchQuotaStatus}
          className="mt-3 text-green-400 hover:text-green-300 text-sm underline"
        >
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-green-400">使用配額狀況</h3>
        {quotas.length > 0 && (
          <span className={`text-sm font-medium ${getTierColor(quotas[0].tier)}`}>
            {quotas[0].tier.toUpperCase()} 方案
          </span>
        )}
      </div>

      <div className="space-y-4">
        {quotas.map((quota) => (
          <div key={quota.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">
                {formatQuotaType(quota.type)}
              </span>
              <span className="text-xs text-gray-400">
                {formatResetDate(quota.resetDate)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(quota.percentageUsed, quota.isExceeded)}`}
                  style={{ width: `${Math.min(quota.percentageUsed, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 min-w-[80px] text-right">
                {formatNumber(quota.used)} / {formatNumber(quota.limit)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={quota.isExceeded ? 'text-red-400' : 'text-gray-400'}>
                {quota.isExceeded ? '已超出限制' : `剩餘 ${formatNumber(quota.remaining)}`}
              </span>
              <span className="text-gray-500">
                {quota.percentageUsed.toFixed(1)}% 已使用
              </span>
            </div>
          </div>
        ))}
      </div>

      {quotas.some(q => q.isExceeded) && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">配額已用完</span>
          </div>
          <p className="text-red-300/80 text-xs mt-1">
            請等待配額重置或升級到更高方案
          </p>
        </div>
      )}
      
      <button
        onClick={fetchQuotaStatus}
        className="mt-4 w-full text-center text-xs text-gray-400 hover:text-green-400 transition-colors"
      >
        重新整理
      </button>
    </div>
  );
};

export default QuotaStatus;