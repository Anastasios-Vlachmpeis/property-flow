import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/KpiCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { mockListings, mockChats, mockActivities } from '@/lib/mockData';

const automationItems = [
  { name: 'Listing Sync', key: 'listingSync' as const },
  { name: 'Price Sync', key: 'priceSync' as const },
  { name: 'Messaging Automation', key: 'messaging' as const },
  { name: 'Cleaning Workflows', key: 'cleaning' as const },
  { name: 'Offboarding Workflows', key: 'offboarding' as const },
];

const statusColors = {
  active: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  error: 'bg-destructive text-destructive-foreground',
};

export default function Dashboard() {
  const { kpis, setKpis, automationStatus, recentActivity, setListings, setChats, addActivity } = useStore();

  useEffect(() => {
    // Initialize mock data
    setListings(mockListings);
    setChats(mockChats);
    setKpis({
      totalListings: mockListings.length,
      upcomingBookings: 12,
      revenue: 8450,
    });
    
    mockActivities.forEach((activity) => addActivity(activity));
  }, []);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Listings"
            value={kpis.totalListings}
            icon={Building2}
            trend={{ value: '+2 this month', isPositive: true }}
          />
          <KpiCard
            title="Upcoming Bookings"
            value={kpis.upcomingBookings}
            icon={Calendar}
            trend={{ value: '+18% vs last week', isPositive: true }}
          />
          <KpiCard
            title="Revenue (30 days)"
            value={`$${kpis.revenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: '+12% vs last month', isPositive: true }}
          />
          <KpiCard
            title="Automation Status"
            value="All Active"
            icon={Activity}
          />
        </div>

        {/* Automation Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Automation Status</h3>
          <div className="space-y-3">
            {automationItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <Badge className={statusColors[automationStatus[item.key]]}>
                  {automationStatus[item.key]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
