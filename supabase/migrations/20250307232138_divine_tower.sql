/*
  # Fix schedule policies for public access

  1. Changes
    - Allow public users to read schedules
    - Keep write access restricted to authenticated users

  2. Security
    - Enable RLS on schedules table
    - Add policy for public users to read schedules
    - Add policy for authenticated users to manage their schedules
*/

-- First enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can read own schedules" ON schedules;
DROP POLICY IF EXISTS "Public users see no schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can manage their schedules" ON schedules;

-- Create new policies
CREATE POLICY "Public users can read schedules"
ON schedules
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage their schedules"
ON schedules
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);