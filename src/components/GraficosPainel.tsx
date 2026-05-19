const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
const eurCompact = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export type FunilOrcamentos = {
  enviado: { n: number; valor: number }
  em_analise: { n: number; valor: number }
  aceite: { n: number; valor: number }
  recusado: { n: number; valor: number }
}

export type ObraMargem = {
  id: string
  descricao: string
  cliente?: string | null
  contratado: number
  gasto: number
}

export type SemanaDespesas = {
  label: string
  total: number
}

type Props = {
  funil: FunilOrcamentos
  obras: ObraMargem[]
  semanas: SemanaDespesas[]
}

export default function GraficosPainel({ funil, obras, semanas }: Props) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          Panorama
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-line rounded-editorial p-5 lg:p-6">
          <FunilGrafico data={funil} />
        </div>
        <div className="bg-bg-card border border-line rounded-editorial p-5 lg:p-6">
          <SparklineSemanas data={semanas} />
        </div>
        <div className="lg:col-span-2 bg-bg-card border border-line rounded-editorial p-5 lg:p-6">
          <MargensObras data={obras} />
        </div>
      </div>
    </section>
  )
}

function FunilGrafico({ data }: { data: FunilOrcamentos }) {
  const estagios = [
    { key: 'enviado', label: 'Enviado', ...data.enviado, cor: '#8C7848' },
    { key: 'em_analise', label: 'Em análise', ...data.em_analise, cor: '#D4B27F' },
    { key: 'aceite', label: 'Aceite', ...data.aceite, cor: '#C9A961' },
  ]
  const maxN = Math.max(1, ...estagios.map((e) => e.n))
  const totalValor = estagios.reduce((a, e) => a + e.valor, 0)
  const taxaAceitacao =
    data.enviado.n + data.em_analise.n + data.aceite.n + data.recusado.n > 0
      ? Math.round(
          (data.aceite.n /
            (data.enviado.n + data.em_analise.n + data.aceite.n + data.recusado.n)) *
            100,
        )
      : 0

  return (
    <div>
      <header className="mb-5">
        <h3 className="font-display text-xl text-cream-bright leading-tight">
          Funil de <span className="italic text-gold">orçamentos.</span>
        </h3>
        <p className="text-muted text-xs mt-1">
          {eur.format(totalValor)} no pipeline · {taxaAceitacao}% aceitação
        </p>
      </header>

      <div className="space-y-3">
        {estagios.map((e) => {
          const pct = (e.n / maxN) * 100
          return (
            <div key={e.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim">
                  {e.label}
                </span>
                <span className="text-cream text-xs tabular-nums">
                  <span className="font-display text-base text-cream-bright mr-2">
                    {e.n}
                  </span>
                  {eurCompact.format(e.valor)}
                </span>
              </div>
              <div className="relative h-2 bg-bg/60 rounded-editorial overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{ width: `${Math.max(2, pct)}%`, background: e.cor }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {data.recusado.n > 0 && (
        <div className="mt-4 pt-3 border-t border-line/60">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] tracking-editorial-wide uppercase text-negative/80">
              Recusados
            </span>
            <span className="text-muted text-xs tabular-nums">
              {data.recusado.n} · {eurCompact.format(data.recusado.valor)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function SparklineSemanas({ data }: { data: SemanaDespesas[] }) {
  const totais = data.map((d) => d.total)
  const max = Math.max(1, ...totais)
  const totalPeriodo = totais.reduce((a, b) => a + b, 0)
  const ultima = data[data.length - 1]
  const penultima = data[data.length - 2]
  const variacao =
    penultima && penultima.total > 0
      ? Math.round(((ultima.total - penultima.total) / penultima.total) * 100)
      : null

  return (
    <div>
      <header className="mb-5">
        <h3 className="font-display text-xl text-cream-bright leading-tight">
          Ritmo de <span className="italic text-gold">despesas.</span>
        </h3>
        <p className="text-muted text-xs mt-1">
          {eur.format(totalPeriodo)} nas últimas {data.length} semanas
          {variacao !== null && (
            <span
              className={`ml-2 ${
                variacao > 0 ? 'text-negative' : variacao < 0 ? 'text-positive' : ''
              }`}
            >
              {variacao > 0 ? '↑' : variacao < 0 ? '↓' : '→'} {Math.abs(variacao)}%
              vs. semana anterior
            </span>
          )}
        </p>
      </header>

      <div className="flex items-end gap-1.5 h-32">
        {data.map((s, i) => {
          const h = (s.total / max) * 100
          const isLast = i === data.length - 1
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group relative"
              title={`${s.label}: ${eur.format(s.total)}`}
            >
              <div
                className={`w-full rounded-t-[2px] transition-all duration-500 ${
                  isLast ? 'bg-gold' : 'bg-gold-dim/70'
                }`}
                style={{ height: `${Math.max(2, h)}%` }}
              />
              <span className="text-[9px] text-muted mt-1.5 tracking-wide tabular-nums">
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {ultima && (
        <div className="mt-4 pt-3 border-t border-line/60 flex items-baseline justify-between">
          <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim">
            Esta semana
          </span>
          <span className="font-display text-lg text-cream-bright tabular-nums">
            {eur.format(ultima.total)}
          </span>
        </div>
      )}
    </div>
  )
}

function MargensObras({ data }: { data: ObraMargem[] }) {
  if (data.length === 0) {
    return (
      <div>
        <h3 className="font-display text-xl text-cream-bright leading-tight mb-2">
          Margem das <span className="italic text-gold">obras em curso.</span>
        </h3>
        <p className="text-muted text-xs">
          Não há obras em curso. Quando arrancares uma, aparece aqui o gasto vs. contratado.
        </p>
      </div>
    )
  }

  const ordenadas = [...data].sort((a, b) => {
    const ra = a.contratado > 0 ? a.gasto / a.contratado : 0
    const rb = b.contratado > 0 ? b.gasto / b.contratado : 0
    return rb - ra
  })

  return (
    <div>
      <header className="mb-5">
        <h3 className="font-display text-xl text-cream-bright leading-tight">
          Margem das <span className="italic text-gold">obras em curso.</span>
        </h3>
        <p className="text-muted text-xs mt-1">
          Gasto vs. contratado · {data.length} {data.length === 1 ? 'obra' : 'obras'}
        </p>
      </header>

      <div className="space-y-4">
        {ordenadas.map((o) => {
          const pct = o.contratado > 0 ? (o.gasto / o.contratado) * 100 : 0
          const margem = o.contratado - o.gasto
          const estado =
            pct > 100 ? 'estouro' : pct > 85 ? 'apertado' : 'saudavel'
          const cor =
            estado === 'estouro'
              ? '#D4715E'
              : estado === 'apertado'
              ? '#C9A961'
              : '#6BA77E'
          const labelEstado =
            estado === 'estouro'
              ? 'Estouro de orçamento'
              : estado === 'apertado'
              ? 'A apertar'
              : 'Saudável'
          return (
            <div key={o.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <div className="min-w-0 flex-1">
                  <div className="text-cream-bright text-sm truncate">
                    {o.descricao}
                  </div>
                  {o.cliente && (
                    <div className="text-muted text-[11px] truncate">{o.cliente}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-cream text-xs tabular-nums">
                    <span className="font-display text-base text-cream-bright">
                      {eurCompact.format(o.gasto)}
                    </span>
                    <span className="text-muted"> / {eurCompact.format(o.contratado)}</span>
                  </div>
                  <div
                    className="text-[10px] tracking-editorial-wide uppercase"
                    style={{ color: cor }}
                  >
                    {labelEstado} · {Math.round(pct)}%
                  </div>
                </div>
              </div>

              <div className="relative h-2.5 bg-bg/60 rounded-editorial overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(2, pct))}%`,
                    background: cor,
                  }}
                />
                {pct > 100 && (
                  <div
                    className="absolute inset-y-0 right-0 bg-negative/40 transition-all duration-700"
                    style={{ width: `${Math.min(100, pct - 100)}%` }}
                  />
                )}
              </div>

              {margem !== 0 && (
                <div className="text-[10px] text-muted mt-1 tabular-nums">
                  {margem >= 0 ? 'Resta' : 'Excedeu em'} {eur.format(Math.abs(margem))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
