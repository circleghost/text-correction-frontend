import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressIndicator } from '../ProgressIndicator';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the store hooks
jest.mock('@/stores/textCorrectionStore', () => ({
  useIsProcessing: jest.fn(),
  useProcessingProgress: jest.fn(),
  useParagraphs: jest.fn(),
  useCurrentParagraphIndex: jest.fn(),
}));

describe('ProgressIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not processing and progress is 0', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(false);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(0);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    const { container } = render(<ProgressIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('shows progress when processing', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(50);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('處理中...')).toBeInTheDocument();
  });

  it('shows appropriate stage labels based on progress', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(5);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('準備中')).toBeInTheDocument();
    expect(screen.getByText('正在初始化處理流程...')).toBeInTheDocument();
  });

  it('shows parsing stage for progress 10-25', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(20);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('解析文字')).toBeInTheDocument();
    expect(screen.getByText('正在分析和分割文字段落...')).toBeInTheDocument();
  });

  it('shows processing stage for progress 25-90', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(60);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('校正中')).toBeInTheDocument();
    expect(screen.getByText('正在進行 AI 文字校正...')).toBeInTheDocument();
  });

  it('shows completing stage for progress 90-100', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(95);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('完成中')).toBeInTheDocument();
    expect(screen.getByText('正在整合校正結果...')).toBeInTheDocument();
  });

  it('shows paragraph progress when paragraphs are available', () => {
    const mockParagraphs = [
      { id: '1', status: 'completed', text: 'Test 1', corrections: [] },
      { id: '2', status: 'processing', text: 'Test 2', corrections: [] },
      { id: '3', status: 'pending', text: 'Test 3', corrections: [] },
    ];

    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(60);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue(mockParagraphs);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(1);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('1/3 段落')).toBeInTheDocument();
    expect(screen.getByText('段落處理進度')).toBeInTheDocument();
    expect(screen.getByText('✓ 已完成: 1')).toBeInTheDocument();
  });

  it('shows paragraph status correctly', () => {
    const mockParagraphs = [
      { id: '1', status: 'completed', text: 'Test 1', corrections: [] },
      { id: '2', status: 'error', text: 'Test 2', corrections: [] },
      { id: '3', status: 'processing', text: 'Test 3', corrections: [] },
    ];

    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(60);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue(mockParagraphs);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(2);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('✓ 已完成: 1')).toBeInTheDocument();
    expect(screen.getByText('✗ 錯誤: 1')).toBeInTheDocument();
  });

  it('shows stage progress indicators', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(60);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    // Check that all stage labels are present
    expect(screen.getByText('準備中')).toBeInTheDocument();
    expect(screen.getByText('解析文字')).toBeInTheDocument();
    expect(screen.getByText('校正中')).toBeInTheDocument();
    expect(screen.getByText('完成中')).toBeInTheDocument();
  });

  it('shows cancel button when processing', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(true);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(50);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('取消處理')).toBeInTheDocument();
  });

  it('shows "處理完成" when not processing but has progress', () => {
    require('@/stores/textCorrectionStore').useIsProcessing.mockReturnValue(false);
    require('@/stores/textCorrectionStore').useProcessingProgress.mockReturnValue(100);
    require('@/stores/textCorrectionStore').useParagraphs.mockReturnValue([]);
    require('@/stores/textCorrectionStore').useCurrentParagraphIndex.mockReturnValue(0);

    render(<ProgressIndicator />);
    
    expect(screen.getByText('處理完成')).toBeInTheDocument();
  });
});