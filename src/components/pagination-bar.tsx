import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationBar({
  page, pageCount, onPage, total, pageSize, onPageSize,
}: {
  page: number; pageCount: number; onPage: (p: number) => void;
  total: number; pageSize: number; onPageSize?: (s: number) => void;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );
  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 backdrop-blur px-2 py-1.5 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPage(p)}
            className={"h-8 min-w-8 px-2 rounded-full text-xs font-medium transition-all " + (p === page ? "gold-gradient text-primary shadow" : "hover:bg-muted text-foreground/70")}>
            {p}
          </button>
        ))}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span>{from}–{to} sur {total}</span>
        {onPageSize && (
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}
            className="border border-border rounded-full bg-card px-2 py-0.5 text-xs">
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

export function usePagination<T>(items: T[], pageSize: number, page: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safe = Math.min(page, pageCount);
  const slice = items.slice((safe - 1) * pageSize, safe * pageSize);
  return { slice, pageCount, safePage: safe };
}
