const records = [
  ['JH-22-1048-0021', 'Ananya Soren', '2.47', 'Agricultural', 'Khunti, Jharkhand', 'Low', 'Verified', 'Agriculture', '12/4'],
  ['JH-22-1048-0022', 'Ritesh Munda', '1.82', 'Agricultural', 'Khunti, Jharkhand', 'Medium', 'Under review', 'Agriculture', '13/1'],
  ['JH-22-1048-0023', 'Meera Toppo', '3.16', 'Residential', 'Ranchi, Jharkhand', 'High', 'Disputed', 'Residential', '44/7'],
  ['JH-22-1048-0024', 'Arun Kachhap', '0.94', 'Agricultural', 'Khunti, Jharkhand', 'Low', 'Verified', 'Agriculture', '14/2'],
  ['JH-22-1048-0025', 'Sushila Kerketta', '1.28', 'Commercial', 'Ranchi, Jharkhand', 'Medium', 'Pending mutation', 'Mixed use', '08/6'],
  ['JH-22-1048-0026', 'Devendra Horo', '4.03', 'Agricultural', 'Gumla, Jharkhand', 'High', 'Verification required', 'Agriculture', '21/9'],
  ['JH-22-1048-0027', 'Lata Minz', '2.11', 'Government', 'Lohardaga, Jharkhand', 'Low', 'Verified', 'Public facility', '31/2'],
  ['JH-22-1048-0028', 'Nikhil Bara', '1.67', 'Agricultural', 'Khunti, Jharkhand', 'Medium', 'Verified', 'Agriculture', '18/3'],
  ['JH-22-1048-0029', 'Pooja Lakra', '0.72', 'Residential', 'Ranchi, Jharkhand', 'Low', 'Verified', 'Residential', '56/1'],
  ['JH-22-1048-0030', 'Sanjay Tirkey', '5.24', 'Industrial', 'Ramgarh, Jharkhand', 'High', 'Under review', 'Industrial', '09/11'],
];

export const parcels = records.map((r, i) => ({
  ulpin: r[0], owner: r[1], area: r[2], landType: r[3], location: r[4], risk: r[5], status: r[6], currentUse: r[7], surveyNumber: r[8],
  registeredValue: `₹${(18 + i * 4.7).toFixed(1)} lakh`,
  applicationStatus: r[6],
  ownershipHistory: [
    { year: '2019', owner: `Previous owner ${String.fromCharCode(65 + i)}`, event: 'Ownership recorded' },
    { year: '2022', owner: `Previous owner ${String.fromCharCode(70 + i)}`, event: 'Mutation registered' },
    { year: '2025', owner: r[1], event: 'Current ownership verified' },
  ],
  riskScores: { document: 18 + i * 3, ownership: 14 + i * 4, mutation: 12 + i * 2, transaction: 20 + i, encroachment: 8 + i * 3, overall: 22 + i * 5 },
}));

export const parcelGeoJSON = {
  type: 'FeatureCollection',
  features: parcels.map((parcel, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const lat = 23.36 + row * 0.018;
    const lng = 85.29 + col * 0.023;
    return {
      type: 'Feature',
      properties: { ...parcel, id: index + 1, state: parcel.risk === 'High' ? 'high-risk' : parcel.status.toLowerCase().includes('pending') ? 'pending' : parcel.status === 'Disputed' ? 'disputed' : 'normal' },
      geometry: { type: 'Polygon', coordinates: [[[lng, lat], [lng + 0.014, lat + 0.002], [lng + 0.012, lat + 0.012], [lng - 0.002, lat + 0.01], [lng, lat]]] },
    };
  }),
};
