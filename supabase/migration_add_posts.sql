-- ==========================================
-- Add missing columns and tables for Posts
-- ==========================================

-- 1. Create table if it doesn't completely exist
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add all the required columns (in case table existed but was missing them)
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Update security policies for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);


-- 4. Create Likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read likes" ON public.post_likes;
CREATE POLICY "Anyone can read likes" ON public.post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own likes" ON public.post_likes;
CREATE POLICY "Users can insert own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);


-- 5. Create Comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read comments" ON public.post_comments;
CREATE POLICY "Anyone can read comments" ON public.post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own comments" ON public.post_comments;
CREATE POLICY "Users can insert own comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);
