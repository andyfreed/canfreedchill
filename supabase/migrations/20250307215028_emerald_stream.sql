/*
  # Fix Chat Messages Table

  1. Changes
    - Drop existing chat_messages table and recreate with proper constraints
    - Add better RLS policies
    - Enable realtime

  2. Security
    - Enable RLS
    - Add policies for message creation and viewing
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS chat_messages;

-- Create new chat_messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  is_read boolean DEFAULT false,
  user_email text NOT NULL,
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

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
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@canfreedchill.com'
    )
  );

-- Allow users to read their own messages
CREATE POLICY "Users can read own messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (user_email = current_setting('app.user_email', true));