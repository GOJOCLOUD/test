import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import Providers from './routes/Providers';
import ApiKeys from './routes/ApiKeys';
import Logs from './routes/Logs';
import Settings from './routes/Settings';
import Users from './routes/Users';

// 路由守卫组件
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'providers',
        element: <Providers />
      },
      {
        path: 'keys',
        element: <ApiKeys />
      },
      {
        path: 'logs',
        element: <Logs />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);

export default router;