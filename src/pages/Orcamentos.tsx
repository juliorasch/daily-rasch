export default function Orcamentos() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          04 — Pipeline
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-6">
        Orçamentos <span className="italic text-gold">activos.</span>
      </h1>
      <p className="text-muted text-sm italic max-w-prose">
        Em construção. Kanban com quatro estados — enviado, em análise, aceite, recusado — chega na próxima iteração.
      </p>
    </div>
  )
}
