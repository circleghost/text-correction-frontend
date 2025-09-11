import React from 'react';
import { motion } from 'framer-motion';

export interface NeonProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showDataFlow?: boolean;
  animated?: boolean;
  className?: string;
  label?: string;
}

const NeonProgressBar: React.FC<NeonProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showPercentage = true,
  showDataFlow = true,
  animated = true,
  className = '',
  label
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isComplete = percentage >= 100;

  const baseClasses = `
    neon-progress
    neon-progress--${variant}
    neon-progress--${size}
    ${animated ? 'neon-progress--animated' : ''}
    ${isComplete ? 'neon-progress--complete' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const fillClasses = `
    neon-progress-fill
    neon-progress-fill--${variant}
    ${showDataFlow ? 'neon-progress-fill--data-flow' : ''}
    ${isComplete ? 'neon-progress-fill--complete' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="neon-progress-container">
      {label && (
        <div className="neon-progress-label">
          <span className="neon-progress-label-text">{label}</span>
          {showPercentage && (
            <span className="neon-progress-percentage">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      <div className={baseClasses}>
        {/* Background glow */}
        <div className="neon-progress-bg-glow"></div>
        
        {/* Progress fill */}
        <motion.div
          className={fillClasses}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        >
          {/* Data flow animation */}
          {showDataFlow && (
            <div className="neon-progress-data-flow">
              <div className="data-stream"></div>
              <div className="data-stream data-stream--delayed"></div>
            </div>
          )}
          
          {/* Progress glow */}
          <div className="neon-progress-fill-glow"></div>
          
          {/* Scan line for active progress */}
          {!isComplete && percentage > 0 && (
            <motion.div
              className="neon-progress-scan-line"
              animate={{ 
                x: [-20, 20, -20],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
        
        {/* Corner decorations */}
        <div className="neon-progress-corners">
          <div className="progress-corner progress-corner--tl"></div>
          <div className="progress-corner progress-corner--tr"></div>
          <div className="progress-corner progress-corner--bl"></div>
          <div className="progress-corner progress-corner--br"></div>
        </div>
        
        {/* Circuit lines */}
        <div className="neon-progress-circuits">
          <div className="circuit-line circuit-line--horizontal"></div>
          <div className="circuit-line circuit-line--vertical"></div>
        </div>
      </div>
      
      {/* Status indicator for completed progress */}
      {isComplete && (
        <motion.div
          className="neon-progress-complete-indicator"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="complete-glow-ring"></div>
          <span className="complete-text">COMPLETE</span>
        </motion.div>
      )}
    </div>
  );
};

// Specialized progress bar components
export const CircularNeonProgress: React.FC<Omit<NeonProgressBarProps, 'size'> & { 
  diameter?: number 
}> = ({ 
  value, 
  max = 100, 
  variant = 'primary', 
  diameter = 120,
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (diameter - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={`neon-circular-progress neon-circular-progress--${variant} ${className}`}
      style={{ width: diameter, height: diameter }}
    >
      <svg width={diameter} height={diameter} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          className="circular-progress-bg"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          className="circular-progress-fill"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference
          }}
        />
        
        {/* Glow effect */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          className="circular-progress-glow"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="circular-progress-content">
        {showPercentage && (
          <span className="circular-progress-percentage">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default NeonProgressBar;