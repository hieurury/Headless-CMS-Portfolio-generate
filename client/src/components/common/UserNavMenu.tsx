import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

export const UserNavMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm transition-all duration-200"
        style={{
          background: isOpen ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
          boxShadow: 'var(--shadow-sm)',
          border: 'none',
          cursor: 'pointer',
        }}
        title={user?.name || 'Tài khoản'}
      >
        {/* Avatar */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--color-surface-3)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            (user?.name || 'U').charAt(0).toUpperCase()
          )}
        </div>

        {/* User Name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text)',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user?.name || 'User'}
        </span>

        {/* Chevron icon */}
        <ChevronDown
          size={14}
          style={{
            color: 'var(--color-text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-sm z-50 animate-fade-in"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-xl)',
            padding: '6px',
          }}
        >
          {/* Header Info */}
          <div className="px-3 py-2">
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'User'}
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--color-text-muted)',
                margin: '2px 0 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </p>
          </div>

          <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

          {/* Menu Items */}
          <Link
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition-colors"
            style={{
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <UserIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span>Trang cá nhân</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded text-left transition-colors"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-error)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-error-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={14} style={{ color: 'var(--color-error)' }} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};
