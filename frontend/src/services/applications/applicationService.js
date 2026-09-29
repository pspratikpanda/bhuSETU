import { applications } from '../../data/mockApplications';

let localApplications = [...applications];
// TODO: Replace mock implementation with REST API and persist officer decisions server-side.
export const getApplications = async () => localApplications;
export const getApplication = async (id) => localApplications.find((application) => application.id === id);
export const submitApplication = async (values) => {
  const record = { id: `MU-2026-${String(125 + localApplications.length).padStart(5, '0')}`, applicant: 'Ananya Soren', ulpin: values.ulpin, type: values.type || 'Mutation', submitted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Submitted', priority: 'Normal', department: 'Revenue Circle, Khunti', step: 1 };
  localApplications = [record, ...localApplications];
  return record;
};
export const updateApplicationStatus = async (id, status) => {
  localApplications = localApplications.map((application) => application.id === id ? { ...application, status } : application);
  return getApplication(id);
};
