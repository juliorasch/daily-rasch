import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Props = { session: Session }

export default function Painel({ session }: Props) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <header className="max-w-6xl mx-auto flex items-start justify-between mb-16">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="block h-px w-7 bg-gold" />
            <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
              02 — Painel
            </span>
          </div>
          <h1 className="font-display text-4xl text-cream-bright leading-tight">
            Visão <span className="italic text-gold">geral.</span>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-muted text-[11px] tracking-editorial-wide uppercase hover:text-gold transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <p className="text-muted text-sm">
          Sessão iniciada como <span className="text-cream">{session.user.email}</span>.
        </p>
        <p className="text-muted text-sm mt-2">
          As secções do painel (empresa + família) chegam na Fase 2.
        </p>
      </main>
    </div>
  )
}
