import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://thbnhqqzovmvsyioibsp.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoYm5ocXF6b3ZtdnN5aW9pYnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODYxNTcsImV4cCI6MjA4MDU2MjE1N30.AKJm0rR7hHNKm0qZfmdgpHmBkWaz0isilU9wLHqO5Qs";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
