import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../../../shared/lib/cn';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ChatInput({ onSend, placeholder = 'اكتب سؤالك هنا...', disabled, className, style }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = disabled || isSending;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isBusy) return;

      setIsSending(true);
      try {
        await onSend(trimmed);
        setInput('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } finally {
        setIsSending(false);
      }
    },
    [input, isBusy, onSend]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.form?.requestSubmit?.();
    }
  };

  return (
    <div className={cn('px-3 py-2', className)} style={style}>
      <form onSubmit={handleSubmit} dir="rtl">
          <div className={cn('relative rounded-2xl p-[2px] isolation-auto', isBusy && 'liquid-input-wrap')}>
          <div className="liquid-input-inner flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className={cn(
                'liquid-send-btn mr-0.5 flex size-9 shrink-0 items-center justify-center self-center',
                'rounded-full bg-gradient-to-b from-blue-500 to-blue-700',
                'text-white shadow-lg shadow-blue-600/25',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none',
                isSending && 'animate-send-pulse'
              )}
              aria-label="إرسال"
            >
              {isSending ? (
                <span className="relative z-10 flex h-2.5 w-2.5 items-center justify-center gap-[2px]">
                  <span
                    className="h-[2px] w-[2px] rounded-full bg-white animate-[bounce_0.6s_ease-in-out_infinite]"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-[2px] w-[2px] rounded-full bg-white animate-[bounce_0.6s_ease-in-out_infinite]"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-[2px] w-[2px] rounded-full bg-white animate-[bounce_0.6s_ease-in-out_infinite]"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
              ) : (
                <ArrowUp className="relative z-10 h-4 w-4 stroke-[2.5px]" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={isBusy}
              dir="auto"
              className={cn(
                'min-h-[44px] max-h-[140px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-5 outline-none',
                'placeholder:text-ink-400 placeholder:dark:text-stone-500',
                'text-ink-900 dark:text-stone-100',
                'disabled:cursor-not-allowed',
                isBusy && 'opacity-60'
              )}
            />

          </div>
        </div>
      </form>
    </div>
  );
}
