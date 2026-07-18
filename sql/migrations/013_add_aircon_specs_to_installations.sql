-- Migration: Add aircon specification columns to installations table
ALTER TABLE installations 
ADD COLUMN IF NOT EXISTS aircon_brand TEXT,
ADD COLUMN IF NOT EXISTS aircon_type TEXT,
ADD COLUMN IF NOT EXISTS horsepower TEXT;
