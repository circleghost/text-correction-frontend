// Text processing utilities

import type { Paragraph, TextCorrection } from '@/types';

/**
 * Split text into paragraphs based on double line breaks
 * Also handles single line breaks within paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text.trim()) return [];

  // Split by double line breaks first
  let paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // If still too long, split by sentence endings
  const maxParagraphLength = 500;
  const result: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxParagraphLength) {
      result.push(paragraph);
    } else {
      // Split by sentence endings but try to keep related sentences together
      const sentences = paragraph.split(/(?<=[。！？])\s*/);
      let currentParagraph = '';

      for (const sentence of sentences) {
        if (currentParagraph.length + sentence.length <= maxParagraphLength) {
          currentParagraph += (currentParagraph ? '' : '') + sentence;
        } else {
          if (currentParagraph) {
            result.push(currentParagraph);
          }
          currentParagraph = sentence;
        }
      }

      if (currentParagraph) {
        result.push(currentParagraph);
      }
    }
  }

  return result;
}

/**
 * Generate paragraph objects with unique IDs
 */
export function createParagraphs(texts: string[]): Paragraph[] {
  return texts.map((text, index) => ({
    id: `paragraph-${index + 1}`,
    text,
    corrections: [],
    status: 'pending' as const,
  }));
}

/**
 * Calculate text statistics
 */
export function getTextStats(text: string) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const paragraphs = splitIntoParagraphs(text).length;
  const lines = text.split('\n').length;

  return {
    chars,
    charsNoSpaces,
    words,
    paragraphs,
    lines,
  };
}

/**
 * Validate text input
 */
export function validateTextInput(text: string, maxLength: number = 10000): {
  isValid: boolean;
  error?: string;
} {
  if (!text.trim()) {
    return {
      isValid: false,
      error: '請輸入需要校正的文字',
    };
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `文字長度超過限制（${maxLength} 字元），請分段處理`,
    };
  }

  return { isValid: true };
}

/**
 * Validate Google Docs URL
 */
export function validateGoogleDocsUrl(url: string): {
  isValid: boolean;
  error?: string;
} {
  if (!url.trim()) {
    return {
      isValid: false,
      error: '請輸入 Google Docs 網址',
    };
  }

  // Check if it's a valid Google Docs URL
  const googleDocsPattern = /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/;
  
  if (!googleDocsPattern.test(url)) {
    return {
      isValid: false,
      error: '請輸入有效的 Google Docs 分享網址',
    };
  }

  return { isValid: true };
}

/**
 * Apply corrections to text and generate diff-friendly output
 */
export function applyCorrections(originalText: string, corrections: TextCorrection[]): {
  correctedText: string;
  segments: Array<{
    text: string;
    type: 'unchanged' | 'added' | 'removed';
    original?: string;
    corrected?: string;
  }>;
} {
  if (corrections.length === 0) {
    return {
      correctedText: originalText,
      segments: [{ text: originalText, type: 'unchanged' }],
    };
  }

  // Sort corrections by position (start index)
  const sortedCorrections = [...corrections].sort((a, b) => a.position.start - b.position.start);
  
  const segments: Array<{
    text: string;
    type: 'unchanged' | 'added' | 'removed';
    original?: string;
    corrected?: string;
  }> = [];

  let correctedText = '';
  let lastIndex = 0;

  for (const correction of sortedCorrections) {
    const { start, end } = correction.position;
    
    // Add unchanged text before this correction
    if (start > lastIndex) {
      const unchangedText = originalText.slice(lastIndex, start);
      segments.push({ text: unchangedText, type: 'unchanged' });
      correctedText += unchangedText;
    }

    // Add removed text segment
    segments.push({
      text: correction.original,
      type: 'removed',
      original: correction.original,
      corrected: correction.corrected,
    });

    // Add corrected text segment
    segments.push({
      text: correction.corrected,
      type: 'added',
      original: correction.original,
      corrected: correction.corrected,
    });

    correctedText += correction.corrected;
    lastIndex = end;
  }

  // Add remaining unchanged text
  if (lastIndex < originalText.length) {
    const remainingText = originalText.slice(lastIndex);
    segments.push({ text: remainingText, type: 'unchanged' });
    correctedText += remainingText;
  }

  return { correctedText, segments };
}

/**
 * Format processing time in human-readable format
 */
export function formatProcessingTime(timeInMs: number): string {
  if (timeInMs < 1000) {
    return `${timeInMs}ms`;
  } else if (timeInMs < 60000) {
    return `${(timeInMs / 1000).toFixed(1)}秒`;
  } else {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = ((timeInMs % 60000) / 1000).toFixed(0);
    return `${minutes}分${seconds}秒`;
  }
}

/**
 * Estimate processing time based on text length
 */
export function estimateProcessingTime(textLength: number): number {
  // Rough estimation: ~100ms per character for AI processing
  const baseTime = Math.max(1000, textLength * 100); // Minimum 1 second
  const networkDelay = 1000; // Add 1 second for network overhead
  
  return baseTime + networkDelay;
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Extract document ID from Google Docs URL
 */
export function extractGoogleDocsId(url: string): string | null {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}