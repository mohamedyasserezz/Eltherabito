import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { BRAND, PATIENT_NAV, getPatientActiveNav } from './navConfig';
import { ROUTES } from '../../routes/paths';
import patientService from '../../services/patientService';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';
import styles from './AppSidebar.module.css';

export default function AppSidebar({
  embedded = false,
  subtitle = BRAND.tagline,
  hasHeader = true,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const activeId = getPatientActiveNav(pathname);

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate(ROUTES.login, { replace: true });
    }
  }
  const [user, setUser] = useState({
    name: 'Loading...',
    avatar: getInitialsAvatar(),
  });

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const patientData = await patientService.getProfile();
        setUser({
          name: patientData.fullName || 'User',
          avatar: getAvatarUrl(patientData.profilePictureUrl, patientData.fullName),
        });
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }
    fetchUserProfile();
  }, []);

  return (
    <aside
      className={`${styles.sidebar} ${embedded ? styles.sidebarEmbedded : ''} ${hasHeader ? styles.sidebarWithHeader : ''}`}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{BRAND.name}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {PATIENT_NAV.map(({ id, label, Icon, path }) => (
          <button
            key={id}
            type="button"
            className={`${styles.navItem} ${activeId === id ? styles.navItemActive : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon className={styles.navIcon} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.user}>
        <button
          type="button"
          className={styles.userAvatarBtn}
          onClick={() => navigate(ROUTES.patient.profile)}
          aria-label="Open patient profile"
        >
          <img className={styles.userAvatar} src={user.avatar} alt={user.name} />
        </button>
        <button
          type="button"
          className={styles.userNameBtn}
          onClick={() => navigate(ROUTES.patient.profile)}
        >
          {user.name}
        </button>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
        >
          <FaSignOutAlt aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
