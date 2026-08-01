import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { AuthNavbar } from './AuthNavbar';

export const ResetPasswordPage: React.FC = () => {
  const { language } = useUIStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) setError('Yêu cầu không hợp lệ.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError('Mật khẩu cần tối thiểu 6 ký tự.');
    if (password !== confirm) return setError('Mật khẩu không khớp.');
    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
    } catch {
      setError('Không thể đặt lại mật khẩu. Token có thể đã hết hạn.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />
      <div className="w-full max-w-md animate-slide-up mt-12">
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5">
          {success ? (
            <div className="text-center">
              <p className="text-[var(--color-text-muted)]">
                Đặt lại mật khẩu thành công.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 py-2 px-4 rounded bg-[var(--color-text)] text-[var(--color-bg)]"
              >
                Đi đến Đăng nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)]"
                />
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}

              <button
                type="submit"
                className="w-full py-3 rounded-lg shadow-md bg-[var(--color-text)] text-[var(--color-bg)] font-semibold"
              >
                Xác nhận
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
