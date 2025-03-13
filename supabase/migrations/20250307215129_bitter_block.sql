/*
  # Fix Chat System Permissions

  1. Changes
    - Create set_claim function for email storage
    - Fix chat_messages table permissions
    - Remove unnecessary user table references
    - Add proper RLS policies

  2. Security
    - Enable RLS
    - Add secure policies for message access
*/

-- Create function to store email in session
CREATE OR REPLACE FUNCTION public.set_user_email(email text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_email', email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate chat_messages table with proper structure
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  is_read boolean DEFAULT false,
  user_email text NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admin can read all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;

-- Create new policies
CREATE POLICY "Anyone can create messages"
ON public.chat_messages FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own messages"
ON public.chat_messages FOR SELECT
TO public
USING (
  CASE 
    WHEN current_setting('app.user_email', true) IS NULL THEN false
    ELSE user_email = current_setting('app.user_email', true)
  END
);

-- Enable realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
END;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;