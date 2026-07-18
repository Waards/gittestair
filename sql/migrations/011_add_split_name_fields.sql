-- Migration: Add split name fields to leads and profiles tables
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- Add name fields to leads table
-- ============================================
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS suffix TEXT;

-- ============================================
-- Add name fields to profiles table
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS suffix TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;
