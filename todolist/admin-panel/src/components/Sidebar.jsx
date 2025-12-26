import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  Key, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '仪表板' },
    { path: '/providers', icon: Cpu, label: 'AI 服务' },
    { path: '/keys', icon: Key, label: 'API 密钥' },
    { path: '/logs', icon: FileText, label: '请求日志' },
    { path: '/settings', icon: Settings, label: '系统设置' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-gray-800 flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">管理后台</h1>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      
      {/* 底部退出按钮 */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 w-full rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Sidebar;