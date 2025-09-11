import React from 'react';
import { motion } from 'framer-motion';

export interface NeonButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  type?: 'pulse' | 'scan' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'primary',
  type = 'pulse',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = `
    neon-button
    neon-button--${variant}
    neon-button--${type}
    neon-button--${size}
    ${disabled ? 'neon-button--disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const buttonContent = (
    <>
      <span className="neon-button__text">{children}</span>
      {type === 'scan' && (
        <>
          <div className="neon-button__scan-line"></div>
          <div className="neon-button__corners">
            <div className="corner corner--tl"></div>
            <div className="corner corner--tr"></div>
            <div className="corner corner--bl"></div>
            <div className="corner corner--br"></div>
          </div>
        </>
      )}
      {type === 'glow' && <div className="neon-button__glow"></div>}
    </>
  );

  return (
    <motion.button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, filter: disabled ? 'brightness(1)' : 'brightness(1.2)' }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
};

// 特定類型的按鈕組件
export const PulseButton: React.FC<Omit<NeonButtonProps, 'type'>> = (props) => (
  <NeonButton {...props} type="pulse" />
);

export const ScanButton: React.FC<Omit<NeonButtonProps, 'type'>> = (props) => (
  <NeonButton {...props} type="scan" />
);

export const GlowButton: React.FC<Omit<NeonButtonProps, 'type'>> = (props) => (
  <NeonButton {...props} type="glow" />
);

export default NeonButton;