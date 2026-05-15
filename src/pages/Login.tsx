import { type FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) {
      setError('Credenciais inválidas. Tenta de novo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <span className="block h-px w-7 bg-gold" />
          <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
            01 — Entrada
          </span>
        </div>

        <h1 className="font-display text-5xl text-cream-bright leading-[1.05]">
          Daily <span className="italic text-gold">Rasch.</span>
        </h1>
        <p className="mt-4 text-muted text-sm">
          A tua plataforma. Entra com a tua conta.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="Palavra-passe"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="text-negative text-xs tracking-wide" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 border border-gold text-gold py-3 text-xs tracking-editorial-wide uppercase rounded-editorial hover:bg-gold hover:text-bg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gold"
          >
            {submitting ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className="font-display italic text-muted text-sm mt-16 text-center">
          Trabalho bem feito constrói reputação sólida.
        </p>
      </div>
    </div>
  )
}

type FieldProps = {
  label: string
  type: 'email' | 'password'
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  required?: boolean
}

function Field({ label, type, value, onChange, autoComplete, required }: FieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-editorial-wide uppercase text-gold-dim block mb-2">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full bg-bg-card border border-line focus:border-gold rounded-editorial px-4 py-3 text-cream-bright text-sm outline-none transition-colors"
      />
    </label>
  )
}
