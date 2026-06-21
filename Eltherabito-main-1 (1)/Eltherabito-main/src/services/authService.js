const BASE_URL = 'https://mentalhealth01.runasp.net/api';

const authService = {

  async register(formData) {
    const payload = {
      firstName:   formData.firstName,
      lastName:    formData.lastName,
      email:       formData.email,
      password:    formData.password,
      phoneNumber: formData.phonePrefix + formData.phone,
      age        : formData.age,
      gender:      formData.gender === 'male' ? 0 : 1,
    };

    const res = await fetch(`${BASE_URL}/Authentication/Register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Registration failed');
    }

    return res.json(); // { firstName, lastName, email, token }
  },

  async login({ email, password }) {
    const res = await fetch(`${BASE_URL}/Authentication/Login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Backend error: Invalid email or password');
    }

    return res.json(); // { firstName, lastName, email, token }
  },

};

export default authService;