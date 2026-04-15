-- Migration: Add split address fields to leads and appointments tables
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- Add address fields to leads table
-- ============================================
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS barangay TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- ============================================
-- Add address fields to appointments table
-- ============================================
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS barangay TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- ============================================
-- Add address fields to profiles table (for client addresses)
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS barangay TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;