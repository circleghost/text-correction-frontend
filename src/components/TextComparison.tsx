import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { createTextDiff, getWordDiff, createInlineDiff, getDiffStats, type DiffResult } from '@/utils/diffUtils';

interface TextComparisonProps {
  originalText: string;
  correctedText: string;
  className?: string;
  onCopy?: (text: string) => void;
  showDifferences?: boolean;
}

type DiffGranularity = 'character' | 'word';

export const TextComparison: React.FC<TextComparisonProps> = ({
  originalText,
  correctedText,
  className = '',
  onCopy,
  showDifferences = false
}) => {
  const [diffGranularity] = useState<DiffGranularity>('character');

  // Calculate diffs based on granularity
  const sideBySideDiff = useMemo(() => {
    return diffGranularity === 'character' 
      ? createTextDiff(originalText, correctedText)
      : getWordDiff(originalText, correctedText);
  }, [originalText, correctedText, diffGranularity]);

  const inlineDiff = useMemo(() => {
    return createInlineDiff(originalText, correctedText);
  }, [originalText, correctedText]);

  const stats = useMemo(() => {
    return getDiffStats(sideBySideDiff);
  }, [sideBySideDiff]);


  const handleCopyCorrected = useCallback(() => {
    navigator.clipboard.writeText(correctedText);
    onCopy?.(correctedText);
  }, [correctedText, onCopy]);

  // Helper function to render text with preserved line breaks
  const renderTextWithLineBreaks = (text: string, spanProps?: React.ComponentProps<'span'>) => {
    return text.split('\n').map((line, lineIndex, lines) => (
      <React.Fragment key={lineIndex}>
        <span {...spanProps}>{line}</span>
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Render corrected text with only green highlights (no deletions)
  const renderCorrectedOnly = () => {
    const diffs = createInlineDiff(originalText, correctedText);
    return diffs.map((diff, index) => {
      let className = '';
      let bgColor = '';

      switch (diff.type) {
        case 'insert':
          className = 'text-diff-added';
          bgColor = 'bg-green-900/30 text-green-400';
          break;
        case 'delete':
          // Don't render deleted text in corrected-only mode
          return null;
        case 'equal':
          className = 'text-diff-unchanged';
          bgColor = 'bg-gray-800/30 text-gray-200';
          break;
      }

      return (
        <span
          key={`corrected-${index}`}
          className={`${className} ${bgColor} rounded`}
          data-type={diff.type}
        >
          {renderTextWithLineBreaks(diff.text)}
        </span>
      );
    }).filter(Boolean); // Remove null entries
  };


  const renderInlineDiff = (diffs: DiffResult[]) => {
    return diffs.map((diff, index) => {
      let className = '';
      let bgColor = '';

      switch (diff.type) {
        case 'insert':
          className = 'text-diff-added';
          bgColor = 'bg-green-900/30 text-green-400';
          break;
        case 'delete':
          className = 'text-diff-removed';
          bgColor = 'bg-red-900/30 text-red-400 line-through';
          break;
        case 'equal':
          className = 'text-diff-unchanged';
          bgColor = 'bg-gray-800/30 text-gray-200';
          break;
      }

      return (
        <span
          key={`inline-${index}`}
          className={`${className} ${bgColor} rounded`}
          data-type={diff.type}
        >
          {renderTextWithLineBreaks(diff.text)}
        </span>
      );
    });
  };

  return (
    <div className={`w-full ${className}`}>

      {/* Main Content Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showDifferences ? "differences" : "corrected-only"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900/20 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">
              {showDifferences ? '差異對比' : '修正結果'}
            </h4>
            <button
              onClick={handleCopyCorrected}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors flex items-center whitespace-nowrap"
              title="複製修正文字"
            >
              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V5a2 2 0 00-2-2v8z" />
              </svg>
              <span>複製結果</span>
            </button>
          </div>
          <div className="text-base leading-relaxed text-gray-200">
            {showDifferences ? renderInlineDiff(inlineDiff) : renderCorrectedOnly()}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Statistics Row - Now at Bottom */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-center gap-4">
          <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded text-sm font-medium">
            新增 <CountUp end={stats.insertions} duration={1.5} /> 處
          </span>
          <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded text-sm font-medium">
            移除 <CountUp end={stats.deletions} duration={1.5} /> 處
          </span>
          <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded text-sm font-medium">
            總修正 <CountUp end={stats.changes} duration={1.5} /> 處
          </span>
        </div>
      </div>
    </div>
  );
};

export default TextComparison;