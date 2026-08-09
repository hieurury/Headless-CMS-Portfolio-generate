import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';
import { StepProgress } from '../../components/auth/StepProgress';
import { OtpInput } from '../../components/auth/OtpInput';

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ['Nhập email', 'Xác thực code', 'Đặt lại mật khẩu'];
const OTP_RESEND_DELAY = 60;

// ─── Shared Styles ────────────────────────────────────────────────────────────

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

const btnPrimary = (loading: boolean, disabled?: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '11px',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  fontWeight: 600,
  cursor: loading || disabled ? 'not-allowed' : 'pointer',
  opacity: loading || disabled ? 0.6 : 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: 'var(--shadow-sm)',
  transition: 'opacity 0.2s',
});

// ─── Error Toast ──────────────────────────────────────────────────────────────

const ErrorToast: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      position: 'fixed',
      top: '80px',
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
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-error)' }}
      />
      <span style={{ fontWeight: 500 }}>{message}</span>
    </div>
  </div>
);

// ─── Step 1: Email ────────────────────────────────────────────────────────────

const Step1: React.FC<{
  onNext: (email: string) => Promise<void>;
  isLoading: boolean;
}> = ({ onNext, isLoading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNext(email);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
        Nhập địa chỉ email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một mã xác thực
        gồm 6 chữ số.
      </p>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
          onFocus={(e) =>
            (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')
          }
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
        />
      </div>

      <button type="submit" disabled={isLoading} style={btnPrimary(isLoading)}>
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Đang gửi...
          </>
        ) : (
          <>
            Gửi mã xác thực <ChevronRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};

// ─── Step 2: OTP ──────────────────────────────────────────────────────────────

const Step2: React.FC<{
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}> = ({ email, onVerify, onResend, isLoading, error, clearError }) => {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(OTP_RESEND_DELAY);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setResendCountdown((v) => {
        if (v <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const handleResend = () => {
    if (resendCountdown > 0) return;
    onResend();
    setResendCountdown(OTP_RESEND_DELAY);
    setLocalError(null);
    clearError();
    intervalRef.current = setInterval(() => {
      setResendCountdown((v) => {
        if (v <= 1) { clearInterval(intervalRef.current!); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setLocalError('Vui lòng nhập đủ 6 chữ số.'); return; }
    setLocalError(null);
    await onVerify(otp);
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
        Mã xác thực đã được gửi đến{' '}
        <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
        Mã có hiệu lực trong <strong style={{ color: 'var(--color-text)' }}>10 phút</strong>.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <OtpInput
          value={otp}
          onChange={(val) => {
            setOtp(val);
            if (localError) setLocalError(null);
            if (error) clearError();
          }}
          disabled={isLoading}
          error={displayError ?? undefined}
        />
      </div>

      <button
        id="forgot-verify-submit"
        type="submit"
        disabled={isLoading || otp.length < 6}
        style={btnPrimary(isLoading, otp.length < 6)}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Đang xác thực...
          </>
        ) : (
          <>
            Tiếp theo <ChevronRight size={16} />
          </>
        )}
      </button>

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: resendCountdown > 0 ? 'var(--color-text-faint)' : 'var(--color-text-muted)',
            cursor: resendCountdown > 0 ? 'default' : 'pointer',
            textDecoration: resendCountdown === 0 ? 'underline' : 'none',
          }}
        >
          {resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại mã'}
        </button>
      </div>
    </form>
  );
};

// ─── Step 3: New Password ─────────────────────────────────────────────────────

const Step3: React.FC<{
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Mật khẩu xác nhận không khớp.');
      return;
    }
    await onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
        Tạo mật khẩu mới cho tài khoản của bạn.
      </p>

      {/* Password */}
      <div>
        <label style={labelStyle}>Mật khẩu mới</label>
        <div style={{ position: 'relative' }}>
          <input
            id="reset-password"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLocalError(null); }}
            placeholder="Tối thiểu 6 ký tự"
            required
            minLength={6}
            style={{ ...inputStyle, paddingRight: 42 }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
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
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Confirm */}
      <div>
        <label style={labelStyle}>Xác nhận mật khẩu</label>
        <div style={{ position: 'relative' }}>
          <input
            id="reset-confirm"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setLocalError(null); }}
            placeholder="Nhập lại mật khẩu"
            required
            style={{ ...inputStyle, paddingRight: 42 }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
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
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {localError && (
        <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{localError}</p>
      )}

      <button
        id="reset-submit"
        type="submit"
        disabled={isLoading}
        style={{ ...btnPrimary(isLoading), marginTop: 4 }}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle2 size={16} /> Xác nhận & Đăng nhập
          </>
        )}
      </button>
    </form>
  );
};

// ─── Main ForgotPasswordPage ──────────────────────────────────────────────────

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, resetPassword, isLoading, error, clearError } =
    useAuthStore();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Auto-clear error on step change
  useEffect(() => { clearError(); }, [step, clearError]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 4000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  // ─── Step handlers ──────────────────────────────────────────────────────────

  const handleStep1 = useCallback(
    async (inputEmail: string) => {
      setEmail(inputEmail);
      await forgotPassword(inputEmail);
      setStep(1);
    },
    [forgotPassword],
  );

  const handleResend = useCallback(async () => {
    await forgotPassword(email);
  }, [forgotPassword, email]);

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      const token = await verifyResetOtp(email, code);
      setResetToken(token);
      setStep(2);
    },
    [verifyResetOtp, email],
  );

  const handleResetPassword = useCallback(
    async (password: string) => {
      await resetPassword(resetToken, password);
      const user = useAuthStore.getState().user;
      navigate(`/${user?.username}/dashboard`);
    },
    [resetPassword, resetToken, navigate],
  );

  const stepTitles = ['Quên mật khẩu', 'Xác thực mã', 'Mật khẩu mới'];
  const stepSubtitles = [
    'Nhập email để nhận mã xác thực',
    'Nhập mã 6 chữ số từ email của bạn',
    'Tạo mật khẩu mới và đăng nhập',
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
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
      {error && <ErrorToast message={error} />}

      <div
        style={{ width: '100%', maxWidth: 440, position: 'relative' }}
        className="animate-slide-up"
      >
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <StepProgress steps={STEPS} currentStep={step} />
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 28px 24px',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 4px',
                letterSpacing: '-0.3px',
              }}
            >
              {stepTitles[step]}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
              {stepSubtitles[step]}
            </p>
          </div>

          {/* Divider */}
          <div
            style={{ height: 1, background: 'var(--color-border)', marginBottom: 20 }}
          />

          {/* Step Content */}
          {step === 0 && (
            <Step1 onNext={handleStep1} isLoading={isLoading} />
          )}
          {step === 1 && (
            <Step2
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleResend}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
            />
          )}
          {step === 2 && (
            <Step3 onSubmit={handleResetPassword} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
};
