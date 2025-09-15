import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { apiService } from '@/services/api';

interface TrendData {
  period: string;
  totalRequests: number;
  totalCharacters: number;
  totalTokens: number;
  averageProcessingTime: number;
  errorCount: number;
}

interface UsageTrendsChartProps {
  period?: 'day' | 'week' | 'month';
  groupBy?: 'day' | 'week' | 'month';
  height?: number;
}

const UsageTrendsChart: React.FC<UsageTrendsChartProps> = ({
  period = 'month',
  groupBy = 'day',
  height = 300
}) => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [metric, setMetric] = useState<'requests' | 'characters' | 'tokens' | 'processing'>('requests');

  useEffect(() => {
    fetchTrendData();
  }, [period, groupBy]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsageTrends(period, groupBy);
      setTrendData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  const formatXAxisDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      if (groupBy === 'day') {
        return format(date, 'MM/dd');
      } else if (groupBy === 'week') {
        return format(date, 'MM/dd');
      } else {
        return format(date, 'yyyy/MM');
      }
    } catch {
      return dateStr;
    }
  };

  const getMetricData = (data: TrendData[]) => {
    return data.map(item => ({
      ...item,
      formattedPeriod: formatXAxisDate(item.period),
      value: metric === 'requests' ? item.totalRequests :
             metric === 'characters' ? item.totalCharacters :
             metric === 'tokens' ? item.totalTokens :
             item.averageProcessingTime
    }));
  };

  const getMetricConfig = () => {
    const configs = {
      requests: {
        name: '請求次數',
        color: '#10b981',
        unit: '次'
      },
      characters: {
        name: '處理字元',
        color: '#3b82f6',
        unit: '字元'
      },
      tokens: {
        name: 'Token 使用',
        color: '#8b5cf6',
        unit: 'tokens'
      },
      processing: {
        name: '處理時間',
        color: '#f59e0b',
        unit: 'ms'
      }
    };
    return configs[metric];
  };

  const formatTooltipValue = (value: number): string => {
    const config = getMetricConfig();
    if (metric === 'processing') {
      return value < 1000 ? `${value.toFixed(0)}ms` : `${(value / 1000).toFixed(1)}s`;
    }
    return `${value.toLocaleString()} ${config.unit}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const config = getMetricConfig();
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-lg p-3 shadow-lg">
          <p className="text-green-400 font-medium mb-1">{label}</p>
          <p className="text-white">
            <span className="text-gray-400">{config.name}: </span>
            <span style={{ color: config.color }}>
              {formatTooltipValue(payload[0].value)}
            </span>
          </p>
          {payload[0].payload.errorCount > 0 && (
            <p className="text-red-400 text-sm">
              錯誤: {payload[0].payload.errorCount} 次
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = getMetricData(trendData);
    const config = getMetricConfig();

    const chartProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      return (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="formattedPeriod" 
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: config.color }}
          />
        </LineChart>
      );
    } else if (chartType === 'area') {
      return (
        <AreaChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="formattedPeriod" 
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            fill={`${config.color}30`}
            strokeWidth={2}
          />
        </AreaChart>
      );
    } else {
      return (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="formattedPeriod" 
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={config.color} radius={[2, 2, 0, 0]} />
        </BarChart>
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-700/50 rounded w-32"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-700/50 rounded w-20"></div>
              <div className="h-8 bg-gray-700/50 rounded w-20"></div>
            </div>
          </div>
          <div className="h-[300px] bg-gray-700/30 rounded-lg"></div>
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
          <span>無法載入趨勢圖表</span>
        </div>
        <p className="text-gray-400 text-sm mb-3">{error}</p>
        <button
          onClick={fetchTrendData}
          className="text-green-400 hover:text-green-300 text-sm underline"
        >
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-xl font-semibold text-green-400">使用趨勢</h3>
        
        <div className="flex flex-wrap gap-2">
          {/* Metric Selector */}
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            className="bg-black/40 border border-green-500/30 text-green-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="requests">請求次數</option>
            <option value="characters">處理字元</option>
            <option value="tokens">Token 使用</option>
            <option value="processing">處理時間</option>
          </select>

          {/* Chart Type Selector */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="bg-black/40 border border-green-500/30 text-green-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="area">面積圖</option>
            <option value="line">線性圖</option>
            <option value="bar">柱狀圖</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchTrendData}
            className="text-green-400 hover:text-green-300 px-2 py-1 rounded text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {trendData.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400">目前沒有趨勢數據</p>
          <p className="text-gray-500 text-sm mt-1">使用服務後，這裡會顯示使用趨勢圖表</p>
        </div>
      ) : (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
          
          <div className="mt-4 flex justify-center">
            <div className="text-xs text-gray-400">
              顯示 {groupBy === 'day' ? '每日' : groupBy === 'week' ? '每週' : '每月'} 數據 · 
              共 {trendData.length} 個數據點
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageTrendsChart;