import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BookingCalendar, BookingList, BookingForm, ApartmentList } from './components';
import { BookingModal } from './components/BookingModal';
import { Booking, Apartment } from './types';
import { SupabaseTest } from './components/SupabaseTest';
import { supabase } from './lib/supabase';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'bookings' | 'calendar' | 'apartments' | 'settings' | 'supabase-test'>('dashboard');
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
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
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
    } catch (err) {
      console.error('Error fetching bookings:', err);
      alert('Failed to load bookings');
    }
  };

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

  const handleDeleteBooking = async (bookingId: number) => {
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
      const apartmentId = typeof bookingData.apartment === 'string' 
        ? parseInt(bookingData.apartment, 10)
        : bookingData.apartment;

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
            apartment_id: apartmentId,
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
            apartment_id: apartmentId,
            status: bookingData.status,
            total_amount: bookingData.totalAmount,
            guests: bookingData.guests,
            notes: bookingData.notes,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      await fetchBookings();
      setIsModalOpen(false);
      setEditingBooking(undefined);
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Failed to save booking');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard bookings={bookings} />;
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
            <BookingList
              bookings={bookings}
              onEdit={(booking: Booking) => {
                setEditingBooking(booking);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteBooking}
            />
          </>
        );
      case 'calendar':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Calendar</h2>
            <BookingCalendar bookings={bookings} />
          </div>
        );
      case 'apartments':
        return <ApartmentList />;
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
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Villa Divona</h1>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left px-4 py-2 ${
              currentView === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('bookings')}
            className={`w-full text-left px-4 py-2 ${
              currentView === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`w-full text-left px-4 py-2 ${
              currentView === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setCurrentView('apartments')}
            className={`w-full text-left px-4 py-2 ${
              currentView === 'apartments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Apartments
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {renderCurrentView()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <BookingForm
              booking={editingBooking}
              onSave={handleSaveBooking}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingBooking(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;