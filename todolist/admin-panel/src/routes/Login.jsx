import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { adminAuth } from '../api/admin';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAuth.login(password);
      localStorage.setItem('admin_token', response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || '登录失败，请检查密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card max-w-md w-full">
        <div className="p-8">
          {/* Logo和标题 */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-primary-blue rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-text-primary mb-2">管理员登录</h2>
          <p className="text-center text-text-secondary mb-8">请输入管理员密码</p>

          {/* 表单 */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="请输入管理员密码"
                required
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-danger-red/10 text-danger-red rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;