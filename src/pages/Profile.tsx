import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/config/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  createdAt: string;
  lastSignIn: string;
  emailConfirmed: boolean;
  preferences: {
    language: string;
    correctionLevel: string;
    notifications: boolean;
  };
}

interface UsageStats {
  currentMonth: {
    tokensUsed: number;
    totalRequests: number;
    totalCorrections: number;
  };
  quota: {
    monthlyTokenLimit: number;
    remaining: number;
  };
  lastActivity: string;
}

const Profile: React.FC = () => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    preferences: {
      language: 'zh-TW',
      correctionLevel: 'standard',
      notifications: true
    }
  });

  useEffect(() => {
    if (session?.access_token) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data.profile);
        setUsage(data.data.usage);
        setFormData({
          name: data.data.profile.name,
          preferences: data.data.profile.preferences
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          preferences: formData.preferences
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, ...data.data.profile } : null);
        setEditMode(false);
        setSuccessMessage('個人資料已成功更新！');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateUsagePercentage = () => {
    if (!usage) return 0;
    return Math.round((usage.currentMonth.tokensUsed / usage.quota.monthlyTokenLimit) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748b] mb-4">無法載入個人資料</p>
          <button 
            onClick={fetchProfile}
            className="btn btn-primary"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">個人資料</h1>
          <p className="text-[#64748b]">管理您的帳戶設定和使用狀況</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-[#dcfce7] border border-[#16a34a] rounded-lg">
            <p className="text-[#16a34a] font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#fee2e2] border border-[#dc2626] rounded-lg">
            <p className="text-[#dc2626] font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#212121]">基本資料</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="btn btn-outline btn-sm"
                >
                  {editMode ? '取消' : '編輯'}
                </button>
              </div>
              <div className="card-body">
                <div className="flex items-center space-x-6 mb-6">
                  {profile.avatar && (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-[#212121]">{profile.name}</h3>
                    <p className="text-[#64748b]">{profile.email}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#dbeafe] text-[#1d4ed8]">
                      {profile.provider} 登入
                    </span>
                  </div>
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-2">
                        顯示名稱
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        className="input w-full"
                        placeholder="請輸入您的姓名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-2">
                        偏好語言
                      </label>
                      <select
                        value={formData.preferences.language}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            language: e.target.value
                          }
                        }))}
                        className="select w-full"
                      >
                        <option value="zh-TW">繁體中文</option>
                        <option value="zh-CN">簡體中文</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-2">
                        校正等級
                      </label>
                      <select
                        value={formData.preferences.correctionLevel}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            correctionLevel: e.target.value
                          }
                        }))}
                        className="select w-full"
                      >
                        <option value="basic">基本</option>
                        <option value="standard">標準</option>
                        <option value="advanced">進階</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.notifications}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              notifications: e.target.checked
                            }
                          }))}
                          className="checkbox"
                        />
                        <span className="text-sm text-[#212121]">接收通知</span>
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                      >
                        {saving ? '儲存中...' : '儲存'}
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            name: profile.name,
                            preferences: profile.preferences
                          });
                        }}
                        className="btn btn-outline"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#64748b]">帳戶創建</label>
                        <p className="text-[#212121]">{formatDate(profile.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#64748b]">最後登入</label>
                        <p className="text-[#212121]">{formatDate(profile.lastSignIn)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#64748b]">偏好語言</label>
                        <p className="text-[#212121]">
                          {profile.preferences.language === 'zh-TW' ? '繁體中文' :
                           profile.preferences.language === 'zh-CN' ? '簡體中文' : 'English'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#64748b]">校正等級</label>
                        <p className="text-[#212121]">
                          {profile.preferences.correctionLevel === 'basic' ? '基本' :
                           profile.preferences.correctionLevel === 'standard' ? '標準' : '進階'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div>
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-[#212121]">使用統計</h2>
              </div>
              <div className="card-body">
                {usage && (
                  <div className="space-y-6">
                    {/* Token Usage */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#64748b]">本月使用量</span>
                        <span className="text-sm text-[#212121]">
                          {calculateUsagePercentage()}%
                        </span>
                      </div>
                      <div className="w-full bg-[#e5e7eb] rounded-full h-2">
                        <div
                          className="bg-[#2563eb] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateUsagePercentage()}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#64748b] mt-1">
                        {usage.currentMonth.tokensUsed.toLocaleString()} / {usage.quota.monthlyTokenLimit.toLocaleString()} tokens
                      </p>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-[#64748b]">本月請求次數</span>
                        <span className="font-medium text-[#212121]">
                          {usage.currentMonth.totalRequests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[#64748b]">總修正數</span>
                        <span className="font-medium text-[#212121]">
                          {usage.currentMonth.totalCorrections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[#64748b]">剩餘額度</span>
                        <span className="font-medium text-[#16a34a]">
                          {usage.quota.remaining.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#e5e7eb]">
                      <p className="text-xs text-[#64748b]">
                        最後活動：{formatDate(usage.lastActivity)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
