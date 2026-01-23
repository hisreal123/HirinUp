-- Migration: Add portfolio_website column to candidate table

-- Add portfolio_website column to candidate table (nullable for existing records)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidate' AND column_name = 'portfolio_website'
    ) THEN
        ALTER TABLE candidate ADD COLUMN portfolio_website TEXT;
    END IF;
END $$;

