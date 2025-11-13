-- Create a function to get leaderboard users
-- This bypasses potential schema cache issues
CREATE OR REPLACE FUNCTION public.get_leaderboard_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    points INTEGER,
    last_award TIMESTAMP WITH TIME ZONE,
    madrasah_maktab TEXT,
    city TEXT,
    avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.points,
        u.last_award,
        u.madrasah_maktab,
        u.city,
        u.avatar
    FROM public.users u
    ORDER BY u.points DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_leaderboard_users() TO anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_users() TO authenticated;