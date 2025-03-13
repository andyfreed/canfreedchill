/*
  # Fix schedule policies

  1. Changes
    - Add RLS policy to only allow authenticated users to view schedules
    - Add default policy to allow public users to view nothing
    - Remove existing policies that don't properly handle authentication

  2. Security
    - Enable RLS on schedules table
    - Add policy for authenticated users to view their schedules
    - Add policy for public users to view nothing
*/

-- First enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can read own schedules" ON schedules;

-- Create new policies
CREATE POLICY "Authenticated users can manage their schedules"
ON schedules
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Public users can't see any schedules
CREATE POLICY "Public users see no schedules"
ON schedules
FOR SELECT
TO public
USING (false);