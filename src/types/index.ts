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
  maxGuests: number;
}