import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '../types';

interface BookingCalendarProps {
  bookings: Booking[];
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(date);
      return currentDate >= checkIn && currentDate <= checkOut;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayBookings = getBookingsForDate(dateString);
    const isToday = new Date().toDateString() === new Date(dateString).toDateString();

    days.push(
      <div
        key={day}
        className={`h-24 border border-gray-100 p-2 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'} transition-colors cursor-pointer`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayBookings.slice(0, 2).map((booking, index) => (
            <div
              key={`${booking.id}-${index}`}
              className={`text-xs px-2 py-1 rounded text-white truncate ${
                booking.status === 'confirmed' ? 'bg-green-500' :
                booking.status === 'pending' ? 'bg-yellow-500' :
                booking.status === 'cancelled' ? 'bg-red-500' :
                'bg-gray-500'
              }`}
              title={`${booking.guestName} - ${booking.apartment}`}
            >
              {booking.guestName}
            </div>
          ))}
          {dayBookings.length > 2 && (
            <div className="text-xs text-gray-500 px-2">
              +{dayBookings.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {days}
        </div>
      </div>
    </div>
  );
};