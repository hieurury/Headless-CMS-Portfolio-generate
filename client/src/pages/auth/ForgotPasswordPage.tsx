import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import { AuthNavbar } from './AuthNavbar';

export const ForgotPasswordPage: React.FC = () => {
  const { language } = useUIStore();
  const lang = t(language).auth;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />
      <div className="w-full max-w-md animate-slide-up mt-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu.
          </p>
        </div>

        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)]"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg shadow-md bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-90"
              >
                Gửi
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-[var(--color-text-muted)]">
                Nếu email tồn tại, kiểm tra hộp thư để nhận hướng dẫn.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="py-2 px-4 rounded bg-[var(--color-text)] text-[var(--color-bg)]"
                >
                  Đi đến Đăng nhập
                </button>
                <Link
                  to="/"
                  className="py-2 px-4 rounded border border-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
