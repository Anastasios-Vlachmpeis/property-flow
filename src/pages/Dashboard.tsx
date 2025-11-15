import { useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/KpiCard';
import { Card } from '@/components/ui/card';
import { Building2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useListings } from '@/hooks/useListings';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

const platformIcons: Record<string, string> = {
  airbnb: '🏠',
  booking: '🏨',
  vrbo: '🏡',
};

export default function Dashboard() {
  const { listings } = useListings();
  const { recentActivity } = useStore();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let upcomingBookings = 0;
    let pastRevenue = 0;
    const activities: Array<{ id: string; message: string; timestamp: string; }> = [];
    
    listings.forEach((listing) => {
      if (!listing.availability) return;
      
      listing.availability.forEach((availability) => {
        const date = parseISO(availability.date);
        
        if (availability.bookedBy) {
          if (isAfter(date, today) || format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
            upcomingBookings++;
          } else if (availability.isPast) {
            // Calculate revenue from past bookings
            const price = availability.bookedBy === 'airbnb' ? listing.airbnbPrice :
                         availability.bookedBy === 'booking' ? listing.bookingPrice :
                         listing.vrboPrice;
            pastRevenue += price;
          }
        }
      });
    });

    // Generate activities from listing data
    const sortedListings = [...listings].sort((a, b) => 
      new Date(b.lastSync || 0).getTime() - new Date(a.lastSync || 0).getTime()
    );

    sortedListings.slice(0, 5).forEach((listing) => {
      if (listing.lastSync) {
        activities.push({
          id: `sync-${listing.id}`,
          message: `Listing "${listing.title}" synced across all platforms`,
          timestamp: format(new Date(listing.lastSync), 'MMM dd, yyyy HH:mm')
        });
      }
    });

    // Add booking activities
    listings.forEach((listing) => {
      if (!listing.availability) return;
      
      const recentBookings = listing.availability
        .filter(a => a.bookedBy && !a.isPast)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3);

      recentBookings.forEach((booking) => {
        const platform = booking.bookedBy === 'airbnb' ? 'Airbnb' :
                        booking.bookedBy === 'booking' ? 'Booking.com' : 'Vrbo';
        activities.push({
          id: `booking-${listing.id}-${booking.date}`,
          message: `New ${platform} booking for "${listing.title}" by ${booking.guestName}`,
          timestamp: format(parseISO(booking.date), 'MMM dd, yyyy')
        });
      });
    });

    return {
      totalListings: listings.length,
      upcomingBookings,
      revenue: pastRevenue,
      activities: activities.slice(0, 10)
    };
  }, [listings]);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard
            title="Total Listings"
            value={stats.totalListings}
            icon={Building2}
          />
          <KpiCard
            title="Upcoming Bookings"
            value={stats.upcomingBookings}
            icon={Calendar}
          />
          <KpiCard
            title="Past Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          {stats.activities.length > 0 ? (
            <div className="space-y-4">
              {stats.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
