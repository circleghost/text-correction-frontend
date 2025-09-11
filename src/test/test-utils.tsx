import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  route?: string
}

function customRender(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    route = '/',
    ...options
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock API responses
export const mockApiResponse = {
  success: (data: any = {}) => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }),
  error: (message: string = 'Something went wrong', code: number = 500) => ({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  })
}

// Mock OpenAI API responses
export const mockOpenAIResponse = {
  textCorrection: {
    correctedText: '這是修正後的文字',
    corrections: [
      {
        original: '錯字',
        corrected: '錯誤',
        position: { start: 0, end: 2 },
        type: 'spelling',
        confidence: 0.95
      }
    ],
    confidence: 0.98
  }
}

// Test data generators
export const generateTestUser = (overrides: Partial<any> = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  ...overrides
})

export const generateTestCorrectionRequest = (overrides: Partial<any> = {}) => ({
  id: '1',
  originalText: '這是原文',
  correctedText: '這是修正後的文字',
  corrections: [],
  status: 'completed',
  createdAt: new Date().toISOString(),
  ...overrides
})

// Async utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 100))

// Custom matchers can be added here
export const expectTextToBeInDocument = (text: string) => {
  expect(document.body).toHaveTextContent(text)
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Use our custom render as the default
export { customRender as render }