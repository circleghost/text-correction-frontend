import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/services/api';

type QuotaItem = {
  type: 'monthly_corrections' | 'monthly_characters' | 'monthly_requests' | 'daily_requests';
  limit: number;
  used: number;
  remaining: number;
  resetDate: string | Date;
  tier: 'free' | 'premium' | 'enterprise' | 'admin';
  percentageUsed: number;
  isExceeded: boolean;
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 shadow-sm p-4 transition-colors">
    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</div>
    {children}
  </div>
);

const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  const width = 160;
  const height = 38;
  if (!values || values.length === 0) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400">尚無資料</div>
    );
  }
  const max = Math.max(1, ...values);
  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 dark:text-green-400" />
    </svg>
  );
};

const StatsOverview: React.FC = () => {
  const [quota, setQuota] = useState<QuotaItem[] | null>(null);
  const [dayUsage, setDayUsage] = useState<{ requests: number; chars: number } | null>(null);
  const [monthUsage, setMonthUsage] = useState<{ requests: number; chars: number } | null>(null);
  const [trend, setTrend] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [quotaRes, currentDayRes, currentMonthRes, trendsRes] = await Promise.allSettled([
          apiService.getQuotaStatus(),
          apiService.getCurrentUsage('day'),
          apiService.getCurrentUsage('month'),
          apiService.getUsageTrends('month', 'day'),
        ]);

        if (cancelled) return;

        if (quotaRes.status === 'fulfilled') setQuota(quotaRes.value.data as any);
        if (currentDayRes.status === 'fulfilled') {
          const d = currentDayRes.value.data;
          setDayUsage({ requests: d.dailyRequests, chars: d.dailyCharacters });
        }
        if (currentMonthRes.status === 'fulfilled') {
          const m = currentMonthRes.value.data;
          setMonthUsage({ requests: m.monthlyRequests, chars: m.monthlyCharacters });
        }
        if (trendsRes.status === 'fulfilled') {
          const values = (trendsRes.value.data || []).map((x: any) => x.totalRequests);
          const last7 = values.slice(-7);
          setTrend(last7.length ? last7 : values.slice(0, 7));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    const onChanged = () => fetchAll();
    window.addEventListener('usage:changed', onChanged);
    return () => { cancelled = true; window.removeEventListener('usage:changed', onChanged); };
  }, []);

  const monthlyReq = useMemo(() => quota?.find(q => q.type === 'monthly_requests'), [quota]);
  const monthlyChars = useMemo(() => quota?.find(q => q.type === 'monthly_characters'), [quota]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card title="本月用量">
        {loading ? (
          <div className="h-6 bg-gray-200 dark:bg-gray-700/50 rounded w-2/3" />
        ) : (
          <div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {monthlyReq && monthUsage ? `${monthUsage.requests}/${monthlyReq.limit} 次` : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              字元 {monthlyChars && monthUsage ? `${monthUsage.chars.toLocaleString()}/${monthlyChars.limit.toLocaleString()}` : '--'}
            </div>
            {!!monthlyReq && monthUsage && (
              <div className="mt-3 h-2 rounded bg-gray-100 dark:bg-gray-700/50">
                <div className="h-2 rounded bg-blue-500 dark:bg-green-500" style={{ width: `${Math.min(100, (monthUsage.requests / Math.max(1, monthlyReq.limit)) * 100)}%` }} />
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="今日概況">
        {loading || !dayUsage ? (
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700/50 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded w-1/3" />
          </div>
        ) : (
          <div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{dayUsage.requests} 次</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{dayUsage.chars.toLocaleString()} 字元</div>
          </div>
        )}
      </Card>

      <Card title="最近 7 天次數">
        {loading || !trend ? (
          <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded" />
        ) : (
          <div className="flex items-end justify-between">
            <Sparkline values={trend} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatsOverview;
