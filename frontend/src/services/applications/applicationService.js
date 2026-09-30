import { applications } from '../../data/mockApplications';

let localApplications = [...applications];
const API_URL = '/api/v1/applications';

export const getApplications = async () => {
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localApplications = json.data;
        return json.data;
      }
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local applications list:', error);
  }
  return localApplications;
};

export const getApplication = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, searching local applications:', error);
  }
  return localApplications.find((app) => app.id === id) || localApplications[0];
};

export const submitApplication = async (values) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localApplications = [json.data, ...localApplications];
        return json.data;
      }
    }
  } catch (error) {
    console.warn('Backend API unavailable, submitting locally:', error);
  }

  const record = {
    id: `MU-2026-${String(125 + localApplications.length).padStart(4, '0')}`,
    applicant: 'Ananya Soren',
    ulpin: values.ulpin,
    type: values.type || 'Mutation',
    submitted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Submitted',
    priority: 'Normal',
    department: 'Revenue Circle, Khunti',
    step: 1
  };
  localApplications = [record, ...localApplications];
  return record;
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/${id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: status })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, updating status locally:', error);
  }

  localApplications = localApplications.map((app) =>
    app.id === id ? { ...app, status } : app
  );
  return getApplication(id);
};
