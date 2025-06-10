import React from 'react';
import { Calendar, Users, DollarSign, Home } from 'lucide-react';
import { Booking } from '../types';

interface DashboardProps {
  bookings: Booking[];
}

export const Dashboard: React.FC<DashboardProps> = ({ bookings }) => {
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings.toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Confirmed',
      value: confirmedBookings.toString(),
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Pending',
      value: pendingBookings.toString(),
      icon: Home,
      color: 'bg-yellow-500',
      change: '+3%'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-coral-500',
      change: '+15%'
    }
  ];

  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingBookings = bookings
    .filter(b => new Date(b.checkIn) > new Date() && b.status === 'confirmed')
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{booking.guestName}</h4>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{booking.apartment}</p>
                    <p className="text-sm text-gray-500">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${booking.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Check-ins */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Check-ins</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{booking.guestName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{booking.apartment}</p>
                      <p className="text-sm text-blue-600">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{booking.guests} guests</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming check-ins</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};