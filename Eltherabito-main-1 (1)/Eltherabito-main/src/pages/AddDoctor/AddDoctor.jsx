import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserMd, FaMars, FaVenus, FaEye, FaEyeSlash, FaSave,
} from 'react-icons/fa';
import AppLayout from '../../components/layout/AppLayout';
import { BRAND } from '../../components/layout/navConfig';
import adminService from '../../services/adminService';
import styles from './AddDoctor.module.css';

const SPECIALTIES = [
  { value: '',           label: 'Select Medical Specialty' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'psychology', label: 'Clinical Psychology' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'therapy',    label: 'Psychotherapy' },
  { value: 'neurology',  label: 'Neurology' },
];

export default function AddDoctor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '', age: '',
    specialty: '', experience: '', email: '',
    phone: '', password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim())  e.firstName  = 'Required';
    if (!form.lastName.trim())   e.lastName   = 'Required';
    if (!form.gender)            e.gender     = 'Required';
    if (!form.age)               e.age        = 'Required';
    else if (form.age < 18 || form.age > 100) e.age = 'Must be 18–100';
    if (!form.specialty)         e.specialty  = 'Required';
    if (!form.experience && form.experience !== 0) e.experience = 'Required';
    if (!form.email.trim())      e.email      = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim())      e.phone      = 'Required';
    if (!form.password)          e.password   = 'Required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await adminService.addDoctor(form);
      showToast('✓ Doctor profile saved successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      showToast(err.message || 'Failed to add doctor', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      variant="admin"
      showSidebar={false}
      headerProps={{ subtitle: BRAND.adminTagline, logoHref: '/admin' }}
    >
      <main className={styles.main}>

        {/* Form header */}
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}><FaUserMd /></div>
          <div>
            <h1 className={styles.formTitle}>Add New Doctor</h1>
            <p className={styles.formSubtitle}>Create a new professional profile for the Eltherabito medical network.</p>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} noValidate>

            {/* ── PERSONAL INFORMATION ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>PERSONAL INFORMATION</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.firstName ? styles.inputErr : ''}`}
                    placeholder="e.g. Ahmad"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                  />
                  {errors.firstName && <p className={styles.err}>{errors.firstName}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.lastName ? styles.inputErr : ''}`}
                    placeholder="e.g. Mansour"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                  />
                  {errors.lastName && <p className={styles.err}>{errors.lastName}</p>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <div className={styles.genderOptions}>
                    {[
                      { val: 'male',   icon: <FaMars />,  label: 'Male' },
                      { val: 'female', icon: <FaVenus />, label: 'Female' },
                    ].map(g => (
                      <label
                        key={g.val}
                        className={`${styles.genderLabel} ${form.gender === g.val ? styles.genderSelected : ''}`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g.val}
                          checked={form.gender === g.val}
                          onChange={() => set('gender', g.val)}
                          className={styles.radioInput}
                        />
                        <span>{g.icon} {g.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <p className={styles.err}>{errors.gender}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Age</label>
                  <input
                    type="number"
                    className={`${styles.input} ${errors.age ? styles.inputErr : ''}`}
                    placeholder="e.g. 35"
                    min="18" max="100"
                    value={form.age}
                    onChange={e => set('age', e.target.value)}
                  />
                  {errors.age && <p className={styles.err}>{errors.age}</p>}
                </div>
              </div>
            </div>

            {/* ── PROFESSIONAL CREDENTIALS ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>PROFESSIONAL CREDENTIALS</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Specialty</label>
                  <select
                    className={`${styles.input} ${errors.specialty ? styles.inputErr : ''}`}
                    value={form.specialty}
                    onChange={e => set('specialty', e.target.value)}
                  >
                    {SPECIALTIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {errors.specialty && <p className={styles.err}>{errors.specialty}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Years of Experience</label>
                  <input
                    type="number"
                    className={`${styles.input} ${errors.experience ? styles.inputErr : ''}`}
                    placeholder="e.g. 10"
                    min="0" max="70"
                    value={form.experience}
                    onChange={e => set('experience', e.target.value)}
                  />
                  {errors.experience && <p className={styles.err}>{errors.experience}</p>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                    placeholder="doctor@eltherabito.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                  {errors.email && <p className={styles.err}>{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* ── CONTACT & SECURITY ── */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>CONTACT & SECURITY</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={styles.phoneGroup}>
                    <span className={styles.phonePrefix}>+20</span>
                    <input
                      type="tel"
                      className={`${styles.phoneInput} ${errors.phone ? styles.inputErr : ''}`}
                      placeholder="123 456 7890"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                    />
                  </div>
                  {errors.phone && <p className={styles.err}>{errors.phone}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Account Password</label>
                  <div className={styles.passGroup}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`${styles.passInput} ${errors.password ? styles.inputErr : ''}`}
                      placeholder="••••••••••"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className={styles.err}>{errors.password}</p>}
                </div>
              </div>
            </div>

            {/* ── ACTIONS ── */}
            <div className={styles.formActions}>
              <button type="button" className={styles.btnCancel} onClick={() => navigate('/admin')}>
                Cancel
              </button>
              <button type="submit" className={styles.btnSave} disabled={loading}>
                {loading ? 'Saving...' : <><FaSave /> Save Professional Profile</>}
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        © 2026 Eltherabito Administration Healthcare Management. All sensitive data encrypted.
      </footer>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastErr}`}>
          {toast.msg}
        </div>
      )}

    </AppLayout>
  );
}