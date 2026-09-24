import { MouseEvent, ReactNode, useRef } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function GlassCard({ children, className = '', interactive = true }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty('--glass-x', `${x}%`);
    ref.current.style.setProperty('--glass-y', `${y}%`);
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={`glass-panel ${className}`}>
      <div className="glass-specular" aria-hidden="true" />
      <div className="glass-content">{children}</div>
    </div>
  );
}
