-- Create game_scores table for tracking game completions and points
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    perfect BOOLEAN DEFAULT FALSE,
    at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to see their own scores" ON public.game_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own scores" ON public.game_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.game_scores TO anon;
GRANT SELECT, INSERT ON public.game_scores TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_game_scores_user_id ON public.game_scores(user_id);
CREATE INDEX idx_game_scores_game_type ON public.game_scores(game_type);
CREATE INDEX idx_game_scores_at ON public.game_scores(at DESC);