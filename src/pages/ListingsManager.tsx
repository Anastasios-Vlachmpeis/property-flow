import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';

const statusColors = {
  synced: 'bg-success text-success-foreground',
  pending: 'bg-warning text-warning-foreground',
  error: 'bg-destructive text-destructive-foreground',
};

export default function ListingsManager() {
  const { listings, selectedListing, setSelectedListing } = useStore();

  const handlePostEverywhere = async () => {
    await fakeApiCall('/listings/post-all', { listingId: selectedListing?.id });
    toast.success('Listing posted to all platforms');
  };

  const handleSyncListing = async () => {
    await fakeApiCall('/listings/sync', { listingId: selectedListing?.id });
    toast.success('Listing synced successfully');
  };

  const handleImproveWithAI = async () => {
    await fakeApiCall('/listings/improve-ai', { listingId: selectedListing?.id });
    toast.success('AI improvements applied');
  };

  return (
    <AppLayout title="Listings Manager">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings Table */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Listings</h3>
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => setSelectedListing(listing)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedListing?.id === listing.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={listing.thumbnail}
                    alt={listing.title}
                    className="w-24 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </div>
                      <Badge className={statusColors[listing.syncStatus]}>
                        {listing.syncStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Airbnb: <span className="font-semibold text-foreground">${listing.airbnbPrice}</span></span>
                      <span className="text-muted-foreground">Booking: <span className="font-semibold text-foreground">${listing.bookingPrice}</span></span>
                      <span className="text-muted-foreground">Vrbo: <span className="font-semibold text-foreground">${listing.vrboPrice}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Detail Panel */}
        <Card className="p-6">
          {selectedListing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handlePostEverywhere} size="sm" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Post Everywhere
                </Button>
                <Button onClick={handleSyncListing} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={handleImproveWithAI} variant="secondary" className="w-full" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Improve With AI
              </Button>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-3 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
                  </div>
                  {selectedListing.amenities && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedListing.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="photos" className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedListing.photos?.map((photo, i) => (
                      <img key={i} src={photo} alt="" className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="status" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Airbnb</span>
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Booking.com</span>
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Vrbo</span>
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a listing to view details</p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
