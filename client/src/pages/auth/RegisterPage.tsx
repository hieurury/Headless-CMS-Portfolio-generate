import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';
import { StepProgress } from '../../components/auth/StepProgress';
import { OtpInput } from '../../components/auth/OtpInput';

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ['Tạo tài khoản', 'Xác thực email', 'Thông tin cá nhân'];
const OTP_RESEND_DELAY = 60;

const INTERESTS = [
  'Marketing',
  'Công nghệ thông tin',
  'Kỹ thuật',
  'Thiết kế',
  'Kinh doanh',
  'Giáo dục',
  'Y tế',
  'Nghệ thuật & Sáng tạo',
  'Khoa học dữ liệu',
  'Phát triển phần mềm',
];

// ─── Error Toast ─────────────────────────────────────────────────────────────

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
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--color-error)',
        }}
      />
      <span style={{ fontWeight: 500 }}>{message}</span>
    </div>
  </div>
);

// ─── Step 1: Account creation ─────────────────────────────────────────────────

const Step1: React.FC<{
  onNext: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}> = ({ onNext, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNext(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{
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
          }}
          onFocus={(e) =>
            (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')
          }
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 6,
          }}
        >
          Mật khẩu
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="register-password"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '10px 42px 10px 14px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow 0.2s',
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')
            }
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
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        id="register-submit"
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
            <Loader2 size={16} className="animate-spin" /> Đang xử lý...
          </>
        ) : (
          <>
            Tiếp theo <ChevronRight size={16} />
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          style={{ color: 'var(--color-text)', fontWeight: 500, textDecoration: 'underline' }}
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
};

// ─── Step 2: OTP Verification ─────────────────────────────────────────────────

const Step2: React.FC<{
  onVerify: (code: string) => Promise<void>;
  onResend: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}> = ({ onVerify, onResend, isLoading, error, clearError }) => {
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(OTP_RESEND_DELAY);
  const [localError, setLocalError] = useState<string | null>(null);
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
        if (v <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setLocalError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setLocalError(null);
    await onVerify(otp);
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
        Chúng tôi đã gửi mã xác thực 6 chữ số tới email của bạn. Mã có hiệu lực trong{' '}
        <strong style={{ color: 'var(--color-text)' }}>10 phút</strong>.
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
        id="verify-otp-submit"
        type="submit"
        disabled={isLoading || otp.length < 6}
        style={{
          width: '100%',
          padding: '11px',
          background: 'var(--color-text)',
          color: 'var(--color-bg)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          fontWeight: 600,
          cursor: isLoading || otp.length < 6 ? 'not-allowed' : 'pointer',
          opacity: isLoading || otp.length < 6 ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: 'var(--shadow-sm)',
          transition: 'opacity 0.2s',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Đang xác thực...
          </>
        ) : (
          'Xác thực'
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
            color:
              resendCountdown > 0
                ? 'var(--color-text-faint)'
                : 'var(--color-text-muted)',
            cursor: resendCountdown > 0 ? 'default' : 'pointer',
            textDecoration: resendCountdown === 0 ? 'underline' : 'none',
            transition: 'color 0.2s',
          }}
        >
          {resendCountdown > 0
            ? `Gửi lại sau ${resendCountdown}s`
            : 'Gửi lại mã xác thực'}
        </button>
      </div>
    </form>
  );
};

// ─── Step 3: Profile ──────────────────────────────────────────────────────────

const Step3: React.FC<{
  onSubmit: (data: {
    name?: string;
    age?: number;
    slogan?: string;
    occupation?: string;
    interests?: string[];
  }) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
}> = ({ onSubmit, onSkip, isLoading }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [slogan, setSlogan] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Parameters<typeof onSubmit>[0] = {};
    if (name.trim()) payload.name = name.trim();
    if (age) payload.age = Number(age);
    if (slogan.trim()) payload.slogan = slogan.trim();
    if (occupation.trim()) payload.occupation = occupation.trim();
    if (selectedInterests.length) payload.interests = selectedInterests;

    if (Object.keys(payload).length > 0) {
      await onSubmit(payload);
    } else {
      onSkip();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    marginBottom: 5,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Name + Age row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
        <div>
          <label style={labelStyle}>Họ và tên</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div style={{ width: 72 }}>
          <label style={labelStyle}>Tuổi</label>
          <input
            id="profile-age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            min={13}
            max={120}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Occupation */}
      <div>
        <label style={labelStyle}>Nghề nghiệp</label>
        <input
          id="profile-occupation"
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="Frontend Developer, Designer..."
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Slogan */}
      <div>
        <label style={labelStyle}>Slogan</label>
        <input
          id="profile-slogan"
          type="text"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="Câu slogan của bạn..."
          maxLength={160}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Interests */}
      <div>
        <label style={{ ...labelStyle, marginBottom: 8 }}>Danh mục quan tâm</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INTERESTS.map((item) => {
            const selected = selectedInterests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: selected
                    ? 'var(--color-text)'
                    : 'var(--color-surface-2)',
                  color: selected ? 'var(--color-bg)' : 'var(--color-text-muted)',
                  boxShadow: selected ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
        <button
          id="profile-submit"
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
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              Tiếp tục <ChevronRight size={16} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'underline',
          }}
        >
          Bỏ qua, cập nhật sau
        </button>
      </div>
    </form>
  );
};

// ─── Main RegisterPage ────────────────────────────────────────────────────────

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    verifyOtp,
    resendOtp,
    updateProfile,
    isLoading,
    isAuthenticated,
    error,
    clearError,
  } = useAuthStore();

  // If URL has ?step=2 (from login redirect for unverified users)
  const initialStep = searchParams.get('step') === '2' ? 1 : 0;
  const [step, setStep] = useState(initialStep);

  // If user is already authenticated and visits /register directly at step 0, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && step === 0 && !searchParams.get('step')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, step, searchParams, navigate]);

  // Auto-clear error on step change
  useEffect(() => {
    clearError();
  }, [step, clearError]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 4000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  // ─── Step handlers ──────────────────────────────────────────────────────────

  const handleStep1 = useCallback(
    async (email: string, password: string) => {
      await register(email, password);
      setStep(1);
    },
    [register],
  );

  const handleVerify = useCallback(
    async (code: string) => {
      await verifyOtp(code);
      setStep(2);
    },
    [verifyOtp],
  );

  const handleProfile = useCallback(
    async (data: Parameters<typeof updateProfile>[0]) => {
      await updateProfile(data);
      navigate('/dashboard');
    },
    [updateProfile, navigate],
  );

  const handleSkip = () => navigate('/dashboard');

  const stepTitles = ['Tạo tài khoản', 'Xác thực email', 'Thông tin cá nhân'];
  const stepSubtitles = [
    'Nhập email và mật khẩu để bắt đầu',
    'Nhập mã 6 chữ số từ email của bạn',
    'Tùy chọn — có thể cập nhật sau',
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
            style={{
              height: 1,
              background: 'var(--color-border)',
              marginBottom: 20,
            }}
          />

          {/* Step Content */}
          {step === 0 && (
            <Step1 onNext={handleStep1} isLoading={isLoading} />
          )}
          {step === 1 && (
            <Step2
              onVerify={handleVerify}
              onResend={resendOtp}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
            />
          )}
          {step === 2 && (
            <Step3
              onSubmit={handleProfile}
              onSkip={handleSkip}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
