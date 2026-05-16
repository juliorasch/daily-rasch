import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Prioridade = Database['public']['Enums']['decisao_prioridade']
type Estado = Database['public']['Enums']['decisao_estado']
type ObraLite = Pick<Database['public']['Tables']['obras']['Row'], 'id' | 'descricao'>
type DecisaoRow = Database['public']['Tables']['decisoes']['Row']
type Decisao = DecisaoRow & { obra: ObraLite | null }
type Editing = Decisao | 'new' | null

const PRIORIDADES: { value: Prioridade; label: string; accent: string; ordem: number }[] = [
  { value: 'alta', label: 'Alta', accent: 'text-negative', ordem: 0 },
  { value: 'media', label: 'Média', accent: 'text-gold', ordem: 1 },
  { value: 'baixa', label: 'Baixa', accent: 'text-gold-dim', ordem: 2 },
]

const ESTADOS: { value: Estado; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'resolvida', label: 'Resolvida' },
]

const dataPt = new Intl.DateTimeFormat('pt-PT')

function formatDate(d: string | null): string {
  if (!d) return '—'
  return dataPt.format(new Date(d))
}

function prioridadeMeta(p: Prioridade) {
  return PRIORIDADES.find((x) => x.value === p)!
}

export default function Decisoes() {
  const [decisoes, setDecisoes] = useState<Decisao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)
  const [filtro, setFiltro] = useState<Estado>('pendente')

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('decisoes')
      .select('*, obra:obras(id, descricao)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setDecisoes((data as Decisao[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const visiveis = useMemo(() => {
    return decisoes
      .filter((d) => d.estado === filtro)
      .sort((a, b) => {
        const oa = prioridadeMeta(a.prioridade).ordem
        const ob = prioridadeMeta(b.prioridade).ordem
        if (oa !== ob) return oa - ob
        if (a.prazo && b.prazo) return a.prazo.localeCompare(b.prazo)
        if (a.prazo) return -1
        if (b.prazo) return 1
        return b.created_at.localeCompare(a.created_at)
      })
  }, [decisoes, filtro])

  const counts = useMemo(
    () => ({
      pendente: decisoes.filter((d) => d.estado === 'pendente').length,
      resolvida: decisoes.filter((d) => d.estado === 'resolvida').length,
    }),
    [decisoes],
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="block h-px w-7 bg-gold" />
            <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
              07 — Discernimento
            </span>
          </div>
          <h1 className="font-display text-4xl text-cream-bright leading-tight">
            Decisões <span className="italic text-gold">pendentes.</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="shrink-0 border border-gold text-gold px-5 py-3 text-[11px] tracking-editorial-wide uppercase rounded-editorial hover:bg-gold hover:text-bg transition-colors"
        >
          Nova decisão
        </button>
      </div>

      <div className="flex items-center gap-6 mb-8 pb-3 border-b border-line">
        {ESTADOS.map((s) => {
          const isActive = filtro === s.value
          const count = s.value === 'pendente' ? counts.pendente : counts.resolvida
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setFiltro(s.value)}
              className={`text-[11px] tracking-editorial-wide uppercase pb-2 transition-colors border-b-2 ${
                isActive ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'
              }`}
            >
              {s.label} <span className="text-muted tabular-nums ml-1">({count})</span>
            </button>
          )
        })}
      </div>

      {loading && <p className="text-muted text-sm">A carregar…</p>}
      {error && <p className="text-negative text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {visiveis.map((d) => {
            const prio = prioridadeMeta(d.prioridade)
            const resolvida = d.estado === 'resolvida'
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setEditing(d)}
                className="w-full text-left bg-bg-card border border-line hover:border-gold rounded-editorial p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] tracking-editorial-wide uppercase ${prio.accent}`}>
                      {prio.label}
                    </span>
                    {d.obra && (
                      <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim">
                        · Obra
                      </span>
                    )}
                  </div>
                  <span className="text-muted text-xs shrink-0">
                    Prazo: {formatDate(d.prazo)}
                  </span>
                </div>
                <div
                  className={`font-display text-base leading-snug mb-1 ${
                    resolvida ? 'text-muted line-through' : 'text-cream-bright'
                  }`}
                >
                  {d.titulo}
                </div>
                {d.descricao && (
                  <p className="text-muted text-sm leading-relaxed line-clamp-2">
                    {d.descricao}
                  </p>
                )}
                {d.obra && (
                  <p className="text-gold-dim text-xs italic mt-2 line-clamp-1">
                    Ligada a: {d.obra.descricao}
                  </p>
                )}
              </button>
            )
          })}

          {visiveis.length === 0 && (
            <p className="text-muted text-sm italic py-8 text-center">
              {filtro === 'pendente'
                ? 'Sem decisões pendentes. Tudo discernido.'
                : 'Ainda não há decisões resolvidas.'}
            </p>
          )}
        </div>
      )}

      {editing !== null && (
        <DecisaoForm
          decisao={editing === 'new' ? null : editing}
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

type FormProps = {
  decisao: Decisao | null
  onClose: () => void
  onSaved: () => void
}

function DecisaoForm({ decisao, onClose, onSaved }: FormProps) {
  const [obras, setObras] = useState<ObraLite[]>([])
  const [titulo, setTitulo] = useState(decisao?.titulo ?? '')
  const [descricao, setDescricao] = useState(decisao?.descricao ?? '')
  const [prazo, setPrazo] = useState(decisao?.prazo ?? '')
  const [prioridade, setPrioridade] = useState<Prioridade>(decisao?.prioridade ?? 'media')
  const [estado, setEstado] = useState<Estado>(decisao?.estado ?? 'pendente')
  const [obraId, setObraId] = useState(decisao?.obra_id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('obras')
      .select('id, descricao')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(`Não foi possível carregar obras: ${error.message}`)
          return
        }
        setObras(data ?? [])
      })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      prazo: prazo || null,
      prioridade,
      estado,
      obra_id: obraId || null,
    }

    const result = decisao
      ? await supabase.from('decisoes').update(payload).eq('id', decisao.id)
      : await supabase.from('decisoes').insert(payload)

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }
    onSaved()
  }

  async function handleDelete() {
    if (!decisao) return
    if (!confirm('Apagar esta decisão? Esta acção não pode ser desfeita.')) return
    setSaving(true)
    const { error } = await supabase.from('decisoes').delete().eq('id', decisao.id)
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-bg-deep/80 backdrop-blur-sm flex items-center justify-center px-6 py-12 z-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-bg-card border border-line rounded-editorial p-8 max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <span className="block h-px w-7 bg-gold" />
          <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
            {decisao ? 'Editar decisão' : 'Nova decisão'}
          </span>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Título
            </span>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Descrição
            </span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
                Prioridade
              </span>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
                Estado
              </span>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as Estado)}
                className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
              >
                {ESTADOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Prazo
            </span>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Obra associada
            </span>
            <select
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
            >
              <option value="">— Sem obra associada —</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.descricao.length > 60 ? `${o.descricao.slice(0, 60)}…` : o.descricao}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="text-negative text-xs mt-4">{error}</p>}

        <div className="flex justify-between items-center gap-2 mt-8">
          {decisao ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-muted text-[11px] tracking-editorial-wide uppercase hover:text-negative transition-colors disabled:opacity-50"
            >
              Apagar
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-muted px-4 py-3 text-[11px] tracking-editorial-wide uppercase hover:text-cream transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border border-gold text-gold px-6 py-3 text-[11px] tracking-editorial-wide uppercase rounded-editorial hover:bg-gold hover:text-bg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gold"
            >
              {saving ? 'A guardar…' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
