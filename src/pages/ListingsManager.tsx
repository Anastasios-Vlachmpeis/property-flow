import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Upload, RefreshCw, Sparkles, Building2, Plus, Pencil, ArrowRight } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useStore } from '@/store/useStore';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';
import { ListingFormDialog } from '@/components/ListingFormDialog';
import { Listing } from '@/store/useStore';
import { format } from 'date-fns';

const statusColors = {
  synced: 'bg-success text-success-foreground',
  pending: 'bg-warning text-warning-foreground',
  error: 'bg-destructive text-destructive-foreground',
};

export default function ListingsManager() {
  const { listings, loading, addListing: dbAddListing, updateListing: dbUpdateListing } = useListings();
  const { selectedListing, setSelectedListing, pricingData } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Keep selected listing in sync after add/update refetches
  useEffect(() => {
    if (selectedListing?.id) {
      const updated = listings.find((l) => l.id === selectedListing.id);
      if (updated && updated !== selectedListing) {
        setSelectedListing(updated);
      }
    }
  }, [listings, selectedListing?.id, setSelectedListing]);

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

  const handleAddListing = async (listing: Partial<Listing>) => {
    try {
      await dbAddListing(listing as Omit<Listing, 'id'>);
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error already handled in useListings hook
    }
  };

  const handleUpdateListing = async (listing: Partial<Listing>) => {
    if (!selectedListing?.id) return;
    
    try {
      await dbUpdateListing(selectedListing.id, listing);
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error already handled in useListings hook
    }
  };

  const handleDateClick = (date: Date) => {
    if (!selectedListing) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentAvailability = selectedListing.availability || [];
    
    // If this is the first click, set it as range start
    if (!rangeStart) {
      const existingDate = currentAvailability.find(a => a.date === dateStr);
      
      // Check if date is booked
      if (existingDate?.bookedBy) {
        toast.error('Cannot modify - this date is already booked');
        return;
      }
      
      setRangeStart(date);
      toast.info('Click another date to complete the range');
      return;
    }
    
    // Second click - process the range
    const start = rangeStart < date ? rangeStart : date;
    const end = rangeStart < date ? date : rangeStart;
    
    // Generate all dates in the range
    const datesInRange: Date[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      datesInRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Check if any date in range is booked
    const hasBookedDate = datesInRange.some(d => {
      const dStr = format(d, 'yyyy-MM-dd');
      const existing = currentAvailability.find(a => a.date === dStr);
      return existing?.bookedBy;
    });
    
    if (hasBookedDate) {
      toast.error('Range contains booked dates - cannot modify');
      setRangeStart(null);
      return;
    }
    
    // Check if all dates in range are currently blocked
    const allBlocked = datesInRange.every(d => {
      const dStr = format(d, 'yyyy-MM-dd');
      const existing = currentAvailability.find(a => a.date === dStr);
      return existing?.blocked === true;
    });
    
    // Toggle the range
    let newAvailability = [...currentAvailability];
    
    datesInRange.forEach(d => {
      const dStr = format(d, 'yyyy-MM-dd');
      const existingIndex = newAvailability.findIndex(a => a.date === dStr);
      
      if (existingIndex >= 0) {
        // Update existing
        newAvailability[existingIndex] = {
          ...newAvailability[existingIndex],
          blocked: !allBlocked,
          available: allBlocked
        };
      } else {
        // Add new blocked date
        newAvailability.push({
          date: dStr,
          available: allBlocked,
          blocked: !allBlocked
        });
      }
    });
    
    dbUpdateListing(selectedListing.id, { availability: newAvailability });
    setRangeStart(null);
    toast.success(allBlocked ? 'Range unblocked' : 'Range blocked');
  };

  const getDateStatus = (date: Date) => {
    if (!selectedListing?.availability) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedListing.availability.find(a => a.date === dateStr);
  };

  return (
    <AppLayout title="Listings Manager">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Your Listings</h3>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </div>
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

        <div className="space-y-6">
        {/* Availability Calendar */}
        {selectedListing && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Availability Calendar</h3>
            <div className="flex gap-4 mb-4 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#FF385C]"></div>
                <span>Airbnb</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#003580]"></div>
                <span>Booking.com</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#FFB400]"></div>
                <span>Vrbo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted line-through"></div>
                <span>Blocked</span>
              </div>
            </div>
            <Calendar
              mode="single"
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                airbnb: (date) => {
                  const status = getDateStatus(date);
                  return status?.bookedBy === 'airbnb';
                },
                booking: (date) => {
                  const status = getDateStatus(date);
                  return status?.bookedBy === 'booking';
                },
                vrbo: (date) => {
                  const status = getDateStatus(date);
                  return status?.bookedBy === 'vrbo';
                },
                blocked: (date) => {
                  const status = getDateStatus(date);
                  return status?.blocked === true;
                },
                rangeStart: (date) => {
                  return rangeStart !== null && format(date, 'yyyy-MM-dd') === format(rangeStart, 'yyyy-MM-dd');
                }
              }}
              modifiersClassNames={{
                airbnb: 'bg-[#FF385C] text-white hover:bg-[#FF385C]/90',
                booking: 'bg-[#003580] text-white hover:bg-[#003580]/90',
                vrbo: 'bg-[#FFB400] text-black hover:bg-[#FFB400]/90',
                blocked: 'line-through bg-muted text-muted-foreground hover:bg-muted/80',
                rangeStart: 'ring-2 ring-primary ring-offset-2'
              }}
              onDayClick={handleDateClick}
            />
            <p className="text-xs text-muted-foreground mt-3">
              Click two dates to block/unblock a range
            </p>
          </Card>
        )}

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
                <Button onClick={() => setIsEditDialogOpen(true)} variant="outline" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={handleImproveWithAI} variant="secondary" className="w-full" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Improve With AI
              </Button>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                
                <TabsContent value="pricing" className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Current Prices</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                        <span className="text-xs text-muted-foreground">Airbnb</span>
                        <span className="text-sm font-semibold text-foreground">${selectedListing.airbnbPrice}/night</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                        <span className="text-xs text-muted-foreground">Booking.com</span>
                        <span className="text-sm font-semibold text-foreground">${selectedListing.bookingPrice}/night</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                        <span className="text-xs text-muted-foreground">Vrbo</span>
                        <span className="text-sm font-semibold text-foreground">${selectedListing.vrboPrice}/night</span>
                      </div>
                    </div>
                  </div>

                  {pricingData && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="text-sm font-semibold text-foreground mb-2">AI Recommendation</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Suggested Price</span>
                          <span className="text-lg font-bold text-primary">${pricingData.recommendation.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Confidence</span>
                          <span className="text-sm font-semibold text-foreground">{pricingData.recommendation.confidence}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{pricingData.recommendation.explanation}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    View Full Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </TabsContent>
                
                <TabsContent value="status" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Airbnb</span>
                      <Badge className={selectedListing.airbnbPrice > 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                        {selectedListing.airbnbPrice > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Booking.com</span>
                      <Badge className={selectedListing.bookingPrice > 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                        {selectedListing.bookingPrice > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Vrbo</span>
                      <Badge className={selectedListing.vrboPrice > 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                        {selectedListing.vrboPrice > 0 ? "Active" : "Inactive"}
                      </Badge>
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
        </div>
      )}

      <ListingFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddListing}
      />

      <ListingFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        listing={selectedListing}
        onSave={handleUpdateListing}
      />
    </AppLayout>
  );
}
