import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMapPin, FaClock, FaVideo, FaEllipsisH,
  FaCalendarCheck, FaPlus, FaUserMd,
  FaCalendar, FaPhone, FaTimes,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import { getBooking } from '../../utils/bookingStorage';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import bookingService from '../../services/bookingService';
import patientService from '../../services/patientService';
import styles from './MyBooking.module.css';

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

export default function MyBookings() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [booking, setBooking] = useState(null);
  const [appointments, setAppointments] = useState({ upcomingAppointments: [], previousAppointments: [] });
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(() => getInitialsAvatar());

  useEffect(() => {
    const savedBooking = getBooking();
    if (savedBooking) {
      setBooking(savedBooking);
    }

    async function fetchAppointments() {
      try {
        const data = await bookingService.getAppointments();
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchAvatar() {
      try {
        const data = await patientService.getProfile();
        setAvatar(getAvatarUrl(data.profilePictureUrl, data.fullName));
      } catch (error) {
        console.error('Failed to fetch patient avatar:', error);
      }
    }

    fetchAppointments();
    fetchAvatar();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleMenuAction(action) {
    setMenuOpen(false);
    if (action === 'cancel') {
      if (window.confirm('Are you sure you want to cancel this session?')) {
        showToast('❌ Session cancelled');
      }
    } else if (action === 'reschedule') {
      showToast('📅 Rescheduling session...');
    } else if (action === 'contact') {
      showToast('📞 Opening contact options...');
    }
  }

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to={ROUTES.patient.dashboard} className={styles.logo}>
            <FaMapPin className={styles.logoIcon} />
            <span>Eltherabito</span>
          </Link>

          <nav className={styles.navMenu}>
            <Link to={ROUTES.patient.dashboard} className={styles.navLink}>Home</Link>
            <Link to={ROUTES.patient.bookings} className={`${styles.navLink} ${styles.navLinkActive}`}>Bookings</Link>
          </nav>

          <button type="button" className={styles.profileBtn} onClick={() => navigate(ROUTES.patient.profile)}>
            <img
              src={avatar}
              alt="Profile"
              className={styles.profileImg}
            />
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className={styles.main}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>{today}</h1>
            <p className={styles.pageSubtitle}>
              {loading ? 'Loading...' : `${appointments.upcomingAppointments.length} session(s) scheduled`}
            </p>
          </div>
        </div>

        {/* ── UPCOMING SESSIONS ── */}
        {loading ? (
          <div className={styles.loading}>Loading appointments...</div>
        ) : appointments.upcomingAppointments.length > 0 ? (
          <section className={styles.upcomingSection}>
            {appointments.upcomingAppointments.map((apt) => (
              <div key={apt.id} className={styles.sessionCard}>
                {/* Doctor image */}
                <div className={styles.sessionImage}>
                  <img
                    src={getAvatarUrl(apt.doctorPictureUrl, apt.doctorName)}
                    alt={apt.doctorName}
                    className={styles.doctorImg}
                  />
                </div>

                {/* Session details */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionHeader}>
                    <div>
                      <p className={styles.sessionLabel}>{apt.specialty}</p>
                      <h2 className={styles.doctorName}>{apt.doctorName}</h2>
                    </div>

                    {/* Menu button */}
                    <div className={styles.menuWrap}>
                      <button className={styles.menuBtn} onClick={() => setMenuOpen(v => !v)}>
                        <FaEllipsisH />
                      </button>
                      {menuOpen && (
                        <div className={styles.menuDropdown}>
                          <button onClick={() => handleMenuAction('reschedule')}>
                            <FaCalendar /> Reschedule
                          </button>
                          <button onClick={() => handleMenuAction('cancel')}>
                            <FaTimes /> Cancel Session
                          </button>
                          <button onClick={() => handleMenuAction('contact')}>
                            <FaPhone /> Contact Doctor
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.sessionInfo}>
                    <div className={styles.infoItem}>
                      <FaClock className={styles.infoIcon} />
                      <div>
                        <p className={styles.infoLabel}>SESSION TIME</p>
                        <p className={styles.infoValue}>{apt.startTime} - {apt.endTime}</p>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <FaVideo className={styles.infoIcon} />
                      <div>
                        <p className={styles.infoLabel}>DATE</p>
                        <p className={styles.infoValue}>{new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Book another */}
            <button
              type="button"
              className={styles.bookAnotherLink}
              onClick={() => navigate(ROUTES.patient.booking)}
            >
              <FaPlus /> Book another session
            </button>
          </section>
        ) : (
          <section className={styles.upcomingSection}>
            <div className={styles.noAppointments}>
              <FaCalendarCheck className={styles.noAppIcon} />
              <p>No upcoming sessions scheduled.</p>
            </div>
            <button
              type="button"
              className={styles.bookAnotherLink}
              onClick={() => navigate(ROUTES.patient.booking)}
            >
              <FaPlus /> Book a session
            </button>
          </section>
        )}

        {/* ── BOOKING HISTORY ── */}
        <section className={styles.historySection}>
          <h2 className={styles.sectionTitle}>Booking History</h2>

          {appointments.previousAppointments.length > 0 ? (
            appointments.previousAppointments.map((apt, i) => (
              <div
                key={apt.id}
                className={styles.historyItem}
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => showToast(`📋 ${apt.doctorName} - Session details`)}
              >
                <div className={styles.historyIcon}><FaUserMd /></div>
                <div className={styles.historyContent}>
                  <p className={styles.historyDoctor}>{apt.doctorName}</p>
                  <p className={styles.historyDate}>{apt.specialty} • {new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className={styles.statusBadge}>COMPLETED</span>
              </div>
            ))
          ) : (
            <div className={styles.noAppointments}>
              <p>No booking history available.</p>
            </div>
          )}
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        © 2026 Eltherabito Mental Health Services. Your privacy is our priority.
      </footer>

      {/* Overlay to close menu */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

    </div>
  );
}