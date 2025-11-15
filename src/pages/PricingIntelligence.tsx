import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle, MapPin, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { mockPricingData, fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';

export default function PricingIntelligence() {
  const { selectedListing, pricingData, setPricingData } = useStore();

  useEffect(() => {
    if (selectedListing) {
      setPricingData(mockPricingData);
    }
  }, [selectedListing]);

  const handleApplyPrice = async () => {
    await fakeApiCall('/pricing/apply', {
      listingId: selectedListing?.id,
      price: pricingData?.recommendation.price,
    });
    toast.success('Price updated across all platforms');
  };

  if (!selectedListing) {
    return (
      <AppLayout title="Pricing Intelligence">
        <Card className="p-12 text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Listing Selected</h3>
          <p className="text-muted-foreground">Select a listing from the Listings Manager to view pricing data</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Pricing Intelligence">
      <div className="space-y-6">
        {/* Selected Listing Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <img src={selectedListing.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold text-foreground">{selectedListing.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedListing.location}</p>
            </div>
          </div>
        </Card>

        {/* Recommendation Card */}
        {pricingData && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Recommended Price</h3>
                <p className="text-4xl font-bold text-primary">${pricingData.recommendation.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-success text-success-foreground">
                    {pricingData.recommendation.confidence}% confidence
                  </Badge>
                </div>
              </div>
              <Button onClick={handleApplyPrice} size="lg" className="gap-2">
                <CheckCircle className="h-5 w-5" />
                Apply Price Everywhere
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{pricingData.recommendation.explanation}</p>
          </Card>
        )}

        {/* Competitor Analysis */}
        {pricingData && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Competitor Analysis</h3>
            <div className="space-y-3">
              {pricingData.competitors.map((comp, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{comp.name}</h4>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-muted-foreground">{comp.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{comp.distance} away</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">${comp.price}</p>
                    <Badge variant={comp.availability ? 'default' : 'secondary'} className="mt-1">
                      {comp.availability ? 'Available' : 'Booked'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Price Trend Chart */}
        {pricingData && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Price Trends (7 Days)</h3>
            <div className="space-y-4">
              {pricingData.trend.dates.map((date, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground w-12">{date}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary/20"
                        style={{ width: `${(pricingData.trend.yourPrice[i] / 300) * 100}%` }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-secondary/20"
                        style={{ width: `${(pricingData.trend.competitorAvg[i] / 300) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-primary w-12">${pricingData.trend.yourPrice[i]}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/40" />
                  <span className="text-xs text-muted-foreground">Your Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary/40" />
                  <span className="text-xs text-muted-foreground">Competitor Avg</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
