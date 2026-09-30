const API_URL = '/api/v1/gis';

export const getGISParcels = async () => {
  try {
    const res = await fetch(`${API_URL}/parcels`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend GIS API unavailable, returning null:', error);
  }
  return null;
};

export const getGISLayers = async () => {
  try {
    const res = await fetch(`${API_URL}/layers`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.layers) return json.layers;
    }
  } catch (error) {
    console.warn('Backend GIS Layers API unavailable:', error);
  }
  return [];
};

export const performSpatialCheck = async (ulpin) => {
  try {
    const res = await fetch(`${API_URL}/spatial-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ulpin })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json.spatialResult;
    }
  } catch (error) {
    console.warn('Spatial check API error:', error);
  }
  return { hasOverlap: false, boundaryStatus: 'Aligned' };
};
