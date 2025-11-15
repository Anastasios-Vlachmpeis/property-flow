-- Add amenities column to listings table
ALTER TABLE public.listings 
ADD COLUMN amenities TEXT[] DEFAULT '{}'::TEXT[];