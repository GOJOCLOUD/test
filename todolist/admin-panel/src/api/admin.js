import api from './index';

// 管理员认证
export const adminAuth = {
  login: (password) => api.post('/admin/login', { password }),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/profile'),
};

// 仪表板数据
export const dashboard = {
  getStats: () => api.get('/admin/stats'),
};

// AI提供商管理
export const providers = {
  getStatus: () => api.get('/admin/providers'),
};

// API密钥管理
export const apiKeys = {
  getAll: () => api.get('/admin/keys'),
  add: (keyData) => api.post('/admin/keys', keyData),
  toggle: (id) => api.put(`/admin/keys/${id}/toggle`),
  delete: (id) => api.delete(`/admin/keys/${id}`),
};

// 请求日志
export const logs = {
  getRecent: () => api.get('/admin/logs'),
};

// 系统设置
export const settings = {
  get: () => api.get('/admin/settings'),
  update: (settingsData) => api.post('/admin/settings', settingsData),
};