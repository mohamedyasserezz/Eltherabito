import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart, FaComments, FaNetworkWired, FaLock,
  FaCheckCircle, FaFacebookF, FaInstagram, FaTwitter,
  FaShieldAlt, FaCertificate,
} from 'react-icons/fa';
import styles from './Home.module.css';

export default function Home() {
  // Scroll animation using IntersectionObserver
  const featureRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add(styles.animateIn); }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    featureRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section id="home" className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>

            {/* Left content */}
            <div className={styles.heroContent}>
              <span className={styles.badge}>
                <FaHeart className={styles.badgeIcon} /> PERSONALIZED CARE
              </span>

              <h1 className={styles.heroTitle}>
                Bridging the Gap to Better Mental Health
              </h1>

              <p className={styles.heroSubtitle}>
                Empowering your journey with professional support, AI-driven insights, and personalized
                care paths designed for your unique emotional needs.
              </p>

              <div className={styles.heroCtas}>
                <Link to="/signup" className={styles.btnPrimary}>Get Started</Link>
                <button className={styles.btnOutline} onClick={() => scrollTo('features')}>Learn More</button>
              </div>

              <div className={styles.avatarRow}>
                <div className={styles.avatars}>
                  <div className={`${styles.avatar} ${styles.av1}`} />
                  <div className={`${styles.avatar} ${styles.av2}`} />
                  <div className={`${styles.avatar} ${styles.av3}`} />
                </div>
                <p className={styles.avatarText}><strong>Joined by 10k+ users this month</strong></p>
              </div>
            </div>

            {/* Right image */}
            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=700&fit=crop"
                alt="Woman meditating in peaceful environment"
                className={styles.heroImage}
              />
              <div className={styles.aiBadge}>
                <FaCheckCircle className={styles.aiCheck} />
                <div>
                  <strong>AI Support Active</strong>
                  <p>Ready to listen anytime</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Comprehensive Approach</h2>
            <p className={styles.sectionSubtitle}>
              Combining cutting-edge AI technology with human compassion to support your mental well-being around the clock.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {[
              { icon: <FaComments />,       title: '24/7 AI Emotional Support',  desc: 'Access our grounding chatbot for immediate empathetic support, mindfulness exercises, and emotional venting whenever you need it.' },
              { icon: <FaNetworkWired />,   title: 'Personalized Resources',     desc: 'Get smart recommendations for articles, videos, and daily practices tailored specifically to your goals and current emotional state.' },
              { icon: <FaLock />,           title: 'Secure Therapist Portal',    desc: 'A private, HIPAA-compliant space to connect with licensed professionals, share progress logs, and manage your therapy sessions.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className={styles.featureCard}
                ref={(el) => (featureRefs.current[i] = el)}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <h5 className={styles.featureTitle}>{f.title}</h5>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta} id="therapists">
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Take the First Step Toward Your Inner Peace Today</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of others finding peace, clarity, and professional support through Eltherabito's integrated mental health platform.
            </p>
            <div className={styles.ctaBtns}>
              <Link to="/signup" className={styles.btnLight}>Get Started Now</Link>
              <button className={styles.btnOutlineLight}>Talk to an Expert</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}  id="resources">
        <div className={styles.container}>
          <div className={styles.footerGrid}>

            {/* Brand */}
            <div>
              <h6 className={styles.footerBrand}><FaHeart className={styles.brandIcon} /> Eltherabito</h6>
              <p className={styles.footerDesc}>
                Professional support, AI-driven insights, and personalized care paths designed for your mental health.
              </p>
              <div className={styles.socials}>
                <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" aria-label="Twitter"><FaTwitter /></a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h6 className={styles.footerHeading}>Company</h6>
              <ul className={styles.footerList}>
                {['About Us', 'Careers', 'Contact', 'Blog'].map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h6 className={styles.footerHeading}>Resources</h6>
              <ul className={styles.footerList}>
                {['Crisis Support', 'For Therapists', 'Privacy Policy', 'Terms of Service'].map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>

            {/* Trust */}
            <div>
              <h6 className={styles.footerHeading}>Trust & Security</h6>
              <ul className={styles.footerList}>
                <li><a href="#"><FaShieldAlt /> HIPAA Compliant</a></li>
                <li><a href="#"><FaLock /> SSL Secure</a></li>
                <li><a href="#"><FaCertificate /> Trusted Partner</a></li>
              </ul>
            </div>

          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 Eltherabito. All rights reserved. Your mental health matters.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}