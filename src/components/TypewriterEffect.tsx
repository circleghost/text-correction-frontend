import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypewriterEffectProps {
  text: string;
  className?: string;
  duration?: number;
  onComplete?: () => void;
  isActive?: boolean;
  speed?: number; // words per minute, default 500
  shouldLoop?: boolean; // New prop to enable looping
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  className = '',
  duration = 5000,
  onComplete,
  isActive = true,
  speed = 500, // words per minute
  shouldLoop = false
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    console.log('🖨️ TypewriterEffect triggered:', { textLength: text?.length, speed });
    
    if (!text || !isActive) {
      setDisplayText('');
      return;
    }

    const runTypewriterEffect = async () => {
      console.log('✅ Starting typewriter effect for', text.length, 'characters');
      setIsTyping(true);
      setDisplayText('');
      
      // Calculate typing speed based on WPM
      // Average Chinese character count per word is ~1.5, English is ~5
      const avgCharsPerWord = /[\u4e00-\u9fff]/.test(text) ? 1.5 : 5;
      const wordsPerSecond = speed / 60;
      const charsPerSecond = wordsPerSecond * avgCharsPerWord;
      const msPerChar = 1000 / charsPerSecond;
      
      // Add natural variance to typing speed
      const chars = text.split('');
      let currentText = '';
      
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        currentText += char;
        
        // Calculate delay with natural variance
        let charDelay = msPerChar;
        
        // Add pauses for punctuation - reduced for faster animation
        if (/[。！？；：\n]/.test(char)) {
          charDelay *= 3; // Long pause for sentence endings (reduced from 8)
        } else if (/[，、；]/.test(char)) {
          charDelay *= 1.5; // Medium pause for commas (reduced from 3)
        } else if (char === ' ') {
          charDelay *= 1.2; // Short pause for spaces (reduced from 2)
        }
        
        // Add randomness to make it feel more human
        charDelay *= (0.8 + Math.random() * 0.4); // ±20% variance
        
        setDisplayText(currentText);
        
        // Don't wait after the last character
        if (i < chars.length - 1) {
          await new Promise(resolve => setTimeout(resolve, charDelay));
        }
      }

      setIsTyping(false);
      console.log('✅ Typewriter effect completed');
      onComplete?.();
    };

    runTypewriterEffect();
  }, [text, duration, speed, onComplete, isActive]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530); // Standard cursor blink rate

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        color: '#e0e0e0',
        fontFamily: 'var(--font-chinese)',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap'
      }}
    >
      {displayText}
      {isTyping && (
        <motion.span
          className="ml-1"
          style={{ 
            color: 'var(--primary-color)',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            opacity: cursorVisible ? 1 : 0.3
          }}
          transition={{ duration: 0.1 }}
        >
          ▊
        </motion.span>
      )}
    </motion.div>
  );
};

export default TypewriterEffect;