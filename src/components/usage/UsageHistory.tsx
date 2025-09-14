import React, { useEffect, useState } from 'react';
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
    if (entry.errorCode) return 'text-red-400';
    return 'text-green-400';
  };

  const getStatusIcon = (entry: UsageHistoryEntry): React.ReactNode => {
    if (entry.errorCode) {
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  if (loading && history.length === 0) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-700/50 rounded w-32"></div>
            <div className="h-8 bg-gray-700/50 rounded w-16"></div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg">
              <div className="w-8 h-8 bg-gray-700/50 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-700/50 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-400 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>無法載入使用歷史</span>
        </div>
        <p className="text-gray-400 text-sm mb-3">{error}</p>
        <button
          onClick={fetchUsageHistory}
          className="text-green-400 hover:text-green-300 text-sm underline"
        >
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-green-400">使用歷史</h3>
        <button
          onClick={handleRefresh}
          className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>重新整理</span>
        </button>
      </div>

      {history.length === 0 && !loading ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400">目前沒有使用記錄</p>
          <p className="text-gray-500 text-sm mt-1">開始使用服務後，這裡會顯示您的使用歷史</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center space-x-4 p-3 bg-black/20 border border-green-500/10 rounded-lg hover:border-green-500/30 transition-colors">
              <div className="flex-shrink-0">
                {getStatusIcon(entry)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-200">
                    {formatActionType(entry.actionType)}
                  </span>
                  {entry.featureUsed && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {entry.featureUsed}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                  <span>{formatDateTime(entry.createdAt)}</span>
                  <span>{entry.textLength.toLocaleString()} 字元</span>
                  {entry.tokensUsed && (
                    <span>{entry.tokensUsed.toLocaleString()} tokens</span>
                  )}
                  <span>{formatProcessingTime(entry.processingTimeMs)}</span>
                </div>
                {entry.errorCode && (
                  <div className="text-red-400 text-xs mt-1">
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
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-400 border-t-transparent"></div>
            </div>
          )}
          
          {pagination.hasMore && !loading && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="text-green-400 hover:text-green-300 text-sm underline"
              >
                載入更多 ({pagination.total - history.length} 筆記錄)
              </button>
            </div>
          )}
          
          {!pagination.hasMore && history.length > 0 && (
            <div className="text-center pt-4 text-gray-500 text-xs">
              已顯示全部 {history.length} 筆記錄
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsageHistory;