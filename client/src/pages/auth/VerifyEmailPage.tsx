import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { AuthNavbar } from './AuthNavbar';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!token) return setStatus('error');
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />
      <div className="w-full max-w-md animate-slide-up mt-12">
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5 text-center">
          {status === 'loading' && <div>Đang xác thực...</div>}
          {status === 'success' && (
            <>
              <h2 className="text-lg font-semibold">Email đã được xác thực</h2>
              <p className="text-[var(--color-text-muted)]">
                Bạn có thể đăng nhập ngay bây giờ.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 py-2 px-4 rounded bg-[var(--color-text)] text-[var(--color-bg)]"
              >
                Đi đến Đăng nhập
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <h2 className="text-lg font-semibold">Xác thực thất bại</h2>
              <p className="text-[var(--color-text-muted)]">
                Token không hợp lệ hoặc đã hết hạn.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="mt-4 py-2 px-4 rounded bg-[var(--color-text)] text-[var(--color-bg)]"
              >
                Gửi lại yêu cầu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
