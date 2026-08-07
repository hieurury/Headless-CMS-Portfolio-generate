import React from 'react';

interface StepProgressProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full flex flex-row items-start justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFuture = index > currentStep;

        let circleStyle: React.CSSProperties = {
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          zIndex: 2,
          position: 'relative',
          flexShrink: 0,
        };

        if (isCompleted) {
          circleStyle = {
            ...circleStyle,
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-bg)'
          };
        } else if (isCurrent) {
          circleStyle = {
            ...circleStyle,
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '2px solid var(--color-text)',
            boxShadow: '0 0 0 3px rgba(228,228,228,0.12)'
          };
        } else {
          circleStyle = {
            ...circleStyle,
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-text-muted)'
          };
        }

        return (
          <React.Fragment key={`step-${index}`}>
            <div className="flex flex-col items-center gap-2" style={{ width: '32px' }}>
              <div style={circleStyle}>
                {index + 1}
              </div>
              <div 
                style={{
                  fontSize: '11px',
                  color: isFuture ? 'var(--color-text-faint, #444444)' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  textAlign: 'center'
                }}
              >
                {step}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div 
                className="flex-1"
                style={{
                  height: '1px',
                  backgroundColor: index < currentStep ? 'var(--color-text)' : 'var(--color-border)',
                  marginTop: '16px', // half of circle height to vertically center with circles
                  transition: 'background-color 0.3s ease',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
