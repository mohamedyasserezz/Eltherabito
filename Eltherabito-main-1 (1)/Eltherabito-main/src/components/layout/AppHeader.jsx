import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaCog, FaCircleNotch, FaSignOutAlt } from 'react-icons/fa';
import { BRAND, THERAPIST_BRAND } from './navConfig';
import { ROUTES } from '../../routes/paths';
import { getInitialsAvatar } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';
import styles from './AppHeader.module.css';

/**
 * Unified top bar for app pages.
 * variant: patient | admin | therapist | auth | public
 */
export default function AppHeader({
  variant = 'patient',
  logoHref,
  subtitle,
  showSearch = false,
  searchPlaceholder = 'Search resources...',
  userInitial = 'A',
  userImage,
  onNotify,
  onSettings,
  onAvatarClick,
  children,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate(ROUTES.login, { replace: true });
    }
  }

  const href = logoHref ?? (
    variant === 'admin'
      ? ROUTES.admin.home
      : variant === 'therapist'
        ? ROUTES.therapist.agenda
        : ROUTES.patient.dashboard
  );
  const tagline = subtitle ?? (variant === 'admin' ? 'Admin Portal' : BRAND.tagline);

  function handleSettings() {
    if (onSettings) {
      onSettings();
      return;
    }
    if (variant === 'patient') navigate(ROUTES.patient.settings);
  }

  function handleAvatar() {
    if (onAvatarClick) {
      onAvatarClick();
      return;
    }
    if (variant === 'patient' || variant === 'admin') {
      navigate(variant === 'admin' ? ROUTES.admin.home : ROUTES.patient.profile);
    }
  }

  if (variant === 'auth') {
    return (
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logoBtn}>
            <FaCircleNotch style={{ color: '#1558D6', marginRight: 8, verticalAlign: 'middle' }} />
            <span className={styles.logoTextOnly}>{BRAND.name}</span>
          </Link>
          {children && <div className={styles.actions}>{children}</div>}
        </div>
      </header>
    );
  }

  if (variant === 'public') {
    return null;
  }

  if (variant === 'therapist') {
    const { Icon } = THERAPIST_BRAND;
    return (
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to={href} className={styles.brandRow}>
            <div className={styles.brandIcon}><Icon /></div>
            <span className={styles.brandName}>{THERAPIST_BRAND.name}</span>
          </Link>
          <div className={styles.rightSlot}>{children}</div>
        </div>
      </header>
    );
  }

  const logoContent = (
    <>
      <p className={styles.logoTitle}>{BRAND.name}</p>
      <p className={styles.logoSubtitle}>{tagline}</p>
    </>
  );

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        <Link to={href} className={styles.logoBtn}>{logoContent}</Link>

        {showSearch && variant === 'patient' && (
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              aria-label="Search"
            />
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            title="Notifications"
            aria-label="Notifications"
            onClick={onNotify}
          >
            <FaBell />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Settings"
            aria-label="Settings"
            onClick={handleSettings}
          >
            <FaCog />
          </button>

          {variant === 'admin' ? (
            <button type="button" className={styles.adminPill} onClick={handleAvatar}>
              <img
                src={userImage || getInitialsAvatar('Admin')}
                alt="Admin"
              />
              <span>Admin</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.userAvatar}
              title="My profile"
              aria-label="My profile"
              onClick={handleAvatar}
            >
              {userImage ? (
                <img src={userImage} alt="" className={styles.userAvatarImg} />
              ) : (
                userInitial
              )}
            </button>
          )}

          <button
            type="button"
            className={styles.iconBtn}
            title="Log out"
            aria-label="Log out"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}
