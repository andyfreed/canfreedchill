/*
  # Add Chat System Tables

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `created_at` (timestamp)
      - `is_admin` (boolean)
      - `is_read` (boolean)
      - `user_email` (text, optional)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for:
      - Anyone can create messages
      - Only admin can read all messages
      - Users can read their own messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  is_read boolean DEFAULT false,
  user_email text,
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create messages
CREATE POLICY "Anyone can create messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admin to read all messages
CREATE POLICY "Admin can read all messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@canfreedchill.com'
  ));

-- Allow users to read their own messages
CREATE POLICY "Users can read own messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (user_email IS NOT NULL AND user_email = current_setting('app.user_email', true));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;