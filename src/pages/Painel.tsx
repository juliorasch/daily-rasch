export default function Painel() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          02 — Painel
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-12">
        Visão <span className="italic text-gold">geral.</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-bg-card border border-line rounded-editorial p-8">
          <div className="text-gold text-[11px] tracking-editorial-wide uppercase mb-4">
            Empresa
          </div>
          <p className="font-display text-2xl text-cream-bright leading-tight">
            Rasch Remodeling <span className="italic text-gold">LDA.</span>
          </p>
          <p className="text-muted text-sm mt-4 leading-relaxed">
            Indicadores activos — orçamentos no pipeline, obras em curso, despesas por confirmar — aparecem aqui à medida que forem registados.
          </p>
        </section>

        <section className="bg-bg-card border border-line rounded-editorial p-8">
          <div className="text-gold text-[11px] tracking-editorial-wide uppercase mb-4">
            Família
          </div>
          <p className="font-display text-2xl text-cream-bright leading-tight">
            Saldo <span className="italic text-gold">familiar.</span>
          </p>
          <p className="text-muted text-sm mt-4 leading-relaxed">
            Entradas e despesas (fixas e variáveis) consolidam-se em saldo mensal. Primeiro lançamento desbloqueia este resumo.
          </p>
        </section>
      </div>
    </div>
  )
}
