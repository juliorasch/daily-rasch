export default function Obras() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          05 — Estaleiro
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-6">
        Obras <span className="italic text-gold">em curso.</span>
      </h1>
      <p className="text-muted text-sm italic max-w-prose">
        Em construção. Lista de obras com cliente, prazo, valor contratado e estado chega a seguir aos orçamentos.
      </p>
    </div>
  )
}
