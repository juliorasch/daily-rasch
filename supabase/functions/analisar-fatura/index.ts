// Daily Rasch — edge function de OCR de faturas
//
// Recebe { fotoPath } (caminho no bucket 'faturas') e devolve dados
// estruturados extraídos pela Claude Vision, mais sugestão de obra.
//
// Deploy:
//   supabase functions deploy analisar-fatura
//
// Secrets necessários no projecto Supabase:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injectados pelo runtime.

// deno-lint-ignore-file no-explicit-any
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const faturaSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    fornecedor: { type: 'string' },
    nif_fornecedor: { type: ['string', 'null'] },
    data: { type: 'string', format: 'date' },
    valor: { type: 'number' },
    categoria: { type: ['string', 'null'] },
    obra_sugerida_id: { type: ['string', 'null'] },
    confianca: { type: 'number' },
    itens: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          descricao: { type: 'string' },
          valor: { type: 'number' },
        },
        required: ['descricao', 'valor'],
      },
    },
  },
  required: [
    'fornecedor',
    'nif_fornecedor',
    'data',
    'valor',
    'categoria',
    'obra_sugerida_id',
    'confianca',
    'itens',
  ],
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Método não permitido.' })
  }

  if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, {
      error:
        'Configuração em falta. Definir ANTHROPIC_API_KEY no projecto Supabase.',
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json(401, { error: 'Sem autorização.' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return json(401, { error: 'Não autenticado.' })
  }

  let payload: { fotoPath?: string }
  try {
    payload = await req.json()
  } catch {
    return json(400, { error: 'JSON inválido no corpo.' })
  }

  const fotoPath = payload.fotoPath?.trim()
  if (!fotoPath) {
    return json(400, { error: 'fotoPath em falta.' })
  }

  const { data: blob, error: dlError } = await supabase.storage
    .from('faturas')
    .download(fotoPath)
  if (dlError || !blob) {
    return json(404, {
      error: `Não foi possível descarregar a foto: ${dlError?.message ?? 'desconhecido'}`,
    })
  }

  const buf = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i])
  const base64 = btoa(binary)
  const mediaType = (blob.type || 'image/jpeg') as
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/webp'

  const { data: obras } = await supabase
    .from('obras')
    .select('id, descricao')
    .eq('estado', 'em_curso')

  const obrasContext = obras && obras.length > 0
    ? obras.map((o) => `- ${o.id}: ${o.descricao}`).join('\n')
    : '(Sem obras em curso registadas.)'

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  let result: Record<string, unknown>
  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      output_config: {
        format: { type: 'json_schema', schema: faturaSchema },
      } as any,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text:
                'Analisa esta fatura/recibo portuguesa e extrai os dados estruturados.\n\n' +
                'Devolve:\n' +
                '- fornecedor: nome comercial (ex: "Leroy Merlin", "Continente").\n' +
                '- nif_fornecedor: NIF (9 dígitos) se visível, senão null.\n' +
                '- data: data da fatura no formato YYYY-MM-DD.\n' +
                '- valor: total a pagar em euros, como número decimal (não string).\n' +
                '- categoria: uma de "Material", "Ferramenta", "Serviço", "Transporte" ou outra curta.\n' +
                '- itens: lista de linhas da fatura com descrição e valor (cada item em euros).\n' +
                '- obra_sugerida_id: dos UUIDs abaixo, escolhe a obra mais provável com base nos itens. ' +
                'Se nenhuma fizer sentido, devolve null.\n' +
                '- confianca: número entre 0 e 1 que reflecte a tua certeza global da extração.\n\n' +
                'Obras em curso disponíveis:\n' +
                obrasContext,
            },
          ],
        },
      ],
    } as any)

    const parsed = (message as any).parsed_output
    if (parsed && typeof parsed === 'object') {
      result = parsed
    } else {
      const textBlock = message.content.find((b: any) => b.type === 'text') as any
      result = JSON.parse(textBlock?.text ?? '{}')
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return json(502, { error: `Falha na análise IA: ${msg}` })
  }

  return json(200, result)
})
