import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';

const automationSteps = [
  { name: 'Welcome message prepared', status: 'completed' },
  { name: 'Check-in instructions sent', status: 'completed' },
  { name: 'Calendar updated', status: 'in-progress' },
  { name: 'Smart lock code generated', status: 'pending' },
  { name: 'House manual sent', status: 'pending' },
];

export default function OperationsOnboarding() {
  const { listings } = useStore();
  const [formData, setFormData] = useState({
    guestName: '',
    checkIn: '',
    checkOut: '',
    property: '',
    platform: '',
    notes: '',
  });

  const handleStartOnboarding = async () => {
    await fakeApiCall('/operations/onboarding/start', formData);
    toast.success('Onboarding workflow started');
  };

  return (
    <AppLayout title="Guest Onboarding">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">New Guest Onboarding</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="Enter guest name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="property">Property</Label>
              <Select value={formData.property} onValueChange={(value) => setFormData({ ...formData, property: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {listings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platform">Booking Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="vrbo">Vrbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special requests, early check-in, etc."
                rows={3}
              />
            </div>

            <Button onClick={handleStartOnboarding} className="w-full" size="lg">
              Start Onboarding Flow
            </Button>
          </div>
        </Card>

        {/* Automation Log */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Automation Log</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Real-time status of automated onboarding steps
          </p>
          <div className="space-y-3">
            {automationSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                {step.status === 'completed' && <CheckCircle className="h-5 w-5 text-success shrink-0" />}
                {step.status === 'in-progress' && <Clock className="h-5 w-5 text-warning shrink-0 animate-pulse" />}
                {step.status === 'pending' && <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />}
                <span className="text-sm text-foreground">{step.name}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="text-sm font-semibold text-foreground mb-2">Next Steps</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Generate and send smart lock access code</li>
              <li>• Email comprehensive house manual</li>
              <li>• Schedule pre-arrival reminder (24h before)</li>
            </ul>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
