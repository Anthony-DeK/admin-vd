-- Run this SQL in your Supabase SQL Editor to enable house rules saving
-- Dashboard -> SQL Editor -> New Query -> Paste and Run

-- Add structured house rules fields to apartment_details
ALTER TABLE apartment_details
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parties_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photoshoots_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
ADD COLUMN IF NOT EXISTS check_in_time TIME,
ADD COLUMN IF NOT EXISTS check_out_time TIME,
ADD COLUMN IF NOT EXISTS custom_house_rules TEXT;
