import { useCallback, useMemo } from 'react';
import { Plus, MessageCircle, Search, Trash2, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { Conversation } from '../chat-types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;

  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `اليوم ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `أمس ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncateTitle(title: string, maxLen = 36): string {
  if (title.length <= maxLen) return title;
  return title.slice(0, maxLen).trimEnd() + '…';
}

export function ConversationSidebar({
  conversations,
  activeId,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onClose,
  isOpen,
}: ConversationSidebarProps) {
  const handleSelect = useCallback(
    (id: string) => {
      onSelectConversation(id);
      onClose();
    },
    [onSelectConversation, onClose]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDeleteConversation(id);
    },
    [onDeleteConversation]
  );

  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations]
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.trim().toLowerCase();
    return sorted.filter((c) => c.title.toLowerCase().includes(q));
  }, [sorted, searchQuery]);

  const sidebarBody = (
    <div className="flex h-full flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-4 py-3" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">المحادثات</h2>
        {isOpen && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 md:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          محادثة جديدة
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث في المحادثات..."
            dir="auto"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-9 pl-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-gray-400 dark:text-zinc-500">
            <MessageCircle className="h-8 w-8" />
            {searchQuery ? 'لا توجد نتائج' : 'لا توجد محادثات بعد'}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <li key={conv.id}>
                  <div
                    onClick={() => handleSelect(conv.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-colors cursor-pointer',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <MessageCircle
                      className={cn(
                        'h-4.5 w-4.5 shrink-0',
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'truncate text-sm',
                          isActive
                            ? 'font-medium text-blue-900 dark:text-blue-100'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {truncateTitle(conv.title)}
                      </p>
                      <p className="truncate text-xs text-gray-400 dark:text-zinc-500">
                        {formatRelativeTime(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className={cn(
                        'shrink-0 rounded-lg p-1.5 opacity-0 transition-all',
                        'group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20',
                        'text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                      )}
                      aria-label={`حذف: ${conv.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="border-t border-gray-200 dark:border-zinc-800 px-4 py-6 text-center text-xs text-gray-400 dark:text-zinc-500">
          {conversations.length} محادثة
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[65] bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - slides in from right on mobile, always visible on desktop */}
      <div
        className={cn(
          'fixed z-[66] top-0 bottom-0 w-[300px] right-0 transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {sidebarBody}
      </div>
    </>
  );
}