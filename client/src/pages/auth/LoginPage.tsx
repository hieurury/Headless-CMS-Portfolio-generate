import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { t, translateError } from '../../i18n';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';
import { useSeo } from '../../hooks/useSeo';

// ─── Shared input style (đồng bộ với RegisterPage / ForgotPasswordPage) ───────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  outline: 'none',
  boxShadow: 'var(--shadow-sm)',
  transition: 'box-shadow 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: 6,
};

export const LoginPage: React.FC = () => {
  const { language } = useUIStore();
  const lang = t(language).auth;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useSeo({
    title: 'Ruryfo CMS — Đăng nhập',
    description: 'Đăng nhập vào Ruryfo CMS để quản lý và tạo portfolio cá nhân.',
  });

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 4000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  // Handle URL errors
  useEffect(() => {
    if (searchParams.get('error') === 'invalid_session') {
      useAuthStore.setState({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(identifier, password);
      const user = useAuthStore.getState().user;
      navigate(`/${user?.username}/dashboard`);
    } catch (err: unknown) {
      // Unverified account — redirect to step 2 of registration
      if ((err as any)?.requiresVerification) {
        navigate('/register?step=2');
        return;
      }
      // Other errors are already set in store
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 16px 24px',
        background: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AuthNavbar />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'var(--color-surface-2)',
          filter: 'blur(100px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Error Toast */}
      {error && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              background: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              color: 'var(--color-error)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--color-error)',
              }}
            />
            <span style={{ fontWeight: 500 }}>{translateError(error, language)}</span>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        style={{ width: '100%', maxWidth: 440, position: 'relative' }}
        className="animate-slide-up"
      >
        {/* Heading */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 6px',
              letterSpacing: '-0.4px',
            }}
          >
            {lang.loginTitle}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {lang.loginSubtitle}
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 28px 24px',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Email */}
            <div>
              <label style={labelStyle}>
                Email hoặc Username <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
              </label>
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com hoặc johndoe"
                required
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')
                }
              />
            </div>

            {/* Password */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  {lang.passwordLabel} <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'var(--color-text)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'var(--color-text-muted)')
                  }
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang.passwordPlaceholder}
                  required
                  style={{ ...inputStyle, paddingRight: 42 }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '11px',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-sm)',
                transition: 'opacity 0.2s',
                marginTop: 4,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {lang.signingInBtn}
                </>
              ) : (
                lang.signInBtn
              )}
            </button>
          </form>

          {/* Footer link */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--color-text-muted)',
              marginTop: 16,
              marginBottom: 0,
            }}
          >
            {lang.noAccount}{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-text)',
                fontWeight: 500,
                textDecoration: 'underline',
              }}
            >
              {lang.createOne}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
