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
