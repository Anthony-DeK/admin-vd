import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Apartment, ApartmentDetails } from '../types';

interface ApartmentWithDetails extends Apartment {
  details?: ApartmentDetails;
}

export function ApartmentList() {
  const [apartments, setApartments] = useState<ApartmentWithDetails[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<ApartmentWithDetails | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const { data: apartmentsData, error: apartmentsError } = await supabase
        .from('apartments')
        .select(`
          *,
          details:apartment_details(*)
        `)
        .order('created_at', { ascending: false });

      if (apartmentsError) throw apartmentsError;
      setApartments(apartmentsData || []);
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setError('Failed to load apartments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingApartment(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (apartment: ApartmentWithDetails) => {
    setEditingApartment(apartment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this apartment?')) return;

    try {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchApartments();
    } catch (err) {
      console.error('Error deleting apartment:', err);
      alert('Failed to delete apartment');
    }
  };

  const uploadImages = async (apartmentId: number): Promise<string[]> => {
    if (!apartmentId) throw new Error('Apartment ID is required');
    
    const uploadedUrls: string[] = [];
    
    for (const image of selectedImages) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${apartmentId}/${Math.random()}.${fileExt}`;
      const filePath = `apartments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('apartments')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('apartments')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const uploadCoverImage = async (apartmentId: number): Promise<string> => {
    if (!apartmentId) throw new Error('Apartment ID is required');
    if (!coverImage) return '';

    const fileExt = coverImage.name.split('.').pop();
    const fileName = `${apartmentId}/cover.${fileExt}`;
    const filePath = `apartments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('apartments')
      .upload(filePath, coverImage);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('apartments')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveApartment = async (apartmentData: Partial<ApartmentWithDetails>) => {
    try {
      setUploadProgress(0);
      let apartmentId = editingApartment?.id;

      if (editingApartment) {
        // Update existing apartment
        const { error } = await supabase
          .from('apartments')
          .update({
            name: apartmentData.name,
            type: apartmentData.type,
            max_guests: apartmentData.max_guests,
            location: apartmentData.location,
            bedrooms: apartmentData.bedrooms,
            bathrooms: apartmentData.bathrooms,
            is_available: apartmentData.is_available
          })
          .eq('id', editingApartment.id);

        if (error) throw error;
        apartmentId = editingApartment.id;
      } else {
        // Add new apartment
        const { data, error } = await supabase
          .from('apartments')
          .insert([{
            name: apartmentData.name,
            type: apartmentData.type,
            max_guests: apartmentData.max_guests,
            location: apartmentData.location,
            bedrooms: apartmentData.bedrooms,
            bathrooms: apartmentData.bathrooms,
            is_available: apartmentData.is_available
          }])
          .select();

        if (error) throw error;
        if (!data?.[0]?.id) throw new Error('Failed to create apartment');
        apartmentId = data[0].id;
      }

      if (!apartmentId) throw new Error('Apartment ID is required');

      // Upload images if any
      let coverImageUrl = '';
      let imageUrls: string[] = [];

      if (coverImage) {
        coverImageUrl = await uploadCoverImage(apartmentId);
      }

      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(apartmentId);
      }

      // Update or insert apartment details
      const detailsData: ApartmentDetails = {
        apartment_id: apartmentId,
        short_description: apartmentData.details?.short_description || '',
        long_description: apartmentData.details?.long_description || '',
        amenities: apartmentData.details?.amenities || [],
        house_rules: apartmentData.details?.house_rules || [],
        base_price: apartmentData.details?.base_price || 0,
        cleaning_fee: apartmentData.details?.cleaning_fee || 0,
        service_fee: apartmentData.details?.service_fee || 0,
        cover_image: coverImageUrl || apartmentData.details?.cover_image || '',
        images: imageUrls.length > 0 ? imageUrls : apartmentData.details?.images || []
      };

      if (editingApartment?.details) {
        const { error } = await supabase
          .from('apartment_details')
          .update(detailsData)
          .eq('apartment_id', apartmentId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('apartment_details')
          .insert([{
            ...detailsData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      await fetchApartments();
      setIsModalOpen(false);
      setEditingApartment(undefined);
      setSelectedImages([]);
      setCoverImage(null);
    } catch (err) {
      console.error('Error saving apartment:', err);
      alert('Failed to save apartment');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Apartments</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Apartment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apartment) => (
          <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {apartment.details?.cover_image && (
              <img
                src={apartment.details.cover_image}
                alt={apartment.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{apartment.name}</h3>
              <p className="text-gray-600 mb-2">{apartment.details?.short_description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {apartment.bedrooms} beds
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {apartment.bathrooms} baths
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {apartment.max_guests} guests
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  ${apartment.details?.base_price}/night
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(apartment)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(apartment.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveApartment({
                name: formData.get('name') as string,
                type: formData.get('type') as string,
                max_guests: parseInt(formData.get('max_guests') as string),
                location: formData.get('location') as string,
                bedrooms: parseInt(formData.get('bedrooms') as string),
                bathrooms: parseInt(formData.get('bathrooms') as string),
                is_available: formData.get('is_available') === 'true',
                details: {
                  apartment_id: editingApartment?.id || 0,
                  short_description: formData.get('short_description') as string,
                  long_description: formData.get('long_description') as string,
                  amenities: (formData.get('amenities') as string).split(',').map(a => a.trim()),
                  house_rules: (formData.get('house_rules') as string).split(',').map(r => r.trim()),
                  base_price: parseFloat(formData.get('base_price') as string),
                  cleaning_fee: parseFloat(formData.get('cleaning_fee') as string),
                  service_fee: parseFloat(formData.get('service_fee') as string),
                  cover_image: editingApartment?.details?.cover_image || '',
                  images: editingApartment?.details?.images || []
                }
              });
            }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingApartment?.name}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <input
                    type="text"
                    name="type"
                    defaultValue={editingApartment?.type}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Guests</label>
                  <input
                    type="number"
                    name="max_guests"
                    defaultValue={editingApartment?.max_guests}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingApartment?.location}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    defaultValue={editingApartment?.bedrooms}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    defaultValue={editingApartment?.bathrooms}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price</label>
                  <input
                    type="number"
                    name="base_price"
                    defaultValue={editingApartment?.details?.base_price}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cleaning Fee</label>
                  <input
                    type="number"
                    name="cleaning_fee"
                    defaultValue={editingApartment?.details?.cleaning_fee}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Service Fee</label>
                  <input
                    type="number"
                    name="service_fee"
                    defaultValue={editingApartment?.details?.service_fee}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available</label>
                  <select
                    name="is_available"
                    defaultValue={editingApartment?.is_available?.toString()}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea
                  name="short_description"
                  defaultValue={editingApartment?.details?.short_description}
                  className="w-full p-2 border rounded"
                  rows={2}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Long Description</label>
                <textarea
                  name="long_description"
                  defaultValue={editingApartment?.details?.long_description}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  defaultValue={editingApartment?.details?.amenities?.join(', ')}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">House Rules (comma-separated)</label>
                <input
                  type="text"
                  name="house_rules"
                  defaultValue={editingApartment?.details?.house_rules?.join(', ')}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Additional Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                  className="w-full p-2 border rounded"
                />
              </div>

              {uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading images... {uploadProgress}%</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 