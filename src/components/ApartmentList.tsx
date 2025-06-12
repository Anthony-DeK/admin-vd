import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Apartment {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  is_available: boolean;
}

export function ApartmentList() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchApartments();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid gap-4">
      {apartments.map((apartment) => (
        <div key={apartment.id} className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">{apartment.title}</h2>
          <p className="text-gray-600">{apartment.description}</p>
          <p className="font-semibold">${apartment.price}/month</p>
          <p>{apartment.location}</p>
          <p>{apartment.bedrooms} beds • {apartment.bathrooms} baths</p>
          <p className={apartment.is_available ? 'text-green-600' : 'text-red-600'}>
            {apartment.is_available ? 'Available' : 'Not Available'}
          </p>
        </div>
      ))}
    </div>
  );
} 