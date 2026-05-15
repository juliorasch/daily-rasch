import { type FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Estado = Database['public']['Enums']['orcamento_estado']
type Cliente = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>
type OrcamentoRow = Database['public']['Tables']['orcamentos']['Row']
type Orcamento = OrcamentoRow & { cliente: Cliente | null }
type Editing = Orcamento | 'new' | null

const ESTADOS: { value: Estado; label: string; accent: string }[] = [
  { value: 'enviado', label: 'Enviado', accent: 'text-gold-dim' },
  { value: 'em_analise', label: 'Em análise', accent: 'text-gold' },
  { value: 'aceite', label: 'Aceite', accent: 'text-positive' },
  { value: 'recusado', label: 'Recusado', accent: 'text-negative' },
]

const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
const dataPt = new Intl.DateTimeFormat('pt-PT')

function formatDate(d: string | null): string {
  if (!d) return '—'
  return dataPt.format(new Date(d))
}

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*, cliente:clientes(id, nome)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setOrcamentos((data as Orcamento[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <div className="flex items-start justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="block h-px w-7 bg-gold" />
            <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
              04 — Pipeline
            </span>
          </div>
          <h1 className="font-display text-4xl text-cream-bright leading-tight">
            Orçamentos <span className="italic text-gold">activos.</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="shrink-0 border border-gold text-gold px-5 py-3 text-[11px] tracking-editorial-wide uppercase rounded-editorial hover:bg-gold hover:text-bg transition-colors"
        >
          Novo orçamento
        </button>
      </div>

      {loading && <p className="text-muted text-sm">A carregar…</p>}
      {error && <p className="text-negative text-sm">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ESTADOS.map((col) => {
            const list = orcamentos.filter((o) => o.estado === col.value)
            return (
              <section key={col.value} className="bg-bg-2 border border-line rounded-editorial p-4 min-h-[180px]">
                <header className="flex items-center justify-between mb-4 pb-3 border-b border-line">
                  <span className={`text-[11px] tracking-editorial-wide uppercase ${col.accent}`}>
                    {col.label}
                  </span>
                  <span className="text-muted text-[11px] tabular-nums">{list.length}</span>
                </header>

                <div className="space-y-3">
                  {list.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setEditing(o)}
                      className="w-full text-left bg-bg-card border border-line hover:border-gold rounded-editorial p-4 transition-colors"
                    >
                      <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-2">
                        {o.cliente?.nome ?? 'Sem cliente'}
                      </div>
                      <div className="font-display text-cream-bright text-base leading-snug mb-3 line-clamp-2">
                        {o.descricao}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gold tabular-nums">{eur.format(Number(o.valor))}</span>
                        <span className="text-muted">{formatDate(o.data_envio)}</span>
                      </div>
                    </button>
                  ))}

                  {list.length === 0 && (
                    <p className="text-muted text-xs italic py-4 text-center">
                      Vazio
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {editing !== null && (
        <OrcamentoForm
          orcamento={editing === 'new' ? null : editing}
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
  orcamento: Orcamento | null
  onClose: () => void
  onSaved: () => void
}

function OrcamentoForm({ orcamento, onClose, onSaved }: FormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState(orcamento?.cliente_id ?? '')
  const [descricao, setDescricao] = useState(orcamento?.descricao ?? '')
  const [valor, setValor] = useState(orcamento ? String(orcamento.valor) : '')
  const [dataEnvio, setDataEnvio] = useState(orcamento?.data_envio ?? '')
  const [estado, setEstado] = useState<Estado>(orcamento?.estado ?? 'enviado')
  const [proximoFollowup, setProximoFollowup] = useState(orcamento?.proximo_followup ?? '')
  const [pdfUrl, setPdfUrl] = useState(orcamento?.pdf_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')
      .then(({ data, error }) => {
        if (error) {
          setError(`Não foi possível carregar clientes: ${error.message}`)
          return
        }
        setClientes(data ?? [])
      })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const valorNum = Number(valor.replace(',', '.'))
    if (Number.isNaN(valorNum) || valorNum < 0) {
      setError('Valor inválido.')
      setSaving(false)
      return
    }

    const payload = {
      cliente_id: clienteId || null,
      descricao: descricao.trim(),
      valor: valorNum,
      data_envio: dataEnvio || null,
      estado,
      proximo_followup: proximoFollowup || null,
      pdf_url: pdfUrl.trim() || null,
    }

    const result = orcamento
      ? await supabase.from('orcamentos').update(payload).eq('id', orcamento.id)
      : await supabase.from('orcamentos').insert(payload)

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }
    onSaved()
  }

  async function handleDelete() {
    if (!orcamento) return
    if (!confirm('Apagar este orçamento? Esta acção não pode ser desfeita.')) return
    setSaving(true)
    const { error } = await supabase.from('orcamentos').delete().eq('id', orcamento.id)
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
            {orcamento ? 'Editar orçamento' : 'Novo orçamento'}
          </span>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Cliente
            </span>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
            >
              <option value="">— Sem cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Descrição
            </span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={3}
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
                Valor (€)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                placeholder="0,00"
                className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors tabular-nums"
              />
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

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
                Data de envio
              </span>
              <input
                type="date"
                value={dataEnvio}
                onChange={(e) => setDataEnvio(e.target.value)}
                className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
              />
            </label>

            <label className="block">
              <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
                Próximo follow-up
              </span>
              <input
                type="date"
                value={proximoFollowup}
                onChange={(e) => setProximoFollowup(e.target.value)}
                className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              PDF (URL)
            </span>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://…"
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
            />
          </label>
        </div>

        {error && <p className="text-negative text-xs mt-4">{error}</p>}

        <div className="flex justify-between items-center gap-2 mt-8">
          {orcamento ? (
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
