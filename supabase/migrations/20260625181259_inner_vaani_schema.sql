
/*
# Inner Vaani - Complete Schema

1. New Tables
- `profiles` - Extended user profiles (name, avatar, bio, emergency contacts, role)
- `journal_entries` - Digital diary entries with AI analysis fields
- `mood_logs` - Daily mood/wellness tracking logs
- `wellness_goals` - User-defined wellness goals
- `wellness_activities` - Yoga/meditation library items
- `activity_completions` - User completions of wellness activities
- `community_posts` - Community social posts
- `community_comments` - Comments on posts
- `community_reactions` - Reactions (likes, hearts, etc.) on posts
- `support_groups` - Community support groups
- `group_memberships` - Users in support groups
- `therapists` - Therapist profiles
- `therapist_reviews` - Reviews for therapists
- `appointment_requests` - Appointment requests to therapists
- `chat_messages` - AI chatbot conversation history
- `notifications` - User notifications
- `emergency_contacts` - Emergency contact storage

2. Security
- RLS enabled on all tables
- Owner-scoped policies for authenticated users
- Public read for therapists and wellness_activities
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  date_of_birth date,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'therapist')),
  streak_count integer DEFAULT 0,
  total_journal_entries integer DEFAULT 0,
  wellness_score integer DEFAULT 50,
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"email": true, "push": true, "inapp": true}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Allow admins to read all profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  mood text CHECK (mood IN ('very_happy','happy','neutral','sad','very_sad','anxious','angry','excited','grateful','confused')),
  tags text[] DEFAULT '{}',
  category text DEFAULT 'general' CHECK (category IN ('general','gratitude','reflection','goals','anxiety','relationships','work','health','creativity')),
  is_private boolean DEFAULT true,
  ai_emotion_score jsonb,
  ai_sentiment text,
  ai_summary text,
  ai_suggestions text[],
  ai_stress_level integer CHECK (ai_stress_level BETWEEN 0 AND 10),
  ai_confidence_level integer CHECK (ai_confidence_level BETWEEN 0 AND 10),
  word_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_journal" ON journal_entries;
CREATE POLICY "select_own_journal" ON journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_journal" ON journal_entries;
CREATE POLICY "insert_own_journal" ON journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_journal" ON journal_entries;
CREATE POLICY "update_own_journal" ON journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_journal" ON journal_entries;
CREATE POLICY "delete_own_journal" ON journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at);

-- MOOD LOGS
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score integer NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  sleep_hours numeric(4,1) CHECK (sleep_hours BETWEEN 0 AND 24),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 10),
  anxiety_level integer CHECK (anxiety_level BETWEEN 1 AND 10),
  productivity_level integer CHECK (productivity_level BETWEEN 1 AND 10),
  emotions text[] DEFAULT '{}',
  notes text,
  activities_done text[] DEFAULT '{}',
  log_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mood" ON mood_logs;
CREATE POLICY "select_own_mood" ON mood_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mood" ON mood_logs;
CREATE POLICY "insert_own_mood" ON mood_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mood" ON mood_logs;
CREATE POLICY "update_own_mood" ON mood_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_mood" ON mood_logs;
CREATE POLICY "delete_own_mood" ON mood_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mood_user_id ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_log_date ON mood_logs(log_date);

-- WELLNESS GOALS
CREATE TABLE IF NOT EXISTS wellness_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('mental','physical','social','spiritual','emotional','habit')),
  target_value integer,
  current_value integer DEFAULT 0,
  unit text,
  deadline date,
  status text DEFAULT 'active' CHECK (status IN ('active','completed','paused','abandoned')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_goals" ON wellness_goals;
CREATE POLICY "select_own_goals" ON wellness_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_goals" ON wellness_goals;
CREATE POLICY "insert_own_goals" ON wellness_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_goals" ON wellness_goals;
CREATE POLICY "update_own_goals" ON wellness_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_goals" ON wellness_goals;
CREATE POLICY "delete_own_goals" ON wellness_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WELLNESS ACTIVITIES (public library)
CREATE TABLE IF NOT EXISTS wellness_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('yoga','meditation','breathing','mindfulness','exercise','relaxation','journaling','therapy')),
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  duration_minutes integer,
  mental_health_goals text[] DEFAULT '{}',
  instructions text[],
  benefits text[],
  thumbnail_url text,
  video_url text,
  avg_rating numeric(3,2) DEFAULT 0,
  total_ratings integer DEFAULT 0,
  completions_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_activities" ON wellness_activities;
CREATE POLICY "public_select_activities" ON wellness_activities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_activities" ON wellness_activities;
CREATE POLICY "admin_insert_activities" ON wellness_activities FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_activities" ON wellness_activities;
CREATE POLICY "admin_update_activities" ON wellness_activities FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_activities" ON wellness_activities;
CREATE POLICY "admin_delete_activities" ON wellness_activities FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ACTIVITY COMPLETIONS
CREATE TABLE IF NOT EXISTS activity_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES wellness_activities(id) ON DELETE CASCADE,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  notes text,
  duration_actual integer,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_completions" ON activity_completions;
CREATE POLICY "select_own_completions" ON activity_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_completions" ON activity_completions;
CREATE POLICY "insert_own_completions" ON activity_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_completions" ON activity_completions;
CREATE POLICY "update_own_completions" ON activity_completions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_completions" ON activity_completions;
CREATE POLICY "delete_own_completions" ON activity_completions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- SUPPORT GROUPS
CREATE TABLE IF NOT EXISTS support_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  icon text,
  member_count integer DEFAULT 0,
  is_private boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_groups" ON support_groups;
CREATE POLICY "public_select_groups" ON support_groups FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_groups" ON support_groups;
CREATE POLICY "auth_insert_groups" ON support_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "auth_update_groups" ON support_groups;
CREATE POLICY "auth_update_groups" ON support_groups FOR UPDATE TO authenticated USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "auth_delete_groups" ON support_groups;
CREATE POLICY "auth_delete_groups" ON support_groups FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- GROUP MEMBERSHIPS
CREATE TABLE IF NOT EXISTS group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_memberships" ON group_memberships;
CREATE POLICY "select_memberships" ON group_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_membership" ON group_memberships;
CREATE POLICY "insert_membership" ON group_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_membership" ON group_memberships;
CREATE POLICY "delete_membership" ON group_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES support_groups(id) ON DELETE SET NULL,
  title text,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  is_anonymous boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  reaction_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  is_moderated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_posts" ON community_posts;
CREATE POLICY "public_select_posts" ON community_posts FOR SELECT TO authenticated USING (NOT is_moderated);

DROP POLICY IF EXISTS "insert_own_post" ON community_posts;
CREATE POLICY "insert_own_post" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_post" ON community_posts;
CREATE POLICY "update_own_post" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_post" ON community_posts;
CREATE POLICY "delete_own_post" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COMMUNITY COMMENTS
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  reaction_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_comments" ON community_comments;
CREATE POLICY "select_comments" ON community_comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_comment" ON community_comments;
CREATE POLICY "insert_comment" ON community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_comment" ON community_comments;
CREATE POLICY "update_comment" ON community_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_comment" ON community_comments;
CREATE POLICY "delete_comment" ON community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POST REACTIONS
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text DEFAULT 'heart' CHECK (reaction_type IN ('heart','support','relate','strength','hug')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reactions" ON post_reactions;
CREATE POLICY "select_reactions" ON post_reactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_reaction" ON post_reactions;
CREATE POLICY "insert_reaction" ON post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_reaction" ON post_reactions;
CREATE POLICY "delete_reaction" ON post_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- THERAPISTS
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  title text,
  bio text,
  avatar_url text,
  specializations text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  consultation_modes text[] DEFAULT '{}',
  location text,
  country text,
  hourly_rate_usd numeric(8,2),
  avg_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  years_experience integer,
  education text[],
  is_available boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  profile_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_therapists" ON therapists;
CREATE POLICY "public_select_therapists" ON therapists FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_therapists" ON therapists;
CREATE POLICY "admin_manage_therapists" ON therapists FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin')));

DROP POLICY IF EXISTS "admin_update_therapists" ON therapists;
CREATE POLICY "admin_update_therapists" ON therapists FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin')));

-- THERAPIST REVIEWS
CREATE TABLE IF NOT EXISTS therapist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(therapist_id, user_id)
);

ALTER TABLE therapist_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reviews" ON therapist_reviews;
CREATE POLICY "select_reviews" ON therapist_reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_review" ON therapist_reviews;
CREATE POLICY "insert_review" ON therapist_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_review" ON therapist_reviews;
CREATE POLICY "update_review" ON therapist_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_review" ON therapist_reviews;
CREATE POLICY "delete_review" ON therapist_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- APPOINTMENT REQUESTS
CREATE TABLE IF NOT EXISTS appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  preferred_date date,
  preferred_time text,
  message text,
  consultation_mode text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_appointments" ON appointment_requests;
CREATE POLICY "select_own_appointments" ON appointment_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_appointment" ON appointment_requests;
CREATE POLICY "insert_own_appointment" ON appointment_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_appointment" ON appointment_requests;
CREATE POLICY "update_own_appointment" ON appointment_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_appointment" ON appointment_requests;
CREATE POLICY "delete_own_appointment" ON appointment_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chats" ON chat_messages;
CREATE POLICY "select_own_chats" ON chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat" ON chat_messages;
CREATE POLICY "insert_own_chat" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info','reminder','achievement','alert','wellness')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notification" ON notifications;
CREATE POLICY "insert_own_notification" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notification" ON notifications;
CREATE POLICY "update_own_notification" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notification" ON notifications;
CREATE POLICY "delete_own_notification" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  email text,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_contacts" ON emergency_contacts;
CREATE POLICY "select_own_contacts" ON emergency_contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_contact" ON emergency_contacts;
CREATE POLICY "insert_own_contact" ON emergency_contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contact" ON emergency_contacts;
CREATE POLICY "update_own_contact" ON emergency_contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_contact" ON emergency_contacts;
CREATE POLICY "delete_own_contact" ON emergency_contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
