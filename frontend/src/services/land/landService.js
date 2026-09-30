import { parcels } from '../../data/mockParcels';

const API_URL = '/api/v1/parcels';

export const getParcels = async () => {
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local parcel records:', error);
  }
  return parcels;
};

export const getParcelByULPIN = async (ulpin) => {
  try {
    const res = await fetch(`${API_URL}/${ulpin}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, searching local parcels:', error);
  }
  return parcels.find((parcel) => parcel.ulpin.toLowerCase() === ulpin.toLowerCase()) || parcels[0];
};

export const searchParcels = async (query, field = 'all') => {
  const value = query.trim().toLowerCase();
  if (!value) return getParcels();

  try {
    const res = await fetch(`${API_URL}?query=${encodeURIComponent(value)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, searching local parcels:', error);
  }

  return parcels.filter((parcel) => {
    const fields = field === 'all'
      ? [parcel.ulpin, parcel.owner, parcel.surveyNumber, parcel.location, parcel.landType]
      : [parcel[field] || ''];
    return fields.some((entry) => entry.toLowerCase().includes(value));
  });
};
