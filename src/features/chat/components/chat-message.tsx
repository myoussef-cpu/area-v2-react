// Chat Message Component
// Displays a single message bubble with support for results and suggestions

import { useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import type { ChatMessage, ToolResult, ConversionResult } from '../chat-types';
import { cn } from '../../../shared/lib/cn';

export function ChatMessage({ message }: { message: ChatMessage }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const isUser = message.role === 'user';
  const hasResults = message.results && message.results.length > 0;
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;

  const formatResultForDisplay = (result: ToolResult | ConversionResult): string => {
    if ('kind' in result && result.kind === 'conversion') {
      return `${result.convertedValue} ${result.convertedTo}`;
    }
    return result.summary;
  };

  const handleCopy = async () => {
    try {
      const text = hasResults
        ? message.results!.map(r => formatResultForDisplay(r)).join('\n')
        : message.content;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'Result from Al-Mohandes Calculator',
        text: message.content +
          (hasResults
            ? '\n\nResult: ' + message.results!.map(r => formatResultForDisplay(r)).join('\n')
            : ''),
      });
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2 text-sm',
          isUser
            ? 'bg-primary/10 text-primary'
            : 'bg-white/75 dark:bg-[rgba(28,28,30,0.7)] text-[var(--foreground)]',
          'break-words'
        )}
      >
        {/* Message content */}
        <div className="mb-2">{message.content}</div>

        {/* Results display */}
        {hasResults && (
          <div className="mt-2 space-y-2">
            {message.results!.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-1">
                  {result.toolName}
                  {result.unitType === 'area' && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Feddan)
                    </span>
                  )}
                  {result.unitType === 'volume' && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Cubic Meter)
                    </span>
                  )}
                </div>
                <div className="text-sm">{result.details}</div>
                {result.primaryValue !== undefined && (
                  <div className="mt-2 text-lg font-bold text-primary">
                    {formatResultForDisplay(result)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-2 flex items-center space-x-2 text-xs opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-primary/20"
            title="Copy"
            disabled={isCopied || isShared}
          >
            <Copy className="h-3 w-3" />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-primary/20"
            title="Share"
            disabled={isCopied || isShared}
          >
            <Share2 className="h-3 w-3" />
            {isShared ? 'Shared!' : 'Share'}
          </button>
        </div>

        {/* Suggestions */}
        {hasSuggestions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions!.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // This would need to be handled by parent component
                  console.log('Suggested:', suggestion);
                }}
                className="px-3 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}