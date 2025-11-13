-- Test direct query to users table and force schema refresh
-- This should help PostgREST recognize the table
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    typname as data_type
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
JOIN pg_namespace n ON t.schemaname = n.nspname
JOIN pg_attribute a ON c.oid = a.attrelid
JOIN pg_type ty ON a.atttypid = ty.oid
WHERE t.schemaname = 'public' 
    AND t.tablename = 'users'
    AND a.attnum > 0
ORDER BY a.attnum;

-- Force a schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Test if we can query the table directly
SELECT count(*) as user_count FROM public.users;