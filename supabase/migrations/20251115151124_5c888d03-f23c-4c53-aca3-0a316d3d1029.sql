-- Add availability column to listings table
ALTER TABLE public.listings 
ADD COLUMN availability JSONB DEFAULT '[]'::jsonb;