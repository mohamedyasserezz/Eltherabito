import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapPin, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import styles from './Login.module.css';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
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
      const data = await authService.login({ email, password });
      // data = { firstName, lastName, email, token }
      login(data, data.token);
      const role = getRoleFromToken(data.token);
      showToast(`✓ Welcome back, ${data.firstName}!`);

      let redirectPath = '/dashboard';
      if (role === 'Admin') {
        redirectPath = '/admin';
      } else if (role === 'Doctor') {
        redirectPath = '/therapist/agenda';
      }

      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      showToast(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <FaMapPin className={styles.logoIcon} />
          <span>Eltherabito</span>
        </Link>
      </header>

      {/* ── MAIN ── */}
      <div className={styles.container}>
        <div className={styles.wrapper}>

          {/* Left image */}
          <div className={styles.imageSection}>
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&fit=crop"
              alt="Peaceful nature"
              className={styles.image}
            />
            <div className={styles.imageOverlay}>
              <h2 className={styles.overlayTitle}>Reconnect with yourself.</h2>
              <p className={styles.overlaySubtitle}>
                Your journey to mental clarity and emotional balance continues here.
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className={styles.formSection}>
            <div className={styles.formWrapper}>
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>Log in to continue your mindfulness journey</p>

              <form onSubmit={handleSubmit} noValidate className={styles.form}>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrap}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input
                      type="email"
                      className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                    />
                  </div>
                  {errors.email && <p className={styles.err}>{errors.email}</p>}
                </div>

                {/* Password */}
                <div className={styles.formGroup}>
                  <div className={styles.passHeader}>
                    <label className={styles.label}>Password</label>
                    <button type="button" className={styles.forgotLink}
                      onClick={() => showToast('📧 Password reset link sent!')}>
                      Forgot password?
                    </button>
                  </div>
                  <div className={styles.inputWrap}>
                    <FaLock className={styles.inputIcon} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className={styles.err}>{errors.password}</p>}
                </div>

                {/* Remember me */}
                <div className={styles.checkRow}>
                  <input type="checkbox" id="remember" className={styles.checkbox}
                    checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <label htmlFor="remember" className={styles.checkLabel}>Stay logged in for 30 days</label>
                </div>

                <button type="submit" className={styles.btnLogin} disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in'}
                </button>

              </form>

              <p className={styles.signupText}>
                New to Eltherabito? <Link to="/signup" className={styles.signupLink}>Create an account</Link>
              </p>

              <div className={styles.divider}><span>Or continue with</span></div>

              <div className={styles.socialRow}>
                <button className={styles.socialBtn} onClick={() => showToast('🔗 Connecting with Google...')}>
                  <FaGoogle /> <span>Google</span>
                </button>
                <button className={styles.socialBtn} onClick={() => showToast('🔗 Connecting with Facebook...')}>
                  <FaFacebookF /> <span>Facebook</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>© 2026 Eltherabito. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastErr : styles.toastOk}`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}