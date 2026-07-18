-- Track members who signed up for exclusive offers
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS wants_offers BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.users.wants_offers IS 'True when the user opted in for exclusive member offers';
