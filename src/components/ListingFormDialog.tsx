import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Listing } from '@/store/useStore';
import { toast } from 'sonner';

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: Listing | null;
  onSave: (listing: Partial<Listing>) => void;
}

export function ListingFormDialog({ open, onOpenChange, listing, onSave }: ListingFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    location: listing?.location || '',
    maxGuests: listing?.maxGuests || 2,
    description: listing?.description || '',
    amenities: listing?.amenities || [],
    airbnbPrice: listing?.airbnbPrice || 0,
    bookingPrice: listing?.bookingPrice || 0,
    vrboPrice: listing?.vrboPrice || 0,
    photos: listing?.photos || [],
    platforms: {
      airbnb: listing ? listing.airbnbPrice > 0 : true,
      booking: listing ? listing.bookingPrice > 0 : true,
      vrbo: listing ? listing.vrboPrice > 0 : true,
    }
  });

  const [newAmenity, setNewAmenity] = useState('');

  const commonAmenities = [
    'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 
    'Heating', 'TV', 'Pool', 'Hot tub', 'Free parking',
    'Gym', 'Elevator', 'Pet friendly', 'Workspace'
  ];

  const toggleCommonAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      handleRemoveAmenity(amenity);
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentPhotoCount = formData.photos.length;
    const remainingSlots = 10 - currentPhotoCount;

    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more photo(s). Maximum is 10 photos.`);
      return;
    }

    const newPhotos: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      try {
        const dataUrl = await readFileAsDataURL(file);
        newPhotos.push(dataUrl);
      } catch (error) {
        toast.error(`Failed to load ${file.name}`);
      }
    }

    if (newPhotos.length > 0) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
      toast.success(`Added ${newPhotos.length} photo(s)`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    toast.success('Photo removed');
  };

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
    
    if (formData.photos.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }
    
    const listingData: Partial<Listing> = {
      ...formData,
      thumbnail: formData.photos[0], // First photo becomes the thumbnail
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
              <Label htmlFor="maxGuests">Maximum Guests *</Label>
              <Input
                id="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests}
                onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 1 }))}
                placeholder="e.g., 4"
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
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Photos ({formData.photos.length}/10) *</Label>
                  <p className="text-xs text-muted-foreground mt-1">First photo will be used as thumbnail</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formData.photos.length >= 10}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          Thumbnail
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.photos.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No photos added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Photos" to upload at least 1 image</p>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add custom amenity..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <Button type="button" onClick={handleAddAmenity} variant="secondary">Add</Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Common amenities (click to add/remove):</p>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleCommonAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {formData.amenities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selected amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="gap-1">
                      {amenity}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveAmenity(amenity)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
