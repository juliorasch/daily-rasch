import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltam variáveis de ambiente Supabase: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. Copia .env.example para .env.local.',
  )
}

export const supabase = createClient<Database>(url, anonKey)

/**
 * Quando `supabase.functions.invoke` recebe um status >= 400, a mensagem
 * de erro é genérica ("Edge Function returned a non-2xx status code") e
 * o body com o detalhe verdadeiro fica em `error.context` (um Response).
 * Este helper extrai esse detalhe para mostrar ao utilizador.
 */
export async function extractFunctionError(err: unknown): Promise<string> {
  const fallback = err instanceof Error ? err.message : String(err)
  if (!err || typeof err !== 'object' || !('context' in err)) return fallback
  const context = (err as { context?: unknown }).context
  if (!(context instanceof Response)) return fallback
  try {
    const body = await context.clone().json()
    const detalhe = typeof body?.detail === 'string' ? ` — ${body.detail}` : ''
    if (typeof body?.error === 'string') return body.error + detalhe
    if (typeof body?.message === 'string') return body.message + detalhe
  } catch {
    try {
      const text = await context.clone().text()
      if (text) return text.slice(0, 500)
    } catch {
      // ignore
    }
  }
  return fallback
}
