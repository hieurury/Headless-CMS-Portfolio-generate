import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

export const LoginPage: React.FC = () => {
  const { language } = useUIStore();
  const lang = t(language).auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Auto-hide error notification
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // error is in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-surface-2)] blur-[120px]" />
      </div>

      {/* Toast Notification */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-5 py-3 rounded-xl bg-red-500/10 border-0 shadow-lg text-red-400 text-sm flex items-center gap-3 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md animate-slide-up mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{lang.loginTitle}</h1>
          <p className="text-[var(--color-text-muted)]">{lang.loginSubtitle}</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">{lang.emailLabel}</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang.emailPlaceholder}
                required
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--color-text-muted)]">{lang.passwordLabel}</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang.passwordPlaceholder}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg shadow-md bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> {lang.signingInBtn}</> : lang.signInBtn}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[var(--color-text-muted)] text-sm">
              {lang.noAccount}{' '}
              <Link to="/register" className="text-[var(--color-text)] hover:opacity-80 font-medium transition-colors underline">
                {lang.createOne}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
