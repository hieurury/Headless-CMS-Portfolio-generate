import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg mb-6 shadow-xl shadow-indigo-500/30">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-slate-400">Start building your portfolio</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', id: 'register-name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', id: 'register-email' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', id: 'register-password' },
            ].map(({ key, label, type, placeholder, id }) => (
              <div key={key}>
                <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
                <input
                  id={id}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  required
                  minLength={key === 'password' ? 6 : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            ))}

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
