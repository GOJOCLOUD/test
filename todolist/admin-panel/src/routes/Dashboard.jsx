import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  Activity, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { dashboard } from '../api/admin';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboard.getStats();
        setStats(data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-text-secondary">加载中...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: '活跃API密钥',
      value: stats?.activeKeys || 0,
      icon: Key,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: '今日请求',
      value: stats?.todayRequests || 0,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: '成功率',
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">仪表板</h1>
        <p className="text-text-secondary">系统运行状态概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">{card.title}</p>
                  <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 请求趋势图 */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-text-primary">请求趋势</h3>
              <BarChart3 className="h-5 w-5 text-text-secondary" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-text-secondary">图表加载中...</p>
            </div>
          </div>
        </div>

        {/* AI服务分布 */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-text-primary">AI服务分布</h3>
              <PieChart className="h-5 w-5 text-text-secondary" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-text-secondary">图表加载中...</p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">最近活动</h3>
          <div className="space-y-4">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border-color last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{activity.description}</p>
                    <p className="text-xs text-text-secondary">{activity.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'success' ? 'bg-success-green/10 text-success-green' : 
                    activity.status === 'warning' ? 'bg-warning-yellow/10 text-warning-yellow' : 
                    'bg-danger-red/10 text-danger-red'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-secondary">
                暂无最近活动
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;