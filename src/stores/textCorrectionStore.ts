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
      resetState: () => set(initialState),

      // Main processing function
      startProcessing: async () => {
        const state = get();
        set({ error: null });

        try {
          if (state.inputMethod === 'google-docs') {
            await get().processWithGoogleDocs();
          } else {
            await get().processDirectText();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          set({
            error: errorMessage,
            isProcessing: false,
            processingProgress: 0,
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
          const importResult = await apiService.importGoogleDoc(googleDocsUrl);
          
          if (!importResult.success || !importResult.data) {
            throw new Error(importResult.error?.message || 'Failed to import Google Docs');
          }

          // Set the imported text and process it
          set({ inputText: importResult.data.content });
          await get().processDirectText();
          
        } catch (error) {
          throw error;
        }
      },

      // Process direct text input
      processDirectText: async () => {
        const { inputText } = get();
        
        // Validate text input
        const validation = validateTextInput(inputText);
        if (!validation.isValid) {
          set({ error: validation.error });
          return;
        }

        set({ isProcessing: true, processingProgress: 0, currentParagraphIndex: 0 });

        try {
          // Split text into paragraphs
          const paragraphTexts = splitIntoParagraphs(inputText);
          const paragraphs = createParagraphs(paragraphTexts);
          
          set({ paragraphs, processingProgress: 20 });

          // Process paragraphs in batches
          const batchSize = 3;
          const totalParagraphs = paragraphs.length;
          let completedCount = 0;

          for (let i = 0; i < paragraphs.length; i += batchSize) {
            const batch = paragraphs.slice(i, i + batchSize);
            const batchData = batch.map(p => ({ id: p.id, text: p.text }));

            // Update status to processing for current batch
            batch.forEach(p => {
              get().updateParagraphStatus(p.id, 'processing');
            });

            set({ currentParagraphIndex: i });

            try {
              // Call batch processing API
              const result = await apiService.correctParagraphs(batchData);
              
              if (!result.success || !result.data) {
                throw new Error(result.error?.message || 'Processing failed');
              }

              // Update paragraphs with results
              result.data.results.forEach(paragraphResult => {
                if (paragraphResult.status === 'completed') {
                  get().updateParagraphStatus(paragraphResult.paragraphId, 'completed');
                  if (paragraphResult.corrections) {
                    get().updateParagraphCorrections(paragraphResult.paragraphId, paragraphResult.corrections);
                  }
                } else {
                  get().updateParagraphStatus(paragraphResult.paragraphId, 'error');
                }
              });

              completedCount += batch.length;
              const progress = 20 + (completedCount / totalParagraphs) * 70; // 20% to 90%
              set({ processingProgress: progress });

            } catch (error) {
              // Mark batch as error
              batch.forEach(p => {
                get().updateParagraphStatus(p.id, 'error');
              });
            }

            // Small delay between batches to prevent overwhelming the API
            if (i + batchSize < paragraphs.length) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          // Mark as completed
          set({
            isCompleted: true,
            isProcessing: false,
            processingProgress: 100,
          });

        } catch (error) {
          throw error;
        }
      },

      // Update paragraph status
      updateParagraphStatus: (id, status) => {
        const state = get();
        const updatedParagraphs = state.paragraphs.map(p =>
          p.id === id ? { ...p, status } : p
        );
        set({ paragraphs: updatedParagraphs });
      },

      // Update paragraph corrections
      updateParagraphCorrections: (id, corrections) => {
        const state = get();
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
        set({ paragraphs: updatedParagraphs });
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
export const useParagraphs = () => useTextCorrectionStore(state => state.paragraphs);
export const useIsCompleted = () => useTextCorrectionStore(state => state.isCompleted);
export const useError = () => useTextCorrectionStore(state => state.error);
export const useShowAnimation = () => useTextCorrectionStore(state => state.showAnimation);
export const useAnimationSpeed = () => useTextCorrectionStore(state => state.animationSpeed);