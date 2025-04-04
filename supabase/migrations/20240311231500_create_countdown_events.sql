-- Create countdown_events table
CREATE TABLE IF NOT EXISTS countdown_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  color text DEFAULT '#FF4081',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE countdown_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON countdown_events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON countdown_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON countdown_events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON countdown_events
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE countdown_events; 