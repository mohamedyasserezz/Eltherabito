const BASE_URL = 'https://mentalhealth01.runasp.net/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('eltherabito-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// FormData requests must NOT set Content-Type manually — the browser needs to
// generate the multipart boundary itself, otherwise the backend can't parse the body.
const getAuthHeadersNoBody = () => {
  const token = localStorage.getItem('eltherabito-token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const patientService = {
  async getProfile() {
    const res = await fetch(`${BASE_URL}/Patient/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch patient profile');
    }

    return res.json();
  },

  async updateProfile(formData) {
    const payload = new FormData();
    payload.append('Email', formData.email);
    if (formData.phoneNumber) {
      payload.append('PhoneNumber', formData.phoneNumber);
    }
    if (formData.profilePicture) {
      payload.append('ProfilePicture', formData.profilePicture);
    }

    const res = await fetch(`${BASE_URL}/Patient/profile`, {
      method: 'PUT',
      headers: getAuthHeadersNoBody(),
      body: payload,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to update patient profile');
    }

    return res.json();
  },
};

export default patientService;
