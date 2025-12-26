import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { providers } from '../api/admin';

const Providers = () => {
  const [providerList, setProviderList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await providers.getStatus();
        setProviderList(data);
      } catch (error) {
        console.error('获取AI服务状态失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    providers.getStatus()
      .then(data => setProviderList(data))
      .catch(error => console.error('刷新失败:', error))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-text-secondary">加载中...</div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-success-green" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-danger-red" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-warning-yellow" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return <span className="badge badge-success">在线</span>;
      case 'offline':
        return <span className="badge badge-danger">离线</span>;
      case 'degraded':
        return <span className="badge badge-warning">降级</span>;
      default:
        return <span className="badge badge-gray">未知</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">AI 服务监控</h1>
          <p className="text-text-secondary">查看和管理AI服务提供商状态</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn btn-outline flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </button>
      </div>

      {/* 服务状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providerList.map((provider, index) => (
          <div key={index} className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text-primary">{provider.name}</h3>
                {getStatusIcon(provider.status)}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">状态</span>
                  {getStatusBadge(provider.status)}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">响应时间</span>
                  <span className="text-sm font-medium text-text-primary">{provider.responseTime}ms</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">今日请求</span>
                  <span className="text-sm font-medium text-text-primary">{provider.todayRequests}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">成功率</span>
                  <span className="text-sm font-medium text-text-primary">{provider.successRate}%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-color">
                <div className="text-xs text-text-secondary">
                  最后检查: {provider.lastChecked}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 服务详情表格 */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">服务详情</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    服务名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    响应时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    今日请求
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    成功率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    最后检查
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-color">
                {providerList.map((provider, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {provider.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(provider.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {provider.responseTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {provider.todayRequests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {provider.successRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {provider.lastChecked}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Providers;