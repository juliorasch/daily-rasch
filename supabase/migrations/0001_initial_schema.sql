-- Daily Rasch — schema inicial
-- Aplicar via Supabase SQL Editor (https://supabase.com/dashboard → SQL → New query).
-- Política RLS simples: utilizadores autenticados têm acesso total
-- (plataforma privada — Rasch + esposa).

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.orcamento_estado as enum ('enviado', 'em_analise', 'aceite', 'recusado');
create type public.obra_estado as enum ('por_arrancar', 'em_curso', 'concluida');
create type public.decisao_prioridade as enum ('alta', 'media', 'baixa');
create type public.decisao_estado as enum ('pendente', 'resolvida');
create type public.despesa_familia_tipo as enum ('fixa', 'variavel');

-- ============================================================================
-- CLIENTES
-- ============================================================================

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  morada text,
  nif text,
  notas text,
  created_at timestamptz not null default now()
);

create index clientes_nome_idx on public.clientes (nome);

-- ============================================================================
-- ORÇAMENTOS
-- ============================================================================

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete restrict,
  descricao text not null,
  valor numeric(12, 2) not null,
  data_envio date,
  estado public.orcamento_estado not null default 'enviado',
  proximo_followup date,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index orcamentos_cliente_id_idx on public.orcamentos (cliente_id);
create index orcamentos_estado_idx on public.orcamentos (estado);

-- ============================================================================
-- OBRAS
-- ============================================================================

create table public.obras (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete restrict,
  orcamento_id uuid references public.orcamentos(id) on delete set null,
  descricao text not null,
  data_inicio date,
  prazo date,
  valor_contratado numeric(12, 2),
  estado public.obra_estado not null default 'por_arrancar',
  created_at timestamptz not null default now()
);

create index obras_cliente_id_idx on public.obras (cliente_id);
create index obras_estado_idx on public.obras (estado);

-- ============================================================================
-- DESPESAS
-- ============================================================================

create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras(id) on delete set null,
  fornecedor text not null,
  nif_fornecedor text,
  valor numeric(12, 2) not null,
  data date not null,
  descricao text,
  itens jsonb,
  foto_url text,
  izibizi_id text,
  categoria text,
  confianca_ia numeric(4, 3),
  confirmado_pelo_user boolean not null default false,
  created_at timestamptz not null default now()
);

create index despesas_obra_id_idx on public.despesas (obra_id);
create index despesas_data_idx on public.despesas (data desc);

-- ============================================================================
-- DECISÕES
-- ============================================================================

create table public.decisoes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  prazo date,
  prioridade public.decisao_prioridade not null default 'media',
  estado public.decisao_estado not null default 'pendente',
  obra_id uuid references public.obras(id) on delete set null,
  created_at timestamptz not null default now()
);

create index decisoes_estado_idx on public.decisoes (estado);
create index decisoes_prazo_idx on public.decisoes (prazo);

-- ============================================================================
-- ENTRADAS FAMÍLIA
-- ============================================================================

create table public.entradas_familia (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12, 2) not null,
  categoria text,
  data date not null,
  recorrente boolean not null default false,
  created_at timestamptz not null default now()
);

create index entradas_familia_data_idx on public.entradas_familia (data desc);

-- ============================================================================
-- DESPESAS FAMÍLIA
-- ============================================================================

create table public.despesas_familia (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12, 2) not null,
  categoria text,
  tipo public.despesa_familia_tipo not null default 'variavel',
  data date not null,
  recorrente boolean not null default false,
  created_at timestamptz not null default now()
);

create index despesas_familia_data_idx on public.despesas_familia (data desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.clientes          enable row level security;
alter table public.orcamentos        enable row level security;
alter table public.obras             enable row level security;
alter table public.despesas          enable row level security;
alter table public.decisoes          enable row level security;
alter table public.entradas_familia  enable row level security;
alter table public.despesas_familia  enable row level security;

create policy "auth full access" on public.clientes
  for all to authenticated using (true) with check (true);

create policy "auth full access" on public.orcamentos
  for all to authenticated using (true) with check (true);

create policy "auth full access" on public.obras
  for all to authenticated using (true) with check (true);

create policy "auth full access" on public.despesas
  for all to authenticated using (true) with check (true);

create policy "auth full access" on public.decisoes
  for all to authenticated using (true) with check (true);

create policy "auth full access" on public.entradas_familia
  for all to authenticated using (true) with check (true);

create policy "auth full access" on public.despesas_familia
  for all to authenticated using (true) with check (true);
