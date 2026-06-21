import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import bookingService from '../../services/bookingService';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import {
  SPECIALIZATIONS,
} from '../../utils/therapistProfileStorage';
import styles from './TherapistUpdateProfile.module.css';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function useNotification() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

export default function TherapistUpdateProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { toast, show } = useNotification();

  const [photo, setPhoto] = useState(() => getInitialsAvatar());
  const [specialization, setSpecialization] = useState('Clinical Psychologist');
  const [yearsExperience, setYearsExperience] = useState('12');
  const [sessionRate, setSessionRate] = useState('120');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await bookingService.getDoctorProfile();
        setPhoto(getAvatarUrl(data.profilePictureUrl, data.fullName));
        setSpecialization(data.specialty || 'Clinical Psychologist');
        setYearsExperience(data.yearsOfExp?.toString() || '12');
        setSessionRate(data.sessionPrice?.toString() || '120');
      } catch (error) {
        show(error.message, 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function markDirty() {
    setDirty(true);
  }

  function handleYearsChange(value) {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits && parseInt(digits, 10) > 70) {
      show('Years of experience cannot exceed 70', 'warning');
      setYearsExperience('70');
    } else {
      setYearsExperience(digits);
    }
    markDirty();
  }

  function handleRateChange(value) {
    setSessionRate(value.replace(/[^0-9$.\s]/g, ''));
    markDirty();
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      show('Please select an image file (JPG, PNG, or GIF)', 'warning');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      show('Image must be 5MB or smaller', 'warning');
      return;
    }

    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      markDirty();
      show('Photo selected', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleSave() {
    if (!specialization || !yearsExperience || !sessionRate) {
      show('Please fill in all fields', 'warning');
      return;
    }
    if (parseInt(yearsExperience, 10) <= 0) {
      show('Years of experience must be greater than 0', 'warning');
      return;
    }

    setSaving(true);
    try {
      const data = await bookingService.updateDoctorProfile({
        specialty: specialization,
        yearsOfExp: parseInt(yearsExperience, 10),
        sessionPrice: parseFloat(sessionRate.replace(/[^0-9.]/g, '')),
        profilePicture: profilePictureFile,
      });
      setSaving(false);
      setDirty(false);
      show('Profile updated successfully!', 'success');
      setTimeout(() => navigate(ROUTES.therapist.profile), 800);
    } catch (error) {
      setSaving(false);
      show(error.message, 'danger');
    }
  }

  function handleCancel() {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    navigate(ROUTES.therapist.profile);
  }

  const toastClass =
    toast?.type === 'success'
      ? styles.notificationSuccess
      : toast?.type === 'warning'
        ? styles.notificationWarning
        : styles.notificationInfo;

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTES.therapist.profile)}
            aria-label="Back to therapist profile"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <h1 className={styles.headerTitle}>Update Professional Profile</h1>
        </div>
        <p className={styles.headerSubtitle}>
          Manage your public information and clinical details.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>Profile Photo</h2>
              <div className={styles.photoSection}>
                <img src={photo} alt="Profile" className={styles.avatar} />
                <p className={styles.photoHint}>JPG, GIF or PNG. Max size of 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className={styles.hiddenFile}
                  onChange={handlePhotoChange}
                />
                <button type="button" className={styles.uploadBtn} onClick={handleUploadClick}>
                  <FaCloudUploadAlt aria-hidden="true" />
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>Professional Details</h2>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="specialization">
                  Clinical Specialization
                </label>
                <select
                  id="specialization"
                  className={styles.select}
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value);
                    markDirty();
                  }}
                >
                  {SPECIALIZATIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="years">
                    Years of Experience
                  </label>
                  <input
                    id="years"
                    type="text"
                    inputMode="numeric"
                    className={styles.input}
                    placeholder="12"
                    value={yearsExperience}
                    onChange={(e) => handleYearsChange(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="rate">
                    Session Rate ($ / hour)
                  </label>
                  <input
                    id="rate"
                    type="text"
                    className={styles.input}
                    placeholder="$ 150"
                    value={sessionRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerActions}>
            <button type="button" className={styles.btnCancel} onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.btnSave}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className={styles.spinning} aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </main>

      {toast && (
        <div className={`${styles.notification} ${toastClass}`} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  );
}
