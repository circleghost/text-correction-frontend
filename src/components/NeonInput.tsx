import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface NeonInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'text' | 'textarea' | 'password' | 'email';
  disabled?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  rows?: number;
  className?: string;
  [key: string]: any;
}

const NeonInput: React.FC<NeonInputProps> = ({
  value = '',
  onChange,
  placeholder = '',
  variant = 'primary',
  size = 'md',
  type = 'text',
  disabled = false,
  maxLength,
  showCharCount = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value.length);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const baseClasses = `
    neon-input
    neon-input--${variant}
    neon-input--${size}
    ${isFocused ? 'neon-input--focused' : ''}
    ${disabled ? 'neon-input--disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const containerClasses = `
    neon-input-container
    neon-input-container--${variant}
    ${isFocused ? 'neon-input-container--focused' : ''}
  `.trim().replace(/\s+/g, ' ');

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <motion.div 
      className={containerClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="neon-input-wrapper">
        <InputComponent
          ref={inputRef as any}
          type={type === 'textarea' ? undefined : type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={type === 'textarea' ? rows : undefined}
          className={baseClasses}
          {...props}
        />
        
        {/* Glow effect */}
        <div className="neon-input-glow"></div>
        
        {/* Corner decorations */}
        <div className="neon-input-corners">
          <div className="neon-input-corner neon-input-corner--tl"></div>
          <div className="neon-input-corner neon-input-corner--tr"></div>
          <div className="neon-input-corner neon-input-corner--bl"></div>
          <div className="neon-input-corner neon-input-corner--br"></div>
        </div>
        
        {/* Scan line effect */}
        {isFocused && (
          <motion.div
            className="neon-input-scan-line"
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.5, ease: 'linear' }}
          />
        )}
      </div>
      
      {/* Character count */}
      {showCharCount && maxLength && (
        <div className="neon-input-char-count">
          <span className={charCount > maxLength * 0.9 ? 'text-warning' : ''}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Specialized input components
export const NeonTextInput: React.FC<Omit<NeonInputProps, 'type'>> = (props) => (
  <NeonInput {...props} type="text" />
);

export const NeonTextarea: React.FC<Omit<NeonInputProps, 'type'>> = (props) => (
  <NeonInput {...props} type="textarea" />
);

export const NeonPasswordInput: React.FC<Omit<NeonInputProps, 'type'>> = (props) => (
  <NeonInput {...props} type="password" />
);

export const NeonEmailInput: React.FC<Omit<NeonInputProps, 'type'>> = (props) => (
  <NeonInput {...props} type="email" />
);

export default NeonInput;