import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Save, Check, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const SettingsPanel = ({ onClose }) => {
  const { settings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState({
    defaultProvider: 'kimi',
    ...settings
  });
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  // 处理输入变化
  const handleChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 保存设置
  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // 更新全局状态
      updateSettings(localSettings);
      
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="bg-china-red text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-bold">系统设置</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* AI服务配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Key className="w-5 h-5 text-china-red" />
              AI 服务配置
            </h3>
            
            {/* 默认AI提供商 */}
            <div>
              <label className="block font-medium text-ink mb-2">默认AI提供商</label>
              <select 
                value={localSettings.defaultProvider}
                onChange={(e) => handleChange('defaultProvider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-china-red"
              >
                <option value="kimi">Kimi</option>
                <option value="glm">GLM</option>
              </select>
            </div>
          </div>

          {/* API密钥说明 */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-ink mb-2">API密钥说明</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>本应用已配置默认API密钥，用户无需自行输入</li>
              <li>API模式响应速度快，稳定性高</li>
              <li>系统将自动使用配置的默认密钥调用AI服务</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-china-red text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>保存中...</>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;