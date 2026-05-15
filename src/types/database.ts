// Tipos escritos à mão a partir de supabase/migrations/0001_initial_schema.sql.
// Quando o CLI Supabase estiver instalado, substituir por
// `npx supabase gen types typescript --project-id <id> > src/types/database.ts`.

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string | null
          email: string | null
          morada: string | null
          nif: string | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          telefone?: string | null
          email?: string | null
          morada?: string | null
          nif?: string | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string | null
          email?: string | null
          morada?: string | null
          nif?: string | null
          notas?: string | null
          created_at?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          id: string
          cliente_id: string | null
          descricao: string
          valor: number
          data_envio: string | null
          estado: Database['public']['Enums']['orcamento_estado']
          proximo_followup: string | null
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          descricao: string
          valor: number
          data_envio?: string | null
          estado?: Database['public']['Enums']['orcamento_estado']
          proximo_followup?: string | null
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          descricao?: string
          valor?: number
          data_envio?: string | null
          estado?: Database['public']['Enums']['orcamento_estado']
          proximo_followup?: string | null
          pdf_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      obras: {
        Row: {
          id: string
          cliente_id: string | null
          orcamento_id: string | null
          descricao: string
          data_inicio: string | null
          prazo: string | null
          valor_contratado: number | null
          estado: Database['public']['Enums']['obra_estado']
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          orcamento_id?: string | null
          descricao: string
          data_inicio?: string | null
          prazo?: string | null
          valor_contratado?: number | null
          estado?: Database['public']['Enums']['obra_estado']
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          orcamento_id?: string | null
          descricao?: string
          data_inicio?: string | null
          prazo?: string | null
          valor_contratado?: number | null
          estado?: Database['public']['Enums']['obra_estado']
          created_at?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          id: string
          obra_id: string | null
          fornecedor: string
          nif_fornecedor: string | null
          valor: number
          data: string
          descricao: string | null
          itens: unknown | null
          foto_url: string | null
          izibizi_id: string | null
          categoria: string | null
          confianca_ia: number | null
          confirmado_pelo_user: boolean
          created_at: string
        }
        Insert: {
          id?: string
          obra_id?: string | null
          fornecedor: string
          nif_fornecedor?: string | null
          valor: number
          data: string
          descricao?: string | null
          itens?: unknown | null
          foto_url?: string | null
          izibizi_id?: string | null
          categoria?: string | null
          confianca_ia?: number | null
          confirmado_pelo_user?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          obra_id?: string | null
          fornecedor?: string
          nif_fornecedor?: string | null
          valor?: number
          data?: string
          descricao?: string | null
          itens?: unknown | null
          foto_url?: string | null
          izibizi_id?: string | null
          categoria?: string | null
          confianca_ia?: number | null
          confirmado_pelo_user?: boolean
          created_at?: string
        }
        Relationships: []
      }
      decisoes: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          prazo: string | null
          prioridade: Database['public']['Enums']['decisao_prioridade']
          estado: Database['public']['Enums']['decisao_estado']
          obra_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          prazo?: string | null
          prioridade?: Database['public']['Enums']['decisao_prioridade']
          estado?: Database['public']['Enums']['decisao_estado']
          obra_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          prazo?: string | null
          prioridade?: Database['public']['Enums']['decisao_prioridade']
          estado?: Database['public']['Enums']['decisao_estado']
          obra_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      entradas_familia: {
        Row: {
          id: string
          descricao: string
          valor: number
          categoria: string | null
          data: string
          recorrente: boolean
          created_at: string
        }
        Insert: {
          id?: string
          descricao: string
          valor: number
          categoria?: string | null
          data: string
          recorrente?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          descricao?: string
          valor?: number
          categoria?: string | null
          data?: string
          recorrente?: boolean
          created_at?: string
        }
        Relationships: []
      }
      despesas_familia: {
        Row: {
          id: string
          descricao: string
          valor: number
          categoria: string | null
          tipo: Database['public']['Enums']['despesa_familia_tipo']
          data: string
          recorrente: boolean
          created_at: string
        }
        Insert: {
          id?: string
          descricao: string
          valor: number
          categoria?: string | null
          tipo?: Database['public']['Enums']['despesa_familia_tipo']
          data: string
          recorrente?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          descricao?: string
          valor?: number
          categoria?: string | null
          tipo?: Database['public']['Enums']['despesa_familia_tipo']
          data?: string
          recorrente?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      orcamento_estado: 'enviado' | 'em_analise' | 'aceite' | 'recusado'
      obra_estado: 'por_arrancar' | 'em_curso' | 'concluida'
      decisao_prioridade: 'alta' | 'media' | 'baixa'
      decisao_estado: 'pendente' | 'resolvida'
      despesa_familia_tipo: 'fixa' | 'variavel'
    }
    CompositeTypes: Record<string, never>
  }
}
