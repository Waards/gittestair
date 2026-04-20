-- Migration: Add aircon specification fields to leads table

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS aircon_brand TEXT,
ADD COLUMN IF NOT EXISTS aircon_type TEXT,
ADD COLUMN IF NOT EXISTS horsepower TEXT,
ADD COLUMN IF NOT EXISTS btu TEXT;