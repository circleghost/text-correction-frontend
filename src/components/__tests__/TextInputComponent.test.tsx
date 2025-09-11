import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TextInputComponent } from '../TextInputComponent';
import { useTextCorrectionStore } from '@/stores/textCorrectionStore';

// Mock the store
jest.mock('@/stores/textCorrectionStore', () => ({
  useTextCorrectionStore: jest.fn(),
  useInputMethod: jest.fn(),
  useInputText: jest.fn(),
  useGoogleDocsUrl: jest.fn(),
  useError: jest.fn(),
}));

const mockStore = {
  setInputMethod: jest.fn(),
  setInputText: jest.fn(),
  setGoogleDocsUrl: jest.fn(),
  clearError: jest.fn(),
};

const mockUseTextCorrectionStore = useTextCorrectionStore as jest.MockedFunction<typeof useTextCorrectionStore>;

describe('TextInputComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTextCorrectionStore.mockReturnValue(mockStore);
  });

  it('renders with direct input mode by default', () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    expect(screen.getByText('直接輸入文字')).toBeInTheDocument();
    expect(screen.getByText('Google Docs 連結')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('在此輸入或貼上您的文字內容...')).toBeInTheDocument();
  });

  it('switches to Google Docs mode when clicked', async () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    const googleDocsButton = screen.getByText('Google Docs 連結');
    await userEvent.click(googleDocsButton);
    
    expect(mockStore.setInputMethod).toHaveBeenCalledWith('google-docs');
  });

  it('shows Google Docs input when in google-docs mode', () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('google-docs');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    expect(screen.getByPlaceholderText('https://docs.google.com/document/d/...')).toBeInTheDocument();
    expect(screen.getByText('請確保文檔已設定為「知道連結的人都能查看」')).toBeInTheDocument();
  });

  it('validates text input length', async () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('短文字');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    const textarea = screen.getByPlaceholderText('在此輸入或貼上您的文字內容...');
    await userEvent.type(textarea, '測試');
    
    expect(mockStore.setInputText).toHaveBeenCalled();
  });

  it('shows character count for text input', () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('測試文字');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    expect(screen.getByText('4 / 10,000')).toBeInTheDocument();
  });

  it('validates Google Docs URL format', async () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('google-docs');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    const urlInput = screen.getByPlaceholderText('https://docs.google.com/document/d/...');
    await userEvent.type(urlInput, 'invalid-url');
    
    expect(mockStore.setGoogleDocsUrl).toHaveBeenCalled();
  });

  it('shows error messages when validation fails', () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue('請輸入要檢查的文字');

    render(<TextInputComponent />);
    
    expect(screen.getByText('請輸入要檢查的文字')).toBeInTheDocument();
  });

  it('handles paste events for Google Docs URLs', async () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('');
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<TextInputComponent />);
    
    const textarea = screen.getByPlaceholderText('在此輸入或貼上您的文字內容...');
    
    // Simulate paste event with Google Docs URL
    const pasteEvent = new Event('paste', { bubbles: true });
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: () => 'https://docs.google.com/document/d/test123/edit',
      },
    });
    
    fireEvent(textarea, pasteEvent);
    
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('enforces maximum character limit', async () => {
    require('@/stores/textCorrectionStore').useInputMethod.mockReturnValue('direct');
    require('@/stores/textCorrectionStore').useInputText.mockReturnValue('a'.repeat(10000));
    require('@/stores/textCorrectionStore').useGoogleDocsUrl.mockReturnValue('');
    require('@/stores/textCorrectionStore').useError.mockReturnValue(null);

    render(<TextInputComponent />);
    
    expect(screen.getByText('10,000 / 10,000')).toBeInTheDocument();
  });
});