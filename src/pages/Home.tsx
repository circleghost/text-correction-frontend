import React from 'react';
import { Layout } from '@/components/common';
import { useTextCorrectionStore } from '@/stores/textCorrectionStore';

const Home: React.FC = () => {
  const { inputMethod, inputText, setInputMethod, setInputText } = useTextCorrectionStore();

  return (
    <Layout>
      <div className='container mx-auto px-4 py-12 max-w-4xl'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-text-primary mb-4'>
            智能中文錯字檢查
          </h2>
          <p className='text-lg text-text-secondary max-w-2xl mx-auto'>
            利用 AI 技術，快速檢測並修正中文文字中的錯別字、語法錯誤和標點符號問題，讓您的表達更精確。
          </p>
        </div>

        {/* Input Method Selection */}
        <div className='card mb-8'>
          <div className='card-header'>
            <h3 className='text-xl font-semibold text-text-primary mb-4'>
              選擇輸入方式
            </h3>
            <div className='flex space-x-4'>
              <button
                className={`btn ${inputMethod === 'direct' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setInputMethod('direct')}
              >
                直接貼上文字
              </button>
              <button
                className={`btn ${inputMethod === 'google-docs' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setInputMethod('google-docs')}
              >
                Google Docs 網址
              </button>
            </div>
          </div>

          <div className='card-body'>
            {inputMethod === 'direct' ? (
              <div className='input-group'>
                <label htmlFor='text-input' className='input-label'>
                  請輸入需要檢查的文字
                </label>
                <textarea
                  id='text-input'
                  className='input-field'
                  rows={10}
                  placeholder='請在這裡貼上您需要檢查的文字內容...'
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className='input-helper'>
                  字數統計: {inputText.length} / 10,000
                </div>
              </div>
            ) : (
              <div className='input-group'>
                <label htmlFor='docs-url' className='input-label'>
                  Google Docs 分享連結
                </label>
                <input
                  id='docs-url'
                  type='url'
                  className='input-field'
                  placeholder='https://docs.google.com/document/d/...'
                />
                <div className='input-helper'>
                  請確保文件已設定為「知道連結的使用者」可檢視
                </div>
              </div>
            )}

            <div className='flex justify-center mt-6'>
              <button className='btn btn-primary btn-lg px-8 py-3'>
                開始智能校正
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <div className='text-center p-6'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-primary-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
              </svg>
            </div>
            <h4 className='text-lg font-semibold text-text-primary mb-2'>
              AI 智能分析
            </h4>
            <p className='text-text-secondary'>
              運用先進的自然語言處理技術，精確識別各類文字問題
            </p>
          </div>

          <div className='text-center p-6'>
            <div className='w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-success-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <h4 className='text-lg font-semibold text-text-primary mb-2'>
              快速處理
            </h4>
            <p className='text-text-secondary'>
              段落化處理，平均 3 秒內完成單段校正，提升工作效率
            </p>
          </div>

          <div className='text-center p-6'>
            <div className='w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-warning-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
              </svg>
            </div>
            <h4 className='text-lg font-semibold text-text-primary mb-2'>
              視覺對比
            </h4>
            <p className='text-text-secondary'>
              清晰的紅綠對比顯示，讓修正內容一目了然
            </p>
          </div>
        </div>

        {/* Usage Tips */}
        <div className='card'>
          <div className='card-header'>
            <h3 className='text-xl font-semibold text-text-primary'>
              使用提示
            </h3>
          </div>
          <div className='card-body'>
            <ul className='space-y-3 text-text-secondary'>
              <li className='flex items-start'>
                <svg className='w-5 h-5 text-primary-500 mr-3 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span>
                  <strong>文字長度：</strong>建議單次處理不超過 10,000 字，過長文字會自動分段處理
                </span>
              </li>
              <li className='flex items-start'>
                <svg className='w-5 h-5 text-primary-500 mr-3 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span>
                  <strong>Google Docs：</strong>請確保文件權限設定為「知道連結的使用者」可以檢視
                </span>
              </li>
              <li className='flex items-start'>
                <svg className='w-5 h-5 text-primary-500 mr-3 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span>
                  <strong>處理時間：</strong>視文字長度而定，通常 3-10 秒內完成，請耐心等候
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;