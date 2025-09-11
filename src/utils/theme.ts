// Theme configuration for the techno-futuristic design
export const techTheme = {
  colors: {
    primary: '#00A9FF',      // Neon blue
    secondary: '#00FF88',    // Neon green
    danger: '#FF0055',       // Neon red
    warning: '#FFD700',      // Neon gold
    
    background: {
      main: '#0d1117',
      darker: '#010409',
      card: 'rgba(26, 42, 58, 0.5)',
      overlay: 'rgba(13, 17, 23, 0.9)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    
    text: {
      primary: '#e0e0e0',
      secondary: '#8a9eb3', 
      highlight: '#ffffff',
      muted: '#6b7280',
    },
    
    border: {
      primary: '#1a2a3a',
      glow: 'rgba(0, 169, 255, 0.3)',
    },
    
    shadow: {
      glowPrimary: '0 0 20px rgba(0, 169, 255, 0.5)',
      glowSecondary: '0 0 15px rgba(0, 255, 136, 0.5)',
      glowDanger: '0 0 15px rgba(255, 0, 85, 0.5)',
    },
  },

  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easings: {
      default: 'ease',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  typography: {
    fontFamily: {
      primary: '"Manrope", "Noto Sans", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
};

// Helper functions for theme usage
export const getGlowShadow = (color: keyof typeof techTheme.colors, intensity: 'low' | 'medium' | 'high' = 'medium') => {
  const colorValue = techTheme.colors[color];
  const intensityMap = {
    low: '0 0 10px',
    medium: '0 0 20px', 
    high: '0 0 30px, 0 0 50px',
  };
  
  return `${intensityMap[intensity]} ${colorValue}`;
};

export const getGlowText = (color: keyof typeof techTheme.colors, intensity: 'low' | 'medium' | 'high' = 'medium') => {
  const colorValue = techTheme.colors[color];
  const intensityMap = {
    low: `0 0 5px ${colorValue}`,
    medium: `0 0 5px ${colorValue}, 0 0 10px ${colorValue}`,
    high: `0 0 5px ${colorValue}, 0 0 10px ${colorValue}, 0 0 20px ${colorValue}`,
  };
  
  return intensityMap[intensity];
};

export const createGlassEffect = (opacity: number = 0.1) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

// Status color mappings
export const statusColors = {
  success: techTheme.colors.secondary,
  processing: techTheme.colors.primary,
  error: techTheme.colors.danger,
  warning: techTheme.colors.warning,
  idle: techTheme.colors.text.muted,
} as const;

export type StatusType = keyof typeof statusColors;

// Animation presets
export const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  
  glowPulse: {
    animate: {
      boxShadow: [
        getGlowShadow('primary', 'low'),
        getGlowShadow('primary', 'high'),
        getGlowShadow('primary', 'low'),
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default techTheme;