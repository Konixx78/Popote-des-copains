-- =========================================================
--  Mes Recettes — schéma Supabase
--  À coller dans Supabase > SQL Editor > New query > Run
-- =========================================================

-- ---------- Profils (nom affiché des membres) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_members" on public.profiles;
create policy "profiles_select_members" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Crée automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Recettes ----------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'Plat',          -- Entrée, Plat, Accompagnement, Dessert, Apéro, Boisson, Sauce, Autre
  tags text[] not null default '{}',
  servings int not null default 4 check (servings > 0),
  prep_minutes int,
  cook_minutes int,
  ingredients jsonb not null default '[]',         -- [{ "qty": 200, "unit": "g", "name": "farine" }, ...]
  steps jsonb not null default '[]',               -- ["Préchauffer le four...", ...]
  photo_path text,                                 -- chemin dans le bucket recipe-photos
  origin text,                                     -- "Recette de mamie", lien, livre...
  tips text,                                       -- astuce
  is_shared boolean not null default true,         -- visible par les autres membres
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipes add column if not exists tips text;

create index if not exists recipes_owner_idx on public.recipes(owner_id);

alter table public.recipes enable row level security;

drop policy if exists "recipes_select" on public.recipes;
create policy "recipes_select" on public.recipes
  for select to authenticated using (owner_id = auth.uid() or is_shared);

drop policy if exists "recipes_insert" on public.recipes;
create policy "recipes_insert" on public.recipes
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "recipes_update" on public.recipes;
create policy "recipes_update" on public.recipes
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "recipes_delete" on public.recipes;
create policy "recipes_delete" on public.recipes
  for delete to authenticated using (owner_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists recipes_touch on public.recipes;
create trigger recipes_touch before update on public.recipes
  for each row execute function public.touch_updated_at();

-- ---------- Notes perso (chaque membre a les siennes) ----------
create table if not exists public.recipe_notes (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  note text not null default '',
  rating int check (rating between 1 and 5),
  last_made date,
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.recipe_notes enable row level security;

drop policy if exists "notes_own" on public.recipe_notes;
create policy "notes_own" on public.recipe_notes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Liste de courses (perso) ----------
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  qty numeric,
  unit text not null default '',
  recipe_title text,
  tag text,                                        -- 'facultatif' ou 'astuce' (article pas obligatoire)
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.shopping_items add column if not exists tag text;

create index if not exists shopping_user_idx on public.shopping_items(user_id);

alter table public.shopping_items enable row level security;

drop policy if exists "shopping_own" on public.shopping_items;
create policy "shopping_own" on public.shopping_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Photos ----------
-- Bucket public en lecture (adresses non devinables), écriture réservée
-- à chaque membre dans son propre dossier : <user_id>/<fichier>.jpg
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_update_own" on storage.objects;
create policy "photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
