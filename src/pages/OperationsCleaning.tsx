import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';

const mockSchedule = [
  { id: '1', date: '2024-01-15', cleaner: 'Maria Garcia', status: 'scheduled', property: 'Modern Downtown Loft' },
  { id: '2', date: '2024-01-16', cleaner: 'John Smith', status: 'in-progress', property: 'Beachfront Villa' },
  { id: '3', date: '2024-01-17', cleaner: 'Maria Garcia', status: 'scheduled', property: 'Mountain Cabin Retreat' },
];

const mockHistory = [
  { date: '2024-01-10', cleaner: 'Maria Garcia', property: 'Modern Downtown Loft', rating: 5 },
  { date: '2024-01-09', cleaner: 'John Smith', property: 'Beachfront Villa', rating: 5 },
  { date: '2024-01-08', cleaner: 'Maria Garcia', property: 'Mountain Cabin Retreat', rating: 4 },
];

const statusColors = {
  scheduled: 'bg-primary text-primary-foreground',
  'in-progress': 'bg-warning text-warning-foreground',
  completed: 'bg-success text-success-foreground',
};

export default function OperationsCleaning() {
  const { cleaningSchedule, setCleaningSchedule } = useStore();

  useEffect(() => {
    setCleaningSchedule(mockSchedule as any);
  }, []);

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
            <h3 className="text-lg font-semibold text-foreground">Cleaning Schedule</h3>
            <Button onClick={handleAssignCleaner}>
              <User className="h-4 w-4 mr-2" />
              Assign Cleaner
            </Button>
          </div>
          
          <div className="space-y-3">
            {cleaningSchedule.map((item) => (
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
                      <span className="text-sm text-muted-foreground">{item.cleaner}</span>
                    </div>
                  </div>
                </div>
                <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Cleaning History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cleaning History</h3>
          <div className="space-y-3">
            {mockHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <h4 className="font-medium text-foreground">{item.property}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{item.cleaner}</span>
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
        </Card>
      </div>
    </AppLayout>
  );
}
