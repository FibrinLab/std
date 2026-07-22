create table public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  plus_one boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.invites enable row level security;
alter table public.save_the_date_rsvps add column invite_id uuid references public.invites(id) on delete set null;
