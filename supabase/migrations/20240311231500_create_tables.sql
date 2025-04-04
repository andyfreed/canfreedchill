-- Create parenting_schedules table
CREATE TABLE IF NOT EXISTS parenting_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "repeatFrequency" TEXT NOT NULL DEFAULT 'NONE',
    "repeatUntil" TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create countdown_events table
CREATE TABLE IF NOT EXISTS countdown_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color TEXT NOT NULL DEFAULT '#FF4081',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE parenting_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdown_events ENABLE ROW LEVEL SECURITY;

-- Create policies for parenting_schedules
CREATE POLICY "Enable read access for all users" ON parenting_schedules
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for authenticated users only" ON parenting_schedules
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for countdown_events
CREATE POLICY "Enable read access for all users" ON countdown_events
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for authenticated users only" ON countdown_events
    FOR ALL USING (auth.role() = 'authenticated'); 