-- Rode no SQL Editor do Supabase
create table if not exists favoritos (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('compositor','obra')),
  nome_item text not null,
  compositor text,
  anotacao text,
  dados_extra jsonb
);
alter table favoritos enable row level security;
create policy "leitura aberta" on favoritos for select to anon using (true);
create policy "insercao aberta" on favoritos for insert to anon with check (true);
create policy "atualizacao aberta" on favoritos for update to anon using (true) with check (true);
create policy "exclusao aberta" on favoritos for delete to anon using (true);
