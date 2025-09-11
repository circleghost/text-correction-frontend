/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_ANIMATIONS: string
  readonly VITE_ENABLE_GOOGLE_DOCS: string
  readonly VITE_ENABLE_EXPORT_FEATURES: string
  readonly VITE_MAX_TEXT_LENGTH: string
  readonly VITE_MAX_PARAGRAPHS: string
  readonly VITE_REQUEST_TIMEOUT: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_MOCK_API: string
  readonly VITE_ANIMATION_SPEED: string
  readonly VITE_THEME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}