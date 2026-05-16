import { supabase } from './supabase'

const BUCKET = 'faturas'
const SIGNED_URL_TTL = 60 * 60

export function isStoragePath(value: string | null): boolean {
  if (!value) return false
  return !/^https?:\/\//i.test(value)
}

export async function uploadFatura(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })
  if (error) throw error
  return path
}

export async function getFaturaSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL)
  if (error) throw error
  return data.signedUrl
}

export async function deleteFatura(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function resolveFotoUrl(fotoUrl: string | null): Promise<string | null> {
  if (!fotoUrl) return null
  if (!isStoragePath(fotoUrl)) return fotoUrl
  try {
    return await getFaturaSignedUrl(fotoUrl)
  } catch {
    return null
  }
}
