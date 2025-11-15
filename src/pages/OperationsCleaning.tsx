import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, CheckCircle } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

const statusColors = {
  scheduled: 'bg-primary text-primary-foreground',
  'in-progress': 'bg-warning text-warning-foreground',
  completed: 'bg-success text-success-foreground',
};

const cleaners = ['Maria Garcia', 'John Smith', 'Lisa Brown', 'David Wilson'];

export default function OperationsCleaning() {
  const { listings } = useListings();

  const { upcomingTasks, completedTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming: Array<{
      id: string;
      date: string;
      cleaner: string;
      status: 'scheduled' | 'in-progress';
      property: string;
      guestName: string;
      checkOutTime: string;
    }> = [];
    
    const completed: Array<{
      id: string;
      date: string;
      cleaner: string;
      property: string;
      guestName: string;
      rating: number;
    }> = [];

    listings.forEach((listing) => {
      if (!listing.availability) return;

      // Group bookings by guest and date range
      const bookings = listing.availability.filter(a => a.bookedBy && a.guestName);
      
      // Find check-out dates (last day of each booking)
      const processedBookings = new Map<string, any>();
      
      bookings.forEach((booking) => {
        const key = `${listing.id}-${booking.guestName}-${booking.bookedBy}`;
        
        if (!processedBookings.has(key)) {
          processedBookings.set(key, {
            listing,
            dates: [booking.date],
            booking
          });
        } else {
          processedBookings.get(key).dates.push(booking.date);
        }
      });

      // Create cleaning tasks for check-out dates
      processedBookings.forEach((data, key) => {
        const sortedDates = data.dates.sort();
        const checkOutDate = sortedDates[sortedDates.length - 1];
        const checkOutDateObj = parseISO(checkOutDate);
        
        const taskId = `clean-${key}-${checkOutDate}`;
        const cleaner = cleaners[Math.floor(Math.random() * cleaners.length)];
        
        if (data.booking.isPast) {
          // Past cleaning tasks
          completed.push({
            id: taskId,
            date: format(checkOutDateObj, 'MMM dd, yyyy'),
            cleaner,
            property: data.listing.title,
            guestName: data.booking.guestName || 'Guest',
            rating: Math.floor(Math.random() * 2) + 4 // 4 or 5 stars
          });
        } else if (isAfter(checkOutDateObj, today) || format(checkOutDateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
          // Upcoming cleaning tasks
          const isToday = format(checkOutDateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          upcoming.push({
            id: taskId,
            date: format(checkOutDateObj, 'MMM dd, yyyy'),
            cleaner,
            status: isToday ? 'in-progress' : 'scheduled',
            property: data.listing.title,
            guestName: data.booking.guestName || 'Guest',
            checkOutTime: data.booking.checkOut || '11:00'
          });
        }
      });
    });

    // Sort by date
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      upcomingTasks: upcoming,
      completedTasks: completed.slice(0, 10) // Show last 10
    };
  }, [listings]);

  const handleAssignCleaner = async () => {
    await fakeApiCall('/operations/cleaning/assign', {});
    toast.success('Cleaner assigned successfully');
  };

  return (
    <AppLayout title="Cleaning Operations">
      <div className="space-y-6">
        {/* Cleaning Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Upcoming Cleaning Schedule</h3>
            <Button onClick={handleAssignCleaner}>
              <User className="h-4 w-4 mr-2" />
              Assign Cleaner
            </Button>
          </div>
          
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.property}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">Check-out: {item.checkOutTime}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{item.cleaner}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Guest: {item.guestName}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[item.status]}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming cleaning tasks scheduled</p>
          )}
        </Card>

        {/* Cleaning History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cleaning History</h3>
          {completedTasks.length > 0 ? (
            <div className="space-y-3">
              {completedTasks.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <h4 className="font-medium text-foreground">{item.property}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{item.cleaner}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">Guest: {item.guestName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={j < item.rating ? 'text-warning' : 'text-muted-foreground'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Rating</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cleaning history available</p>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
