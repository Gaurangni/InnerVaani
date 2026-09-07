import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  role: 'user' | 'admin' | 'therapist';
  streak_count: number;
  total_journal_entries: number;
  wellness_score: number;
  timezone: string;
  notification_preferences: { email: boolean; push: boolean; inapp: boolean };
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
  category: string;
  is_private: boolean;
  ai_emotion_score: Record<string, number> | null;
  ai_sentiment: string | null;
  ai_summary: string | null;
  ai_suggestions: string[] | null;
  ai_stress_level: number | null;
  ai_confidence_level: number | null;
  word_count: number;
  created_at: string;
  updated_at: string;
};

export type MoodLog = {
  id: string;
  user_id: string;
  mood_score: number;
  stress_level: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  energy_level: number | null;
  anxiety_level: number | null;
  productivity_level: number | null;
  emotions: string[];
  notes: string | null;
  activities_done: string[];
  log_date: string;
  created_at: string;
};

export type WellnessActivity = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration_minutes: number | null;
  mental_health_goals: string[];
  instructions: string[];
  benefits: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  avg_rating: number;
  total_ratings: number;
  completions_count: number;
  is_featured: boolean;
  created_at: string;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  group_id: string | null;
  title: string | null;
  content: string;
  tags: string[];
  is_anonymous: boolean;
  is_pinned: boolean;
  reaction_count: number;
  comment_count: number;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
};

export type Therapist = {
  id: string;
  full_name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  specializations: string[];
  languages: string[];
  consultation_modes: string[];
  location: string | null;
  country: string | null;
  hourly_rate_usd: number | null;
  avg_rating: number;
  total_reviews: number;
  years_experience: number | null;
  education: string[];
  is_available: boolean;
  is_verified: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'achievement' | 'alert' | 'wellness';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
};

export type SupportGroup = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  member_count: number;
  is_private: boolean;
  created_by: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};
