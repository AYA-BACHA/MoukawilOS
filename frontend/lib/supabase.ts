import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://syxmylidoeantkndstqa.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_KbMayuqUx3eG9jqmnaXCRw_MPrAIhJ3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
