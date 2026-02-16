
-- 1. Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('profiles', 'user_profiles');

-- 2. Check columns for profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 3. Check columns for user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
