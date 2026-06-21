import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import {
  FaUser, FaEnvelope, FaGlobe,
  FaBirthdayCake, FaLock, FaEye, FaEyeSlash,
  FaShieldAlt, FaArrowRight,
} from 'react-icons/fa';
import AppHeader from '../../components/layout/AppHeader';
import styles from './Signup.module.css';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const PHONE_PREFIXES = ['+20', '+1', '+44', '+91'];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phonePrefix: '+20', phone: '',
    age: '', gender: '', password: '', agreed: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.age) e.age = 'Required';
    else if (form.age < 18 || form.age > 65) e.age = 'Must be 18–65';
    if (!form.gender) e.gender = 'Please select a gender';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (!form.agreed) e.agreed = 'You must agree to continue';
    return e;
  }

  function getRoleFromToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Patient';
    } catch (e) {
      console.error('Error decoding token:', e);
      return 'Patient';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await authService.register(form);
      // data = { firstName, lastName, email, token }
      login(data, data.token);
      const role = getRoleFromToken(data.token);
      showToast(`✓ Welcome, ${data.firstName}!`);

      let redirectPath = ROUTES.patient.dashboard;
      if (role === 'Admin') {
        redirectPath = '/admin';
      } else if (role === 'Doctor') {
        redirectPath = '/therapist/agenda';
      }

      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      <AppHeader variant="auth">
        <span className={styles.headerText}>Already have an account?</span>
        <Link to="/login" className={styles.btnLoginLink}>Log in</Link>
      </AppHeader>

      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.formSection}>
            <div className={styles.formWrapper}>

              <h1 className={styles.title}>Create your account</h1>
              <p className={styles.subtitle}>Join a community dedicated to mental well-being</p>

              <div className={styles.roleIndicator}>
                <FaUser /> <span>Patient</span>
              </div>

              <form onSubmit={handleSubmit} noValidate className={styles.form}>

                {/* First + Last Name */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name</label>
                    <div className={styles.inputWrap}>
                      <FaUser className={styles.inputIcon} />
                      <input type="text"
                        className={`${styles.input} ${errors.firstName ? styles.inputErr : ''}`}
                        placeholder="John" value={form.firstName}
                        onChange={e => set('firstName', e.target.value)} />
                    </div>
                    {errors.firstName && <p className={styles.err}>{errors.firstName}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <div className={styles.inputWrap}>
                      <FaUser className={styles.inputIcon} />
                      <input type="text"
                        className={`${styles.input} ${errors.lastName ? styles.inputErr : ''}`}
                        placeholder="Doe" value={form.lastName}
                        onChange={e => set('lastName', e.target.value)} />
                    </div>
                    {errors.lastName && <p className={styles.err}>{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrap}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input type="email"
                      className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                      placeholder="john@example.com" value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </div>
                  {errors.email && <p className={styles.err}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={`${styles.phoneWrap} ${errors.phone ? styles.inputErr : ''}`}>
                    <div className={styles.phonePrefix}>
                      <FaGlobe className={styles.globeIcon} />
                      <select className={styles.prefixSelect} value={form.phonePrefix}
                        onChange={e => set('phonePrefix', e.target.value)}>
                        {PHONE_PREFIXES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <input type="tel" className={styles.phoneInput}
                      placeholder="(00) 123 4567" value={form.phone}
                      onChange={e => set('phone', e.target.value)} />
                  </div>
                  {errors.phone && <p className={styles.err}>{errors.phone}</p>}
                </div>

                {/* Age */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Age</label>
                  <div className={styles.inputWrap}>
                    <FaBirthdayCake className={styles.inputIcon} />
                    <input type="number"
                      className={`${styles.input} ${errors.age ? styles.inputErr : ''}`}
                      placeholder="Enter your age" min="18" max="65"
                      value={form.age} onChange={e => set('age', e.target.value)} />
                  </div>
                  {errors.age && <p className={styles.err}>{errors.age}</p>}
                </div>

                {/* Gender */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <div className={styles.genderOptions}>
                    {['male', 'female'].map(g => (
                      <label key={g}
                        className={`${styles.genderOption} ${form.gender === g ? styles.genderSelected : ''}`}>
                        <input type="radio" name="gender" value={g}
                          checked={form.gender === g} onChange={() => set('gender', g)}
                          className={styles.radioInput} />
                        <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <p className={styles.err}>{errors.gender}</p>}
                </div>

                {/* Password */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrap}>
                    <FaLock className={styles.inputIcon} />
                    <input type={showPass ? 'text' : 'password'}
                      className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                      placeholder="Create a strong password" value={form.password}
                      onChange={e => set('password', e.target.value)} />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className={styles.hint}>Must be at least 6 characters</p>
                  {errors.password && <p className={styles.err}>{errors.password}</p>}
                </div>

                {/* Terms */}
                <div className={styles.checkRow}>
                  <input type="checkbox" id="terms" className={styles.checkbox}
                    checked={form.agreed} onChange={e => set('agreed', e.target.checked)} />
                  <label htmlFor="terms" className={styles.checkLabel}>
                    I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                  </label>
                </div>
                {errors.agreed && <p className={styles.err}>{errors.agreed}</p>}

                {/* Badges */}
                <div className={styles.badges}>
                  <div className={styles.badge}><FaShieldAlt /> HIPAA COMPLIANT</div>
                  <div className={styles.badge}><FaLock /> END-TO-END ENCRYPTED</div>
                </div>

                <button type="submit" className={styles.btnRegister} disabled={loading}>
                  {loading
                    ? 'Creating account...'
                    : <><span>Create Account</span> <FaArrowRight /></>
                  }
                </button>

              </form>

              <p className={styles.loginBottom}>
                Already have an account? <Link to="/login">Log in here</Link>
              </p>

            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 Eltherabito Mental Health. All rights reserved.</p>
      </footer>

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastErr : styles.toastOk}`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}