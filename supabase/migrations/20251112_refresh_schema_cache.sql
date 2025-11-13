-- Force PostgREST schema cache refresh
-- This is needed when new tables are created to avoid PGRST205 errors
SELECT pg_notify('pgrst', 'reload schema');