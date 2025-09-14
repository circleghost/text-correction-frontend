import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface UsageData {
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
}

const UsageStats: React.FC = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageStats();
  }, [period]);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUsage(period);
      setUsage({
        ...response.data,
        lastActivity: response.data.lastActivity ? new Date(response.data.lastActivity) : undefined
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatProcessingTime = (ms?: number): string => {
    if (!ms) return '--';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatLastActivity = (date?: Date): string => {
    if (!date) return '未知';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (hours < 24) return `${hours} 小時前`;
    if (days < 30) return `${days} 天前`;
    
    return date.toLocaleDateString('zh-TW');
  };

  const getPeriodLabel = (p: string): string => {
    const labels = {
      day: '今日',
      week: '本週',
      month: '本月',
      all: '總計'
    };
    return labels[p as keyof typeof labels] || p;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, subtitle, icon, color = 'text-green-400' }) => (
    <div className="bg-black/20 backdrop-blur-sm border border-green-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color}`}>{icon}</div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <h4 className="text-sm font-medium text-gray-300 mb-1">{title}</h4>
      {subtitle && (
        <p className="text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-700/50 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-700/50 rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-black/20 backdrop-blur-sm border border-green-500/20 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 bg-gray-700/50 rounded"></div>
                <div className="w-12 h-6 bg-gray-700/50 rounded"></div>
              </div>
              <div className="h-4 bg-gray-700/50 rounded mb-1"></div>
              <div className="h-3 bg-gray-700/50 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-400 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>無法載入使用統計</span>
        </div>
        <p className="text-gray-400 text-sm mb-3">{error}</p>
        <button
          onClick={fetchUsageStats}
          className="text-green-400 hover:text-green-300 text-sm underline"
        >
          重試
        </button>
      </div>
    );
  }

  if (!usage) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-green-400">使用統計</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="bg-black/40 border border-green-500/30 text-green-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-green-400"
        >
          <option value="day">今日</option>
          <option value="week">本週</option>
          <option value="month">本月</option>
          <option value="all">總計</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="請求次數"
          value={formatNumber(period === 'day' ? usage.dailyRequests : 
                            period === 'month' ? usage.monthlyRequests : 
                            usage.totalRequests)}
          subtitle={getPeriodLabel(period)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatCard
          title="處理字元"
          value={formatNumber(period === 'day' ? usage.dailyCharacters : 
                            period === 'month' ? usage.monthlyCharacters : 
                            usage.totalCharacters)}
          subtitle={getPeriodLabel(period)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="text-blue-400"
        />

        <StatCard
          title="Token 使用"
          value={formatNumber(usage.totalTokens)}
          subtitle="累積使用量"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="text-purple-400"
        />

        <StatCard
          title="平均處理時間"
          value={formatProcessingTime(usage.averageProcessingTime)}
          subtitle="每次請求"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="text-yellow-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="錯誤次數"
          value={usage.totalErrors}
          subtitle={`錯誤率: ${usage.totalRequests > 0 ? ((usage.totalErrors / usage.totalRequests) * 100).toFixed(1) : '0'}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color={usage.totalErrors > 0 ? "text-red-400" : "text-green-400"}
        />

        <StatCard
          title="最後活動"
          value={formatLastActivity(usage.lastActivity)}
          subtitle="最近一次使用"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="text-indigo-400"
        />
      </div>

      <button
        onClick={fetchUsageStats}
        className="w-full text-center text-sm text-gray-400 hover:text-green-400 transition-colors py-2"
      >
        重新整理統計
      </button>
    </div>
  );
};

export default UsageStats;