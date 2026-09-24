-- 0015_payments_guest_checkout.sql
-- À la carte booking payments (deposit holds and pay-in-full) are written by
-- the Stripe webhook the same way memberships are (see 0014), and a booking
-- there is made as a guest -- there is no signed-in profile yet, and no
-- `bookings` row either (the app's booking funnel doesn't use book_slot()).
--
-- Relax payments to the same shape as memberships: profile_id becomes
-- nullable and the buyer's email is recorded, so the purchase can be traced
-- and claimed on first sign-in.

alter table public.payments alter column profile_id drop not null;
alter table public.payments add column email citext;

-- Speeds the "claim by email" lookup for still-unclaimed guest payments.
create index payments_unclaimed_email_idx on public.payments (email)
  where profile_id is null;

comment on column public.payments.email is
  'Buyer email at time of payment. Set for guest checkouts; used to claim the row to a profile on first sign-in.';
