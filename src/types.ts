export interface Booking {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  apartment: string | number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  guests: number;
  createdAt: string;
  notes?: string;
}

export interface Apartment {
  id: number;
  name: string;
  type: string;
  max_guests: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  is_available: boolean;
  created_at: string;
}

export interface ApartmentDetails {
  id?: number;
  apartment_id: number;
  short_description: string;
  long_description: string;
  amenities: string[];
  house_rules: string[];
  cover_image: string;
  images: string[];
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  created_at?: string;
} 