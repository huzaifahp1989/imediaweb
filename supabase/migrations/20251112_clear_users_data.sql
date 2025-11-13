-- Clear all user data and game scores to start fresh
-- This migration removes all existing users and their game scores

-- First, delete all game scores (due to foreign key constraints)
DELETE FROM public.game_scores;

-- Then delete all users
DELETE FROM public.users;

-- Reset any sequences if needed
ALTER SEQUENCE IF EXISTS public.users_id_seq RESTART WITH 1;