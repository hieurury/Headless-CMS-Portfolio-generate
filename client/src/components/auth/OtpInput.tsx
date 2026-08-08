import React, { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  disabled = false,
  error
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ensure value is exactly 6 chars or padded
  const valueArray = value.split('').slice(0, 6);
  while (valueArray.length < 6) {
    valueArray.push('');
  }

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    
    const newValueArray = [...valueArray];
    newValueArray[index] = val.substring(val.length - 1); // take last character if multiple
    
    const newValue = newValueArray.join('');
    onChange(newValue);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !valueArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    
    const newValueArray = [...valueArray];
    for (let i = 0; i < pastedData.length; i++) {
      newValueArray[i] = pastedData[i];
    }
    
    onChange(newValueArray.join(''));
    
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const boxStyle: React.CSSProperties = {
    width: '44px',
    height: '56px',
    fontSize: '24px',
    fontWeight: 700,
    textAlign: 'center',
    backgroundColor: 'var(--color-surface-2)',
    color: 'var(--color-text)',
    border: 'none',
    borderRadius: '6px', // var(--radius-md)
    boxShadow: error ? '0 0 0 2px var(--color-error)' : '0 2px 8px rgba(0,0,0,0.3)',
    outline: 'none',
    transition: 'box-shadow 0.2s ease'
  };

  return (
    <div className="flex flex-col gap-2">
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
        {valueArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={boxStyle}
            onFocus={(e) => {
              if (!error) {
                e.target.style.boxShadow = '0 0 0 2px var(--color-text)';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              }
            }}
          />
        ))}
      </div>
      {error && (
        <div style={{ color: 'var(--color-error)', fontSize: '13px' }}>
          {error}
        </div>
      )}
    </div>
  );
};
