create table public.gift_claims (
  id uuid primary key default gen_random_uuid(),
  gift_id text not null,
  guest_name text not null,
  email text not null default '',
  message text not null default '',
  created_at timestamptz not null default now()
);
create index gift_claims_gift_idx on public.gift_claims(gift_id);
alter table public.gift_claims enable row level security;
