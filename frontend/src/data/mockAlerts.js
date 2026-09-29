export const alerts = [
  { id: 'AL-081', severity: 'High', title: 'Rapid ownership changes', detail: 'Four ownership changes recorded within seven months. Review chain of title and supporting documents.', ulpin: 'JH-22-1048-0026', confidence: 87, date: '26 Sep 2026', icon: 'activity' },
  { id: 'AL-076', severity: 'Medium', title: 'Area mismatch across records', detail: 'GIS measured area differs from the revenue record by 0.22 acres.', ulpin: 'JH-22-1048-0023', confidence: 79, date: '25 Sep 2026', icon: 'map' },
  { id: 'AL-069', severity: 'Warning', title: 'Document metadata inconsistency', detail: 'Registration date in document metadata differs from the declared transaction date.', ulpin: 'JH-22-1048-0025', confidence: 72, date: '24 Sep 2026', icon: 'file' },
  { id: 'AL-064', severity: 'Medium', title: 'Potential land-use change', detail: 'Recent imagery classification indicates built-up features on an agricultural parcel.', ulpin: 'JH-22-1048-0021', confidence: 76, date: '23 Sep 2026', icon: 'layers' },
  { id: 'AL-058', severity: 'High', title: 'Boundary overlap indicator', detail: 'Adjacent parcel boundaries overlap in the prototype cadastral layer.', ulpin: 'JH-22-1048-0030', confidence: 84, date: '22 Sep 2026', icon: 'triangle' },
  { id: 'AL-051', severity: 'Warning', title: 'Possible duplicate submission', detail: 'Two applications reference similar document identifiers and parcel details.', ulpin: 'JH-22-1048-0028', confidence: 69, date: '20 Sep 2026', icon: 'copy' },
];
