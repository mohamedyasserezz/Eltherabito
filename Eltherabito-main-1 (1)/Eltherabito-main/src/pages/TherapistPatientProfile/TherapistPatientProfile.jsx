import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import adminService from '../../services/adminService';
import bookingService from '../../services/bookingService';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import styles from './TherapistPatientProfile.module.css';

export default function TherapistPatientProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyCards, setHistoryCards] = useState([]);
  const [doctorAvatar, setDoctorAvatar] = useState(() => getInitialsAvatar());

  // Fetch the logged-in therapist's own avatar for the header
  useEffect(() => {
    async function fetchDoctorAvatar() {
      try {
        const data = await bookingService.getDoctorProfile();
        setDoctorAvatar(getAvatarUrl(data.profilePictureUrl, data.fullName));
      } catch (error) {
        console.error('Failed to fetch doctor avatar:', error);
      }
    }
    fetchDoctorAvatar();
  }, []);

  // Fetch patient profile data
  useEffect(() => {
    async function fetchPatientData() {
      try {
        const state = location.state;
        if (!state?.patientId) {
          setLoading(false);
          return;
        }

        const data = await adminService.getPatientProfile(state.patientId);
        
        const patientPhoto = getAvatarUrl(data.pictureUrl, data.patientName);

        setPatientData({
          name: data.patientName || 'Unknown Patient',
          phone: data.patientPhone || '+20 000 000 0000',
          email: data.patientEmail || 'email@example.com',
          photo: patientPhoto,
          previousCount: data.previousbookinghistory?.length || 0,
          nextSession: data.nextSession || null,
        });

        // Map booking history
        if (data.previousbookinghistory && Array.isArray(data.previousbookinghistory)) {
          const cards = data.previousbookinghistory.slice(0, 4).map((session, index) => ({
            id: index,
            date: formatDate(session.appointmentDate),
            time: formatTime(session.startTime) + ' • Completed',
          }));
          setHistoryCards(cards);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setNotification('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, [location.state]);

  // Keyboard shortcuts - must be defined before any conditional returns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        showNotification('👤 Profile page');
      }
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        showNotification('📅 Booking history');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  function formatNextSessionDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    };
  }

  // Show notification
  const showNotification = (message, duration = 3000) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Logo click handler
  const handleLogoClick = () => {
    navigate('/therapist/agenda');
  };

  // Icon button handlers
  const handleIconBtnClick = (icon) => {
    if (icon === 'bell') {
      showNotification('🔔 No new notifications');
    } else if (icon === 'cog') {
      showNotification('⚙️ Settings page coming soon');
    }
  };

  // Profile button handler
  const handleProfileBtnClick = () => {
    showNotification('👤 Profile settings');
  };

  // History card click handler
  const handleHistoryCardClick = (date, time) => {
    showNotification(`📋 Session on ${date} - ${time}`);
  };

  // View All link handler
  const handleViewAllClick = (e) => {
    e.preventDefault();
    showNotification('📅 Loading all booking history...');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button className={styles.logoSection} onClick={handleLogoClick}>
              <span className={styles.logoText}>Eltherabito</span>
            </button>
          </div>
        </header>
        <main className={styles.mainContainer}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading patient data...</div>
        </main>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button className={styles.logoSection} onClick={handleLogoClick}>
              <span className={styles.logoText}>Eltherabito</span>
            </button>
          </div>
        </header>
        <main className={styles.mainContainer}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>No patient data available</div>
        </main>
      </div>
    );
  }

  const nextSessionFormatted = formatNextSessionDate(patientData.nextSession?.appointmentDate);
  const nextSessionTime = patientData.nextSession ? formatTime(patientData.nextSession.startTime) : 'N/A';

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.logoSection} onClick={handleLogoClick}>
            <span className={styles.logoText}>Eltherabito</span>
          </button>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => handleIconBtnClick('bell')}>
              <i className="fas fa-bell"></i>
            </button>
            <button className={styles.iconBtn} onClick={() => handleIconBtnClick('cog')}>
              <i className="fas fa-cog"></i>
            </button>
            <button className={styles.profileBtn} onClick={handleProfileBtnClick}>
              <img src={doctorAvatar} alt="Profile" className={styles.profileImg} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.mainContainer}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbSection}>
          <span className={styles.breadcrumbText}>Patients</span>
          <span className={styles.breadcrumbSeparator}>•</span>
          <span className={styles.breadcrumbCurrent}>{patientData.name}</span>
        </div>

        {/* Profile Section */}
        <div className={styles.profileSection}>
          {/* Left Side - Patient Info */}
          <div className={styles.patientInfo}>
            {/* Patient Card */}
            <div className={styles.patientCard}>
              {/* Patient Image */}
              <div className={styles.patientImage}>
                <img src={patientData.photo} alt={patientData.name} className={styles.patientPhoto} />
                <div className={styles.onlineIndicator}></div>
              </div>

              {/* Patient Details */}
              <div className={styles.patientDetails}>
                <h1 className={styles.patientName}>{patientData.name}</h1>
                <p className={styles.previousSessions}>
                  <i className="fas fa-history"></i>
                  <span>PREVIOUS SESSIONS: {patientData.previousCount}</span>
                </p>

                {/* Contact Info */}
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <p className={styles.contactLabel}>MOBILE NUMBER</p>
                    <p className={styles.contactValue}>{patientData.phone}</p>
                  </div>

                  <div className={styles.contactItem}>
                    <p className={styles.contactLabel}>EMAIL ADDRESS</p>
                    <p className={styles.contactValue}>{patientData.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Booking History */}
            <div className={styles.bookingHistorySection}>
              <div className={styles.sectionHeader}>
                <i className="fas fa-calendar"></i>
                <h2>Previous Booking History</h2>
                <button className={styles.viewAllLink} onClick={handleViewAllClick}>
                  View All
                </button>
              </div>

              {/* History Grid */}
              <div className={styles.historyGrid}>
                {historyCards.map((card, index) => (
                  <div
                    key={card.id}
                    className={styles.historyCard}
                    onClick={() => handleHistoryCardClick(card.date, card.time)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={styles.historyIcon}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <p className={styles.historyDate}>{card.date}</p>
                    <p className={styles.historyTime}>{card.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Next Session */}
          <aside className={styles.nextSessionSidebar}>
            <div className={styles.nextSessionCard}>
              <p className={styles.sessionLabel}>NEXT SESSION</p>
              {nextSessionFormatted ? (
                <>
                  <div className={styles.sessionDate}>
                    <span className={styles.dateDay}>{nextSessionFormatted.day}</span>
                    <span className={styles.dateMonth}>{nextSessionFormatted.month}</span>
                  </div>
                  <p className={styles.sessionTime}>{nextSessionFormatted.full}</p>
                  <p className={styles.sessionTime}>{nextSessionTime}</p>
                  <p className={styles.sessionType}>Video Consultation</p>
                </>
              ) : (
                <p className={styles.sessionType}>No upcoming sessions</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <div className={styles.notification} role="alert" aria-live="polite">
          {notification}
        </div>
      )}
    </div>
  );
}
