export default function Decisoes() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          07 — Discernimento
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-6">
        Decisões <span className="italic text-gold">pendentes.</span>
      </h1>
      <p className="text-muted text-sm italic max-w-prose">
        Em construção. Lista priorizada de decisões — alta, média, baixa — com prazo e ligação opcional a obra.
      </p>
    </div>
  )
}
