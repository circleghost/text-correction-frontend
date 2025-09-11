// Zustand store for text correction state management

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import type { AppState, Paragraph, TextCorrection } from '@/types';
import { apiService } from '@/services/api';
import { splitIntoParagraphs, createParagraphs, validateTextInput, validateGoogleDocsUrl } from '@/utils/textProcessor';

interface TextCorrectionStore extends AppState {
  // Actions
  setInputMethod: (method: 'direct' | 'google-docs') => void;
  setInputText: (text: string) => void;
  setGoogleDocsUrl: (url: string) => void;
  setShowAnimation: (show: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  
  // Core processing actions
  startProcessing: () => Promise<void>;
  processWithGoogleDocs: () => Promise<void>;
  processDirectText: () => Promise<void>;
  resetState: () => void;
  cancelProcessing: () => void;
  
  // Paragraph management
  updateParagraphStatus: (id: string, status: Paragraph['status']) => void;
  updateParagraphCorrections: (id: string, corrections: TextCorrection[]) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState: AppState = {
  inputMethod: 'direct',
  inputText: '',
  googleDocsUrl: '',
  isProcessing: false,
  processingProgress: 0,
  currentParagraphIndex: 0,
  paragraphs: [],
  isCompleted: false,
  showAnimation: true,
  animationSpeed: 80, // ms per character
  error: null,
  currentAbortController: null,
};

export const useTextCorrectionStore = create<TextCorrectionStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Basic setters
      setInputMethod: (method) => set({ inputMethod: method }),
      setInputText: (text) => set({ inputText: text }),
      setGoogleDocsUrl: (url) => set({ googleDocsUrl: url }),
      setShowAnimation: (show) => set({ showAnimation: show }),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset state
      resetState: () => {
        const state = get();
        // Cancel any ongoing requests
        if (state.currentAbortController) {
          state.currentAbortController.abort();
        }
        set(initialState);
      },

      // Cancel current processing
      cancelProcessing: () => {
        const state = get();
        if (state.currentAbortController) {
          state.currentAbortController.abort();
        }
        set({
          isProcessing: false,
          processingProgress: 0,
          currentAbortController: null,
          error: 'Processing cancelled by user'
        });
      },

      // Main processing function
      startProcessing: async () => {
        const state = get();
        
        // Cancel any existing request
        if (state.currentAbortController) {
          state.currentAbortController.abort();
        }
        
        // Create new AbortController for this request
        const abortController = new AbortController();
        
        set({ 
          error: null,
          currentAbortController: abortController 
        });

        try {
          if (state.inputMethod === 'google-docs') {
            console.log('🔗 Processing Google Docs URL');
            await get().processWithGoogleDocs();
          } else {
            console.log('📝 Processing Direct Text Input');
            await get().processDirectText();
          }
          console.log('✅ Processing completed successfully');
        } catch (error) {
          // Don't set error if request was cancelled
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          set({
            error: errorMessage,
            isProcessing: false,
            processingProgress: 0,
            currentAbortController: null,
          });
        }
      },

      // Process Google Docs URL
      processWithGoogleDocs: async () => {
        const { googleDocsUrl } = get();
        
        // Validate URL
        const validation = validateGoogleDocsUrl(googleDocsUrl);
        if (!validation.isValid) {
          set({ error: validation.error });
          return;
        }

        set({ isProcessing: true, processingProgress: 0 });

        try {
          // Import Google Docs content
          set({ processingProgress: 10 });
          console.log('🔗 Attempting to import Google Docs:', googleDocsUrl);
          
          const importResult = await apiService.importGoogleDoc(googleDocsUrl);
          console.log('📥 Google Docs import result:', importResult);
          
          if (!importResult.success || !importResult.data) {
            const errorMessage = importResult.error?.message || 'Failed to import Google Docs';
            console.error('❌ Google Docs import failed:', errorMessage);
            throw new Error(errorMessage);
          }

          console.log('✅ Google Docs content imported successfully:', {
            title: importResult.data.title,
            contentLength: importResult.data.content.length
          });

          // Set the imported text and process it
          set({ inputText: importResult.data.content });
          await get().processDirectText();
          
        } catch (error) {
          console.error('❌ processWithGoogleDocs failed:', error);
          
          // Enhanced error handling for common issues
          if (error instanceof Error) {
            if (error.message.includes('Request timeout')) {
              throw new Error('Google Docs 請求超時，請檢查網路連線或稍後再試');
            } else if (error.message.includes('Google Docs integration is not available')) {
              throw new Error('Google Docs 整合功能暫時無法使用，請聯繫系統管理員');
            } else if (error.message.includes('Google Docs API is not enabled')) {
              throw new Error('Google Docs API 尚未啟用，請聯繫系統管理員配置 API 權限');
            } else if (error.message.includes('API is not properly configured')) {
              throw new Error('Google Docs API 配置錯誤，請聯繫系統管理員');
            } else if (error.message.includes('Permission denied')) {
              throw new Error('無法存取該 Google Docs 文件，請確認文件已設為「知道連結的使用者可以檢視」');
            } else if (error.message.includes('Document not found')) {
              throw new Error('找不到該 Google Docs 文件，請檢查連結是否正確');
            } else {
              throw error;
            }
          }
          
          throw error;
        }
      },

      // Process direct text input
      processDirectText: async () => {
        console.group(`%c📝 Processing Direct Text`, 'color: #FF9800; font-weight: bold;');
        const { inputText } = get();
        console.log('📄 Input text length:', inputText.length);
        
        // Validate text input
        const validation = validateTextInput(inputText);
        if (!validation.isValid) {
          console.error('❌ Text validation failed:', validation.error);
          set({ error: validation.error });
          console.groupEnd();
          return;
        }
        console.log('✅ Text validation passed');

        set({ isProcessing: true, processingProgress: 0, currentParagraphIndex: 0 });
        console.log('🔄 Set processing state to true, progress: 0%');

        try {
          // Split text into paragraphs
          const paragraphTexts = splitIntoParagraphs(inputText);
          const paragraphs = createParagraphs(paragraphTexts);
          console.log(`📄 Text split into ${paragraphs.length} paragraphs:`, paragraphs.map(p => ({ id: p.id, length: p.text.length })));
          
          set({ paragraphs, processingProgress: 20 });
          console.log('📊 Progress updated to 20%');

          // Process paragraphs in batches
          const batchSize = 3;
          const totalParagraphs = paragraphs.length;
          let completedCount = 0;

          for (let i = 0; i < paragraphs.length; i += batchSize) {
            const batch = paragraphs.slice(i, i + batchSize);
            const batchData = batch.map(p => ({ id: p.id, text: p.text }));
            console.group(`%c📦 Processing Batch ${Math.floor(i/batchSize) + 1}`, 'color: #3F51B5; font-weight: bold;');
            console.log('📋 Batch paragraphs:', batch.map(p => ({ id: p.id, text: p.text.substring(0, 50) + '...' })));

            // Update status to processing for current batch
            batch.forEach(p => {
              get().updateParagraphStatus(p.id, 'processing');
            });
            console.log('🔄 Updated paragraphs status to "processing"');

            set({ currentParagraphIndex: i });

            try {
              // Call batch processing API
              console.log('🚀 Calling API for batch correction...');
              const result = await apiService.correctParagraphs(batchData);
              console.log('📥 API Response received:', result);
              
              if (!result.success || !result.data) {
                console.error('❌ API returned error:', result.error);
                throw new Error(result.error?.message || 'Processing failed');
              }

              // Update paragraphs with results
              console.log('🔄 Updating paragraphs with API results...');
              result.data.results.forEach((paragraphResult, index) => {
                console.log(`📝 Processing result ${index + 1}:`, paragraphResult);
                if (paragraphResult.status === 'completed') {
                  get().updateParagraphStatus(paragraphResult.paragraphId, 'completed');
                  console.log(`✅ Updated paragraph ${paragraphResult.paragraphId} to completed`);
                  if (paragraphResult.corrections) {
                    get().updateParagraphCorrections(paragraphResult.paragraphId, paragraphResult.corrections);
                    console.log(`📝 Applied ${paragraphResult.corrections.length} corrections to paragraph ${paragraphResult.paragraphId}`);
                  }
                } else {
                  get().updateParagraphStatus(paragraphResult.paragraphId, 'error');
                  console.error(`❌ Updated paragraph ${paragraphResult.paragraphId} to error`);
                }
              });

              completedCount += batch.length;
              const progress = 20 + (completedCount / totalParagraphs) * 70; // 20% to 90%
              set({ processingProgress: progress });
              console.log(`📊 Progress updated: ${completedCount}/${totalParagraphs} completed (${Math.round(progress)}%)`);

            } catch (error) {
              console.error('❌ Batch processing failed:', error);
              // Mark batch as error
              batch.forEach(p => {
                get().updateParagraphStatus(p.id, 'error');
              });
              console.log('🚫 Marked batch paragraphs as error');
            }
            
            console.groupEnd();

            // Small delay between batches to prevent overwhelming the API
            if (i + batchSize < paragraphs.length) {
              console.log('⏱️ Waiting 500ms before next batch...');
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          // Mark as completed
          console.log('🎉 All batches processed, marking as completed');
          set({
            isCompleted: true,
            isProcessing: false,
            processingProgress: 100,
            currentAbortController: null,
          });
          console.log('✅ Final state: completed=true, processing=false, progress=100%');

        } catch (error) {
          console.error('❌ processDirectText failed:', error);
          throw error;
        } finally {
          console.groupEnd();
        }
      },

      // Update paragraph status
      updateParagraphStatus: (id, status) => {
        console.log(`%c🔄 Updating paragraph ${id} status to: ${status}`, 'color: #607D8B; font-weight: bold;');
        const state = get();
        const updatedParagraphs = state.paragraphs.map(p =>
          p.id === id ? { ...p, status } : p
        );
        set({ paragraphs: updatedParagraphs });
        console.log(`✅ Paragraph ${id} status updated successfully`);
      },

      // Update paragraph corrections
      updateParagraphCorrections: (id, corrections) => {
        console.group(`%c📝 Updating paragraph ${id} corrections`, 'color: #4CAF50; font-weight: bold;');
        console.log('📋 Corrections received:', corrections);
        const state = get();
        const paragraph = state.paragraphs.find(p => p.id === id);
        if (paragraph) {
          console.log('📄 Original text:', paragraph.text);
        }
        
        const updatedParagraphs = state.paragraphs.map(p =>
          p.id === id 
            ? { 
                ...p, 
                corrections,
                correctedText: corrections.length > 0 ? 
                  corrections.reduce((text, correction) => 
                    text.replace(correction.original, correction.corrected), p.text) : 
                  p.text 
              } 
            : p
        );
        
        const updatedParagraph = updatedParagraphs.find(p => p.id === id);
        if (updatedParagraph) {
          console.log('📝 Corrected text:', updatedParagraph.correctedText);
          console.log('📊 Applied corrections:', updatedParagraph.corrections.length);
        }
        
        set({ paragraphs: updatedParagraphs });
        console.log('✅ Paragraph corrections updated successfully');
        console.groupEnd();
      },
    })),
    {
      name: 'text-correction-store',
    }
  )
);

// Selector hooks for better performance
export const useInputMethod = () => useTextCorrectionStore(state => state.inputMethod);
export const useInputText = () => useTextCorrectionStore(state => state.inputText);
export const useGoogleDocsUrl = () => useTextCorrectionStore(state => state.googleDocsUrl);
export const useIsProcessing = () => useTextCorrectionStore(state => state.isProcessing);
export const useProcessingProgress = () => useTextCorrectionStore(state => state.processingProgress);
export const useProgress = useProcessingProgress; // Alias for compatibility
export const useCurrentParagraphIndex = () => useTextCorrectionStore(state => state.currentParagraphIndex);
export const useParagraphs = () => useTextCorrectionStore(state => state.paragraphs);
export const useIsCompleted = () => useTextCorrectionStore(state => state.isCompleted);
export const useError = () => useTextCorrectionStore(state => state.error);
export const useShowAnimation = () => useTextCorrectionStore(state => state.showAnimation);
export const useAnimationSpeed = () => useTextCorrectionStore(state => state.animationSpeed);