-- Migration: Remove theme_color column from interview table

-- Remove theme_color column from interview table
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interview' AND column_name = 'theme_color'
    ) THEN
        ALTER TABLE interview DROP COLUMN theme_color;
    END IF;
END $$;

