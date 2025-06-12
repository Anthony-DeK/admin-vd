import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingsList } from './components/BookingsList';
import { BookingModal } from './components/BookingModal';
import { Booking } from './types';
import { ApartmentList } from './components/ApartmentList';
import { SupabaseTest } from './components/SupabaseTest';
import { supabase } from './lib/supabase';
import ApartmentManagement from './components/ApartmentManagement';

interface Apartment {
  id: string;
  name: string;
  type: 'studio' | '1bed' | '2bed' | '3bed';
  max_guests: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  is_available: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<'bookings' | 'apartments' | 'apartment-management' | 'dashboard' | 'calendar' | 'settings' | 'supabase-test'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();

  // Fetch apartments from Supabase
  useEffect(() => {
    async function fetchApartments() {
      try {
        const { data, error } = await supabase
          .from('apartments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApartments(data || []);
      } catch (err) {
        console.error('Error fetching apartments:', err);
      }
    }

    fetchApartments();
  }, []);

  // Fetch bookings from Supabase
  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            apartment:apartments(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match our Booking interface
        const transformedBookings: Booking[] = (data || []).map(booking => ({
          id: booking.id,
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          guestPhone: booking.guest_phone,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          apartment: booking.apartment?.name || 'Unknown Apartment', // Use the apartment name
          status: booking.status,
          totalAmount: booking.total_amount,
          guests: booking.guests,
          createdAt: booking.created_at,
          notes: booking.notes
        }));

        setBookings(updateBookingStatuses(transformedBookings));
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    }

    fetchBookings();
  }, []);

  // Function to update booking statuses based on current date
  const updateBookingStatuses = (bookingsList: Booking[]): Booking[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookingsList.map(booking => {
      const checkOutDate = new Date(booking.checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      if (booking.status === 'confirmed' && checkOutDate < today) {
        return { ...booking, status: 'completed' as const };
      }

      return booking;
    });
  };

  const handleAddBooking = () => {
    setEditingBooking(undefined);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingId);

        if (error) throw error;
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Failed to delete booking');
      }
    }
  };

  const handleSaveBooking = async (bookingData: Partial<Booking>) => {
    try {
      if (editingBooking) {
        // Update existing booking
        const { error } = await supabase
          .from('bookings')
          .update({
            guest_name: bookingData.guestName,
            guest_email: bookingData.guestEmail,
            guest_phone: bookingData.guestPhone,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            apartment_id: bookingData.apartment, // This is the apartment ID
            status: bookingData.status,
            total_amount: bookingData.totalAmount,
            guests: bookingData.guests,
            notes: bookingData.notes
          })
          .eq('id', editingBooking.id);

        if (error) throw error;
      } else {
        // Add new booking
        const { error } = await supabase
          .from('bookings')
          .insert([{
            guest_name: bookingData.guestName,
            guest_email: bookingData.guestEmail,
            guest_phone: bookingData.guestPhone,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            apartment_id: bookingData.apartment, // This is the apartment ID
            status: bookingData.status,
            total_amount: bookingData.totalAmount,
            guests: bookingData.guests,
            notes: bookingData.notes
          }]);

        if (error) throw error;
      }

      // Refresh bookings after save
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          apartment:apartments(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedBookings: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        guestPhone: booking.guest_phone,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        apartment: booking.apartment?.name || 'Unknown Apartment',
        status: booking.status,
        totalAmount: booking.total_amount,
        guests: booking.guests,
        createdAt: booking.created_at,
        notes: booking.notes
      }));

      setBookings(updateBookingStatuses(transformedBookings));
      setIsModalOpen(false);
      setEditingBooking(undefined);
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Failed to save booking');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'bookings':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bookings</h2>
              <button
                onClick={() => {
                  setEditingBooking(undefined);
                  setIsModalOpen(true);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add New Booking
              </button>
            </div>
            <BookingsList
              bookings={bookings}
              onAddBooking={handleAddBooking}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          </>
        );
      case 'apartments':
        return <ApartmentList />;
      case 'apartment-management':
        return <ApartmentManagement />;
      case 'dashboard':
        return <Dashboard bookings={bookings} />;
      case 'calendar':
        return <BookingCalendar bookings={bookings} />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      case 'supabase-test':
        return <SupabaseTest />;
      default:
        return <Dashboard bookings={bookings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen fixed">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Villa Divona</h1>
            <nav>
              <button
                onClick={() => setCurrentView('bookings')}
                className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                  currentView === 'bookings'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setCurrentView('apartments')}
                className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                  currentView === 'apartments'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Apartments
              </button>
              <button
                onClick={() => setCurrentView('apartment-management')}
                className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                  currentView === 'apartment-management'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Manage Apartments
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {renderCurrentView()}
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBooking(undefined);
        }}
        onSave={handleSaveBooking}
        booking={editingBooking}
        apartments={apartments}
      />
    </div>
  );
}

export default App;