import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, TextInputComponent, TextComparison, ScrambledTextEffect, TypewriterEffect, DecryptedTextEffect, TextShuffleEffect } from '@/components';
import NeonButton, { PulseButton, ScanButton } from '@/components/NeonButton';
import NeonProgressBar, { CircularNeonProgress } from '@/components/NeonProgressBar';
import FloatingParticles from '@/components/FloatingParticles';
import { useTextCorrectionStore, useInputText, useGoogleDocsUrl, useInputMethod, useIsCompleted, useParagraphs, useProcessingProgress } from '@/stores/textCorrectionStore';
import { apiService } from '@/services/api';

const Home: React.FC = () => {
  const inputMethod = useInputMethod();
  const inputText = useInputText();
  const googleDocsUrl = useGoogleDocsUrl();
  const isCompleted = useIsCompleted();
  const paragraphs = useParagraphs();
  const progress = useProcessingProgress();
  const { startProcessing, resetState } = useTextCorrectionStore();

  // Demo state for text comparison and animation
  const [showDemo, setShowDemo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showDifferences, setShowDifferences] = useState(false);
  const [demoOriginal] = useState('這是一个測試文檔，裡面有一些錯别字和語法問題。我們希望能够通過人工智能來檢查並修正這些錯誤。');
  const [demoCorrected] = useState('這是一個測試文檔，裡面有一些錯別字和語法問題。我們希望能夠通過人工智慧來檢查並修正這些錯誤。');
  
  // Real processing state for scrambled text effect
  const [isProcessingStarted, setIsProcessingStarted] = useState(false);
  const [showProcessingScramble, setShowProcessingScramble] = useState(false);
  
  // Loading state for Google Docs
  const [isGoogleDocsLoading, setIsGoogleDocsLoading] = useState(false);
  const [showGoogleDocsAnimation, setShowGoogleDocsAnimation] = useState(false);
  const [googleDocsText, setGoogleDocsText] = useState('');
  
  // Results display state (no animation, direct display)
  const [resultsAnimationComplete, setResultsAnimationComplete] = useState(false);

  // Trigger results display when processing completes (no animation)
  useEffect(() => {
    if (isCompleted && paragraphs.length > 0 && !resultsAnimationComplete && !showProcessingScramble && !showGoogleDocsAnimation) {
      console.log('✅ 處理完成，設置結果動畫完成標誌');
      setResultsAnimationComplete(true);
      // Also trigger a delayed scroll to results once animation completes
      setTimeout(() => {
        const resultElement = document.getElementById('result-section');
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          console.log('📍 自動滾動到結果區塊 (完成後)');
        }
      }, 2000); // Give animation time to complete
    }
  }, [isCompleted, paragraphs.length, resultsAnimationComplete, showProcessingScramble, showGoogleDocsAnimation]);

  const handleStartProcessing = async () => {
    console.group(`%c🎬 User Started Processing`, 'color: #E91E63; font-weight: bold; font-size: 16px;');
    console.log('🎯 Input Method:', inputMethod);
    
    if (inputMethod === 'direct') {
      console.log('📝 Direct Text Input:');
      console.log('  - Length:', inputText.trim().length);
      console.log('  - Preview:', inputText.trim().substring(0, 100) + (inputText.length > 100 ? '...' : ''));
      
      if (!inputText.trim()) {
        console.warn('❌ No text input provided');
        console.groupEnd();
        return;
      }
    } else {
      console.log('🔗 Google Docs URL:', googleDocsUrl);
      
      if (!googleDocsUrl.trim()) {
        console.warn('❌ No Google Docs URL provided');
        console.groupEnd();
        return;
      }
    }
    
    console.log('🚀 Initiating text processing...');
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Show scrambled text effect for direct input
    if (inputMethod === 'direct' && inputText.trim()) {
      console.log('📱 Setting showProcessingScramble to TRUE');
      console.log('📍 Current state:', { showProcessingScramble, showDemo });
      setIsProcessingStarted(true);
      setShowProcessingScramble(true);
      
      // Wait for scrambled effect to complete before starting actual processing
      setTimeout(async () => {
        console.log('⏰ 5 seconds passed, hiding scramble effect');
        setShowProcessingScramble(false);
        
        try {
          await startProcessing();
          console.log('✅ Processing completed successfully');
        } catch (error) {
          console.error('❌ Processing failed:', error);
        } finally {
          setIsProcessingStarted(false);
          console.groupEnd();
        }
      }, 5000); // 5 seconds for scrambled effect
    } else {
      // For Google Docs, first fetch content then show animation
      console.log('🔗 Processing Google Docs - fetching content first');
      setIsGoogleDocsLoading(true);
      
      try {
        // First, import Google Docs content without processing
        console.log('📥 Importing Google Docs content...');
        const { googleDocsUrl } = useTextCorrectionStore.getState();
        
        // Import the content using the pre-imported API service
        console.log('🔗 Calling API service with URL:', googleDocsUrl);
        const importResult = await apiService.importGoogleDoc(googleDocsUrl);
        console.log('📦 API response:', importResult);
        
        if (!importResult.success || !importResult.data) {
          const errorMsg = importResult.error?.message || 'Failed to import Google Docs';
          console.error('❌ Import failed:', errorMsg);
          throw new Error(errorMsg);
        }
        
        const fetchedText = importResult.data.content;
        console.log('✅ Google Docs content fetched, length:', fetchedText.length);
        
        // Store the fetched text and show animation
        setGoogleDocsText(fetchedText);
        setIsGoogleDocsLoading(false);
        setIsProcessingStarted(true);
        setShowGoogleDocsAnimation(true);
        
        // Wait for animation to complete before actual processing
        setTimeout(async () => {
          console.log('⏰ 5 seconds passed, starting actual processing');
          setShowGoogleDocsAnimation(false);
          
          try {
            // Now do the actual processing with the fetched text
            const store = useTextCorrectionStore.getState();
            store.setInputText(fetchedText);
            await store.processDirectText();
            console.log('✅ Google Docs processing completed successfully');
          } catch (processingError) {
            console.error('❌ Google Docs processing failed:', processingError);
          } finally {
            setIsProcessingStarted(false);
            console.groupEnd();
          }
        }, 5000); // 5 seconds for animation effect
        
      } catch (error) {
        console.error('❌ Google Docs fetch failed:', error);
        
        // Show detailed error to user
        let userMessage = 'Google Docs 導入失敗';
        if (error instanceof Error) {
          userMessage = `Google Docs 導入失敗: ${error.message}`;
        }
        
        // Use browser alert for now - in production you might want a proper notification system
        alert(userMessage);
        
        // Reset all loading states
        setIsGoogleDocsLoading(false);
        setShowGoogleDocsAnimation(false);
        setIsProcessingStarted(false);
        console.groupEnd();
      }
    }
  };

  const canStartProcessing = inputMethod === 'direct' 
    ? inputText.trim().length >= 10 
    : googleDocsUrl.trim().length > 0;

  const isProcessingActive = isProcessingStarted || showProcessingScramble || showGoogleDocsAnimation || isGoogleDocsLoading || (progress > 0 && progress < 100);

  const handleDemoToggle = () => {
    if (showDemo) {
      // Reset demo state when closing
      setShowDemo(false);
      setIsAnalyzing(false);
      setAnalysisComplete(false);
    } else {
      // Start demo animation sequence
      setShowDemo(true);
      setIsAnalyzing(true);
      setAnalysisComplete(false);
      
      // Simulate analysis completion after 3 seconds
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="full-screen-container circuit-board">
        <FloatingParticles />
        <div className="gradient-overlay-dark">
          <main className="flex flex-1 flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl text-center">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4 glowing-text">
                讓您的中文寫作更加精準
              </h1>
              <p className="max-w-2xl mx-auto text-lg mb-10" style={{color: 'var(--text-secondary)'}}>
                貼上您的文字或從 Google Docs 匯入，識別並修正中文寫作中的錯誤。我們的 AI 工具確保您的文字準確且精煉。
              </p>
            </div>

            {/* Text Input / Processing Animation */}
            {console.log('🖥️ Render check:', { showProcessingScramble, showGoogleDocsAnimation, inputMethod, showDemo, inputTextLength: inputText?.length, googleDocsTextLength: googleDocsText?.length, isCompleted, resultsAnimationComplete })}
            <div className="mb-8">
              <AnimatePresence mode="wait">
              {(() => {
                const shouldShowProcessing = 
                  (showProcessingScramble && inputMethod === 'direct') ||
                  (showGoogleDocsAnimation && inputMethod === 'google-docs');
                console.log('🎯 Processing animation check:', { 
                  shouldShowProcessing, 
                  showProcessingScramble, 
                  showGoogleDocsAnimation,
                  inputMethod, 
                  directText: inputText?.substring(0, 50) + '...',
                  googleDocsText: googleDocsText?.substring(0, 50) + '...'
                });
                return shouldShowProcessing;
              })() ? (
                <motion.div 
                  key="processing-animation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 w-full max-w-3xl mx-auto"
                >
                  {console.log('✅ Processing animation rendering!', { inputTextLength: inputText?.length })}
                  <div className="tech-card glass">
                    <div className="p-6">
                      <div className="mb-4 text-lg font-semibold flex items-center gap-2" style={{color: 'var(--primary-color)'}}>
                        <span>🔍</span> 正在分析文本資料流...（處理模式）
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                      </div>
                      <div className="bg-gray-900/20 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                        {(() => {
                          // Get the text to animate - either from direct input or Google Docs
                          const animationText = inputMethod === 'google-docs' ? googleDocsText : inputText;
                          const textLength = animationText?.length || 0;
                          const lineCount = animationText?.split('\n').length || 1;
                          
                          // Smart animation selection
                          let animationType = 'scrambled';
                          if (textLength >= 500 || lineCount >= 5) {
                            animationType = 'decrypted';
                          } else if (textLength >= 100) {
                            animationType = 'typewriter';
                          }
                          
                          console.log('🎯 動畫選擇:', { 
                            inputMethod, 
                            textLength, 
                            lineCount, 
                            animationType, 
                            hasAnimationText: !!animationText 
                          });
                          
                          const handleAnimationComplete = () => {
                            console.log('🎬 動畫特效完成，檢查處理狀態');
                            // Check if processing is complete
                            if (isCompleted) {
                              console.log('✅ 處理完成，準備滾動到結果');
                              // Auto-scroll to results after animation completes
                              setTimeout(() => {
                                const resultElement = document.getElementById('result-section');
                                if (resultElement) {
                                  resultElement.scrollIntoView({ 
                                    behavior: 'smooth',
                                    block: 'start'
                                  });
                                  console.log('📍 自動滾動到結果區塊');
                                }
                              }, 1000); // 1 second delay for smooth transition
                            } else {
                              console.log('⏳ 處理尚未完成，繼續等待');
                            }
                          };
                          
                          // If no text available, show loading message
                          if (!animationText) {
                            return (
                              <div className="text-sm leading-relaxed text-gray-400">
                                {inputMethod === 'google-docs' ? 
                                  '正在獲取 Google Docs 內容...' : 
                                  '等待文字輸入...'}
                              </div>
                            );
                          }
                          
                          if (animationType === 'decrypted') {
                            return (
                              <DecryptedTextEffect 
                                text={animationText}
                                duration={isCompleted ? 3000 : 30000} // Long duration if not complete yet
                                decryptSpeed={isCompleted ? 30 : 80} // Faster when complete
                                className="text-sm leading-relaxed"
                                onComplete={handleAnimationComplete}
                                shouldLoop={!isCompleted} // Loop until processing is complete
                              />
                            );
                          } else if (animationType === 'typewriter') {
                            return (
                              <TypewriterEffect 
                                text={animationText}
                                duration={isCompleted ? 3000 : 30000} // Long duration if not complete yet  
                                speed={isCompleted ? 200 : 800} // Faster when complete
                                className="text-sm leading-relaxed"
                                onComplete={handleAnimationComplete}
                              />
                            );
                          } else {
                            return (
                              <ScrambledTextEffect 
                                text={animationText}
                                duration={isCompleted ? 3000 : 30000} // Long duration if not complete yet
                                className="text-sm leading-relaxed"
                                onComplete={handleAnimationComplete}
                              />
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="text-input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 w-full max-w-3xl mx-auto"
                  style={{position: 'relative'}}
                >
                  <TextInputComponent />
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {/* 【區塊 D：處理按鈕區】Processing Button */}
            <div className="flex justify-center items-center w-full mb-8 gap-4">
              <PulseButton 
                onClick={handleStartProcessing}
                disabled={!canStartProcessing || isProcessingActive}
                className="w-full sm:w-auto"
              >
                {isProcessingActive ? (
                  inputMethod === 'google-docs' && isGoogleDocsLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      正在處理 Google Doc...
                    </span>
                  ) : showProcessingScramble || showGoogleDocsAnimation ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {inputMethod === 'google-docs' ? '分析 Google Docs 文字中...' : '分析文字中...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      處理中...
                    </span>
                  )
                ) : (
                  inputMethod === 'google-docs' ? '處理 Google Doc' : '檢查文字'
                )}
              </PulseButton>
              
              {/* Reset button - only show when analysis is completed */}
              {isCompleted && (
                <NeonButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    console.log('🔄 Resetting state...');
                    resetState();
                    setIsProcessingStarted(false);
                    setShowProcessingScramble(false);
                    setResultsAnimationComplete(false);
                    setShowDifferences(false);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  重啟系統
                </NeonButton>
              )}
            </div>


            {/* 【區塊 E：結果顯示區】Results Display */}
            {isCompleted && paragraphs.length > 0 && !showProcessingScramble && !showGoogleDocsAnimation && (
              <div id="result-section" className="mb-8">
                <div className="tech-card glass">
                  <div className="p-6" style={{borderBottom: '1px solid var(--secondary-color)'}}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold flex items-center">
                        <div className="status-dot success mr-3"></div>
                        <span style={{color: 'var(--text-secondary)'}}>分析完成！以下展示校正結果</span>
                      </h3>
                      <div className="flex gap-3">
                        <ScanButton
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const correctedText = paragraphs
                              .filter(p => p.status === 'completed')
                              .map(p => p.correctedText || p.text)
                              .join('\n\n');
                            navigator.clipboard.writeText(correctedText);
                            console.log('📋 Copied corrected text to clipboard');
                          }}
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V5a2 2 0 00-2-2v8z" />
                          </svg>
                          複製結果
                        </ScanButton>
                        <ScanButton
                          variant="primary"
                          size="sm"
                          onClick={() => setShowDifferences(!showDifferences)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          {showDifferences ? '隱藏差異' : '顯示差異'}
                        </ScanButton>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {paragraphs.some(p => p.status === 'error') && (
                        <div className="p-4 bg-gradient-to-r from-danger-neon/10 to-transparent border border-danger-neon/30 rounded-lg mb-6">
                          <p className="text-danger-neon text-sm">
                            <span>⚠</span> 系統檢測到部分段落處理異常，已顯示原始數據
                          </p>
                        </div>
                      )}
                      
                      {/* Direct results display - no animation */}
                      <div className="rounded-lg overflow-hidden">
                        <TextComparison
                          originalText={paragraphs.map(p => p.text).join('\n\n')}
                          correctedText={paragraphs.map(p => p.correctedText || p.text).join('\n\n')}
                          showDifferences={showDifferences}
                          onCopy={(text) => {
                            navigator.clipboard.writeText(text);
                            console.log('📋 Copied combined text');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 【區塊 F：演示模式區】Demo Section */}
            <div className="tech-card glass">
              <div className="p-6" style={{borderBottom: '1px solid var(--secondary-color)'}}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    <span style={{color: 'var(--text-secondary)'}}>演示模式</span>
                  </h3>
                  <ScanButton
                    variant={showDemo ? "danger" : "primary"}
                    size="sm"
                    onClick={handleDemoToggle}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      {showDemo ? (
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      )}
                    </svg>
                    {showDemo ? '關閉' : '啟動'}演示
                  </ScanButton>
                </div>
              </div>
              {showDemo && (
                <div className="p-6">
                  {isAnalyzing ? (
                    <div className="space-y-6">
                      <p className="mb-4 text-sm" style={{color: 'var(--text-secondary)'}}>
                        <span>🔍</span> 正在分析文本資料流...（演示模式）
                      </p>
                      <div className="bg-gray-900/20 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                        <div className="text-sm leading-relaxed text-gray-200">
                          <ScrambledTextEffect 
                            text={demoOriginal}
                            duration={3000}
                            className="text-gray-300"
                            onComplete={() => {
                              // Animation complete
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-blue-400">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-sm">AI 正在處理文字差異...</span>
                        </div>
                      </div>
                    </div>
                  ) : analysisComplete ? (
                    <div className="space-y-6">
                      <p className="mb-4 text-sm" style={{color: 'var(--text-secondary)'}}>
                        <span>✨</span> 分析完成！以下展示修正結果
                      </p>
                      <div className="bg-gray-900/20 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                        <div className="text-sm leading-relaxed text-gray-200">
                          <TextShuffleEffect 
                            originalText={demoOriginal}
                            targetText={demoCorrected}
                            duration={2500}
                            highlightChanges={true}
                            className="text-gray-300"
                            onComplete={() => {
                              // Shuffle animation complete
                            }}
                          />
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden">
                        <TextComparison 
                          originalText={demoOriginal}
                          correctedText={demoCorrected}
                          showDifferences={showDifferences}
                          onCopy={(text) => {
                            navigator.clipboard.writeText(text);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="mb-4 text-sm" style={{color: 'var(--text-secondary)'}}>
                        <span>▶</span> 點擊『啟動演示』開始文字流分析特效
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Home;