alter table public.save_the_date_rsvps add column guest_names jsonb not null default '[]'::jsonb;
