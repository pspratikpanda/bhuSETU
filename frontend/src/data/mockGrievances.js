export const grievances = [
  { id: 'GR-2026-00042', type: 'Incorrect land record', ulpin: 'JH-22-1048-0021', submitted: '20 Sep 2026', status: 'Assigned for review' },
  { id: 'GR-2026-00039', type: 'Mutation delay', ulpin: 'JH-22-1048-0025', submitted: '16 Sep 2026', status: 'In progress' },
  { id: 'GR-2026-00031', type: 'Boundary issue', ulpin: 'JH-22-1048-0026', submitted: '08 Sep 2026', status: 'Additional information needed' },
  ...Array.from({ length: 7 }, (_, i) => ({ id: `GR-2026-${String(28 - i).padStart(5, '0')}`, type: ['Ownership issue', 'Encroachment', 'Other'][i % 3], ulpin: `JH-22-1048-00${21 + i}`, submitted: `${i + 1} Sep 2026`, status: i % 2 ? 'Resolved' : 'Submitted' })),
];
