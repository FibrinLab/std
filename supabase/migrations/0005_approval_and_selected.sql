alter table public.save_the_date_rsvps drop constraint save_the_date_rsvps_guest_count_check;
alter table public.save_the_date_rsvps add constraint save_the_date_rsvps_guest_count_check check (guest_count between 1 and 2);
alter table public.save_the_date_rsvps add column approval text not null default 'pending' check (approval in ('pending','confirmed'));
alter table public.broadcasts drop constraint broadcasts_audience_check;
alter table public.broadcasts add constraint broadcasts_audience_check check (audience in ('all','celebrating','from_afar','selected'));
