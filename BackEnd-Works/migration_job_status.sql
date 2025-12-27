-- Migration: active (Boolean) -> status (JobStatus enum)
-- Step 1: Migrate existing data
SET SQL_SAFE_UPDATES = 0;

UPDATE jobs SET status = CASE 
    WHEN active = true OR active IS NULL THEN 'ACTIVE' 
    ELSE 'PAUSED' 
END
WHERE id > 0;

SET SQL_SAFE_UPDATES = 1;

-- Step 2: Drop old active column
ALTER TABLE jobs DROP COLUMN active;

-- Verify
SELECT id, name, status FROM jobs LIMIT 10;
