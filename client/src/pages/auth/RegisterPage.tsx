import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { Eye, EyeOff, Check, Loader2, ChevronRight, X, Tag, Search, Sparkles, Plus } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';
import { StepProgress } from '../../components/auth/StepProgress';
import { OtpInput } from '../../components/auth/OtpInput';

import { useUIStore } from '../../store/uiStore';
import { useAlertStore } from '../../store/alertStore';
import { translateError } from '../../i18n';
import { useSeo } from '../../hooks/useSeo';

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ['Tạo tài khoản', 'Xác thực email', 'Thông tin cá nhân'];
const OTP_RESEND_DELAY = 60;
const USERNAME_REGEX = /^[a-z0-9][a-z0-9_-]{2,29}$/;

// Helper to remove Vietnamese diacritics for smart search
const normalizeVietnamese = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};



// ─── Shared input style helper ────────────────────────────────────────────────

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

// ─── Step 1: Account creation (email + password + username) ───────────────────

const Step1: React.FC<{
  onNext: (email: string, password: string, username: string) => Promise<void>;
  isLoading: boolean;
}> = ({ onNext, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUsernameChange = (val: string) => {
    // Force lowercase + strip invalid chars on the fly
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!cleaned) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (!USERNAME_REGEX.test(cleaned)) {
      setUsernameStatus('invalid');
      setUsernameMessage('3–30 ký tự, bắt đầu bằng chữ/số, chỉ dùng a-z, 0-9, - hoặc _');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('');

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await authService.checkUsername(cleaned);
        if (result.available) {
          setUsernameStatus('available');
          setUsernameMessage('');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(result.reason ?? 'Username đã được sử dụng');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') return;
    await onNext(email, password, username);
  };

  const getUsernameBorderColor = () => {
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return '0 0 0 2px var(--color-error)';
    return 'var(--shadow-sm)';
  };

  const getUsernameStatusIcon = () => {
    if (usernameStatus === 'checking') return <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />;
    if (usernameStatus === 'available') return <Check size={14} style={{ color: '#22c55e' }} />;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return <span title={usernameMessage} style={{display: 'flex'}}><X size={14} style={{ color: 'var(--color-error)' }} /></span>;
    return null;
  };

  const isSubmitDisabled = isLoading || usernameStatus !== 'available';
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Username */}
      <div>
        <label style={labelStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Tên đăng nhập
            <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
          </span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="johndoe"
            required
            maxLength={30}
            style={{
              ...inputStyle,
              paddingRight: 38,
              boxShadow: username ? getUsernameBorderColor() : 'var(--shadow-sm)',
            }}
            autoComplete="username"
          />
          {username && (
            <div style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              {getUsernameStatusIcon()}
            </div>
          )}
        </div>



      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>
          Email <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ ...inputStyle, paddingRight: 38 }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
          />
          {isEmailValid && (
            <div style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              <Check size={14} style={{ color: '#22c55e' }} />
            </div>
          )}
          {email && !isEmailValid && (
            <div style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              <span title="Email không hợp lệ" style={{display: 'flex'}}><X size={14} style={{ color: 'var(--color-error)', cursor: 'help' }} /></span>
            </div>
          )}
        </div>
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>
          Mật khẩu <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
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
            style={{ ...inputStyle, paddingRight: 64 }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
          />
          {isPasswordValid && (
            <div style={{
              position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              <Check size={14} style={{ color: '#22c55e' }} />
            </div>
          )}
          {password && !isPasswordValid && (
            <div style={{
              position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              <span title="Mật khẩu phải từ 6 ký tự trở lên" style={{display: 'flex'}}><X size={14} style={{ color: 'var(--color-error)', cursor: 'help' }} /></span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', padding: 0, display: 'flex',
            }}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        id="register-submit"
        type="submit"
        disabled={isSubmitDisabled}
        style={{
          width: '100%', padding: '11px',
          background: 'var(--color-text)', color: 'var(--color-bg)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: 14, fontWeight: 600,
          cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
          opacity: isSubmitDisabled ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.2s', marginTop: 4,
        }}
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
        ) : (
          <>Tiếp theo <ChevronRight size={16} /></>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
        Đã có tài khoản?{' '}
        <Link to="/login" style={{ color: 'var(--color-text)', fontWeight: 500, textDecoration: 'underline' }}>
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
        if (v <= 1) { clearInterval(intervalRef.current!); return 0; }
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
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
        Chúng tôi đã gửi mã xác thực 6 chữ số tới email của bạn. Mã có hiệu lực trong{' '}
        <strong style={{ color: 'var(--color-text)' }}>10 phút</strong>.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <OtpInput
          value={otp}
          onChange={(val) => { setOtp(val); if (localError) setLocalError(null); if (error) clearError(); }}
          disabled={isLoading}
          error={displayError ?? undefined}
        />
      </div>

      <button
        id="verify-otp-submit"
        type="submit"
        disabled={isLoading || otp.length < 6}
        style={{
          width: '100%', padding: '11px',
          background: 'var(--color-text)', color: 'var(--color-bg)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: 14, fontWeight: 600,
          cursor: isLoading || otp.length < 6 ? 'not-allowed' : 'pointer',
          opacity: isLoading || otp.length < 6 ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.2s',
        }}
      >
        {isLoading ? <><Loader2 size={16} className="animate-spin" /> Đang xác thực...</> : 'Xác thực'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0}
          style={{
            background: 'none', border: 'none', fontSize: 13,
            color: resendCountdown > 0 ? 'var(--color-text-faint)' : 'var(--color-text-muted)',
            cursor: resendCountdown > 0 ? 'default' : 'pointer',
            textDecoration: resendCountdown === 0 ? 'underline' : 'none',
            transition: 'color 0.2s',
          }}
        >
          {resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại mã xác thực'}
        </button>
      </div>
    </form>
  );
};

// ─── Step 3: Profile (fullName optional + other info) ─────────────────────────

const Step3: React.FC<{
  onSubmit: (data: {
    fullName?: string;
    age?: number;
    slogan?: string;
    occupation?: string;
    interests?: string[];
  }) => Promise<void>;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [slogan, setSlogan] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [fetchedCategories, setFetchedCategories] = useState<string[]>([]);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const categoryPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    authService.getCategories().then((res) => {
      if (mounted) setFetchedCategories(res);
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryPopoverRef.current &&
        !categoryPopoverRef.current.contains(e.target as Node)
      ) {
        setIsCategoryPopoverOpen(false);
      }
    };
    if (isCategoryPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryPopoverOpen]);

  const sampleSuggestedCategories = useMemo(() => {
    return fetchedCategories.slice(0, 3);
  }, [fetchedCategories]);

  const filteredCategories = useMemo(() => {
    const query = normalizeVietnamese(categorySearchQuery.trim());
    if (!query) return fetchedCategories;
    return fetchedCategories.filter((cat) =>
      normalizeVietnamese(cat).includes(query)
    );
  }, [categorySearchQuery, fetchedCategories]);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Parameters<typeof onSubmit>[0] = {};
    if (fullName.trim()) payload.fullName = fullName.trim();
    if (age) payload.age = Number(age);
    if (slogan.trim()) payload.slogan = slogan.trim();
    if (occupation.trim()) payload.occupation = occupation.trim();
    if (selectedInterests.length) payload.interests = selectedInterests;
    await onSubmit(payload);
  };

  const stepInputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    background: 'var(--color-surface-2)', color: 'var(--color-text)',
    border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, outline: 'none',
    boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s',
  };

  const stepLabelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
    textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 5,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-text)');
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.boxShadow = 'var(--shadow-sm)');

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* fullName + Age */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
        <div>
          <label style={stepLabelStyle}>Họ và tên</label>
          <input
            id="profile-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            style={stepInputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div style={{ width: 72 }}>
          <label style={stepLabelStyle}>Tuổi</label>
          <input
            id="profile-age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            min={13}
            max={120}
            style={stepInputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Occupation */}
      <div>
        <label style={stepLabelStyle}>Nghề nghiệp</label>
        <input
          id="profile-occupation"
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="Frontend Developer, Designer..."
          style={stepInputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Slogan */}
      <div>
        <label style={stepLabelStyle}>Slogan</label>
        <input
          id="profile-slogan"
          type="text"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="Câu slogan của bạn..."
          maxLength={160}
          style={stepInputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Interests */}
      <div>
        <label style={{ ...stepLabelStyle, marginBottom: 8 }}>Danh mục quan tâm</label>
        <div style={{ position: 'relative' }} ref={categoryPopoverRef}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {selectedInterests.length > 0 ? (
              selectedInterests.map((item) => (
                <span
                  key={item}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                    fontSize: 12, fontWeight: 500,
                    background: 'var(--color-surface-2)', color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleInterest(item)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, opacity: 0.6 }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontStyle: 'italic', marginRight: 4 }}>
                Chưa chọn danh mục nào
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setIsCategoryPopoverOpen(!isCategoryPopoverOpen);
                setCategorySearchQuery('');
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: isCategoryPopoverOpen ? 'var(--color-text)' : 'var(--color-surface-2)',
                color: isCategoryPopoverOpen ? 'var(--color-bg)' : 'var(--color-text)',
                boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s'
              }}
            >
              <Plus size={13} />
              Thêm danh mục
            </button>
          </div>

          {/* Category Popover */}
          {isCategoryPopoverOpen && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute', left: 0, bottom: '100%', marginBottom: 8, zIndex: 50,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)',
                width: 360, maxWidth: '100%', padding: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={14} style={{ color: 'var(--color-text)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>Danh mục quan tâm</span>
                </div>
                <button type="button" onClick={() => setIsCategoryPopoverOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Tìm kiếm danh mục..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 28px 6px 30px', fontSize: 12,
                    background: 'var(--color-surface-2)', color: 'var(--color-text)',
                    border: 'none', borderRadius: 'var(--radius-sm)', outline: 'none'
                  }}
                />
                {categorySearchQuery && (
                  <button type="button" onClick={() => setCategorySearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={12} style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                )}
              </div>

              {!categorySearchQuery.trim() ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    <Sparkles size={11} /> Gợi ý tiêu biểu
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sampleSuggestedCategories.map(cat => {
                      const isSelected = selectedInterests.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleInterest(cat)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                            background: isSelected ? 'var(--color-text)' : 'var(--color-surface-2)',
                            color: isSelected ? 'var(--color-bg)' : 'var(--color-text-muted)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          {isSelected ? <Check size={12} /> : <Plus size={12} />} {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Kết quả tìm kiếm ({filteredCategories.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(cat => {
                        const isSelected = selectedInterests.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleInterest(cat)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                              background: isSelected ? 'var(--color-text)' : 'var(--color-surface-2)',
                              color: isSelected ? 'var(--color-bg)' : 'var(--color-text-muted)',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            {isSelected ? <Check size={12} /> : <Plus size={12} />} {cat}
                          </button>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>Không tìm thấy danh mục.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
        <button
          id="profile-submit"
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '11px',
            background: 'var(--color-text)', color: 'var(--color-bg)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 14, fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
          ) : (
            <>Hoàn tất <Check size={16} /></>
          )}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-faint)', margin: 0 }}>
          Tất cả thông tin có thể cập nhật sau trong phần cài đặt
        </p>
      </div>
    </form>
  );
};

// ─── Main RegisterPage ────────────────────────────────────────────────────────

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useUIStore();
  const { showAlert } = useAlertStore();

  useSeo({
    title: 'Ruryfo CMS — Đăng ký',
    description: 'Đăng ký tài khoản Ruryfo CMS để bắt đầu tạo portfolio cá nhân của bạn.',
  });
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

  const initialStep = searchParams.get('step') === '2' ? 1 : 0;
  const [step, setStep] = useState(initialStep);

  useEffect(() => {
    if (isAuthenticated && step === 0 && !searchParams.get('step')) {
      const user = useAuthStore.getState().user;
      navigate(`/${user?.username}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, step, searchParams, navigate]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return;
    showAlert(translateError(error, language), 'error');
    const timer = setTimeout(clearError, 4000);
    return () => clearTimeout(timer);
  }, [error, language, clearError, showAlert]);

  // ─── Step handlers ──────────────────────────────────────────────────────────

  const handleStep1 = useCallback(
    async (email: string, password: string, username: string) => {
      await register(email, password, username);
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
      const user = useAuthStore.getState().user;
      navigate(`/${user?.username}/dashboard`);
    },
    [updateProfile, navigate],
  );

  const stepTitles = ['Tạo tài khoản', 'Xác thực email', 'Thông tin cá nhân'];
  const stepSubtitles = [
    'Nhập email, mật khẩu và username của bạn',
    'Nhập mã 6 chữ số từ email của bạn',
    'Tùy chọn — có thể cập nhật sau',
  ];

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 16px 24px', background: 'var(--color-bg)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <AuthNavbar />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'var(--color-surface-2)', filter: 'blur(100px)', opacity: 0.4,
          pointerEvents: 'none',
        }}
      />



      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }} className="animate-slide-up">
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <StepProgress steps={STEPS} currentStep={step} />
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
            padding: '28px 28px 24px', boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontSize: 18, fontWeight: 700, color: 'var(--color-text)',
                margin: '0 0 4px', letterSpacing: '-0.3px',
              }}
            >
              {stepTitles[step]}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
              {stepSubtitles[step]}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 20 }} />

          {/* Step Content */}
          {step === 0 && <Step1 onNext={handleStep1} isLoading={isLoading} />}
          {step === 1 && (
            <Step2
              onVerify={handleVerify}
              onResend={resendOtp}
              isLoading={isLoading}
              error={error ? translateError(error, language) : null}
              clearError={clearError}
            />
          )}
          {step === 2 && (
            <Step3
              onSubmit={handleProfile}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
