-- Daily Rasch — bucket privado para fotos de faturas
-- Aplicar via Supabase SQL Editor depois do 0001.

-- ============================================================================
-- BUCKET
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('faturas', 'faturas', false)
on conflict (id) do nothing;

-- ============================================================================
-- POLÍTICAS RLS NO storage.objects
-- ============================================================================
-- Plataforma privada (Rasch + esposa). Qualquer utilizador autenticado
-- tem acesso completo ao bucket 'faturas'.

create policy "Auth read faturas"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'faturas');

create policy "Auth insert faturas"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'faturas');

create policy "Auth update faturas"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'faturas')
  with check (bucket_id = 'faturas');

create policy "Auth delete faturas"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'faturas');
