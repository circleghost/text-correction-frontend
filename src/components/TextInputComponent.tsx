import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextCorrectionStore, useInputMethod, useInputText, useGoogleDocsUrl, useError } from '@/stores/textCorrectionStore';

interface TextInputComponentProps {
  className?: string;
}

export const TextInputComponent: React.FC<TextInputComponentProps> = ({ className = '' }) => {
  const inputMethod = useInputMethod();
  const inputText = useInputText();
  const googleDocsUrl = useGoogleDocsUrl();
  
  const { setInputMethod, setInputText, setGoogleDocsUrl, clearError } = useTextCorrectionStore();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  const maxTextLength = 10000;
  const minTextLength = 10;

  // Update character count when text changes
  useEffect(() => {
    setCharCount(inputText.length);
  }, [inputText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [inputText]);

  // Clear errors when switching input methods
  useEffect(() => {
    setUrlError(null);
    setTextError(null);
    clearError();
  }, [inputMethod, clearError]);

  const validateGoogleDocsUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('請輸入 Google Docs 連結');
      return false;
    }

    const googleDocsPattern = /^https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/;
    if (!googleDocsPattern.test(url)) {
      setUrlError('請輸入有效的 Google Docs 分享連結');
      return false;
    }

    setUrlError(null);
    return true;
  };

  const validateDirectText = (text: string): boolean => {
    if (!text.trim()) {
      setTextError('請輸入要檢查的文字');
      return false;
    }

    if (text.trim().length < minTextLength) {
      setTextError(`文字長度至少需要 ${minTextLength} 個字元`);
      return false;
    }

    if (text.length > maxTextLength) {
      setTextError(`文字長度不能超過 ${maxTextLength} 個字元`);
      return false;
    }

    setTextError(null);
    return true;
  };

  const handleInputMethodToggle = (method: 'direct' | 'google-docs') => {
    setInputMethod(method);
    clearError();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxTextLength) {
      setInputText(newText);
      validateDirectText(newText);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setGoogleDocsUrl(newUrl);
    if (newUrl) {
      validateGoogleDocsUrl(newUrl);
    } else {
      setUrlError(null);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Handle paste events for potential Google Docs URLs
    const pastedText = e.clipboardData.getData('text');
    const googleDocsPattern = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/;
    
    if (googleDocsPattern.test(pastedText) && inputMethod === 'direct') {
      e.preventDefault();
      // Suggest switching to Google Docs mode
      const shouldSwitch = window.confirm('偵測到 Google Docs 連結，是否切換到 Google Docs 模式？');
      if (shouldSwitch) {
        setInputMethod('google-docs');
        setGoogleDocsUrl(pastedText);
      }
    }
  };

  return (
    <div className={`w-full ${className}`} style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 0 30px rgba(0, 170, 255, 0.15)', border: '1px solid var(--secondary-color)'}}>
      {/* Input Method Toggle */}
      <div className="flex items-center mb-2 px-3 pt-2">
        <button 
          onClick={() => handleInputMethodToggle('direct')}
          className={`flex items-center gap-2 py-2 px-3 rounded-t-lg border-b-2 text-sm font-semibold transition-all duration-300 ${
            inputMethod === 'direct'
              ? 'text-[var(--primary-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
          }`}
          style={inputMethod === 'direct' ? {borderBottomColor: 'var(--primary-color)', textShadow: '0 0 5px var(--primary-color)'} : {}}
        >
          貼上文字
        </button>
        <button 
          onClick={() => handleInputMethodToggle('google-docs')}
          className={`flex items-center gap-2 py-2 px-3 rounded-t-lg border-b-2 text-sm font-semibold transition-all duration-300 ${
            inputMethod === 'google-docs'
              ? 'text-[var(--primary-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
          }`}
          style={inputMethod === 'google-docs' ? {borderBottomColor: 'var(--primary-color)', textShadow: '0 0 5px var(--primary-color)'} : {}}
        >
          從 Google Doc 匯入文件
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {inputMethod === 'direct' ? (
            <motion.div
              key="direct-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <textarea 
                ref={textareaRef}
                value={inputText}
                onChange={handleTextChange}
                onPaste={handlePaste}
                className="w-full resize-y rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-opacity-50 min-h-60 p-6 transition-all duration-300" 
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(13, 17, 23, 0.8)',
                  border: '1px solid rgba(107, 114, 126, 0.5)',
                  boxShadow: textError ? '0 0 15px rgba(255, 71, 87, 0.3)' : 'none'
                }}
                placeholder="在此處貼上您的中文文字..."
              />
              <div className="absolute bottom-4 right-4 text-sm" style={{color: 'var(--text-secondary)'}}>
                字元數: {charCount} / 5000
              </div>
              {textError && (
                <div className="text-red-400 text-sm mt-2 px-3">
                  {textError}
                </div>
              )}
            </motion.div>
            ) : (
              <motion.div
                key="url-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="url"
                  value={googleDocsUrl}
                  onChange={handleUrlChange}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-opacity-50 h-12 px-6 transition-all duration-300" 
                  style={{
                    color: 'var(--text-primary)',
                    backgroundColor: 'rgba(13, 17, 23, 0.8)',
                    border: '1px solid rgba(107, 114, 126, 0.5)',
                    boxShadow: urlError ? '0 0 15px rgba(255, 71, 87, 0.3)' : 'none'
                  }}
                />
                {urlError && (
                  <div className="text-red-400 text-sm mt-2 px-3">
                    {urlError}
                  </div>
                )}
                <div className="text-sm mt-2 px-3" style={{color: 'var(--text-secondary)'}}>
                  請確保文檔已設定為「知道連結的人都能查看」
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default TextInputComponent;