import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use GSAP quickTo for highly performant tracking, reduced duration for faster snap
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.05, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.05, ease: "power3.out" });

    const moveCursor = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Define what is considered "clickable"
      const isClickable = target.closest('a, button, input, select, textarea, label, .link, [role="button"]');
      setIsHovering(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseDown = (e: MouseEvent) => {
      // Spawn particles
      const numParticles = 8;
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'fixed pointer-events-none rounded-full bg-white z-[10001]';
        
        // Random size between 2px and 4px
        const size = Math.random() * 2 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        // Position at cursor
        particle.style.left = `${e.clientX - size/2}px`;
        particle.style.top = `${e.clientY - size/2}px`;
        particle.style.mixBlendMode = 'difference';
        
        document.body.appendChild(particle);

        // Random radial scatter
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 40 + 20; // 20px to 60px distance
        
        gsap.to(particle, {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          opacity: 0,
          scale: 0,
          duration: Math.random() * 0.3 + 0.3,
          ease: 'power3.out',
          onComplete: () => particle.remove()
        });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Hide default cursor globally
    document.body.style.cursor = 'none';
    
    // Fallback: hide cursor on links/buttons manually too
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
      document.head.removeChild(style);
    };
  }, [isVisible]);

  return (
    <>
      <style>
        {`
          @keyframes cursor-pulse-scale {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
          }
          .animate-cursor-pulse {
            animation: cursor-pulse-scale 1s ease-in-out infinite;
          }
        `}
      </style>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[10000] flex items-center justify-center w-10 h-10 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      >
        {/* Normal State: Tilted Rounded Triangle (Sharper & Smaller) */}
        <div 
          className={`absolute w-8 h-8 flex items-center justify-center transition-all duration-300 origin-center ${
            isHovering ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {/* Tip precisely at 50,50 so it targets the exact mouse coordinate */}
            <polygon 
              points="50,50 60,90 50,80 40,90" 
              fill="white" 
              stroke="white" 
              strokeWidth="6" 
              strokeLinejoin="round" 
              transform="rotate(-20 50 50)"
            />
          </svg>
        </div>

        {/* Hover State: Small Circular Dot with Pulse */}
        <div 
          className={`absolute w-3 h-3 bg-white rounded-full transition-all duration-300 origin-center ${
            isHovering ? 'scale-100 opacity-100 animate-cursor-pulse' : 'scale-0 opacity-0'
          }`}
        />
      </div>
    </>
  );
};
