import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading, error, clearError } = useAuthStore();
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
      await register(form.email, form.password, form.name);
      navigate('/dashboard');
    } catch {
      // error is in store
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AuthNavbar />

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Create account</h1>
          <p className="text-[var(--color-text-muted)]">Start building your portfolio</p>
        </div>

        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-xl rounded-xl p-8 space-y-5">

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', id: 'register-name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', id: 'register-email' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', id: 'register-password' },
            ].map(({ key, label, type, placeholder, id }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>
                <input
                  id={id}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  required
                  minLength={key === 'password' ? 6 : undefined}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] shadow-sm border-0 text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] transition-all"
                />
              </div>
            ))}

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg shadow-md bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[var(--color-text-muted)] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-text)] hover:opacity-80 font-medium transition-colors underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
