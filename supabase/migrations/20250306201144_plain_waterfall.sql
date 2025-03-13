/*
  # Create parenting schedules table

  1. New Tables
    - `schedules`
      - `id` (uuid, primary key)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `type` (text)
      - `repeat` (text)
      - `repeat_until` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `schedules` table
    - Add policies for authenticated users to:
      - Read their own schedules
      - Create new schedules
      - Delete their own schedules
*/

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  type text NOT NULL,
  repeat text NOT NULL,
  repeat_until timestamptz,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own schedules"
  ON schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create schedules"
  ON schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);