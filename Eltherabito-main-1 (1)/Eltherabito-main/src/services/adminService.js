const BASE_URL = 'https://mentalhealth01.runasp.net/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('eltherabito-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const adminService = {
  async getStats() {
    const res = await fetch(`${BASE_URL}/Admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch statistics');
    }

    return res.json();
  },

  async getPatients() {
    const res = await fetch(`${BASE_URL}/Admin/patients`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch patients');
    }

    return res.json();
  },

  async addDoctor(formData) {
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender === 'male' ? 'Male' : 'Female',
      age: parseInt(formData.age),
      specialty: formData.specialty,
      yearsOfExperience: parseInt(formData.experience),
      email: formData.email,
      phoneNumber: formData.phone,
      password: formData.password,
    };

    const res = await fetch(`${BASE_URL}/Admin/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to add doctor');
    }

    return res.json();
  },

  async deletePatient(id) {
    const res = await fetch(`${BASE_URL}/Admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to delete patient');
    }

    return res.json();
  },

  async getDoctors() {
    const res = await fetch(`${BASE_URL}/Admin/doctors`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch doctors');
    }

    return res.json();
  },

  async getAppointmentAgenda(date) {
    const res = await fetch(`${BASE_URL}/appointments/Appointmentagenda?Date=${date}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch appointment agenda');
    }

    return res.json();
  },

  async updateAppointmentStatus(appointmentId, status) {
    const payload = {
      appointmentStatus: status,
    };

    const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to update appointment status');
    }

    return res.json();
  },

  async getPatientProfile(patientId) {
    const res = await fetch(`${BASE_URL}/appointments/viewprofile/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch patient profile');
    }

    return res.json();
  },
};

export default adminService;