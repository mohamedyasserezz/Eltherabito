import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaComments,
  FaBrain,
  FaBriefcaseMedical,
  FaCalendarCheck,
  FaBell,
  FaCog,
  FaSearch,
  FaCalendarAlt,
  FaPlay,
  FaList,
  FaPen,
  FaShieldAlt,
  FaLock,
  FaArrowRight,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import AppLayout from '../../components/layout/AppLayout';
import patientService from '../../services/patientService';
import bookingService from '../../services/bookingService';
import { getAvatarUrl } from '../../utils/imageUrl';
import styles from './Dashboard.module.css';

const JOURNAL_STORAGE_KEY = 'eltherabito-patient-journal';

export default function Dashboard() {
  const navigate = useNavigate();
  const journalRef = useRef(null);
  const [journal, setJournal] = useState(() => {
    try {
      return localStorage.getItem(JOURNAL_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [toast, setToast] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );

  useEffect(() => {
    if (!journal.trim()) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(JOURNAL_STORAGE_KEY, journal);
      } catch {
        // ignore
      }
      setToast({ type: 'success', message: 'Journal entry saved' });
    }, 2000);
    return () => window.clearTimeout(t);
  }, [journal]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientData, doctorsData] = await Promise.all([
          patientService.getProfile(),
          bookingService.getDoctors(),
        ]);
        console.log('Patient data from API:', patientData);
        console.log('Doctors data from API:', doctorsData);
        setPatient(patientData);
        setDoctors(doctorsData.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppLayout variant="patient" showSidebar showHeader={false}>
      <div className={styles.page}>
        <header className={styles.topHeader}>
          <div className={styles.searchBar}>
            <FaSearch aria-hidden="true" />
            <input type="text" placeholder="Search resources..." />
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnIcon}
              onClick={() => setToast({ type: 'info', message: 'You have 3 new notifications' })}
              aria-label="Notifications"
            >
              <FaBell />
            </button>
            <button
              type="button"
              className={styles.btnIcon}
              onClick={() => navigate(ROUTES.patient.settings)}
              aria-label="Settings"
            >
              <FaCog />
            </button>
          </div>
        </header>

        <div className={styles.pageContent}>
          <section className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h1 className={styles.greeting}>Hello, {patient?.fullName || 'there'}</h1>
              <p className={styles.subtitle}>Your journey to wellness continues today.</p>
            </div>
            <div className={styles.welcomeDate}>
              <FaCalendarAlt aria-hidden="true" />
              <span>{today}</span>
            </div>
          </section>

          <section className={styles.featuresSection}>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <FaComments aria-hidden="true" />
                </div>
                <h3>AI Support</h3>
                <p>
                  Need a safe space to talk? Your AI companion is ready to listen and help you ground yourself.
                </p>
                <div className={styles.cardButtonWrapper}>
                  <button
                    type="button"
                    className={styles.primaryPill}
                    onClick={() => navigate(ROUTES.patient.chat)}
                  >
                    <FaComments aria-hidden="true" /> Start Chat
                  </button>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <FaBrain aria-hidden="true" />
                </div>
                <h3>Understand Your Mind</h3>
                <p>
                  Answer 17 clinically-informed questions. Our AI model gives you a personalised mental wellness
                  snapshot instantly.
                </p>
                <small className={styles.mutedSmall}>
                  <FaShieldAlt aria-hidden="true" /> Not a medical diagnosis. Results are confidential.
                </small>
                <div className={styles.cardButtonWrapper}>
                  <button
                    type="button"
                    className={styles.primaryPill}
                    onClick={() => navigate(ROUTES.patient.assessment)}
                  >
                    <FaPlay aria-hidden="true" /> Start Assessment
                  </button>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <FaBriefcaseMedical aria-hidden="true" />
                </div>
                <h3>Booking Doctor</h3>
                <p>Connect with licensed professionals across multiple specialties.</p>
                <div className={styles.doctorsPreview}>
                  <div className={styles.doctorsAvatars} aria-hidden="true">
                    {doctors.slice(0, 3).map((doctor) => (
                      <img
                        key={doctor.id}
                        src={getAvatarUrl(doctor.profilePictureUrl, `${doctor.firstName} ${doctor.lastName}`)}
                        alt=""
                      />
                    ))}
                    {doctors.length > 3 && (
                      <span className={styles.doctorsMore}>+{doctors.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardButtonWrapper}>
                  <button
                    type="button"
                    className={styles.primaryPill}
                    onClick={() => navigate(ROUTES.patient.booking)}
                  >
                    <FaSearch aria-hidden="true" /> Find Doctor
                  </button>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <FaCalendarCheck aria-hidden="true" />
                </div>
                <h3>My Booking</h3>
                <p>Manage your upcoming therapeutic sessions and history.</p>
                <div className={styles.cardButtonWrapper}>
                  <button
                    type="button"
                    className={styles.primaryPill}
                    onClick={() => navigate(ROUTES.patient.bookings)}
                  >
                    <FaList aria-hidden="true" /> Manage
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.journalSection}>
            <div className={styles.sectionHeader}>
              <h2>Daily Journal</h2>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => {
                  journalRef.current?.focus();
                  setToast({ type: 'info', message: 'Journal is ready for editing' });
                }}
                aria-label="Edit journal"
              >
                <FaPen />
              </button>
            </div>
            <p className={styles.sectionSubtitle}>Take a moment to reflect and write down your thoughts.</p>
            <textarea
              ref={journalRef}
              className={styles.journalInput}
              placeholder="How are you feeling right now?..."
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
            />
          </section>

          <section className={styles.privacySection}>
            <div className={styles.privacyContent}>
              <div className={styles.privacyText}>
                <div className={styles.privacyBadge}>
                  <FaShieldAlt aria-hidden="true" />
                  <span>SECURE ENVIRONMENT</span>
                </div>
                <h3>Your Privacy is Our Priority</h3>
                <p>
                  Military-grade encryption ensures your sessions and data stay private. Your health record is your
                  own, always anonymized and protected.
                </p>
                <button
                  type="button"
                  className={styles.privacyLink}
                  onClick={() => setToast({ type: 'info', message: 'Opening Security Whitepaper...' })}
                >
                  Security Whitepaper <FaArrowRight aria-hidden="true" />
                </button>
              </div>
              <div className={styles.privacyIcon}>
                <FaLock aria-hidden="true" />
              </div>
            </div>
          </section>

          <footer className={styles.pageFooter}>
            <div className={styles.footerContent}>
              <div className={styles.footerCenter}>
                <p className={styles.footerBrand}>Eltherabito</p>
                <p className={styles.footerCopyright}>© 2026 Mental Wellness Ecosystem</p>
              </div>
              <div className={styles.footerRight}>
                <button
                  type="button"
                  className={styles.footerLink}
                  onClick={() => setToast({ type: 'info', message: 'Support coming soon' })}
                >
                  Support
                </button>
                <button
                  type="button"
                  className={styles.footerLink}
                  onClick={() => setToast({ type: 'info', message: 'Terms coming soon' })}
                >
                  Terms
                </button>
                <button
                  type="button"
                  className={styles.footerLink}
                  onClick={() => setToast({ type: 'info', message: 'Privacy coming soon' })}
                >
                  Privacy
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {toast && (
        <div
          className={`${styles.toast} ${toast.type === 'success'
              ? styles.toastSuccess
              : toast.type === 'warning'
                ? styles.toastWarning
                : styles.toastInfo
            }`}
          role="alert"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </AppLayout>
  );
}
