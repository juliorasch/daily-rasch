import { type FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Cliente = Database['public']['Tables']['clientes']['Row']
type Editing = Cliente | 'new' | null

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true })
    if (error) setError(error.message)
    else setClientes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(c: Cliente) {
    if (!confirm(`Apagar o cliente "${c.nome}"? Esta acção não pode ser desfeita.`)) return
    const { error } = await supabase.from('clientes').delete().eq('id', c.id)
    if (error) {
      alert(`Erro ao apagar: ${error.message}`)
      return
    }
    await load()
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="block h-px w-7 bg-gold" />
            <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
              03 — Carteira
            </span>
          </div>
          <h1 className="font-display text-4xl text-cream-bright leading-tight">
            Clientes <span className="italic text-gold">activos.</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="shrink-0 border border-gold text-gold px-5 py-3 text-[11px] tracking-editorial-wide uppercase rounded-editorial hover:bg-gold hover:text-bg transition-colors"
        >
          Novo cliente
        </button>
      </div>

      {loading && <p className="text-muted text-sm">A carregar…</p>}
      {error && <p className="text-negative text-sm">{error}</p>}

      {!loading && !error && clientes.length === 0 && (
        <p className="text-muted text-sm italic">
          Ainda não há clientes. Adiciona o primeiro.
        </p>
      )}

      {clientes.length > 0 && (
        <div className="border border-line rounded-editorial overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-2 text-gold uppercase text-[10px] tracking-editorial-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">Contacto</th>
                <th className="text-left px-4 py-3 font-medium">NIF</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-line hover:bg-bg-card transition-colors"
                >
                  <td className="px-4 py-4 text-cream-bright">{c.nome}</td>
                  <td className="px-4 py-4 text-muted">
                    {c.telefone || c.email || '—'}
                  </td>
                  <td className="px-4 py-4 text-muted">{c.nif || '—'}</td>
                  <td className="px-4 py-4 text-right space-x-5">
                    <button
                      type="button"
                      onClick={() => setEditing(c)}
                      className="text-muted text-[11px] tracking-editorial-wide uppercase hover:text-gold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="text-muted text-[11px] tracking-editorial-wide uppercase hover:text-negative transition-colors"
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <ClienteForm
          cliente={editing === 'new' ? null : editing}
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
  cliente: Cliente | null
  onClose: () => void
  onSaved: () => void
}

function ClienteForm({ cliente, onClose, onSaved }: FormProps) {
  const [nome, setNome] = useState(cliente?.nome ?? '')
  const [telefone, setTelefone] = useState(cliente?.telefone ?? '')
  const [email, setEmail] = useState(cliente?.email ?? '')
  const [morada, setMorada] = useState(cliente?.morada ?? '')
  const [nif, setNif] = useState(cliente?.nif ?? '')
  const [notas, setNotas] = useState(cliente?.notas ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      morada: morada.trim() || null,
      nif: nif.trim() || null,
      notas: notas.trim() || null,
    }
    const result = cliente
      ? await supabase.from('clientes').update(payload).eq('id', cliente.id)
      : await supabase.from('clientes').insert(payload)
    if (result.error) {
      setError(result.error.message)
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
            {cliente ? 'Editar cliente' : 'Novo cliente'}
          </span>
        </div>

        <div className="space-y-5">
          <TextField label="Nome" value={nome} onChange={setNome} required />
          <TextField label="Telefone" value={telefone} onChange={setTelefone} />
          <TextField label="Email" type="email" value={email} onChange={setEmail} />
          <TextField label="Morada" value={morada} onChange={setMorada} />
          <TextField label="NIF" value={nif} onChange={setNif} />
          <label className="block">
            <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
              Notas
            </span>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors resize-none"
            />
          </label>
        </div>

        {error && <p className="text-negative text-xs mt-4">{error}</p>}

        <div className="flex justify-end gap-2 mt-8">
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
      </form>
    </div>
  )
}

type TextFieldProps = {
  label: string
  type?: 'text' | 'email'
  value: string
  onChange: (v: string) => void
  required?: boolean
}

function TextField({ label, type = 'text', value, onChange, required }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-bg border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
      />
    </label>
  )
}
