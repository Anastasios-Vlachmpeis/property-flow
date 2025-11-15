-- Add max_guests column to listings table
ALTER TABLE public.listings 
ADD COLUMN max_guests integer NOT NULL DEFAULT 2;

-- Add a check constraint to ensure max_guests is positive
ALTER TABLE public.listings
ADD CONSTRAINT max_guests_positive CHECK (max_guests > 0);