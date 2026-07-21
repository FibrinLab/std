-- All migrations combined, in order. Paste this once into the Supabase SQL editor.

-- ── supabase/migrations/0001_initial.sql
create extension if not exists pgcrypto;

create table public.save_the_date_rsvps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique check (email = lower(email)),
  status text not null check (status in ('celebrating','from_afar')),
  guest_count integer not null default 1 check (guest_count between 1 and 10),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create index rsvps_updated_idx on public.save_the_date_rsvps(updated_at desc);

alter table public.save_the_date_rsvps enable row level security;
alter table public.admin_users enable row level security;

-- Guests write only through the server (service role); signed-in admins may read directly.
create policy "admins read replies" on public.save_the_date_rsvps for select to authenticated
  using (exists(select 1 from public.admin_users where user_id = auth.uid()));

-- ── supabase/migrations/0002_guest_names.sql
alter table public.save_the_date_rsvps add column guest_names jsonb not null default '[]'::jsonb;

-- ── supabase/migrations/0003_broadcasts.sql
create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  audience text not null check (audience in ('all','celebrating','from_afar')),
  sent_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;

-- ── supabase/migrations/0004_guest_cap.sql
alter table public.save_the_date_rsvps drop constraint save_the_date_rsvps_guest_count_check;
alter table public.save_the_date_rsvps add constraint save_the_date_rsvps_guest_count_check check (guest_count between 1 and 8);

-- ── supabase/migrations/0005_approval_and_selected.sql
alter table public.save_the_date_rsvps drop constraint save_the_date_rsvps_guest_count_check;
alter table public.save_the_date_rsvps add constraint save_the_date_rsvps_guest_count_check check (guest_count between 1 and 2);
alter table public.save_the_date_rsvps add column approval text not null default 'pending' check (approval in ('pending','confirmed'));
alter table public.broadcasts drop constraint broadcasts_audience_check;
alter table public.broadcasts add constraint broadcasts_audience_check check (audience in ('all','celebrating','from_afar','selected'));
