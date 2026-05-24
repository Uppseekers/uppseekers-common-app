
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles self select" on public.profiles for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- Applicant profile (onboarding wizard data)
create table public.applicant_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  personal jsonb not null default '{}'::jsonb,
  academics jsonb not null default '{}'::jsonb,
  testing jsonb not null default '{}'::jsonb,
  activities jsonb not null default '[]'::jsonb,
  essays jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  status text not null default 'in_progress',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.applicant_profiles enable row level security;
create policy "applicant self select" on public.applicant_profiles for select using (auth.uid() = user_id);
create policy "applicant self insert" on public.applicant_profiles for insert with check (auth.uid() = user_id);
create policy "applicant self update" on public.applicant_profiles for update using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger applicant_profiles_updated before update on public.applicant_profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.applicant_profiles (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
