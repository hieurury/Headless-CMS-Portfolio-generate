import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading, error, successMessage, clearError, clearSuccess } =
    useAuthStore();

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (error) {
      const t = setTimeout(clearError, 5000);
      return () => clearTimeout(t);
    }
  }, [error, clearError]);

  useEffect(() => {
    return () => {
      clearError();
      clearSuccess();
    };
  }, [clearError, clearSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();
    try {
      await forgotPassword(email);
    } catch {
      // error is in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-surface-2)] blur-[120px]" />
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-5 py-3 rounded-xl bg-red-500/10 shadow-lg text-red-400 text-sm flex items-center gap-3 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md animate-slide-up mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-2)] mb-4">
            <Mail size={24} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Forgot password?</h1>
          <p className="text-[var(--color-text-muted)]">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5">
          {/* Success state */}
          {successMessage ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle size={40} className="mx-auto text-emerald-400" />
              <p className="text-[var(--color-text)] font-medium">{successMessage}</p>
              <p className="text-[var(--color-text-muted)] text-sm">
                Check your inbox. The link expires in 1 hour.
              </p>
              <button
                onClick={() => {
                  setEmail('');
                  clearSuccess();
                }}
                className="text-sm text-[var(--color-text-muted)] underline hover:text-[var(--color-text)] transition-colors"
              >
                Resend email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] transition-all"
                />
              </div>

              <button
                id="forgot-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg shadow-md bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
