import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScrambledTextEffectProps {
  text: string;
  className?: string;
  duration?: number;
  scrambleChars?: string;
  onComplete?: () => void;
  isActive?: boolean;
  shouldLoop?: boolean; // New prop to enable looping
}

const defaultScrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789一二三四五六七八九十上下左右東西南北中文字型錯別語法修正檢查分析處理系統資料';

export const ScrambledTextEffect: React.FC<ScrambledTextEffectProps> = ({
  text,
  className = '',
  duration = 2000,
  scrambleChars = defaultScrambleChars,
  onComplete,
  isActive = true,
  shouldLoop = false
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(false);
  const [animationLoop, setAnimationLoop] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔄 ScrambledTextEffect useEffect triggered:', { 
      textLength: text?.length, 
      shouldLoop, 
      isActive 
    });
    
    // Clean up previous animation
    if (animationLoop) {
      clearInterval(animationLoop);
      setAnimationLoop(null);
    }
    
    // 如果沒有文字或不活動，停止動畫
    if (!text || !isActive) {
      console.log('❌ No text provided or inactive');
      setDisplayText('');
      setIsScrambling(false);
      return;
    }

    const runScrambleEffect = async () => {
      console.log('✅ Starting scramble effect for', text.length, 'characters');
      setIsScrambling(true);
      
      const chars = text.split('');
      const scrambleFrames = Math.floor(duration / 50); // 50ms per frame
      const revealDelay = Math.floor(scrambleFrames / chars.length);

      for (let frame = 0; frame < scrambleFrames; frame++) {
        const scrambled = chars.map((char, index) => {
          // Reveal characters progressively
          const revealAt = index * revealDelay;
          if (frame > revealAt) {
            return char;
          }
          
          // Skip spaces, keep Chinese and English characters for scrambling
          if (char === ' ' || char === '\n' || /^[，。！？、；：""''（）《》【】\-]$/.test(char)) {
            return char;
          }
          
          // Scramble with random characters
          const randomIndex = Math.floor(Math.random() * scrambleChars.length);
          return scrambleChars[randomIndex];
        }).join('');

        setDisplayText(scrambled);
        
        // Wait for next frame
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Ensure final text is correct
      setDisplayText(text);
      
      if (shouldLoop) {
        console.log('🔄 Looping animation...');
        // Wait a bit then restart
        await new Promise(resolve => setTimeout(resolve, 1000));
        runScrambleEffect(); // Recursive call for looping
      } else {
        setIsScrambling(false);
        console.log('✅ Scramble effect completed');
        onComplete?.();
      }
    };

    // 立即開始動畫
    runScrambleEffect();

    // Cleanup function
    return () => {
      if (animationLoop) {
        clearInterval(animationLoop);
      }
    };
  }, [text, duration, scrambleChars, onComplete, shouldLoop, isActive]);

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
      {isScrambling && (
        <motion.span
          className="ml-1"
          style={{ 
            color: 'var(--primary-color)',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace'
          }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          ▊
        </motion.span>
      )}
    </motion.div>
  );
};

export default ScrambledTextEffect;