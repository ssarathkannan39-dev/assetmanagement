export function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">{label}</div>
      <div className={`stencil text-3xl font-bold ${accent ? 'text-accent' : 'text-zinc-50'}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
      <div className="absolute top-0 right-0 w-16 h-16 border-l border-b border-line opacity-30" />
    </div>
  );
}

export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="card p-12 text-center">
      <div className="stencil text-lg text-zinc-300 mb-1">{title}</div>
      {subtitle && <div className="text-sm text-muted mb-4">{subtitle}</div>}
      {action}
    </div>
  );
}

export function Spinner({ label = 'LOADING' }) {
  return (
    <div className="flex items-center gap-3 text-muted text-xs font-mono uppercase tracking-wider py-8 justify-center">
      <span className="w-2 h-2 bg-accent animate-pulse rounded-full" />
      {label}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm rounded-sm px-4 py-3 mb-4 font-mono">
      {message}
    </div>
  );
}
