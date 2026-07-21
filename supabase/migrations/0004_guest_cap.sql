alter table public.save_the_date_rsvps drop constraint save_the_date_rsvps_guest_count_check;
alter table public.save_the_date_rsvps add constraint save_the_date_rsvps_guest_count_check check (guest_count between 1 and 8);
