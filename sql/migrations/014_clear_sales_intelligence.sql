-- Migration: Clear Sales Intelligence fields from existing leads
UPDATE leads SET lead_temperature = NULL, potential_deal_value = NULL;
