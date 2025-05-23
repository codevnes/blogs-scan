-- Migration to change column types from VARCHAR(255) to TEXT

-- Update title column in articles table
ALTER TABLE articles ALTER COLUMN title TYPE TEXT;

-- Update url column in articles table
ALTER TABLE articles ALTER COLUMN url TYPE TEXT;

-- Note: This migration should be run manually using:
-- psql -U your_username -d your_database_name -f src/migrations/001-update-columns-to-text.sql 