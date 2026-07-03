import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, Trash2, X, Cloud, CloudOff, Inbox } from 'lucide-react';
import { useResultsStore } from '../../shared/store/results-store';
import { useAuthStore } from '../../shared/store/auth-store';
import { useResults } from '../../shared/hooks/use-results';
import { Button } from '../../shared/ui/button';
import { cn } from '../../shared/lib/cn';
import { ResultItem } from './result-item';

export default function SavedResultsPage() {
  const { results, removeResult, clearAll } = useResultsStore();
  const { deleteResult } = useResults();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const synced = results.length > 0 && results.every((r) => r.synced);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleDelete = useCallback((id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    const timeout = setTimeout(() => {
      deleteResult(id);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timeoutsRef.current.delete(id);
    }, 300);
    timeoutsRef.current.set(id, timeout);
  }, [deleteResult]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search) return results;
    const q = search.toLowerCase();
    return results.filter(
      (r) => r.toolName.includes(q) || r.result.includes(q) || r.toolId.includes(q)
    );
  }, [results, search]);

  const handleExport = async (id: string) => {
    const result = results.find((r) => r.id === id);
    if (!result) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = document.getElementById(`result-${id}`);
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `result-${id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="animate-ios-slide-up py-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">النتائج المحفوظة</h2>
          <p className="text-sm text-[#8e8e93]">{results.length} نتيجة</p>
        </div>
        {results.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="ml-1.5 h-4 w-4" />
            مسح الكل
          </Button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في النتائج..."
          className="w-full rounded-2xl border border-black/5 bg-white/70 px-12 py-3 text-right text-sm backdrop-blur-md transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93]">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={cn(
        'mb-4 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold',
        synced ? 'bg-green-500/10 text-green-600' : 'bg-[#8e8e93]/10 text-[#8e8e93]'
      )}>
        {synced ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
        {synced
          ? 'جميع النتائج متزامنة مع السحابة'
          : user
            ? 'غير متزامن - اضغط للمزامنة'
            : 'سجل دخول للمزامنة مع السحابة'}
      </div>

      {filtered.length === 0 && !deletingIds.size ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
            <Inbox className="h-7 w-7 text-[#8e8e93]" />
          </div>
          <p className="text-sm font-semibold text-[#8e8e93]">
            {search ? 'لا توجد نتائج مطابقة' : 'لا توجد نتائج محفوظة'}
          </p>
          <p className="text-xs text-[#8e8e93]">
            {search ? 'حاول بكلمات بحث مختلفة' : 'النتائج التي تحفظها ستظهر هنا'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((result) => (
            <div key={result.id} id={`result-${result.id}`}>
              <ResultItem
                result={result}
                deleting={deletingIds.has(result.id)}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
