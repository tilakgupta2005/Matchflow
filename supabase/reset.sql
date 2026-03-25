-- Run this in the Supabase SQL Editor to completely wipe your database

-- 1. Delete all the public tables and their data
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.influencer_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Delete all the actual authentication accounts (emails/passwords)
-- This ensures you can sign up again with exactly the same emails if you want to!
DELETE FROM auth.users;

-- After running this, your database is 100% empty!
-- Next step: Paste and run your original schema.sql, followed by seed.sql to rebuild.
