import { create } from 'zustand';

export interface Listing {
  id: string;
  title: string;
  location: string;
  thumbnail: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  airbnbPrice: number;
  bookingPrice: number;
  vrboPrice: number;
  syncStatus: 'synced' | 'pending' | 'error';
  description?: string;
  amenities?: string[];
  photos?: string[];
  availability?: {
    date: string;
    available: boolean;
    bookedBy?: 'airbnb' | 'booking' | 'vrbo';
    blocked?: boolean;
    guestName?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }[];
}

export interface Chat {
  id: string;
  guestName: string;
  platform: 'airbnb' | 'booking' | 'vrbo';
  preview: string;
  isAuto: boolean;
  messages: { text: string; sender: 'guest' | 'host'; timestamp: string }[];
}

export interface BookingRequest {
  id: string;
  guestName: string;
  platform: 'airbnb' | 'booking' | 'vrbo';
  guests: number;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'approved' | 'declined';
  propertyTitle: string;
  totalPrice: number;
  platformSpecific?: {
    geniusLevel?: number; // Booking.com
    guestRating?: number; // Airbnb
    verified?: boolean; // VRBO
  };
}

export interface PricingData {
  competitors: {
    name: string;
    distance: string;
    rating: number;
    price: number;
    availability: boolean;
  }[];
  recommendation: {
    price: number;
    confidence: number;
    explanation: string;
  };
  trend: {
    dates: string[];
    yourPrice: number[];
    competitorAvg: number[];
    competitorMin: number[];
  };
}

export interface Activity {
  id: string;
  type: 'booking' | 'sync' | 'price' | 'message' | 'cleaning';
  message: string;
  timestamp: string;
}

interface AutomationStatus {
  listingSync: 'active' | 'warning' | 'error';
  priceSync: 'active' | 'warning' | 'error';
  messaging: 'active' | 'warning' | 'error';
  cleaning: 'active' | 'warning' | 'error';
  offboarding: 'active' | 'warning' | 'error';
}

interface CleaningSchedule {
  id: string;
  date: string;
  cleaner: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  property: string;
}

interface Store {
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;

  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;

  listings: Listing[];
  setListings: (listings: Listing[]) => void;
  addListing: (listing: Partial<Listing>) => void;
  updateListing: (listing: Partial<Listing>) => void;

  chats: Chat[];
  setChats: (chats: Chat[]) => void;

  bookingRequests: BookingRequest[];
  setBookingRequests: (requests: BookingRequest[]) => void;

  pricingData: PricingData | null;
  setPricingData: (data: PricingData) => void;

  automationStatus: AutomationStatus;
  setAutomationStatus: (status: Partial<AutomationStatus>) => void;

  recentActivity: Activity[];
  addActivity: (activity: Activity) => void;

  cleaningSchedule: CleaningSchedule[];
  setCleaningSchedule: (schedule: CleaningSchedule[]) => void;

  kpis: {
    totalListings: number;
    upcomingBookings: number;
    revenue: number;
  };
  setKpis: (kpis: Partial<Store['kpis']>) => void;
}

export const useStore = create<Store>((set) => ({
  selectedListing: null,
  setSelectedListing: (listing) => set({ selectedListing: listing }),

  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),

  listings: [],
  setListings: (listings) => set({ listings }),
  addListing: (listing) => set((state) => ({
    listings: [
      ...state.listings,
      {
        ...listing,
        id: `listing-${Date.now()}`,
        syncStatus: 'pending' as const,
      } as Listing,
    ],
  })),
  updateListing: (listing) => set((state) => ({
    listings: state.listings.map((l) => 
      l.id === listing.id ? { ...l, ...listing } : l
    ),
    selectedListing: state.selectedListing?.id === listing.id 
      ? { ...state.selectedListing, ...listing } 
      : state.selectedListing,
  })),

  chats: [],
  setChats: (chats) => set({ chats }),

  bookingRequests: [],
  setBookingRequests: (requests) => set({ bookingRequests: requests }),

  pricingData: null,
  setPricingData: (data) => set({ pricingData: data }),

  automationStatus: {
    listingSync: 'active',
    priceSync: 'active',
    messaging: 'active',
    cleaning: 'active',
    offboarding: 'active',
  },
  setAutomationStatus: (status) =>
    set((state) => ({
      automationStatus: { ...state.automationStatus, ...status },
    })),

  recentActivity: [],
  addActivity: (activity) =>
    set((state) => ({
      recentActivity: [activity, ...state.recentActivity].slice(0, 10),
    })),

  cleaningSchedule: [],
  setCleaningSchedule: (schedule) => set({ cleaningSchedule: schedule }),

  kpis: {
    totalListings: 0,
    upcomingBookings: 0,
    revenue: 0,
  },
  setKpis: (kpis) => set((state) => ({ kpis: { ...state.kpis, ...kpis } })),
}));
