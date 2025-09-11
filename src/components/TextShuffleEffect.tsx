import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TextShuffleEffectProps {
  originalText: string;
  targetText: string;
  className?: string;
  duration?: number;
  onComplete?: () => void;
  isActive?: boolean;
  highlightChanges?: boolean;
}

export const TextShuffleEffect: React.FC<TextShuffleEffectProps> = ({
  originalText,
  targetText,
  className = '',
  duration = 3000,
  onComplete,
  isActive = true,
  highlightChanges = true
}) => {
  const [displayText, setDisplayText] = useState(originalText);
  const [isShuffling, setIsShuffling] = useState(false);
  const [changedIndices, setChangedIndices] = useState<Set<number>>(new Set());

  const findChanges = useCallback(() => {
    const changes = new Set<number>();
    const maxLength = Math.max(originalText.length, targetText.length);
    
    for (let i = 0; i < maxLength; i++) {
      const originalChar = originalText[i] || '';
      const targetChar = targetText[i] || '';
      
      if (originalChar !== targetChar) {
        changes.add(i);
      }
    }
    
    return changes;
  }, [originalText, targetText]);

  const shuffleToTarget = useCallback(async () => {
    if (!isActive) return;

    setIsShuffling(true);
    const changes = findChanges();
    setChangedIndices(changes);

    const shuffleFrames = Math.floor(duration / 100); // 100ms per frame
    const originalChars = originalText.split('');
    const targetChars = targetText.split('');
    const maxLength = Math.max(originalChars.length, targetChars.length);

    // Create a shuffled version of changed characters
    const shuffleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789一二三四五六七八九十的了是我你他她它們這那些什麼怎麼為什';

    for (let frame = 0; frame < shuffleFrames; frame++) {
      const progress = frame / shuffleFrames;
      
      const shuffled = Array.from({ length: maxLength }, (_, index) => {
        const originalChar = originalChars[index] || '';
        const targetChar = targetChars[index] || '';
        
        // If this character doesn't change, keep it as is
        if (!changes.has(index)) {
          return originalChar;
        }
        
        // Calculate when this character should start transitioning
        const charProgress = Math.max(0, (progress * 1.5) - (index / maxLength) * 0.3);
        
        if (charProgress < 0.7) {
          // Shuffle phase: show random characters
          if (Math.random() < 0.3) { // Only change 30% of the time for smooth effect
            const randomIndex = Math.floor(Math.random() * shuffleChars.length);
            return shuffleChars[randomIndex];
          }
          return originalChar;
        } else {
          // Settle phase: transition to target character
          return targetChar;
        }
      }).join('');

      setDisplayText(shuffled);
      
      // Wait for next frame
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Ensure final text is correct
    setDisplayText(targetText);
    setIsShuffling(false);
    onComplete?.();
  }, [originalText, targetText, duration, onComplete, isActive, findChanges]);

  useEffect(() => {
    if (isActive && originalText !== targetText) {
      shuffleToTarget();
    } else {
      setDisplayText(targetText);
      setChangedIndices(findChanges());
    }
  }, [originalText, targetText, isActive, shuffleToTarget, findChanges]);

  const renderHighlightedText = (text: string) => {
    if (!highlightChanges) {
      return text;
    }

    return text.split('').map((char, index) => {
      const isChanged = changedIndices.has(index);
      return (
        <motion.span
          key={index}
          className={isChanged ? 'text-green-300 bg-green-900/30 rounded px-0.5' : ''}
          initial={isChanged ? { opacity: 0, scale: 0.8 } : {}}
          animate={isChanged ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          {char}
        </motion.span>
      );
    });
  };

  return (
    <motion.span 
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderHighlightedText(displayText)}
      {isShuffling && (
        <motion.span
          className="ml-1 text-blue-400"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.span>
      )}
    </motion.span>
  );
};

export default TextShuffleEffect;