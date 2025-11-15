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
    
    // Get first day of current and previous month
    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const upcomingBookingsSet = new Set<string>();
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    const activities: Array<{ id: string; message: string; timestamp: string; }> = [];
    
    listings.forEach((listing) => {
      if (!listing.availability) return;
      
      // Accumulate monthly revenue per night
      listing.availability.forEach((a) => {
        if (!a.bookedBy) return;
        const d = parseISO(a.date);
        const basePrice = a.bookedBy === 'airbnb' ? listing.airbnbPrice :
                      a.bookedBy === 'booking' ? listing.bookingPrice :
                      listing.vrboPrice;
        const price = basePrice && basePrice > 0 
          ? basePrice 
          : (a.bookedBy === 'airbnb' ? 150 : a.bookedBy === 'booking' ? 140 : 130);
        if (d >= firstDayThisMonth && d <= today) thisMonthRevenue += price;
        else if (d >= firstDayLastMonth && d <= lastDayLastMonth) lastMonthRevenue += price;
      });

      // Group bookings by guest and platform to count unique reservations
      const bookingGroups = new Map<string, any>();
      
      listing.availability.forEach((availability) => {
        if (!availability.bookedBy || !availability.guestName) return;
        
        const key = `${listing.id}-${availability.guestName}-${availability.bookedBy}`;
        
        if (!bookingGroups.has(key)) {
          bookingGroups.set(key, {
            dates: [availability.date],
            isPast: availability.isPast,
            bookedBy: availability.bookedBy,
            guestName: availability.guestName
          });
        } else {
          bookingGroups.get(key).dates.push(availability.date);
        }
      });

      // Count unique upcoming bookings
      bookingGroups.forEach((booking, key) => {
        const sortedDates = booking.dates.sort();
        const lastDate = parseISO(sortedDates[sortedDates.length - 1]);
        if (isAfter(lastDate, today) || format(lastDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
          upcomingBookingsSet.add(key);
        }
      });
    });

    // Calculate revenue change percentage
    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

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
      upcomingBookings: upcomingBookingsSet.size,
      thisMonthRevenue,
      revenueChange: revenueChange.toFixed(1),
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
            title="Revenue This Month"
            value={`$${stats.thisMonthRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ 
              value: `${stats.revenueChange}% vs last month`, 
              isPositive: parseFloat(stats.revenueChange) >= 0 
            }}
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
