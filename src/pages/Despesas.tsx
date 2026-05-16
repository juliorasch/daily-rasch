import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DespesaForm from '@/components/DespesaForm'
import type { Database } from '@/types/database'

type ObraLite = Pick<Database['public']['Tables']['obras']['Row'], 'id' | 'descricao'>
type DespesaRow = Database['public']['Tables']['despesas']['Row']
type Despesa = DespesaRow & { obra: ObraLite | null }
type Editing = Despesa | 'new' | null
type Filtro = 'todas' | 'por_confirmar'

const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
const dataPt = new Intl.DateTimeFormat('pt-PT')

function formatDate(d: string): string {
  return dataPt.format(new Date(d))
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [obras, setObras] = useState<ObraLite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)
  const [obraFiltro, setObraFiltro] = useState<string>('')
  const [filtro, setFiltro] = useState<Filtro>('todas')

  async function load() {
    setLoading(true)
    setError(null)
    const [eDesp, eObras] = await Promise.all([
      supabase
        .from('despesas')
        .select('*, obra:obras(id, descricao)')
        .order('data', { ascending: false }),
      supabase.from('obras').select('id, descricao').order('created_at', { ascending: false }),
    ])
    if (eDesp.error) setError(eDesp.error.message)
    else if (eObras.error) setError(eObras.error.message)
    else {
      setDespesas((eDesp.data as Despesa[] | null) ?? [])
      setObras(eObras.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const visiveis = useMemo(() => {
    return despesas.filter((d) => {
      if (obraFiltro && d.obra_id !== obraFiltro) return false
      if (filtro === 'por_confirmar' && d.confirmado_pelo_user) return false
      return true
    })
  }, [despesas, obraFiltro, filtro])

  const total = useMemo(
    () => visiveis.reduce((acc, d) => acc + Number(d.valor), 0),
    [visiveis],
  )

  const porConfirmarCount = useMemo(
    () => despesas.filter((d) => !d.confirmado_pelo_user).length,
    [despesas],
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-12 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="block h-px w-7 bg-gold" />
            <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
              06 — Lançamentos
            </span>
          </div>
          <h1 className="font-display text-4xl text-cream-bright leading-tight">
            Despesas <span className="italic text-gold">por obra.</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="shrink-0 border border-gold text-gold px-5 py-3 text-[11px] tracking-editorial-wide uppercase rounded-editorial hover:bg-gold hover:text-bg transition-colors"
        >
          Nova despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-bg-card border border-line rounded-editorial p-5">
          <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-3">
            Total filtrado
          </div>
          <div className="font-display text-2xl tabular-nums text-negative">
            {eur.format(total)}
          </div>
        </div>
        <div className="bg-bg-card border border-line rounded-editorial p-5">
          <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-3">
            Por confirmar
          </div>
          <div className="font-display text-2xl tabular-nums text-gold">
            {porConfirmarCount}
          </div>
        </div>
        <div className="bg-bg-card border border-line rounded-editorial p-5">
          <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-3">
            Lançamentos visíveis
          </div>
          <div className="font-display text-2xl tabular-nums text-cream-bright">
            {visiveis.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
            Filtrar por obra
          </span>
          <select
            value={obraFiltro}
            onChange={(e) => setObraFiltro(e.target.value)}
            className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
          >
            <option value="">Todas as obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.descricao.length > 60 ? `${o.descricao.slice(0, 60)}…` : o.descricao}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
            Estado
          </span>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as Filtro)}
            className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
          >
            <option value="todas">Todas</option>
            <option value="por_confirmar">Apenas por confirmar</option>
          </select>
        </label>
      </div>

      {loading && <p className="text-muted text-sm">A carregar…</p>}
      {error && <p className="text-negative text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {visiveis.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setEditing(d)}
              className="w-full text-left bg-bg-card border border-line hover:border-gold rounded-editorial p-5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim">
                      {d.fornecedor}
                    </span>
                    {d.categoria && (
                      <span className="text-muted text-[11px] tracking-editorial-wide uppercase">
                        · {d.categoria}
                      </span>
                    )}
                    {!d.confirmado_pelo_user && (
                      <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
                        · Por confirmar
                      </span>
                    )}
                  </div>
                  <div className="font-display text-cream-bright text-base leading-snug mb-1">
                    {d.descricao || <span className="italic text-muted">Sem descrição</span>}
                  </div>
                  {d.obra && (
                    <p className="text-gold-dim text-xs italic line-clamp-1">
                      Obra: {d.obra.descricao}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-negative tabular-nums font-display">
                    {eur.format(Number(d.valor))}
                  </div>
                  <div className="text-muted text-xs mt-1">{formatDate(d.data)}</div>
                </div>
              </div>
            </button>
          ))}

          {visiveis.length === 0 && (
            <p className="text-muted text-sm italic py-8 text-center">
              Sem despesas para os filtros actuais.
            </p>
          )}
        </div>
      )}

      {editing !== null && (
        <DespesaForm
          despesa={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await load()
          }}
        />
      )}
    </div>
  )
}

