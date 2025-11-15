import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star, Calendar, MessageSquare, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';

const checklistItems = [
  { id: 'checkout', label: 'Checkout confirmation received', icon: Calendar },
  { id: 'cleaning', label: 'Trigger cleaning workflow', icon: RefreshCw },
  { id: 'review', label: 'Request guest review', icon: Star },
  { id: 'calendar', label: 'Reset calendar availability', icon: Calendar },
  { id: 'message', label: 'Send thank you message', icon: MessageSquare },
];

export default function OperationsOffboarding() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStartOffboarding = async () => {
    await fakeApiCall('/operations/offboarding/start', { completed: checkedItems });
    toast.success('Offboarding workflow started');
  };

  return (
    <AppLayout title="Guest Offboarding">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Checklist */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Offboarding Checklist</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Automated tasks to complete after guest checkout
          </p>
          
          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => handleToggle(item.id)}
                />
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <Label htmlFor={item.id} className="flex-1 text-sm font-medium cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          <Button onClick={handleStartOffboarding} className="w-full mt-6" size="lg">
            Start Offboarding Flow
          </Button>
        </Card>

        {/* Recent Offboardings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Offboardings</h3>
          <div className="space-y-3">
            {[
              { guest: 'Sarah Johnson', property: 'Modern Downtown Loft', date: '2024-01-12', status: 'Completed' },
              { guest: 'Michael Chen', property: 'Beachfront Villa', date: '2024-01-10', status: 'In Progress' },
              { guest: 'Emma Davis', property: 'Mountain Cabin Retreat', date: '2024-01-08', status: 'Completed' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{item.guest}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    item.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{item.property}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
