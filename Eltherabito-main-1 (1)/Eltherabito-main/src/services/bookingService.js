import { loadSavedContact } from '../utils/profileStorage';

const BASE_URL = 'https://mentalhealth01.runasp.net/api';

function getSavedUser() {
  try {
    const saved = localStorage.getItem('eltherabito-user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

async function readErrorMessage(res) {
  const text = await res.text().catch(() => '');
  if (!text) {
    return '';
  }

  try {
    const data = JSON.parse(text);
    return data.message || data.title || data.error || text;
  } catch {
    return text;
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('eltherabito-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// GET requests have no body, so they don't need Content-Type at all.
// Kept as a separate helper to avoid touching the POST/PUT/PATCH calls.
const getAuthHeadersNoBody = () => {
  const token = localStorage.getItem('eltherabito-token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const bookingService = {
  async getDoctors() {
    const res = await fetch(`${BASE_URL}/Doctors`, {
      method: 'GET',
      headers: getAuthHeadersNoBody(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch doctors');
    }

    return res.json();
  },

  async getDoctorSlots(doctorId, date) {
    const res = await fetch(`${BASE_URL}/Doctors/${doctorId}/slots?date=${date}`, {
      method: 'GET',
      headers: getAuthHeadersNoBody(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch doctor slots');
    }

    return res.json();
  },

  async getDoctorProfile() {
    const res = await fetch(`${BASE_URL}/Doctor/me`, {
      method: 'GET',
      headers: getAuthHeadersNoBody(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch doctor profile');
    }

    return res.json();
  },

  async getDoctorSchedules() {
    console.log('🔄 Fetching doctor schedules...');

    const res = await fetch(`${BASE_URL}/Doctor/me/schedules`, {
      method: 'GET',
      headers: getAuthHeadersNoBody(),
    });

    console.log('📨 Response status:', res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('❌ Error response:', text);
      let errorMessage = 'Backend error: Failed to fetch doctor schedules';

      try {
        const err = JSON.parse(text);
        errorMessage = err.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const text = await res.text().catch(() => '');
    console.log('✅ Response text:', text);

    if (!text) {
      console.log('⚠️ Empty response, returning empty array');
      return [];
    }

    try {
      const data = JSON.parse(text);
      console.log('✅ Parsed schedules:', data);

      const schedules = Array.isArray(data) ? data : [];

      // FIX: backend returns the weekday as "day", but every other
      // schedule-related call in this file (addScheduleSlot, changeDayStatus,
      // getScheduleSlotsForDay) uses "dayOfWeek". Without this mapping, any
      // component that reads slot.dayOfWeek from this response gets undefined
      // and ends up sending undefined back to changeDayStatus/deleteScheduleSlot.
      return schedules.map((slot) => ({
        ...slot,
        dayOfWeek: slot.dayOfWeek ?? slot.day,
      }));
    } catch {
      console.error('❌ Failed to parse schedules JSON');
      return [];
    }
  },

  async updateDoctorProfile(formData) {
    const payload = new FormData();
    payload.append('Specialty', formData.specialty);
    payload.append('YearsOfExp', formData.yearsOfExp);
    payload.append('SessionPrice', formData.sessionPrice);
    if (formData.profilePicture) {
      payload.append('ProfilePicture', formData.profilePicture);
    }

    const res = await fetch(`${BASE_URL}/Doctor/profile`, {
      method: 'PUT',
      headers: getAuthHeadersNoBody(), // FormData sets its own Content-Type (multipart boundary)
      body: payload,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to update doctor profile');
    }

    return res.json();
  },

  async deleteScheduleSlot(slotId) {
    console.log('🗑️ Deleting schedule slot:', slotId);

    const res = await fetch(`${BASE_URL}/DoctorSchedule/${slotId}`, {
      method: 'DELETE',
      headers: getAuthHeadersNoBody(),
    });

    console.log('📨 Delete response status:', res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('❌ Delete error response:', text);
      let errorMessage = `Failed to delete slot (${res.status})`;

      try {
        const err = JSON.parse(text);
        errorMessage = err.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('✅ Slot deleted successfully');
    return { success: true };
  },

  async changeDayStatus(dayOfWeek, isActive) {
    const payload = {
      dayOfWeek,
      isActive,
    };

    const res = await fetch(`${BASE_URL}/DoctorSchedule/schedule/day-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to change day status');
    }

    // Backend returns 204 No Content on success, so there's no JSON body to parse.
    return { success: true };
  },

  async addScheduleSlot(dayOfWeek, startTime, endTime) {
    // API expects flat structure with TimeOnly format (HH:mm:ss)
    const payload = {
      dayOfWeek,
      startTime: `${startTime}:00`,  // Convert 10:00 to 10:00:00
      endTime: `${endTime}:00`,      // Convert 11:00 to 11:00:00
    };

    console.log('📤 Sending addScheduleSlot request:');
    console.log('  dayOfWeek:', dayOfWeek);
    console.log('  startTime:', `${startTime}:00`);
    console.log('  endTime:', `${endTime}:00`);
    console.log('  Full Payload:', payload);
    console.log('📤 Stringified:', JSON.stringify(payload));

    const res = await fetch(`${BASE_URL}/DoctorSchedule/AddSlot`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    console.log('📨 Response status:', res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('❌ Error response text:', text);
      let errorMessage = 'Backend error: Failed to add schedule slot';

      try {
        const err = JSON.parse(text);
        if (err.errors) {
          const firstErrorKey = Object.keys(err.errors)[0];
          errorMessage = err.errors[firstErrorKey]?.[0] || err.message || errorMessage;
        } else {
          errorMessage = err.message || errorMessage;
        }
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const text = await res.text().catch(() => '');
    console.log('✅ Response text:', text);

    if (!text) {
      console.log('⚠️ Empty response body');
      return { id: null };
    }

    try {
      const data = JSON.parse(text);
      console.log('✅ Parsed response:', data);
      return data;
    } catch {
      console.log('✅ Non-JSON response, returning empty object');
      return { id: null };
    }
  },

  async getScheduleSlotsForDay(dayOfWeek) {
    console.log('🔄 Fetching slots for day:', dayOfWeek);

    const res = await fetch(`${BASE_URL}/DoctorSchedule/GetAllSlots/${dayOfWeek}`, {
      method: 'GET',
      headers: getAuthHeadersNoBody(),
    });

    console.log('📨 Response status:', res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('❌ Error response:', text);
      let errorMessage = `Failed to fetch slots for day ${dayOfWeek}`;

      try {
        const err = JSON.parse(text);
        errorMessage = err.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const text = await res.text().catch(() => '');
    console.log('✅ Response text:', text);

    if (!text) {
      console.log('⚠️ Empty response, returning empty array');
      return [];
    }

    try {
      const data = JSON.parse(text);
      console.log('✅ Parsed slots for day:', data);
      return Array.isArray(data) ? data : [];
    } catch {
      console.error('❌ Failed to parse slots JSON');
      return [];
    }
  },

  async bookAppointment(bookingData) {
    const user = getSavedUser();
    const { mobile, email } = loadSavedContact();
    const firstPatientName = bookingData.firstPatientName || user?.firstName || 'Patient';
    const lastPatientName = bookingData.lastPatientName || user?.lastName || 'User';

    const payload = {
      doctorId: bookingData.doctorId,
      doctorScheduleId: bookingData.doctorScheduleId,
      appointmentDate: bookingData.appointmentDate,
      firstPatientName,
      lastPatientName,
      phonePatient: bookingData.phonePatient || mobile,
      emailPatient: bookingData.emailPatient || user?.email || email,
    };

    const res = await fetch(`${BASE_URL}/appointments/BookAppoinment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await readErrorMessage(res);
      throw new Error(message || `Backend error: Failed to book appointment (${res.status})`);
    }

    const text = await res.text().catch(() => '');
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },

  async predictAssessment(assessmentData) {
    const res = await fetch(`${BASE_URL}/Assessment/Predict`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assessmentData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to predict assessment');
    }

    return res.json();
  },

  async getAppointments() {
    const res = await fetch(`${BASE_URL}/appointments/BooKing`, {
      method: 'GET',
      headers: getAuthHeadersNoBody(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Failed to fetch appointments');
    }

    return res.json();
  },
};

export default bookingService;
