import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Booking, Apartment } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Partial<Booking>) => void;
  booking?: Booking;
  apartments: Apartment[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  booking,
  apartments
}) => {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    apartment: '',
    status: 'pending' as Booking['status'],
    totalAmount: 0,
    guests: 1,
    notes: ''
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        apartment: booking.apartment,
        status: booking.status,
        totalAmount: booking.totalAmount,
        guests: booking.guests,
        notes: booking.notes || ''
      });
    } else {
      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkIn: '',
        checkOut: '',
        apartment: apartments[0]?.name || '',
        status: 'pending',
        totalAmount: 0,
        guests: 1,
        notes: ''
      });
    }
  }, [booking, apartments, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: booking?.id,
      createdAt: booking?.createdAt || new Date().toISOString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {booking ? 'Edit Booking' : 'Add New Booking'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name *
              </label>
              <input
                type="text"
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="guestEmail"
                name="guestEmail"
                value={formData.guestEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="guestPhone"
                name="guestPhone"
                value={formData.guestPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                Apartment *
              </label>
              <select
                id="apartment"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              >
                {apartments.map(apt => (
                  <option key={apt.id} value={apt.name}>{apt.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date *
              </label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests *
              </label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount ($) *
              </label>
              <input
                type="number"
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              placeholder="Any special requests or notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
            >
              {booking ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};