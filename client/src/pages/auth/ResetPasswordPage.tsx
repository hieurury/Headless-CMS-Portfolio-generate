import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { resetPassword, isLoading, error, successMessage, clearError, clearSuccess } =
    useAuthStore();

  // Auto-hide error toast
  useEffect(() => {
    if (error) {
      const t = setTimeout(clearError, 5000);
      return () => clearTimeout(t);
    }
  }, [error, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearError();
      clearSuccess();
    };
  }, [clearError, clearSuccess]);

  // Redirect to login after success
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!token) {
      setLocalError('Reset token is missing. Please use the link from your email.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      await resetPassword(token, newPassword);
    } catch {
      // error is in store
    }
  };

  const displayError = localError ?? error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-surface-2)] blur-[120px]" />
      </div>

      {/* Error toast */}
      {displayError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-5 py-3 rounded-xl bg-red-500/10 shadow-lg text-red-400 text-sm flex items-center gap-3 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            <span className="font-medium">{displayError}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md animate-slide-up mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-2)] mb-4">
            <KeyRound size={24} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Set new password</h1>
          <p className="text-[var(--color-text-muted)]">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5">
          {/* Success state */}
          {successMessage ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle size={40} className="mx-auto text-emerald-400" />
              <p className="text-[var(--color-text)] font-medium">{successMessage}</p>
              <p className="text-[var(--color-text-muted)] text-sm">
                Redirecting to sign in…
              </p>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-red-400 font-medium">Invalid or missing reset link.</p>
              <Link to="/forgot-password" className="text-sm text-[var(--color-text)] underline">
                Request a new one
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
                  Confirm password
                </label>
                <input
                  id="reset-confirm-password"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] transition-all"
                />
              </div>

              <button
                id="reset-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg shadow-md bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Resetting…
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
