create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  audience text not null check (audience in ('all','celebrating','from_afar')),
  sent_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
