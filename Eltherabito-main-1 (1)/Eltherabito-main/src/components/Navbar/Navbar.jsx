import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCircleNotch } from 'react-icons/fa';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  // shadow + active section detection on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);

      const sections = ['home', 'features', 'therapists', 'resources'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // اقفل المنيو لما يغير الصفحة
  useEffect(() => { setMenuOpen(false); }, [location]);

  function scrollToSection(id) {
    setMenuOpen(false);
    setActiveSection(id);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const navLinks = [
    { label: 'Home',           id: 'home' },
    { label: 'Features',       id: 'features' },
    { label: 'For Therapists', id: 'therapists' },
    { label: 'Resources',      id: 'resources' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <FaCircleNotch className={styles.logoIcon} />
          Eltherabito
        </Link>

        {/* Desktop nav links */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <button
                className={`${styles.navLink} ${activeSection === link.id ? styles.navLinkActive : ''}`}
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop auth buttons */}
        <div className={styles.authButtons}>
          <Link to="/login"  className={styles.btnOutline}>Login</Link>
          <Link to="/signup" className={styles.btnPrimary}>Sign Up</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <button
              key={link.label}
              className={`${styles.mobileLink} ${activeSection === link.id ? styles.mobileLinkActive : ''}`}
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </button>
          ))}
          <div className={styles.mobileAuth}>
            <Link to="/login"  className={styles.btnOutline} onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className={styles.btnPrimary} onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}