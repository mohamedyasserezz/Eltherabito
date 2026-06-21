import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCheck, FaEnvelope, FaPhone, FaShieldAlt, FaSave,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import AppLayout from '../../components/layout/AppLayout';
import { BRAND } from '../../components/layout/navConfig';
import patientService from '../../services/patientService';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import styles from './EditProfile.module.css';

const PROFILE_DRAFT_KEY = 'eltherabito-profile-draft';

function useNotification() {
  const [message, setMessage] = useState(null);
  const show = useCallback((msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);
  return { message, show };
}

// ✅ يحوّل أي صيغة لرقم موبايل مصري لصيغة 01XXXXXXXXX المحلية اللي الـ backend بيتوقعها
function formatEgyptianPhone(phone) {
  let cleaned = phone.replace(/[\s-]+/g, '');

  // لو بادئ بـ +20 أو 0020 أو 20 يشيل كود الدولة ويرجع للصيغة المحلية
  cleaned = cleaned.replace(/^(\+?20)0*(1[0125]\d{8})$/, '0$2');

  return cleaned;
}

function isValidEgyptianPhone(phone) {
  return /^01[0125]\d{8}$/.test(phone);
}

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { message, show } = useNotification();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(() => getInitialsAvatar());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await patientService.getProfile();
        setEmail(data.email);
        setPhone(data.phoneNumber || '');
        setAvatar(getAvatarUrl(data.profilePictureUrl, data.fullName));
      } catch (error) {
        show(error.message, 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const saveDraft = useCallback((value) => {
    try {
      localStorage.setItem(
        PROFILE_DRAFT_KEY,
        JSON.stringify({ email, phone: value, lastSaved: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
  }, [email, phone]);

  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate(-1);
    }
  }, [navigate]);

  const handleSave = useCallback(async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      show('❌ Please enter a phone number');
      return;
    }

    // ✅ نظّف ونتحقق من صيغة الرقم المصري قبل الإرسال
    const formattedPhone = formatEgyptianPhone(trimmedPhone);
    if (!isValidEgyptianPhone(formattedPhone)) {
      show('❌ Please enter a valid Egyptian mobile number (e.g. 01012345678)');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        email,
        phoneNumber: formattedPhone,
        profilePicture: profilePictureFile,
      };
      const updatedData = await patientService.updateProfile(formData);

      setEmail(updatedData.email);
      setPhone(updatedData.phoneNumber || '');
      setAvatar(getAvatarUrl(updatedData.profilePictureUrl, updatedData.fullName));
      setProfilePictureFile(null);

      localStorage.removeItem(PROFILE_DRAFT_KEY);
      show('✓ Profile updated successfully!');
      setTimeout(() => {
        navigate(ROUTES.patient.profile);
        setSaving(false);
      }, 1500);
    } catch (error) {
      show(error.message, 'danger');
      setSaving(false);
    }
  }, [email, phone, profilePictureFile, navigate, show]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleSave, handleCancel]);

  function handlePhoneChange(e) {
    const value = e.target.value;
    setPhone(value);
    saveDraft(value);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      show('❌ Image must be 2MB or smaller');
      e.target.value = '';
      return;
    }

    setProfilePictureFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        show('📸 Profile picture selected');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  if (loading) {
    return (
      <AppLayout variant="patient" showSidebar showHeader={false}>
        <div className={styles.content}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      variant="patient"
      showSidebar
      showHeader={false}
      sidebarSubtitle={BRAND.portalTagline}
      headerProps={{
        userImage: avatar,
      }}
    >
      <div className={styles.content}>

        <div className={styles.breadcrumbSection}>
          <button
            type="button"
            className={styles.breadcrumbLink}
            onClick={() => navigate(ROUTES.patient.profile)}
          >
            Profile
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Edit Settings</span>
        </div>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Update Personal Information</h1>
          <p className={styles.pageSubtitle}>
            Manage your profile details and preferences to ensure your medical records stay up to date.
          </p>
        </div>

        <div className={styles.profileSection}>

          <div className={styles.profilePictureCard}>
            <div className={styles.pictureInfoCenter}>
              <div className={styles.pictureContainer}>
                <img src={avatar} alt="Profile" className={styles.profilePicture} />
                <div className={styles.pictureBadge} aria-hidden="true">
                  <FaCheck />
                </div>
              </div>
              <h3 className={styles.pictureTitle}>Profile Picture</h3>
              <p className={styles.pictureSubtitle}>JPEG, PNG or GIF. Max size 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className={styles.hiddenInput}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className={styles.btnUpload}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload New
              </button>
            </div>
          </div>

          <div className={styles.detailsCard}>
            <h2 className={styles.cardTitle}>Basic Details</h2>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <div className={styles.formInputGroup}>
                <FaEnvelope className={styles.inputIcon} aria-hidden="true" />
                <input
                  type="email"
                  id="email"
                  className={styles.formControl}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>Phone Number</label>
              <div className={styles.formInputGroup}>
                <FaPhone className={styles.inputIcon} aria-hidden="true" />
                <input
                  type="tel"
                  id="phone"
                  className={styles.formControl}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="01012345678"
                />
              </div>
              <p className={styles.formHint}>
                We&apos;ll use this for appointment reminders. Enter a valid Egyptian mobile number.
              </p>
            </div>
          </div>

          <div className={styles.privacyCard}>
            <div className={styles.privacyHeader}>
              <FaShieldAlt className={styles.privacyIcon} aria-hidden="true" />
              <h3 className={styles.privacyTitle}>Data Privacy</h3>
            </div>
            <p className={styles.privacyText}>
              Your information is securely encrypted and only shared with your designated
              healthcare providers at Eltherabito.
            </p>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSave}`}
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave aria-hidden="true" />
            Save Changes
          </button>
        </div>

        <footer className={styles.pageFooter}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <img src={avatar} alt="" className={styles.footerAvatar} />
              <div>
                <p className={styles.footerUserName}>{email}</p>
                <p className={styles.footerUserRole}>Patient</p>
              </div>
            </div>
            <div className={styles.footerSection}>
              <button type="button" className={styles.footerLink} onClick={() => show('Support')}>
                Support
              </button>
              <button type="button" className={styles.footerLink} onClick={() => show('Terms')}>
                Terms
              </button>
              <button type="button" className={styles.footerLink} onClick={() => show('Privacy')}>
                Privacy
              </button>
            </div>
          </div>
        </footer>
      </div>

      {message && (
        <div className={styles.notification} role="alert" aria-live="polite">
          {message}
        </div>
      )}
    </AppLayout>
  );
}