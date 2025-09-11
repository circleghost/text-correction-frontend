import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsProcessing, useProcessingProgress, useParagraphs, useCurrentParagraphIndex, useIsCompleted } from '@/stores/textCorrectionStore';

interface ProgressIndicatorProps {
  className?: string;
}

interface ProcessingStage {
  key: string;
  label: string;
  description: string;
  minProgress: number;
  maxProgress: number;
}

const processingStages: ProcessingStage[] = [
  {
    key: 'initializing',
    label: '準備中',
    description: '正在初始化處理流程...',
    minProgress: 0,
    maxProgress: 10,
  },
  {
    key: 'parsing',
    label: '解析文字',
    description: '正在分析和分割文字段落...',
    minProgress: 10,
    maxProgress: 25,
  },
  {
    key: 'processing',
    label: '校正中',
    description: '正在進行 AI 文字校正...',
    minProgress: 25,
    maxProgress: 90,
  },
  {
    key: 'completing',
    label: '完成中',
    description: '正在整合校正結果...',
    minProgress: 90,
    maxProgress: 100,
  },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ className = '' }) => {
  const isProcessing = useIsProcessing();
  const progress = useProcessingProgress();
  const paragraphs = useParagraphs();
  const currentParagraphIndex = useCurrentParagraphIndex();
  const isCompleted = useIsCompleted();
  
  const [currentStage, setCurrentStage] = useState<ProcessingStage>(processingStages[0]);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Determine current stage based on progress
  useEffect(() => {
    const stage = processingStages.find(
      stage => progress >= stage.minProgress && progress <= stage.maxProgress
    ) || processingStages[processingStages.length - 1];
    setCurrentStage(stage);
  }, [progress]);

  // Animate progress bar
  useEffect(() => {
    if (!isProcessing && !isCompleted) {
      setAnimatedProgress(0);
      return;
    }

    // If completed, ensure we show 100%
    const targetProgress = isCompleted ? 100 : progress;
    
    const timer = setTimeout(() => {
      setAnimatedProgress(targetProgress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress, isProcessing, isCompleted]);

  // Calculate processing statistics
  const completedParagraphs = paragraphs.filter(p => p.status === 'completed').length;
  const errorParagraphs = paragraphs.filter(p => p.status === 'error').length;
  const totalParagraphs = paragraphs.length;

  // Only hide if not processing, not completed, and progress is 0
  if (!isProcessing && !isCompleted && progress === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {(isProcessing || progress > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`w-full max-w-4xl mx-auto ${className}`}
        >
          <div className="card">
            <div className="card-body">
              {/* Progress Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-title text-[#212121]">
                    {currentStage.label}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {currentStage.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#2563eb]">
                    {Math.round(animatedProgress)}%
                  </div>
                  {totalParagraphs > 0 && (
                    <div className="text-sm text-neutral-500">
                      {completedParagraphs}/{totalParagraphs} 段落
                    </div>
                  )}
                </div>
              </div>

              {/* Main Progress Bar */}
              <div className="relative mb-6">
                <div className="progress">
                  <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedProgress}%` }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                </div>
                
                {/* Progress Labels */}
                <div className="flex justify-between mt-2 text-xs text-neutral-500">
                  {processingStages.map((stage) => (
                    <div
                      key={stage.key}
                      className={`flex flex-col items-center ${
                        progress >= stage.minProgress ? 'text-[#2563eb]' : 'text-neutral-400'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 mb-1 transition-colors duration-200 ${
                          progress >= stage.minProgress
                            ? 'bg-[#2563eb] border-[#2563eb]'
                            : 'bg-white border-neutral-300'
                        }`}
                      />
                      <span className="text-center leading-tight max-w-16">
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Progress Information */}
              {totalParagraphs > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="bg-neutral-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">
                      段落處理進度
                    </span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-[#059669]">
                        ✓ 已完成: {completedParagraphs}
                      </span>
                      <span className="text-[#2563eb]">
                        ⟳ 處理中: {Math.min(currentParagraphIndex + 3, totalParagraphs) - currentParagraphIndex}
                      </span>
                      {errorParagraphs > 0 && (
                        <span className="text-[#dc2626]">
                          ✗ 錯誤: {errorParagraphs}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Paragraph Progress Visualization */}
                  <div className="flex flex-wrap gap-1">
                    {paragraphs.map((paragraph, index) => (
                      <motion.div
                        key={paragraph.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`w-3 h-3 rounded-sm transition-colors duration-200 ${
                          paragraph.status === 'completed'
                            ? 'bg-[#10b981]'
                            : paragraph.status === 'processing'
                            ? 'bg-[#3b82f6] animate-pulse'
                            : paragraph.status === 'error'
                            ? 'bg-[#ef4444]'
                            : 'bg-neutral-300'
                        }`}
                        title={`段落: ${paragraph.status}`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Processing Animation */}
              <div className="flex items-center justify-center mt-4">
                <div className="loading-dots">
                  <div />
                  <div />
                  <div />
                </div>
                <span className="ml-3 text-sm text-neutral-600">
                  {isProcessing ? '處理中...' : '處理完成'}
                </span>
              </div>

              {/* Cancel Button (Optional) */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex justify-center mt-4"
                >
                  <button
                    onClick={() => {
                      // This would need to be implemented in the store
                      console.log('Cancel processing requested');
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    取消處理
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressIndicator;