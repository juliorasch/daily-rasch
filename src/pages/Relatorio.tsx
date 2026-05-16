import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
const diaMes = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long' })
const dataPt = new Intl.DateTimeFormat('pt-PT')

type Orcamento = {
  id: string
  descricao: string
  valor: number
  estado: 'enviado' | 'em_analise' | 'aceite' | 'recusado'
  data_envio: string | null
  proximo_followup: string | null
  cliente: { nome: string } | null
}
type Obra = {
  id: string
  descricao: string
  valor_contratado: number | null
  estado: 'por_arrancar' | 'em_curso' | 'concluida'
  data_inicio: string | null
  prazo: string | null
}
type Despesa = {
  id: string
  fornecedor: string
  valor: number
  data: string
  descricao: string | null
  obra: { id: string; descricao: string } | null
}
type Decisao = {
  id: string
  titulo: string
  estado: 'pendente' | 'resolvida'
  prazo: string | null
  prioridade: 'alta' | 'media' | 'baixa'
  created_at: string
}

type Resumo = {
  inicioSemana: Date
  fimSemana: Date
  fimProxima: Date
  orcamentosEnviados: Orcamento[]
  orcamentosAceites: Orcamento[]
  obrasIniciadas: Obra[]
  obrasConcluidas: Obra[]
  despesasSemana: Despesa[]
  decisoesResolvidas: Decisao[]
  followupsProximos: Orcamento[]
  obrasComPrazoProximo: Obra[]
  decisoesComPrazoProximo: Decisao[]
  entradasFamSemana: number
  despesasFamSemana: number
}

function startOfDay(d: Date): Date {
  const n = new Date(d)
  n.setHours(0, 0, 0, 0)
  return n
}

function addDays(d: Date, days: number): Date {
  const n = new Date(d)
  n.setDate(n.getDate() + days)
  return n
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function Relatorio() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hoje = startOfDay(new Date())
    const inicioSemana = addDays(hoje, -6)
    const fimSemana = hoje
    const fimProxima = addDays(hoje, 7)
    const inicioIso = iso(inicioSemana)
    const hojeIso = iso(hoje)
    const fimProximaIso = iso(fimProxima)

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [
          orcamentosEnviados,
          orcamentosAceites,
          obrasIniciadas,
          obrasConcluidas,
          despesasSemana,
          decisoesResolvidas,
          followupsProximos,
          obrasPrazoProximo,
          decisoesPrazoProximo,
          entradasFam,
          despesasFam,
        ] = await Promise.all([
          supabase
            .from('orcamentos')
            .select('id, descricao, valor, estado, data_envio, proximo_followup, cliente:clientes(nome)')
            .gte('data_envio', inicioIso)
            .lte('data_envio', hojeIso)
            .order('data_envio', { ascending: false }),
          supabase
            .from('orcamentos')
            .select('id, descricao, valor, estado, data_envio, proximo_followup, cliente:clientes(nome)')
            .eq('estado', 'aceite')
            .gte('created_at', inicioSemana.toISOString())
            .order('created_at', { ascending: false }),
          supabase
            .from('obras')
            .select('id, descricao, valor_contratado, estado, data_inicio, prazo')
            .gte('data_inicio', inicioIso)
            .lte('data_inicio', hojeIso)
            .order('data_inicio', { ascending: false }),
          supabase
            .from('obras')
            .select('id, descricao, valor_contratado, estado, data_inicio, prazo')
            .eq('estado', 'concluida')
            .gte('created_at', inicioSemana.toISOString())
            .order('created_at', { ascending: false }),
          supabase
            .from('despesas')
            .select('id, fornecedor, valor, data, descricao, obra:obras(id, descricao)')
            .gte('data', inicioIso)
            .lte('data', hojeIso)
            .order('data', { ascending: false }),
          supabase
            .from('decisoes')
            .select('id, titulo, estado, prazo, prioridade, created_at')
            .eq('estado', 'resolvida')
            .gte('created_at', inicioSemana.toISOString())
            .order('created_at', { ascending: false }),
          supabase
            .from('orcamentos')
            .select('id, descricao, valor, estado, data_envio, proximo_followup, cliente:clientes(nome)')
            .in('estado', ['enviado', 'em_analise'])
            .not('proximo_followup', 'is', null)
            .gte('proximo_followup', hojeIso)
            .lte('proximo_followup', fimProximaIso)
            .order('proximo_followup', { ascending: true }),
          supabase
            .from('obras')
            .select('id, descricao, valor_contratado, estado, data_inicio, prazo')
            .eq('estado', 'em_curso')
            .not('prazo', 'is', null)
            .gte('prazo', hojeIso)
            .lte('prazo', fimProximaIso)
            .order('prazo', { ascending: true }),
          supabase
            .from('decisoes')
            .select('id, titulo, estado, prazo, prioridade, created_at')
            .eq('estado', 'pendente')
            .not('prazo', 'is', null)
            .lte('prazo', fimProximaIso)
            .order('prazo', { ascending: true }),
          supabase
            .from('entradas_familia')
            .select('valor')
            .gte('data', inicioIso)
            .lte('data', hojeIso),
          supabase
            .from('despesas_familia')
            .select('valor')
            .gte('data', inicioIso)
            .lte('data', hojeIso),
        ])

        const firstError =
          orcamentosEnviados.error ||
          orcamentosAceites.error ||
          obrasIniciadas.error ||
          obrasConcluidas.error ||
          despesasSemana.error ||
          decisoesResolvidas.error ||
          followupsProximos.error ||
          obrasPrazoProximo.error ||
          decisoesPrazoProximo.error ||
          entradasFam.error ||
          despesasFam.error
        if (firstError) {
          setError(firstError.message)
          setLoading(false)
          return
        }

        setResumo({
          inicioSemana,
          fimSemana,
          fimProxima,
          orcamentosEnviados: (orcamentosEnviados.data ?? []) as Orcamento[],
          orcamentosAceites: (orcamentosAceites.data ?? []) as Orcamento[],
          obrasIniciadas: (obrasIniciadas.data ?? []) as Obra[],
          obrasConcluidas: (obrasConcluidas.data ?? []) as Obra[],
          despesasSemana: (despesasSemana.data ?? []) as Despesa[],
          decisoesResolvidas: (decisoesResolvidas.data ?? []) as Decisao[],
          followupsProximos: (followupsProximos.data ?? []) as Orcamento[],
          obrasComPrazoProximo: (obrasPrazoProximo.data ?? []) as Obra[],
          decisoesComPrazoProximo: (decisoesPrazoProximo.data ?? []) as Decisao[],
          entradasFamSemana: entradasFam.data?.reduce((a, r) => a + Number(r.valor), 0) ?? 0,
          despesasFamSemana: despesasFam.data?.reduce((a, r) => a + Number(r.valor), 0) ?? 0,
        })
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado.')
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <p className="text-muted text-sm">A carregar…</p>
  if (error) return <p className="text-negative text-sm">{error}</p>
  if (!resumo) return null

  const totalDespesas = resumo.despesasSemana.reduce(
    (a, d) => a + Number(d.valor),
    0,
  )
  const saldoFam = resumo.entradasFamSemana - resumo.despesasFamSemana

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          09 — Relatório
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-2">
        Sumário <span className="italic text-gold">semanal.</span>
      </h1>
      <p className="text-muted text-sm italic mb-12">
        {diaMes.format(resumo.inicioSemana)} — {diaMes.format(resumo.fimSemana)}
      </p>

      <Section titulo="A semana — Empresa">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Orçamentos enviados"
            value={String(resumo.orcamentosEnviados.length)}
            detalhe={eur.format(
              resumo.orcamentosEnviados.reduce((a, o) => a + Number(o.valor), 0),
            )}
          />
          <StatCard
            label="Orçamentos aceites"
            value={String(resumo.orcamentosAceites.length)}
            accent={resumo.orcamentosAceites.length > 0 ? 'text-positive' : 'text-cream-bright'}
          />
          <StatCard
            label="Obras iniciadas"
            value={String(resumo.obrasIniciadas.length)}
          />
          <StatCard
            label="Obras concluídas"
            value={String(resumo.obrasConcluidas.length)}
            accent={resumo.obrasConcluidas.length > 0 ? 'text-positive' : 'text-cream-bright'}
          />
        </div>
      </Section>

      <Section titulo="A semana — Lançamentos">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Despesas registadas"
            value={String(resumo.despesasSemana.length)}
            detalhe={eur.format(totalDespesas)}
            accent={totalDespesas > 0 ? 'text-negative' : 'text-cream-bright'}
          />
          <StatCard
            label="Decisões resolvidas"
            value={String(resumo.decisoesResolvidas.length)}
            accent={resumo.decisoesResolvidas.length > 0 ? 'text-positive' : 'text-cream-bright'}
          />
          <StatCard
            label="Saldo familiar"
            value={eur.format(saldoFam)}
            detalhe={`Entr ${eur.format(resumo.entradasFamSemana)} · Desp ${eur.format(resumo.despesasFamSemana)}`}
            accent={saldoFam >= 0 ? 'text-positive' : 'text-negative'}
          />
        </div>
        {resumo.despesasSemana.length > 0 && (
          <div className="space-y-2">
            {resumo.despesasSemana.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-4 bg-bg-card border border-line rounded-editorial p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-1">
                    {d.fornecedor}
                  </div>
                  <div className="text-cream-bright text-sm leading-snug line-clamp-1">
                    {d.descricao || (d.obra?.descricao ?? 'Sem descrição')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-negative tabular-nums text-sm">
                    {eur.format(Number(d.valor))}
                  </div>
                  <div className="text-muted text-xs">{dataPt.format(new Date(d.data))}</div>
                </div>
              </div>
            ))}
            {resumo.despesasSemana.length > 5 && (
              <Link
                to="/despesas"
                className="block text-center text-muted text-[11px] tracking-editorial-wide uppercase hover:text-gold transition-colors pt-2"
              >
                Ver as restantes {resumo.despesasSemana.length - 5} →
              </Link>
            )}
          </div>
        )}
      </Section>

      <Section titulo="Próximos 7 dias">
        {resumo.followupsProximos.length === 0 &&
        resumo.obrasComPrazoProximo.length === 0 &&
        resumo.decisoesComPrazoProximo.length === 0 ? (
          <p className="text-muted text-sm italic py-4 text-center">
            Sem prazos ou follow-ups marcados para os próximos 7 dias.
          </p>
        ) : (
          <div className="space-y-2">
            {resumo.followupsProximos.map((o) => (
              <ProximoItem
                key={`f-${o.id}`}
                href="/orcamentos"
                badge="Follow-up"
                badgeAccent="text-gold"
                titulo={
                  o.cliente?.nome ? `${o.cliente.nome} — ${o.descricao}` : o.descricao
                }
                detalhe={dataPt.format(new Date(o.proximo_followup!))}
              />
            ))}
            {resumo.obrasComPrazoProximo.map((o) => (
              <ProximoItem
                key={`o-${o.id}`}
                href={`/obras/${o.id}`}
                badge="Prazo obra"
                badgeAccent="text-gold-dim"
                titulo={o.descricao}
                detalhe={dataPt.format(new Date(o.prazo!))}
              />
            ))}
            {resumo.decisoesComPrazoProximo.map((d) => (
              <ProximoItem
                key={`d-${d.id}`}
                href="/decisoes"
                badge={d.prioridade === 'alta' ? 'Decisão · alta' : 'Decisão'}
                badgeAccent={d.prioridade === 'alta' ? 'text-negative' : 'text-gold'}
                titulo={d.titulo}
                detalhe={dataPt.format(new Date(d.prazo!))}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          {titulo}
        </span>
      </div>
      {children}
    </section>
  )
}

function StatCard({
  label,
  value,
  detalhe,
  accent = 'text-cream-bright',
}: {
  label: string
  value: string
  detalhe?: string
  accent?: string
}) {
  return (
    <div className="bg-bg-card border border-line rounded-editorial p-5">
      <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-3">
        {label}
      </div>
      <div className={`font-display text-2xl tabular-nums ${accent}`}>{value}</div>
      {detalhe && <div className="text-muted text-xs mt-1">{detalhe}</div>}
    </div>
  )
}

function ProximoItem({
  href,
  badge,
  badgeAccent,
  titulo,
  detalhe,
}: {
  href: string
  badge: string
  badgeAccent: string
  titulo: string
  detalhe: string
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between gap-4 bg-bg-card border border-line hover:border-gold rounded-editorial p-4 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className={`text-[11px] tracking-editorial-wide uppercase mb-1 ${badgeAccent}`}>
          {badge}
        </div>
        <div className="text-cream-bright text-sm leading-snug line-clamp-1">{titulo}</div>
      </div>
      <div className="text-muted text-xs shrink-0">{detalhe}</div>
    </Link>
  )
}
