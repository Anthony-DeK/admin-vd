export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  apartment: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  guests: number;
  createdAt: string;
  notes?: string;
}

export interface Apartment {
  id: string;
  name: string;
  type: 'studio' | '1bed' | '2bed' | '3bed';
  max_guests: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}