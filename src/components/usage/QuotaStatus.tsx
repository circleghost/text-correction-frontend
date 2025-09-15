import React, { useEffect, useState, useRef } from 'react';
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
  const [animatedPercentages, setAnimatedPercentages] = useState<{ [key: string]: number }>({});
  const [showDetails, setShowDetails] = useState(false);
  const animationTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    fetchQuotaStatus();
  }, []);

  // Animate progress bars when quotas update
  useEffect(() => {
    quotas.forEach((quota) => {
      const key = quota.type;
      // Clear existing timeout
      if (animationTimeoutRef.current[key]) {
        clearTimeout(animationTimeoutRef.current[key]);
      }
      
      // Start from 0 and animate to target percentage
      setAnimatedPercentages(prev => ({ ...prev, [key]: 0 }));
      
      animationTimeoutRef.current[key] = setTimeout(() => {
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const stepValue = quota.percentageUsed / steps;
        let currentStep = 0;
        
        const animateStep = () => {
          currentStep++;
          const newPercentage = Math.min(stepValue * currentStep, quota.percentageUsed);
          setAnimatedPercentages(prev => ({ ...prev, [key]: newPercentage }));
          
          if (currentStep < steps && newPercentage < quota.percentageUsed) {
            setTimeout(animateStep, duration / steps);
          }
        };
        
        animateStep();
      }, 200); // Delay start
    });

    // Cleanup timeouts on unmount
    return () => {
      Object.values(animationTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [quotas]);

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

  const getProgressBarGradient = (percentageUsed: number, isExceeded: boolean): string => {
    if (isExceeded) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percentageUsed >= 80) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  const getStatusIcon = (quota: QuotaInfo) => {
    if (quota.isExceeded) {
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (quota.percentageUsed >= 80) {
      return (
        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const getRemainingTimeColor = (quota: QuotaInfo): string => {
    const now = new Date();
    const diff = quota.resetDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 1) return 'text-red-400';
    if (days <= 3) return 'text-yellow-400';
    return 'text-gray-400';
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

      <div className="space-y-6">
        {quotas.map((quota) => {
          const animatedPercentage = animatedPercentages[quota.type] || 0;
          return (
            <div 
              key={quota.type} 
              className={`space-y-3 p-4 rounded-lg border transition-all duration-300 ${
                quota.isExceeded 
                  ? 'bg-red-500/5 border-red-500/30' 
                  : quota.percentageUsed >= 80 
                  ? 'bg-yellow-500/5 border-yellow-500/30'
                  : 'bg-green-500/5 border-green-500/20'
              }`}
            >
              {/* Header with icon and title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(quota)}
                  <span className="text-gray-200 text-sm font-medium">
                    {formatQuotaType(quota.type)}
                  </span>
                  {quota.isExceeded && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full animate-pulse">
                      超限
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${getRemainingTimeColor(quota)}`}>
                  {formatResetDate(quota.resetDate)}
                </span>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {formatNumber(quota.used)} / {formatNumber(quota.limit)}
                  </span>
                  <span className={`font-medium ${quota.isExceeded ? 'text-red-400' : 'text-green-400'}`}>
                    {animatedPercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="relative">
                  {/* Background track */}
                  <div className="w-full bg-gray-700/30 rounded-full h-3 shadow-inner">
                    {/* Animated progress bar with gradient */}
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden ${getProgressBarGradient(quota.percentageUsed, quota.isExceeded)}`}
                      style={{ width: `${Math.min(animatedPercentage, 100)}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
                    </div>
                    
                    {/* Overflow indicator for exceeded quotas */}
                    {quota.isExceeded && animatedPercentage >= 100 && (
                      <div className="absolute right-0 top-0 h-3 w-2 bg-red-600 rounded-r-full animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Progress markers */}
                  <div className="absolute top-0 left-1/2 w-px h-3 bg-gray-600/50"></div>
                  <div className="absolute top-0 left-3/4 w-px h-3 bg-gray-600/50"></div>
                </div>
              </div>
              
              {/* Status and details */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {quota.isExceeded ? (
                    <span className="text-red-400 font-medium">已超出限制</span>
                  ) : (
                    <span className="text-gray-400">
                      剩餘 <span className="text-green-400 font-medium">{formatNumber(quota.remaining)}</span>
                    </span>
                  )}
                </div>
                
                {showDetails && (
                  <div className="text-gray-500">
                    {quota.type === 'monthly_corrections' && '校正次數'}
                    {quota.type === 'monthly_characters' && '字元處理'}
                    {quota.type === 'monthly_requests' && '月度請求'}
                    {quota.type === 'daily_requests' && '日度請求'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
      
      {/* Enhanced Footer Controls */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center space-x-1"
          >
            <span>{showDetails ? '隱藏詳情' : '顯示詳情'}</span>
            <svg 
              className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={fetchQuotaStatus}
            className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重新整理</span>
          </button>
        </div>
        
        {/* Summary stats when showing details */}
        {showDetails && quotas.length > 0 && (
          <div className="pt-3 border-t border-green-500/20">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-2 bg-black/20 rounded">
                <div className="text-green-400 font-medium">
                  {quotas.filter(q => !q.isExceeded).length}/{quotas.length}
                </div>
                <div className="text-gray-400">正常配額</div>
              </div>
              <div className="text-center p-2 bg-black/20 rounded">
                <div className="text-yellow-400 font-medium">
                  {quotas.filter(q => q.percentageUsed >= 80 && !q.isExceeded).length}
                </div>
                <div className="text-gray-400">接近上限</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotaStatus;