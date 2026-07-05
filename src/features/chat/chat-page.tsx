import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ChatMessage, Conversation, ToolResult } from './chat-types';
import { ChatAgent } from './chat-agent';
import { ChatInput } from './components/chat-input';
import { ConversationSidebar } from './components/conversation-sidebar';
import { HtmlMessage } from '@/components/HtmlMessage';
import { AppBar } from '@/features/layout/app-bar';
import { useAppStore } from '@/shared/store/app-store';
import { cn } from '@/shared/lib/cn';
import {
  Message,
  MessageToolbar,
} from '@/components/ai-elements/message';
import {
  Suggestions,
  Suggestion,
} from '@/components/ai-elements/suggestion';
import { Clawd } from '@/components/clawd';

const STORAGE_KEY = 'conversations';

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Conversation[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  try {
    const oldRaw = localStorage.getItem('chatHistory');
    if (oldRaw) {
      const oldMessages = JSON.parse(oldRaw) as ChatMessage[];
      if (Array.isArray(oldMessages) && oldMessages.length > 0) {
        const migrated: Conversation = {
          id: crypto.randomUUID(),
          title: oldMessages.find((m) => m.role === 'user')?.content?.slice(0, 40) || 'محادثة قديمة',
          messages: oldMessages,
          createdAt: oldMessages[0]?.timestamp || Date.now(),
          updatedAt: oldMessages[oldMessages.length - 1]?.timestamp || Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([migrated]));
        localStorage.removeItem('chatHistory');
        return [migrated];
      }
    }
  } catch {
    // ignore
  }

  return [];
}

function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // ignore
  }
}

function getSnippet(text: string, maxLen = 40): string {
  const cleaned = text.replace(/<[^>]*>/g, '').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).trimEnd() + '…';
}

export default function ChatPage() {
  const darkMode = useAppStore((s) => s.darkMode);
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatAgent] = useState(() => new ChatAgent());

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const messages = activeConversation?.messages ?? [];
  const chatTitle = activeConversation?.title;

  const handleNewChatRef = useRef<() => void>();
  const handleSendRef = useRef<((input: string) => Promise<void>) | null>(null);

  const handleNewChat = useCallback(() => {
    handleNewChatRef.current = () => {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: '',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => {
        const next = [newConv, ...prev];
        saveConversations(next);
        return next;
      });
      setActiveId(newConv.id);
      setSearchQuery('');
      setIsSidebarOpen(false);
    };
    handleNewChatRef.current();
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setSearchQuery('');
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveConversations(next);
        if (activeId === id) {
          setActiveId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeId]
  );

  const handleSend = useCallback(
    async (input: string) => {
      if (!input.trim() || isTyping) return;

      let target = activeId;

      if (!target) {
        const newConv: Conversation = {
          id: crypto.randomUUID(),
          title: getSnippet(input),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setConversations((prev) => {
          const next = [newConv, ...prev];
          saveConversations(next);
          return next;
        });
        setActiveId(newConv.id);
        target = newConv.id;
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        timestamp: Date.now(),
      };

      setConversations((prev) => {
        const conv = prev.find((c) => c.id === target);
        if (!conv) return prev;

        const updatedMessages = [...conv.messages, userMessage];
        const shouldAutoTitle = !conv.title && updatedMessages.filter((m) => m.role === 'user').length === 1;

        const next = prev.map((c) =>
          c.id === target
            ? {
                ...c,
                messages: updatedMessages,
                title: shouldAutoTitle ? getSnippet(input) : c.title,
                updatedAt: Date.now(),
              }
            : c
        );
        saveConversations(next);
        return next;
      });

      setIsTyping(true);

      try {
        const currentHistory = conversations.find((c) => c.id === target)?.messages ?? [];
        const botResponse = await chatAgent.processMessage(input, [...currentHistory, userMessage]);

        setConversations((prev) => {
          const next = prev.map((c) =>
            c.id === target
              ? {
                  ...c,
                  messages: [...c.messages, botResponse],
                  updatedAt: Date.now(),
                }
              : c
          );
          saveConversations(next);
          return next;
        });
      } catch {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '<p>عذراً، حدث خطأ أثناء المعالجة. حاول مرة أخرى.</p>',
          timestamp: Date.now(),
        };
        setConversations((prev) => {
          const next = prev.map((c) =>
            c.id === target
              ? { ...c, messages: [...c.messages, errorMsg], updatedAt: Date.now() }
              : c
          );
          saveConversations(next);
          return next;
        });
      } finally {
        setIsTyping(false);
      }
    },
    [activeId, isTyping, chatAgent, conversations]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSend(suggestion);
  }, [handleSend]);

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  const showEmptyState = messages.length === 0 && !isTyping;

  return (
    <>
      {/* Sidebar - outside, stays fixed */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />

      <AppBar onToggleSidebar={() => setIsSidebarOpen(true)} chatTitle={chatTitle} />

      {/* Content - adjusts width to make room for sidebar on right */}
      <div
        className={cn(
          'fixed top-0 bottom-0 left-0 bg-white dark:bg-black flex flex-col transition-[right] duration-300 ease-in-out',
          isSidebarOpen ? 'right-[300px]' : 'right-0',
          'md:right-[300px]'
        )}
      >
        {/* Messages - scrollable area, takes remaining space above input */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop: 'calc(3.5rem + var(--safe-area-inset-top, 0px))',
          }}
        >
          <div className="mx-auto w-full max-w-3xl px-4 pb-32 pt-4">
          {showEmptyState ? (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 flex items-center justify-center">
                <Clawd mood="happy" scale={0.8} color="#3B82F6" animated={false} />
              </div>

              <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                مساعد الهندسة الذكي
              </h2>
              <p className="mb-8 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                اسألني عن أي شيء — مساحات، تحويل وحدات، فيزياء، أو رياضيات — وسأجيبك فوراً
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'احسب مساحة دائرة نصف قطرها 5',
                  'حول 100 متر إلى قدم',
                  'ما هو قانون أوم؟',
                  'احسب حجم كرة نصف قطر 3',
                ].map((label) => (
                  <button
                    key={label}
                    onClick={() => handleSend(label)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {(() => {
                const pairs: { user: ChatMessage; assistant?: ChatMessage }[] = [];
                for (let i = 0; i < messages.length; i++) {
                  if (messages[i].role === 'user') {
                    const next = messages[i + 1];
                    pairs.push({ user: messages[i], assistant: next?.role === 'assistant' ? next : undefined });
                  }
                }
                return pairs.map((pair) => (
                  <div key={pair.user.id} className="flex flex-col gap-2">
                    <div className="flex">
                      <div className="ml-auto w-fit max-w-[85%] sm:max-w-[65%] rounded-2xl rounded-tr-sm bg-gray-200 px-3.5 py-2.5 text-[14px] leading-relaxed text-gray-900 shadow-sm dark:bg-zinc-800 dark:text-white">
                        <div className="whitespace-pre-wrap break-words">{pair.user.content}</div>
                      </div>
                    </div>
                    {pair.assistant && (
                      <Message from="assistant">
                        <div className="w-full min-w-0 max-w-full text-gray-800 dark:text-gray-200">
                          <HtmlMessage html={pair.assistant.content} dark={darkMode} />
                          {pair.assistant.results && pair.assistant.results.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {pair.assistant.results.map((r, idx) => (
                                <ToolResultCard key={idx} result={r} />
                              ))}
                            </div>
                          )}
                        </div>
                        {pair.assistant.suggestions && pair.assistant.suggestions.length > 0 && (
                          <MessageToolbar>
                            <Suggestions>
                              {pair.assistant.suggestions.map((s, i) => (
                                <Suggestion key={i} suggestion={s} onClick={handleSuggestionClick} />
                              ))}
                            </Suggestions>
                          </MessageToolbar>
                        )}
                      </Message>
                    )}
                  </div>
                ));
              })()}

              {isTyping && (
                <div className="flex flex-col gap-2">
                  <Message from="assistant">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                      <span className="size-2 rounded-full bg-gray-400 animate-pulse dark:bg-gray-500" />
                      <span className="size-2 rounded-full bg-gray-400 animate-pulse dark:bg-gray-500" style={{ animationDelay: '0.2s' }} />
                      <span className="size-2 rounded-full bg-gray-400 animate-pulse dark:bg-gray-500" style={{ animationDelay: '0.4s' }} />
                      <span className="mr-1 text-xs">جاري المعالجة...</span>
                    </div>
                  </Message>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input - at the bottom of the flex layout */}
      <ChatInput
        onSend={handleSend}
        placeholder="اسأل عن أي شيء..."
        disabled={isTyping}
        className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-black px-4 sm:px-6"
      />
      </div>
    </>
  );
}

function ToolResultCard({ result }: { result: ToolResult }) {
  const isConversion = 'kind' in result && result.kind === 'conversion';
  return (
    <div
      dir="rtl"
      className="rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-right dark:border-blue-900/40 dark:bg-blue-950/20"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {result.toolName}
        </span>
        {isConversion && (
          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            تحويل
          </span>
        )}
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {result.summary}
      </div>
      {result.details && (
        <div className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {result.details}
        </div>
      )}
    </div>
  );
}