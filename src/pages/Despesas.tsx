export default function Despesas() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          06 — Lançamentos
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-6">
        Despesas <span className="italic text-gold">por obra.</span>
      </h1>
      <p className="text-muted text-sm italic max-w-prose">
        Em construção. Captura de fatura, OCR com Claude Vision e ligação à obra entram na Fase 3.
      </p>
    </div>
  )
}
