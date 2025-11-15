import { Listing, Chat, PricingData, Activity } from '@/store/useStore';

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    location: 'San Francisco, CA',
    thumbnail: 'https://images.unsplash.com/photo-1502672260066-6bc36a5c10e1?w=400&h=300&fit=crop',
    airbnbPrice: 250,
    bookingPrice: 245,
    vrboPrice: 260,
    syncStatus: 'synced',
    description: 'Beautiful modern loft in the heart of downtown',
    amenities: ['WiFi', 'Kitchen', 'Workspace', 'Parking'],
    photos: [
      'https://images.unsplash.com/photo-1502672260066-6bc36a5c10e1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '2',
    title: 'Beachfront Villa',
    location: 'Malibu, CA',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    airbnbPrice: 450,
    bookingPrice: 440,
    vrboPrice: 465,
    syncStatus: 'synced',
    description: 'Stunning oceanfront property with private beach access',
    amenities: ['Beach Access', 'Pool', 'Hot Tub', 'BBQ'],
    photos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '3',
    title: 'Mountain Cabin Retreat',
    location: 'Lake Tahoe, CA',
    thumbnail: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&fit=crop',
    airbnbPrice: 180,
    bookingPrice: 175,
    vrboPrice: 185,
    syncStatus: 'pending',
    description: 'Cozy cabin surrounded by nature',
    amenities: ['Fireplace', 'Hiking', 'Lake View', 'Pet Friendly'],
  },
];

export const mockChats: Chat[] = [
  {
    id: '1',
    guestName: 'Sarah Johnson',
    platform: 'airbnb',
    preview: 'What time is check-in?',
    isAuto: true,
    messages: [
      { text: 'Hi! What time is check-in?', sender: 'guest', timestamp: '2:30 PM' },
      { text: 'Check-in is at 3:00 PM. Looking forward to hosting you!', sender: 'host', timestamp: '2:35 PM' },
    ],
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    platform: 'booking',
    preview: 'Is parking included?',
    isAuto: false,
    messages: [
      { text: 'Is parking included with the booking?', sender: 'guest', timestamp: '11:20 AM' },
    ],
  },
  {
    id: '3',
    guestName: 'Emma Davis',
    platform: 'vrbo',
    preview: 'Thank you for the stay!',
    isAuto: true,
    messages: [
      { text: 'Thank you for the wonderful stay!', sender: 'guest', timestamp: 'Yesterday' },
      { text: 'Thank you for being a great guest! We hope to host you again.', sender: 'host', timestamp: 'Yesterday' },
    ],
  },
];

export const mockPricingData: PricingData = {
  competitors: [
    { name: 'Sunset View Apt', distance: '0.3 mi', rating: 4.8, price: 245, availability: true },
    { name: 'City Center Studio', distance: '0.5 mi', rating: 4.6, price: 230, availability: true },
    { name: 'Downtown Retreat', distance: '0.7 mi', rating: 4.9, price: 265, availability: false },
    { name: 'Urban Oasis', distance: '1.2 mi', rating: 4.7, price: 240, availability: true },
  ],
  recommendation: {
    price: 255,
    confidence: 87,
    explanation: 'Based on location, amenities, and current demand, we recommend $255/night for optimal occupancy and revenue.',
  },
  trend: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    yourPrice: [250, 250, 250, 250, 250, 280, 280],
    competitorAvg: [245, 242, 248, 250, 255, 270, 275],
    competitorMin: [230, 228, 235, 238, 240, 250, 255],
  },
};

export const mockActivities: Activity[] = [
  { id: '1', type: 'booking', message: 'New booking for Modern Downtown Loft', timestamp: '2 hours ago' },
  { id: '2', type: 'sync', message: 'Listing synced across all platforms', timestamp: '4 hours ago' },
  { id: '3', type: 'price', message: 'Price updated for Beachfront Villa', timestamp: '6 hours ago' },
  { id: '4', type: 'message', message: 'Guest message handled automatically', timestamp: '8 hours ago' },
  { id: '5', type: 'cleaning', message: 'Cleaning scheduled for tomorrow', timestamp: '1 day ago' },
];

export const fakeApiCall = async (endpoint: string, payload?: any): Promise<any> => {
  console.log(`API Call: ${endpoint}`, payload);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: payload });
    }, 500);
  });
};
