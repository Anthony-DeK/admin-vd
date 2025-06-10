import { Booking, Apartment } from '../types';

export const apartments: Apartment[] = [
  { id: '1', name: 'Downtown Studio', type: 'studio', maxGuests: 2 },
  { id: '2', name: 'Riverside 1BR', type: '1bed', maxGuests: 3 },
  { id: '3', name: 'Central Park 2BR', type: '2bed', maxGuests: 4 },
  { id: '4', name: 'Luxury 3BR Suite', type: '3bed', maxGuests: 6 },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.johnson@email.com',
    guestPhone: '+1 (555) 123-4567',
    checkIn: '2025-01-15',
    checkOut: '2025-01-18',
    apartment: 'Downtown Studio',
    status: 'confirmed',
    totalAmount: 450,
    guests: 2,
    createdAt: '2025-01-10T10:00:00Z',
    notes: 'Early check-in requested'
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@email.com',
    guestPhone: '+1 (555) 234-5678',
    checkIn: '2025-01-20',
    checkOut: '2025-01-25',
    apartment: 'Riverside 1BR',
    status: 'pending',
    totalAmount: 625,
    guests: 2,
    createdAt: '2025-01-12T14:30:00Z'
  },
  {
    id: '3',
    guestName: 'Emma Wilson',
    guestEmail: 'emma.wilson@email.com',
    guestPhone: '+1 (555) 345-6789',
    checkIn: '2025-01-22',
    checkOut: '2025-01-28',
    apartment: 'Central Park 2BR',
    status: 'confirmed',
    totalAmount: 840,
    guests: 4,
    createdAt: '2025-01-08T09:15:00Z',
    notes: 'Celebrating anniversary'
  },
  {
    id: '4',
    guestName: 'David Rodriguez',
    guestEmail: 'david.rodriguez@email.com',
    guestPhone: '+1 (555) 456-7890',
    checkIn: '2025-01-18',
    checkOut: '2025-01-21',
    apartment: 'Luxury 3BR Suite',
    status: 'completed',
    totalAmount: 720,
    guests: 5,
    createdAt: '2025-01-05T16:45:00Z'
  },
  {
    id: '5',
    guestName: 'Lisa Thompson',
    guestEmail: 'lisa.thompson@email.com',
    guestPhone: '+1 (555) 567-8901',
    checkIn: '2025-02-01',
    checkOut: '2025-02-07',
    apartment: 'Downtown Studio',
    status: 'confirmed',
    totalAmount: 945,
    guests: 1,
    createdAt: '2025-01-14T11:20:00Z'
  }
];