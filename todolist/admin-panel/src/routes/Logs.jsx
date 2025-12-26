import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { logs } from '../api/admin';

const LogsPage = () => {
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await logs.getRecent();
      setLogData(data);
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    logs.getRecent()
      .then(data => setLogData(data))
      .catch(error => console.error('刷新失败:', error))
      .finally(() => setLoading(false));
  };

  const handleExportLogs = () => {
    // 这里可以实现导出日志功能
    console.log('导出日志');
  };

  const filteredLogs = logData.filter(log => {
    const matchesSearch = log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.ip?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || log.provider === filterProvider;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-text-secondary">加载中...</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) {
      return <span className="badge badge-success">{status}</span>;
    } else if (status >= 400 && status < 500) {
      return <span className="badge badge-warning">{status}</span>;
    } else if (status >= 500) {
      return <span className="badge badge-danger">{status}</span>;
    }
    return <span className="badge badge-gray">{status}</span>;
  };

  const providers = [...new Set(logData.map(log => log.provider).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">请求日志</h1>
          <p className="text-text-secondary">查看API请求历史和日志</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="btn btn-outline flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </button>
          <button 
            onClick={handleExportLogs}
            className="btn btn-outline flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            导出
          </button>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  placeholder="搜索端点或IP地址"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
              >
                <option value="all">所有状态</option>
                <option value="200">成功 (2xx)</option>
                <option value="400">客户端错误 (4xx)</option>
                <option value="500">服务器错误 (5xx)</option>
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="form-input"
              >
                <option value="all">所有提供商</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 日志表格 */}
      <div className="card">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    IP地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    端点
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    方法
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    响应时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    提供商
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-color">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {log.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {log.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                          log.method === 'POST' ? 'bg-green-100 text-green-800' :
                          log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          log.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {log.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {log.provider || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-text-secondary hover:text-text-primary">
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-text-secondary">
                      没有找到匹配的日志记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;