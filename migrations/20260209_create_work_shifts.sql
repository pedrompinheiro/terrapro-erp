
-- Create work_shifts table
CREATE TABLE IF NOT EXISTS work_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  end_time TIME NOT NULL,
  work_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID -- Optional linkage to company if needed
);

-- Add work_shift_id to employees
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'work_shift_id') THEN
        ALTER TABLE employees ADD COLUMN work_shift_id UUID REFERENCES work_shifts(id);
    END IF;
END $$;
