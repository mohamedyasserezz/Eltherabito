import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendar, FaEdit, FaSignOutAlt, FaBirthdayCake,
  FaBriefcase, FaCreditCard, FaVenus, FaClock,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import bookingService from '../../services/bookingService';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';
import styles from './TherapistProfile.module.css';

const DEFAULT_THERAPIST = {
  name: 'Dr. Sarah Miller',
  age: '38 Years',
  gender: 'Female',
  about:
    'I specialize in cognitive behavioral therapy (CBT) for adults facing anxiety, depression, and significant life transitions. My approach is collaborative and evidence-based, focusing on practical strategies to help you navigate challenges and build resilience. Over the past 12 years, I have worked in both clinical hospital settings and private practice.',
  tags: ['Anxiety', 'Depression', 'CBT', 'Stress Management'],
};

function useNotification() {
  const [message, setMessage] = useState(null);
  const show = useCallback((msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);
  return { message, show };
}

export default function TherapistProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { message, show } = useNotification();

  const [therapist, setTherapist] = useState(DEFAULT_THERAPIST);
  const [profile, setProfile] = useState({
    photo: getInitialsAvatar(),
    specialization: 'Clinical Psychologist',
    yearsExperience: 12,
    sessionRate: 120,
  });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await bookingService.getDoctorProfile();
        setTherapist({
          name: data.fullName,
          age: data.age ? `${data.age} Years` : 'N/A',
          gender: data.gender,
          about: data.bio || DEFAULT_THERAPIST.about,
          tags: DEFAULT_THERAPIST.tags,
        });
        setProfile({
          photo: getAvatarUrl(data.profilePictureUrl, data.fullName),
          specialization: data.specialty,
          yearsExperience: data.yearsOfExp,
          sessionRate: data.sessionPrice,
        });
      } catch (error) {
        show(error.message, 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        console.log('🔄 Fetching doctor schedules from TherapistProfile...');
        const data = await bookingService.getDoctorSchedules();
        console.log('✅ Raw API Response:', data);
        console.log('📊 Response length:', data?.length);
        
        const mappedSchedule = data.map(s => {
          console.log('📍 Mapping schedule item:', {
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            id: s.id,
          });
          return {
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            id: s.id,
          };
        });
        console.log('📋 Mapped schedule:', mappedSchedule);
        setSchedule(mappedSchedule);
      } catch (error) {
        console.error('❌ Error fetching schedules:', error);
        show(error.message, 'danger');
      }
    }
    fetchSchedules();
  }, []);

  const infoItems = [
    { icon: FaBirthdayCake, label: 'Age', value: therapist.age },
    { icon: FaBriefcase, label: 'Experience', value: `${profile.yearsExperience} years` },
    { icon: FaCreditCard, label: 'Session Rate', value: `$${profile.sessionRate}/hr` },
    { icon: FaVenus, label: 'Gender', value: therapist.gender },
  ];

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate(ROUTES.login, { replace: true });
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>Therapist Profile</h1>
          <p className={styles.pageSubtitle}>Manage your professional details and availability.</p>
        </div>

        <div className={styles.actionButtons}>
          <button type="button" className={`${styles.btn} ${styles.btnBookings}`} onClick={() => navigate(ROUTES.therapist.agenda)}>
            <FaCalendar aria-hidden="true" />
            My Bookings
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnUpdate}`}
            onClick={() => navigate(ROUTES.therapist.editProfile)}
          >
            <FaEdit aria-hidden="true" />
            Update Profile
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnLogout}`} onClick={handleLogout}>
            <FaSignOutAlt aria-hidden="true" />
            Log Out
          </button>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.profileImageSection}>
              <img src={profile.photo} alt={therapist.name} className={styles.profileImage} />
            </div>

            <h2 className={styles.therapistName}>{therapist.name}</h2>
            <p className={styles.therapistTitle}>{profile.specialization}</p>

            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className={styles.infoItem}>
                <Icon className={styles.infoIcon} aria-hidden="true" />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={styles.infoValue}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className={styles.mainContent}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>About Me</h3>
            <p className={styles.aboutText}>{therapist.about}</p>
            <div className={styles.tagsContainer}>
              {therapist.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <FaClock aria-hidden="true" />
                Consultation Hours
              </h3>
              <button
                type="button"
                className={styles.editLink}
                onClick={() => navigate(ROUTES.therapist.editSchedule)}
              >
                Edit Schedule
              </button>
            </div>

            <div className={styles.scheduleTableWrapper}>
              <table className={styles.scheduleTable}>
                <tbody>
                  {schedule.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={styles.closedCell}>No schedule set</td>
                    </tr>
                  ) : (
                    schedule.map((row) => (
                      <tr key={row.id}>
                        <td className={styles.dayCell}>{row.day}</td>
                        <td className={styles.timeCell}>{row.startTime} - {row.endTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {message && (
        <div className={styles.notification} role="alert" aria-live="polite">
          {message}
        </div>
      )}
    </div>
  );
}
