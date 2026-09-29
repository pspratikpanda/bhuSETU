import { parcels } from '../../data/mockParcels';

// TODO: Replace mock implementation with REST API when the backend is available.
export const getParcels = async () => parcels;
export const getParcelByULPIN = async (ulpin) => parcels.find((parcel) => parcel.ulpin.toLowerCase() === ulpin.toLowerCase());
export const searchParcels = async (query, field = 'all') => {
  const value = query.trim().toLowerCase();
  if (!value) return parcels;
  return parcels.filter((parcel) => {
    const fields = field === 'all' ? [parcel.ulpin, parcel.owner, parcel.surveyNumber, parcel.location, parcel.landType] : [parcel[field] || ''];
    return fields.some((entry) => entry.toLowerCase().includes(value));
  });
};
