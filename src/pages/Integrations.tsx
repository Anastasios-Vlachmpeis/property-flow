import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Link as LinkIcon, Settings } from 'lucide-react';
import { toast } from 'sonner';
import airbnbLogo from '@/assets/airbnb-logo.jpg';

interface Integration {
  id: string;
  name: string;
  icon?: string;
  iconImage?: string;
  color: string;
  connected: boolean;
  description: string;
  lastSync?: string;
}

const initialIntegrations: Integration[] = [
  {
    id: 'airbnb',
    name: 'Airbnb',
    iconImage: airbnbLogo,
    color: 'bg-[#FF385C]',
    connected: true,
    description: 'Sync your Airbnb listings, bookings, and calendar automatically',
    lastSync: new Date().toISOString(),
  },
  {
    id: 'booking',
    name: 'Booking.com',
    icon: '🏨',
    color: 'bg-[#003580]',
    connected: true,
    description: 'Connect to Booking.com to manage reservations and availability',
    lastSync: new Date().toISOString(),
  },
  {
    id: 'vrbo',
    name: 'Vrbo',
    icon: '🏡',
    color: 'bg-[#FFB400]',
    connected: true,
    description: 'Integrate with Vrbo to sync your vacation rental listings',
    lastSync: new Date().toISOString(),
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, connected: false, lastSync: undefined }
          : int
      )
    );
    toast.success(`${integrations.find(i => i.id === integrationId)?.name} disconnected`);
  };

  const handleSaveConnection = () => {
    if (!selectedIntegration) return;

    if (!apiKey || !apiSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIntegrations(prev =>
      prev.map(int =>
        int.id === selectedIntegration.id
          ? { ...int, connected: true, lastSync: new Date().toISOString() }
          : int
      )
    );

    toast.success(`${selectedIntegration.name} connected successfully`);
    setIsDialogOpen(false);
    setApiKey('');
    setApiSecret('');
    setSelectedIntegration(null);
  };

  return (
    <AppLayout title="Integrations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Platform Integrations</h2>
            <p className="text-muted-foreground mt-1">
              Connect your OTA accounts to sync listings, bookings, and availability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center text-2xl overflow-hidden`}>
                    {integration.iconImage ? (
                      <img src={integration.iconImage} alt={integration.name} className="w-full h-full object-cover" />
                    ) : (
                      integration.icon
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{integration.name}</h3>
                    {integration.connected ? (
                      <Badge className="bg-success text-success-foreground mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>

              {integration.connected && integration.lastSync && (
                <p className="text-xs text-muted-foreground mb-4">
                  Last synced: {new Date(integration.lastSync).toLocaleDateString()} at{' '}
                  {new Date(integration.lastSync).toLocaleTimeString()}
                </p>
              )}

              <div className="flex gap-2">
                {integration.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleConnect(integration)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleConnect(integration)}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Integration Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Automatic Calendar Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Keep availability updated across all platforms in real-time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Centralized Booking Management</h4>
                <p className="text-sm text-muted-foreground">
                  Manage all reservations from one unified dashboard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Price Synchronization</h4>
                <p className="text-sm text-muted-foreground">
                  Update prices once and sync across all connected platforms
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Unified Messaging</h4>
                <p className="text-sm text-muted-foreground">
                  Respond to guests from all platforms in one inbox
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect your {selectedIntegration?.name} account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="Enter your API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You can find your API credentials in your {selectedIntegration?.name} account settings
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
