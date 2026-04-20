-- ============================================================
-- RouteSync P0 + P1 Migration
-- Run this SQL in the Supabase Dashboard → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- P0.1  Notifications table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('sync','match','trip','social','system')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  icon        TEXT DEFAULT 'notifications',
  color       TEXT DEFAULT '#30AF5B',
  read        BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- P0.2  Posts table (Community / Social feed)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption         TEXT,
  image_url       TEXT,
  location        TEXT,
  likes           INT DEFAULT 0,
  comments_count  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- P0.2b  Post comments table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON post_comments FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_comments_post ON post_comments(post_id, created_at ASC);

-- ─────────────────────────────────────────────────────────────
-- P0.2c  Post likes table (tracks who liked what)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON post_likes FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- P0.3  Follows table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ─────────────────────────────────────────────────────────────
-- P0.4  Supabase Storage bucket for avatars
-- ─────────────────────────────────────────────────────────────
-- Create the bucket via Supabase Dashboard or the storage API:
--   Go to Storage → New Bucket → Name: "avatars" → Set Public
-- RLS policies for storage are managed in the Dashboard.
-- Alternatively, run the following (Supabase may support this):
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view avatars
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to update/delete their own avatars
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────
-- Helper function: Compute relative time string
-- (Used by the app to avoid computing on client)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_follower_count(target_user_id UUID)
RETURNS INT AS $$
  SELECT COALESCE(COUNT(*)::INT, 0)
  FROM follows
  WHERE following_id = target_user_id;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_following_count(target_user_id UUID)
RETURNS INT AS $$
  SELECT COALESCE(COUNT(*)::INT, 0)
  FROM follows
  WHERE follower_id = target_user_id;
$$ LANGUAGE SQL STABLE;
