import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingsList } from './components/BookingsList';
import { BookingModal } from './components/BookingModal';
import { mockBookings, apartments } from './data/mockData';
import { Booking } from './types';
import { ApartmentList } from './components/ApartmentList';
import { SupabaseTest } from './components/SupabaseTest';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();

  // Function to update booking statuses based on current date
  const updateBookingStatuses = (bookingsList: Booking[]): Booking[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    return bookingsList.map(booking => {
      const checkOutDate = new Date(booking.checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      // If booking is confirmed and check-out date has passed, mark as completed
      if (booking.status === 'confirmed' && checkOutDate < today) {
        return { ...booking, status: 'completed' as const };
      }

      return booking;
    });
  };

  // Initialize bookings with updated statuses
  useEffect(() => {
    const updatedBookings = updateBookingStatuses(mockBookings);
    setBookings(updatedBookings);
  }, []);

  const handleAddBooking = () => {
    setEditingBooking(undefined);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  const handleSaveBooking = (bookingData: Partial<Booking>) => {
    let updatedBookings: Booking[];

    if (editingBooking) {
      // Update existing booking
      updatedBookings = bookings.map(b => 
        b.id === editingBooking.id 
          ? { ...b, ...bookingData }
          : b
      );
    } else {
      // Add new booking
      const newBooking: Booking = {
        id: Date.now().toString(),
        guestName: bookingData.guestName!,
        guestEmail: bookingData.guestEmail!,
        guestPhone: bookingData.guestPhone!,
        checkIn: bookingData.checkIn!,
        checkOut: bookingData.checkOut!,
        apartment: bookingData.apartment!,
        status: bookingData.status!,
        totalAmount: bookingData.totalAmount!,
        guests: bookingData.guests!,
        createdAt: new Date().toISOString(),
        notes: bookingData.notes
      };
      updatedBookings = [...bookings, newBooking];
    }

    // Apply status updates to the new booking list
    const finalBookings = updateBookingStatuses(updatedBookings);
    setBookings(finalBookings);
    setIsModalOpen(false);
    setEditingBooking(undefined);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard bookings={bookings} />;
      case 'calendar':
        return <BookingCalendar bookings={bookings} />;
      case 'bookings':
        return (
          <BookingsList
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onEditBooking={handleEditBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      case 'apartments':
        return <ApartmentList />;
      case 'supabase-test':
        return <SupabaseTest />;
      default:
        return <Dashboard bookings={bookings} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
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