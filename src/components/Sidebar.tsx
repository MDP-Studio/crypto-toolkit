import type { Page } from '@/App';
import { CryptoLogo } from '@/components/CryptoLogo';
import { NAV_ITEMS } from '@/data/nav-items';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  PanelRightClose,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  open: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const COLLAPSED_STORAGE_KEY = 'crypto-toolkit:sidebar-collapsed';

export function Sidebar({ currentPage, onPageChange, open, onToggle, isMobile }: SidebarProps) {
  const categories = Array.from(new Set(NAV_ITEMS.map(i => i.category)));
  const activeCategory = NAV_ITEMS.find(i => i.id === currentPage)?.category;
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const initial = new Set(categories);
    if (activeCategory) initial.delete(activeCategory);
    try {
      const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const stored = new Set(parsed.filter((s: unknown): s is string => typeof s === 'string'));
          if (activeCategory) stored.delete(activeCategory);
          return stored;
        }
      }
    } catch (error) {
      console.debug('Recovered from non-fatal error in src/components/Sidebar.tsx:38.', error); /* ignore corrupt storage */ }
    return initial;
  });

  useEffect(() => {
    if (activeCategory && collapsed.has(activeCategory)) {
      const next = new Set(collapsed);
      next.delete(activeCategory);
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (error) {
      console.debug('Recovered from non-fatal error in src/components/Sidebar.tsx:48.', error); /* ignore quota errors */ }
      setCollapsed(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- agent-quality: allow: active category updates are intentionally keyed only by the derived active id
  }, [activeCategory]);

  function toggleCategory(cat: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (error) {
      console.debug('Recovered from non-fatal error in src/components/Sidebar.tsx:61.', error); /* ignore quota errors */ }
      return next;
    });
  }

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    if (isMobile) onToggle();
  };

  useEffect(() => {
    if (!isMobile || !open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onToggle(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobile, open, onToggle]);

  if (!open) return null;

  const sidebarContent = (
    <aside
      aria-label="Tool navigation"
      className={cn(
        'bg-card flex flex-col h-full',
        isMobile ? 'w-72' : 'w-64 border-l shrink-0',
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <CryptoLogo className="h-8 w-8" />
          <div className="min-w-0">
            <h2 className="font-semibold text-sm leading-none truncate">CryptoToolkit</h2>
            <span className="text-xs text-muted-foreground">v1.0</span>
          </div>
        </div>
        <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0">
          {isMobile
            ? <X className="h-[18px] w-[18px]" strokeWidth={2} />
            : <PanelRightClose className="h-[18px] w-[18px]" strokeWidth={2} />
          }
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {categories.map(cat => {
          const items = NAV_ITEMS.filter(i => i.category === cat);
          const isCollapsed = collapsed.has(cat);
          const hasActive = items.some(i => i.id === currentPage);

          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${cat} category`}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors rounded"
              >
                <span className="flex items-center gap-1">
                  {cat}
                  {hasActive && isCollapsed && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </span>
                <ChevronDown
                  className={cn('h-3 w-3 transition-transform shrink-0', isCollapsed ? '-rotate-90' : 'rotate-0')}
                  strokeWidth={2}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {items.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors text-left',
                          currentPage === item.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <p className="text-[11px] text-muted-foreground text-center">
          Educational use. Built with BigInt arithmetic.
        </p>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="flex-1 bg-black/50 animate-in fade-in duration-200"
          onClick={onToggle}
        />
        <div className="animate-in slide-in-from-right duration-200">
          {sidebarContent}
        </div>
      </div>
    );
  }

  return sidebarContent;
}
