import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, UserCircle } from 'lucide-react';
import { Card } from '../shared/ui/card';
import { TOOLS, CATEGORY_ORDER } from '../domains/registry';
import { CATEGORY_META, type ToolCategory } from '../shared/types';
import * as Icons from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = search
    ? TOOLS.filter((t) => t.name.includes(search) || t.description.includes(search))
    : TOOLS;

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
      <div className="mb-6 mt-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">أهلاً بك يا هندسة 👋</h2>
          <p className="text-sm text-[#8e8e93]">جاهز نحسب مساحات النهاردة؟</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCircle className="h-6 w-6" />
        </div>
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
            <div className="mb-3 flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-[#8e8e93]">{meta.name}</h3>
              <span className="text-xs text-[#8e8e93]">({tools.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  onClick={() => navigate(`/tool/${tool.id}`)}
                  className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center transition-all hover:bg-primary/5 active:scale-[0.97]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold leading-tight">{tool.name}</span>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
