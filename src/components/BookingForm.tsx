import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { supabase } from '../lib/supabase';

interface BookingFormProps {
  booking?: Booking;
  onSave: (bookingData: Partial<Booking>) => void;
  onCancel: () => void;
}

interface Apartment {
  id: number;
  name: string;
}

export function BookingForm({ booking, onSave, onCancel }: BookingFormProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [formData, setFormData] = useState({
    guestName: booking?.guestName || '',
    guestEmail: booking?.guestEmail || '',
    guestPhone: booking?.guestPhone || '',
    checkIn: booking?.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : '',
    checkOut: booking?.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : '',
    apartment: booking?.apartment ? String(booking.apartment) : '',
    status: booking?.status || 'pending',
    totalAmount: booking?.totalAmount || 0,
    guests: booking?.guests || 1,
    notes: booking?.notes || ''
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setApartments(data || []);
    } catch (err) {
      console.error('Error fetching apartments:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      apartment: parseInt(formData.apartment, 10)
    };
    onSave(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guest Name</label>
          <input
            type="text"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guest Email</label>
          <input
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guest Phone</label>
          <input
            type="tel"
            name="guestPhone"
            value={formData.guestPhone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Apartment</label>
          <select
            name="apartment"
            value={formData.apartment}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select an apartment</option>
            {apartments.map(apt => (
              <option key={apt.id} value={apt.id}>
                {apt.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Check In</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Check Out</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
          <input
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </form>
  );
} 