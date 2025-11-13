-- Create proper users table for leaderboard functionality
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    points INTEGER DEFAULT 0,
    last_award TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    madrasah_maktab TEXT,
    city TEXT,
    avatar TEXT
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for anon and authenticated roles
CREATE POLICY "Allow read access to all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON public.users TO anon;
GRANT SELECT, UPDATE, INSERT ON public.users TO authenticated;

-- Create index on points for better performance
CREATE INDEX idx_users_points ON public.users(points DESC);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON public.users(email);