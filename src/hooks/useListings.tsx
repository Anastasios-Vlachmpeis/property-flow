import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Listing } from '@/store/useStore';

export const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedListings: Listing[] = data.map((listing) => ({
        id: listing.id,
        title: listing.title,
        location: listing.location,
        description: listing.description || '',
        thumbnail: listing.thumbnail || listing.photos?.[0] || '/placeholder.svg',
        photos: listing.photos || [],
        maxGuests: listing.max_guests || 2,
        bedrooms: listing.bedrooms || 1,
        beds: listing.beds || 1,
        airbnbPrice: Number(listing.airbnb_price),
        bookingPrice: Number(listing.booking_price),
        vrboPrice: Number(listing.vrbo_price),
        syncStatus: listing.sync_status as 'synced' | 'pending' | 'error',
        lastSync: listing.last_sync || undefined,
        amenities: listing.amenities || [],
        availability: (listing.availability as any) || [],
      }));

      setListings(formattedListings);
    } catch (error: any) {
      toast.error('Error loading listings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addListing = async (listing: Omit<Listing, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: listing.title,
          location: listing.location,
          description: listing.description || '',
          amenities: listing.amenities || [],
          max_guests: listing.maxGuests,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          airbnb_price: listing.airbnbPrice,
          booking_price: listing.bookingPrice,
          vrbo_price: listing.vrboPrice,
          photos: listing.photos,
          thumbnail: listing.thumbnail || listing.photos[0],
          sync_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Listing added successfully!');
      await fetchListings();
      return data;
    } catch (error: any) {
      toast.error('Error adding listing: ' + error.message);
      throw error;
    }
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: updates.title,
          location: updates.location,
          description: updates.description,
          amenities: updates.amenities,
          max_guests: updates.maxGuests,
          bedrooms: updates.bedrooms,
          beds: updates.beds,
          airbnb_price: updates.airbnbPrice,
          booking_price: updates.bookingPrice,
          vrbo_price: updates.vrboPrice,
          photos: updates.photos,
          thumbnail: updates.thumbnail || updates.photos?.[0],
          availability: updates.availability as any,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Listing updated successfully!');
      await fetchListings();
    } catch (error: any) {
      toast.error('Error updating listing: ' + error.message);
      throw error;
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Listing deleted successfully!');
      await fetchListings();
    } catch (error: any) {
      toast.error('Error deleting listing: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchListings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
        },
        () => {
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { listings, loading, addListing, updateListing, deleteListing, refetch: fetchListings };
};
