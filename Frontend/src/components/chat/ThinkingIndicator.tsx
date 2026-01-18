import { useEffect, useState } from 'react';

const thinkingPhrases = [
  'Thinking',
  'Analyzing',
  'Processing',
  'Searching',
  'Routing query',
  'Checking database',
  'Gathering information',
  'Formulating response'
];

export function ThinkingIndicator() {
  const [phraseIndex, setphraseIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Change phrase every 2 seconds
    const phraseInterval = setInterval(() => {
      setphraseIndex((prev) => (prev + 1) % thinkingPhrases.length);
    }, 2000);

    // Animate dots every 400ms
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-5 h-5 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
          {thinkingPhrases[phraseIndex]}
          {dots}
        </div>
        <div className="flex gap-1 mt-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
