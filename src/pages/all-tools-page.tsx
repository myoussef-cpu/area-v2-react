import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Card } from '../shared/ui/card';
import { TOOLS, CATEGORY_ORDER } from '../domains/registry';
import { CATEGORY_META, type ToolCategory } from '../shared/types';
import * as Icons from 'lucide-react';

export default function AllToolsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return TOOLS;
    const q = search.toLowerCase();
    return TOOLS.filter(
      (t) => t.name.includes(q) || t.description.includes(q) || t.category.includes(q)
    );
  }, [search]);

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const tools = filtered.filter((t) => t.category === cat);
      if (tools.length) acc[cat] = tools;
      return acc;
    },
    {} as Record<ToolCategory, typeof TOOLS>
  );

  return (
    <div className="animate-ios-slide-up py-2">
      <div className="mb-4">
        <h2 className="text-xl font-bold">جميع الأدوات</h2>
        <p className="text-sm text-[#8e8e93]">{TOOLS.length} أداة متاحة</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن أداة..."
          className="w-full rounded-2xl border border-black/5 bg-white/70 px-12 py-3 text-right text-sm backdrop-blur-md transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93]">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {Object.entries(grouped).map(([cat, tools]) => {
        const meta = CATEGORY_META[cat as ToolCategory];
        const IconComponent = (Icons as any)[meta.icon] || Icons.Circle;
        return (
          <div key={cat} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-[#8e8e93]">{meta.name}</h3>
              <span className="text-xs text-[#8e8e93]">({tools.length})</span>
            </div>
            <div className="space-y-2">
              {tools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    onClick={() => navigate(`/tool/${tool.id}`)}
                    className="flex cursor-pointer items-center gap-3 transition-all hover:bg-primary/5 active:scale-[0.99]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ToolIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{tool.name}</p>
                      <p className="truncate text-xs text-[#8e8e93]">{tool.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold text-[#8e8e93] dark:bg-white/10">
                      {meta.name}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
