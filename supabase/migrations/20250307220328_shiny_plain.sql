/*
  # Add visitor tracking

  1. New Tables
    - `visitor_logs`
      - `id` (uuid, primary key)
      - `ip_address` (text)
      - `country` (text)
      - `city` (text)
      - `created_at` (timestamp)
      - `action` (text) - Type of interaction (e.g., 'check_availability')
      - `dates_checked` (jsonb) - Start and end dates that were checked

  2. Security
    - Enable RLS on `visitor_logs` table
    - Add policy for authenticated users to read logs
    - Allow public to insert logs (for tracking visitors)
*/

CREATE TABLE IF NOT EXISTS visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  country text,
  city text,
  created_at timestamptz DEFAULT now(),
  action text NOT NULL,
  dates_checked jsonb
);

-- Enable RLS
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to view logs"
  ON visitor_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public to insert logs"
  ON visitor_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_visitor_logs_created_at ON visitor_logs(created_at);