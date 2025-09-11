import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DecryptedTextEffectProps {
  text: string;
  className?: string;
  duration?: number;
  onComplete?: () => void;
  isActive?: boolean;
  decryptSpeed?: number; // ms between decrypt frames
  shouldLoop?: boolean; // New prop to enable looping
}

const DECRYPT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()一二三四五六七八九十上下左右東西南北中文字型錯別語法修正檢查分析處理系統資料數據流程演算法智慧型人工';

export const DecryptedTextEffect: React.FC<DecryptedTextEffectProps> = ({
  text,
  className = '',
  duration = 5000,
  onComplete,
  isActive = true,
  decryptSpeed = 50, // 50ms per frame for fast decryption
  shouldLoop = false
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState<boolean[]>([]);

  useEffect(() => {
    console.log('🔓 DecryptedTextEffect triggered:', { textLength: text?.length, decryptSpeed });
    
    if (!text || !isActive) {
      setDisplayText('');
      return;
    }

    const runDecryptEffect = async () => {
      console.log('✅ Starting Matrix decrypt effect for', text.length, 'characters');
      setIsDecrypting(true);
      setDisplayText('');
      
      const chars = text.split('');
      const totalFrames = Math.floor(duration / decryptSpeed);
      const progress = new Array(chars.length).fill(false);
      setDecryptProgress(progress);
      
      // Start with all characters encrypted
      let currentDisplay = chars.map((char, index) => {
        // Keep structural characters visible
        if (char === '\n' || char === ' ' || /^[，。！？、；：""''（）《》【】\-]$/.test(char)) {
          progress[index] = true; // Mark as already decrypted
          return char;
        }
        // Return random character for encryption
        return DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)];
      });
      
      setDisplayText(currentDisplay.join(''));
      
      // Calculate how many characters to decrypt per frame to finish in specified duration
      const charactersToDecrypt = chars.filter(char => 
        char !== '\n' && char !== ' ' && !/^[，。！？、；：""''（）《》【】\-]$/.test(char)
      ).length;
      
      const charactersPerFrame = Math.max(1, Math.ceil(charactersToDecrypt / totalFrames));
      
      for (let frame = 0; frame < totalFrames; frame++) {
        // Decrypt some characters this frame
        let decryptedThisFrame = 0;
        const indices = Array.from({ length: chars.length }, (_, i) => i)
          .filter(i => !progress[i]) // Only undecrypted characters
          .sort(() => Math.random() - 0.5); // Randomize order
        
        // Decrypt characters for this frame
        for (const index of indices) {
          if (decryptedThisFrame >= charactersPerFrame) break;
          
          progress[index] = true;
          currentDisplay[index] = chars[index];
          decryptedThisFrame++;
        }
        
        // Update remaining encrypted characters with new random chars
        for (let i = 0; i < chars.length; i++) {
          if (!progress[i]) {
            const char = chars[i];
            if (char !== '\n' && char !== ' ' && !/^[，。！？、；：""''（）《》【】\-]$/.test(char)) {
              // Add some stability - 70% chance to change to new random char
              if (Math.random() < 0.7) {
                currentDisplay[i] = DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)];
              }
            }
          }
        }
        
        setDisplayText(currentDisplay.join(''));
        setDecryptProgress([...progress]);
        
        // Wait for next frame
        await new Promise(resolve => setTimeout(resolve, decryptSpeed));
        
        // If all characters are decrypted, break early
        if (progress.every(p => p)) break;
      }
      
      // Ensure final text is completely correct
      setDisplayText(text);
      setIsDecrypting(false);
      console.log('✅ Matrix decrypt effect completed');
      
      // If shouldLoop is true, restart the effect after a brief pause
      if (shouldLoop) {
        console.log('🔁 Looping decrypt effect...');
        setTimeout(() => {
          runDecryptEffect();
        }, 500); // Brief pause before looping
      } else {
        onComplete?.();
      }
    };

    runDecryptEffect();
  }, [text, duration, decryptSpeed, onComplete, isActive, shouldLoop]);

  const renderDecryptedText = () => {
    return displayText.split('').map((char, index) => {
      const isDecrypted = decryptProgress[index];
      const isStructural = char === '\n' || char === ' ' || /^[，。！？、；：""''（）《》【】\-]$/.test(char);
      
      return (
        <span
          key={index}
          style={{
            color: isDecrypted || isStructural 
              ? '#00ff00' // Bright green for decrypted
              : '#004400', // Dark green for encrypted
            textShadow: isDecrypted || isStructural
              ? '0 0 5px #00ff00'  // Glow effect for decrypted
              : 'none',
            fontWeight: isDecrypted || isStructural ? 'normal' : '300',
            transition: 'all 0.3s ease'
          }}
        >
          {char === '\n' ? <br /> : char}
        </span>
      );
    });
  };

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily: 'var(--font-chinese), "Courier New", monospace',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        backgroundColor: 'rgba(0, 20, 0, 0.1)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid rgba(0, 255, 0, 0.2)'
      }}
    >
      {renderDecryptedText()}
      {isDecrypting && (
        <motion.span
          className="ml-1"
          style={{ 
            color: '#00ff00',
            fontSize: '1.2em',
            fontFamily: '"Courier New", monospace'
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        >
          █
        </motion.span>
      )}
    </motion.div>
  );
};

export default DecryptedTextEffect;