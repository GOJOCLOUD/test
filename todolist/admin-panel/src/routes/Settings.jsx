import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { settings } from '../api/admin';

const SettingsPage = () => {
  const [config, setConfig] = useState({
    systemName: 'AI API Gateway',
    maxRequestsPerMinute: 60,
    enableRequestLogging: true,
    enableApiKeyAuth: true,
    defaultProvider: 'OpenAI',
    timeoutMs: 30000,
    enableRateLimiting: true,
    enableCaching: false,
    cacheExpirationMinutes: 15,
    adminPassword: '',
    adminPasswordConfirm: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settings.get();
      setConfig({
        ...data,
        adminPassword: '',
        adminPasswordConfirm: ''
      });
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    // 验证密码
    if (config.adminPassword && config.adminPassword !== config.adminPasswordConfirm) {
      setMessage('密码确认不匹配');
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      await settings.update(config);
      setMessage('设置已保存');
      // 清空密码字段
      setConfig({
        ...config,
        adminPassword: '',
        adminPasswordConfirm: ''
      });
    } catch (error) {
      setMessage('保存失败: ' + (error.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    fetchSettings();
    setMessage('设置已重置');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-text-secondary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">系统设置</h1>
          <p className="text-text-secondary">配置系统参数和管理选项</p>
        </div>
        <button 
          onClick={handleResetSettings}
          className="btn btn-outline flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          重置
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('失败') ? 'bg-danger-red/10 text-danger-red' : 'bg-success-green/10 text-success-green'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本设置 */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                基本设置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    系统名称
                  </label>
                  <input
                    type="text"
                    value={config.systemName}
                    onChange={(e) => setConfig({...config, systemName: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    默认AI提供商
                  </label>
                  <select
                    value={config.defaultProvider}
                    onChange={(e) => setConfig({...config, defaultProvider: e.target.value})}
                    className="form-input"
                  >
                    <option value="OpenAI">OpenAI</option>
                    <option value="Claude">Claude</option>
                    <option value="Gemini">Gemini</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    请求超时时间 (毫秒)
                  </label>
                  <input
                    type="number"
                    value={config.timeoutMs}
                    onChange={(e) => setConfig({...config, timeoutMs: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">安全设置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    新管理员密码
                  </label>
                  <input
                    type="password"
                    value={config.adminPassword}
                    onChange={(e) => setConfig({...config, adminPassword: e.target.value})}
                    className="form-input"
                    placeholder="留空表示不更改"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    确认新密码
                  </label>
                  <input
                    type="password"
                    value={config.adminPasswordConfirm}
                    onChange={(e) => setConfig({...config, adminPasswordConfirm: e.target.value})}
                    className="form-input"
                    placeholder="再次输入新密码"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enableApiKeyAuth}
                      onChange={(e) => setConfig({...config, enableApiKeyAuth: e.target.checked})}
                      className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-text-primary">启用API密钥认证</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enableRequestLogging}
                      onChange={(e) => setConfig({...config, enableRequestLogging: e.target.checked})}
                      className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-text-primary">启用请求日志记录</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 限流设置 */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">限流设置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={config.enableRateLimiting}
                      onChange={(e) => setConfig({...config, enableRateLimiting: e.target.checked})}
                      className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-text-primary">启用请求频率限制</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    每分钟最大请求数
                  </label>
                  <input
                    type="number"
                    value={config.maxRequestsPerMinute}
                    onChange={(e) => setConfig({...config, maxRequestsPerMinute: parseInt(e.target.value)})}
                    className="form-input"
                    disabled={!config.enableRateLimiting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 缓存设置 */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">缓存设置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={config.enableCaching}
                      onChange={(e) => setConfig({...config, enableCaching: e.target.checked})}
                      className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-text-primary">启用响应缓存</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    缓存过期时间 (分钟)
                  </label>
                  <input
                    type="number"
                    value={config.cacheExpirationMinutes}
                    onChange={(e) => setConfig({...config, cacheExpirationMinutes: parseInt(e.target.value)})}
                    className="form-input"
                    disabled={!config.enableCaching}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;