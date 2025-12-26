import React, { useState, useEffect } from 'react';
import { Key, Plus, ToggleLeft, ToggleRight, Trash2, Edit, Copy } from 'lucide-react';
import { apiKeys } from '../api/admin';

const ApiKeysPage = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    provider: 'OpenAI',
    key: '',
    isActive: true
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const data = await apiKeys.getAll();
      setKeys(data);
    } catch (error) {
      console.error('获取API密钥失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKey = async (id) => {
    try {
      await apiKeys.toggle(id);
      fetchKeys();
    } catch (error) {
      console.error('切换密钥状态失败:', error);
    }
  };

  const handleDeleteKey = async (id) => {
    if (window.confirm('确定要删除这个API密钥吗？')) {
      try {
        await apiKeys.delete(id);
        fetchKeys();
      } catch (error) {
        console.error('删除密钥失败:', error);
      }
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    try {
      await apiKeys.add(newKey);
      setNewKey({ name: '', provider: 'OpenAI', key: '', isActive: true });
      setShowAddModal(false);
      fetchKeys();
    } catch (error) {
      console.error('添加密钥失败:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // 这里可以添加一个toast提示
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
          <h1 className="text-2xl font-bold text-text-primary">API 密钥管理</h1>
          <p className="text-text-secondary">管理AI服务的API密钥</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加密钥
        </button>
      </div>

      {/* 密钥列表 */}
      <div className="card">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    提供商
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    密钥
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-color">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {key.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      <div className="flex items-center">
                        <span className="mr-2">••••••••••••{key.key.slice(-4)}</span>
                        <button 
                          onClick={() => copyToClipboard(key.key)}
                          className="text-text-secondary hover:text-text-primary"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleKey(key.id)}
                        className="flex items-center"
                      >
                        {key.isActive ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-success-green mr-1" />
                            <span className="text-sm text-success-green">启用</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-400">禁用</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {key.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-text-secondary hover:text-text-primary">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-danger-red hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 添加密钥模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">添加新API密钥</h3>
              <form onSubmit={handleAddKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    名称
                  </label>
                  <input
                    type="text"
                    value={newKey.name}
                    onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                    className="form-input"
                    placeholder="输入密钥名称"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    提供商
                  </label>
                  <select
                    value={newKey.provider}
                    onChange={(e) => setNewKey({...newKey, provider: e.target.value})}
                    className="form-input"
                  >
                    <option value="OpenAI">OpenAI</option>
                    <option value="Claude">Claude</option>
                    <option value="Gemini">Gemini</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    API密钥
                  </label>
                  <textarea
                    value={newKey.key}
                    onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                    className="form-input"
                    placeholder="输入API密钥"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newKey.isActive}
                      onChange={(e) => setNewKey({...newKey, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-text-primary">启用此密钥</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-outline"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysPage;