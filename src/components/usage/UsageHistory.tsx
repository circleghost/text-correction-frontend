import React, { useEffect, useState } from 'react';
import { format, parseISO, subDays, isAfter, isBefore } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { apiService } from '@/services/api';

interface UsageHistoryEntry {
  id: string;
  actionType: string;
  textLength: number;
  tokensUsed?: number;
  createdAt: Date;
  processingTimeMs?: number;
  errorCode?: string;
  featureUsed?: string;
  metadata?: any;
}

const UsageHistory: React.FC = () => {
  const [history, setHistory] = useState<UsageHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });
  
  // Enhanced filtering state
  const [filters, setFilters] = useState({
    actionType: 'all',
    dateRange: 'all',
    searchText: '',
    showErrors: false
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  useEffect(() => {
    fetchUsageHistory();
  }, [pagination.limit, pagination.offset]);

  const fetchUsageHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsageHistory({
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      setHistory(response.data.map(entry => ({
        ...entry,
        createdAt: new Date(entry.createdAt)
      })));
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        hasMore: response.pagination.hasMore
      }));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch usage history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage history');
    } finally {
      setLoading(false);
    }
  };

  const formatActionType = (actionType: string): string => {
    const actionMap: Record<string, string> = {
      correction_request: '文字校正',
      text_processed: '文字處理',
      api_call: 'API 呼叫'
    };
    return actionMap[actionType] || actionType;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatProcessingTime = (ms?: number): string => {
    if (!ms) return '--';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (entry: UsageHistoryEntry): string => {
    if (entry.errorCode) return 'text-red-600 dark:text-red-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = (entry: UsageHistoryEntry): React.ReactNode => {
    if (entry.errorCode) {
      return (
        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const handleRefresh = () => {
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
    setHistory([]);
  };

  // Enhanced filtering and utility functions
  const getFilteredHistory = () => {
    return history.filter(entry => {
      // Action type filter
      if (filters.actionType !== 'all' && entry.actionType !== filters.actionType) {
        return false;
      }
      
      // Error filter
      if (filters.showErrors && !entry.errorCode) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const entryDate = entry.createdAt;
        const now = new Date();
        let dateThreshold;
        
        switch (filters.dateRange) {
          case 'today':
            dateThreshold = subDays(now, 1);
            break;
          case 'week':
            dateThreshold = subDays(now, 7);
            break;
          case 'month':
            dateThreshold = subDays(now, 30);
            break;
          default:
            dateThreshold = null;
        }
        
        if (dateThreshold && isBefore(entryDate, dateThreshold)) {
          return false;
        }
      }
      
      // Text search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const actionType = formatActionType(entry.actionType).toLowerCase();
        const featureUsed = entry.featureUsed?.toLowerCase() || '';
        
        if (!actionType.includes(searchLower) && !featureUsed.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const getChartData = () => {
    const filteredHistory = getFilteredHistory();
    const dailyData = new Map();
    
    filteredHistory.forEach(entry => {
      const date = format(entry.createdAt, 'MM/dd');
      const existing = dailyData.get(date) || { date, requests: 0, characters: 0, avgTime: 0, times: [] };
      
      existing.requests++;
      existing.characters += entry.textLength;
      if (entry.processingTimeMs) {
        existing.times.push(entry.processingTimeMs);
      }
      
      dailyData.set(date, existing);
    });
    
    return Array.from(dailyData.values()).map(item => ({
      ...item,
      avgTime: item.times.length > 0 ? item.times.reduce((a, b) => a + b, 0) / item.times.length : 0
    })).slice(-7); // Last 7 days
  };

  const exportToCSV = () => {
    const filteredHistory = getFilteredHistory();
    const headers = ['時間', '動作類型', '字元數', 'Token 使用', '處理時間', '狀態', '功能', '錯誤代碼'];
    
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(entry => [
        formatDateTime(entry.createdAt),
        formatActionType(entry.actionType),
        entry.textLength,
        entry.tokensUsed || 0,
        formatProcessingTime(entry.processingTimeMs),
        entry.errorCode ? '失敗' : '成功',
        entry.featureUsed || '',
        entry.errorCode || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usage_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading && history.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-6 shadow-lg dark:shadow-none">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700/50 rounded w-32"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700/50 rounded w-16"></div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4 p-3 bg-gray-100 dark:bg-black/20 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700/50 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-red-300 dark:border-red-500/30 rounded-lg p-6 shadow-lg dark:shadow-none">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>無法載入使用歷史</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{error}</p>
        <button
          onClick={fetchUsageHistory}
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm underline"
        >
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-6 shadow-lg dark:shadow-none">
      <div className="space-y-4 mb-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-green-400">使用歷史</h3>
          
          <div className="flex flex-wrap gap-2">
            {/* View mode toggle */}
            <div className="flex bg-gray-200 dark:bg-black/40 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-xs ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-300'}`}
              >
                列表
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded text-xs ${viewMode === 'chart' ? 'bg-green-600 text-white' : 'text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-300'}`}
              >
                圖表
              </button>
            </div>
            
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-300 text-sm flex items-center space-x-1 px-2 py-1 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span>篩選</span>
            </button>
            
            {/* Export button */}
            <button
              onClick={exportToCSV}
              className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-300 text-sm flex items-center space-x-1 px-2 py-1 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>匯出</span>
            </button>
            
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-300 text-sm flex items-center space-x-1 px-2 py-1 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>重新整理</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">搜尋</label>
                <input
                  type="text"
                  value={filters.searchText}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                  placeholder="搜尋動作或功能..."
                  className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-green-500/30 text-gray-800 dark:text-green-400 rounded px-3 py-1 text-sm focus:outline-none focus:border-gray-500 dark:focus:border-green-400"
                />
              </div>
              
              {/* Action Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">動作類型</label>
                <select
                  value={filters.actionType}
                  onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
                  className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-green-500/30 text-gray-800 dark:text-green-400 rounded px-3 py-1 text-sm focus:outline-none focus:border-gray-500 dark:focus:border-green-400"
                >
                  <option value="all">全部</option>
                  <option value="correction_request">文字校正</option>
                  <option value="text_processed">文字處理</option>
                  <option value="api_call">API 呼叫</option>
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">時間範圍</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-green-500/30 text-gray-800 dark:text-green-400 rounded px-3 py-1 text-sm focus:outline-none focus:border-gray-500 dark:focus:border-green-400"
                >
                  <option value="all">全部</option>
                  <option value="today">今日</option>
                  <option value="week">本週</option>
                  <option value="month">本月</option>
                </select>
              </div>
              
              {/* Error filter */}
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="showErrors"
                  checked={filters.showErrors}
                  onChange={(e) => setFilters(prev => ({ ...prev, showErrors: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-green-500/30 bg-white dark:bg-black/40 text-green-600 focus:ring-green-400"
                />
                <label htmlFor="showErrors" className="text-xs text-gray-600 dark:text-gray-400">只顯示錯誤</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {history.length === 0 && !loading ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">目前沒有使用記錄</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">開始使用服務後，這裡會顯示您的使用歷史</p>
        </div>
      ) : (
        <div>
          {viewMode === 'chart' ? (
            /* Chart View */
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">{getFilteredHistory().length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">總記錄</div>
                </div>
                <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{getFilteredHistory().filter(e => !e.errorCode).length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">成功</div>
                </div>
                <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">{getFilteredHistory().filter(e => e.errorCode).length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">失敗</div>
                </div>
                <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    {getFilteredHistory().reduce((sum, e) => sum + e.textLength, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">總字元</div>
                </div>
              </div>
              
              {/* Usage Chart */}
              <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-green-400 mb-4">每日使用趨勢</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Bar dataKey="requests" radius={[2, 2, 0, 0]}>
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10b981" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Processing Time Chart */}
              <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-green-400 mb-4">平均處理時間</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Bar dataKey="avgTime" radius={[2, 2, 0, 0]}>
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#f59e0b" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {getFilteredHistory().map((entry) => (
            <div key={entry.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-green-500/10 rounded-lg hover:border-gray-300 dark:hover:border-green-500/30 transition-colors shadow-sm dark:shadow-none">
              <div className="flex-shrink-0">
                {getStatusIcon(entry)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatActionType(entry.actionType)}
                  </span>
                  {entry.featureUsed && (
                    <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                      {entry.featureUsed}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDateTime(entry.createdAt)}</span>
                  <span>{entry.textLength.toLocaleString()} 字元</span>
                  {entry.tokensUsed && (
                    <span>{entry.tokensUsed.toLocaleString()} tokens</span>
                  )}
                  <span>{formatProcessingTime(entry.processingTimeMs)}</span>
                </div>
                {entry.errorCode && (
                  <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                    錯誤: {entry.errorCode}
                  </div>
                )}
              </div>
              
              <div className={`text-right ${getStatusColor(entry)}`}>
                <div className="text-xs font-medium">
                  {entry.errorCode ? '失敗' : '成功'}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 dark:border-green-400 border-t-transparent"></div>
            </div>
          )}
          
              {pagination.hasMore && !loading && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm underline"
                  >
                    載入更多 ({pagination.total - getFilteredHistory().length} 筆記錄)
                  </button>
                </div>
              )}
              
              {!pagination.hasMore && getFilteredHistory().length > 0 && (
                <div className="text-center pt-4 text-gray-500 dark:text-gray-500 text-xs">
                  已顯示全部 {getFilteredHistory().length} 筆記錄
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsageHistory;