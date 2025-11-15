import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Upload } from 'lucide-react';
import { Listing } from '@/store/useStore';
import { toast } from 'sonner';

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: Listing | null;
  onSave: (listing: Partial<Listing>) => void;
}

export function ListingFormDialog({ open, onOpenChange, listing, onSave }: ListingFormDialogProps) {
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    location: listing?.location || '',
    description: listing?.description || '',
    amenities: listing?.amenities || [],
    airbnbPrice: listing?.airbnbPrice || 0,
    bookingPrice: listing?.bookingPrice || 0,
    vrboPrice: listing?.vrboPrice || 0,
    thumbnail: listing?.thumbnail || '',
    photos: listing?.photos || [],
    platforms: {
      airbnb: listing ? listing.airbnbPrice > 0 : true,
      booking: listing ? listing.bookingPrice > 0 : true,
      vrbo: listing ? listing.vrboPrice > 0 : true,
    }
  });

  const [newAmenity, setNewAmenity] = useState('');

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const listingData: Partial<Listing> = {
      ...formData,
      airbnbPrice: formData.platforms.airbnb ? formData.airbnbPrice : 0,
      bookingPrice: formData.platforms.booking ? formData.bookingPrice : 0,
      vrboPrice: formData.platforms.vrbo ? formData.vrboPrice : 0,
      syncStatus: 'pending' as const,
    };

    if (listing) {
      listingData.id = listing.id;
    }

    onSave(listingData);
    onOpenChange(false);
    toast.success(listing ? 'Listing updated successfully' : 'Listing created successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{listing ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL *</Label>
            <Input
              id="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
              placeholder="https://..."
              required
            />
            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="Thumbnail preview" className="w-32 h-24 object-cover rounded-lg mt-2" />
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <Button type="button" onClick={handleAddAmenity} variant="secondary">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="gap-1">
                  {amenity}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveAmenity(amenity)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Platforms & Pricing */}
          <div className="space-y-4">
            <Label>Platforms & Pricing</Label>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Checkbox
                  id="airbnb"
                  checked={formData.platforms.airbnb}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, airbnb: checked as boolean } }))
                  }
                />
                <Label htmlFor="airbnb" className="flex-1">Airbnb</Label>
                <Input
                  type="number"
                  value={formData.airbnbPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, airbnbPrice: Number(e.target.value) }))}
                  placeholder="Price"
                  className="w-32"
                  disabled={!formData.platforms.airbnb}
                  min="0"
                />
              </div>

              <div className="flex items-center gap-4">
                <Checkbox
                  id="booking"
                  checked={formData.platforms.booking}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, booking: checked as boolean } }))
                  }
                />
                <Label htmlFor="booking" className="flex-1">Booking.com</Label>
                <Input
                  type="number"
                  value={formData.bookingPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, bookingPrice: Number(e.target.value) }))}
                  placeholder="Price"
                  className="w-32"
                  disabled={!formData.platforms.booking}
                  min="0"
                />
              </div>

              <div className="flex items-center gap-4">
                <Checkbox
                  id="vrbo"
                  checked={formData.platforms.vrbo}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, vrbo: checked as boolean } }))
                  }
                />
                <Label htmlFor="vrbo" className="flex-1">Vrbo</Label>
                <Input
                  type="number"
                  value={formData.vrboPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, vrboPrice: Number(e.target.value) }))}
                  placeholder="Price"
                  className="w-32"
                  disabled={!formData.platforms.vrbo}
                  min="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {listing ? 'Update Listing' : 'Create Listing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
