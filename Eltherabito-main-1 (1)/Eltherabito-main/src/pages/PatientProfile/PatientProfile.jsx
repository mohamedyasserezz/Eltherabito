import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaCamera, FaPhone, FaVenusMars, FaEnvelope,
  FaFileAlt, FaHistory,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import { loadSavedContact } from '../../utils/profileStorage';
import { loadPatientNotes, addPatientNote } from '../../utils/patientNotesStorage';
import { getAvatarUrl } from '../../utils/imageUrl';
import patientService from '../../services/patientService';
import AppLayout from '../../components/layout/AppLayout';
import styles from './PatientProfile.module.css';

function useNotification() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

// ✅ يترجم قيمة gender الرقمية الجايه من الـ API لنص مفهوم
function getGenderLabel(gender) {
  if (gender === '0' || gender === 0) return 'Male';
  if (gender === '1' || gender === 1) return 'Female';
  if (typeof gender === 'string' && gender.trim()) return gender;
  return 'Not specified';
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { toast, show } = useNotification();
  const contact = loadSavedContact();
  const [notes, setNotes] = useState(() => loadPatientNotes());
  const [draftNote, setDraftNote] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await patientService.getProfile();
        setPatient(data);
      } catch (error) {
        show(error.message, 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const latestNote = notes.find((n) => n.latest) ?? notes[0];

  function handleSaveNote() {
    const text = draftNote.trim();
    if (!text) {
      show('Please enter a note', 'warning');
      return;
    }
    setNotes(addPatientNote(text));
    setDraftNote('');
    show('Note saved successfully!', 'success');
  }

  const toastClass =
    toast?.type === 'success'
      ? styles.notificationSuccess
      : toast?.type === 'warning'
        ? styles.notificationWarning
        : styles.notificationInfo;

  if (loading) {
    return (
      <AppLayout variant="patient" showSidebar showHeader={false}>
        <div className={styles.content}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </div>
      </AppLayout>
    );
  }

  // ✅ لو الداتا جايه من الـ API، نبني عليها صورة صحيحة ولابل gender مفهوم
  // لو لسه null (فشل الطلب)، نستخدم fallback كامل
  const patientData = patient
    ? {
        ...patient,
        gender: getGenderLabel(patient.gender),
        profilePictureUrl: getAvatarUrl(patient.profilePictureUrl, patient.fullName),
      }
    : {
        fullName: 'Ahmed Ali',
        gender: 'Male',
        profilePictureUrl: getAvatarUrl(null, 'Ahmed Ali'),
        email: contact.email,
        phoneNumber: contact.mobile,
      };

  return (
    <AppLayout
      variant="patient"
      showSidebar
      showHeader={false}
    >
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Patient Profile</h1>
          <button
            type="button"
            className={styles.updateBtn}
            onClick={() => navigate(ROUTES.patient.editProfile)}
          >
            <FaEdit aria-hidden="true" />
            Update Data
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.profileRow}>
              <div className={styles.avatarWrap}>
                <img src={patientData.profilePictureUrl} alt={patientData.fullName} className={styles.avatar} />
                <button
                  type="button"
                  className={styles.cameraBadge}
                  onClick={() => navigate(ROUTES.patient.editProfile)}
                  title="Change photo"
                  aria-label="Change profile photo"
                >
                  <FaCamera aria-hidden="true" />
                </button>
              </div>

              <div>
                <h2 className={styles.patientName}>{patientData.fullName}</h2>
                <div className={styles.badgesGrid}>
                  <div className={styles.infoBadge}>
                    <FaPhone className={styles.infoBadgeIcon} aria-hidden="true" />
                    <span>{patientData.phoneNumber}</span>
                  </div>
                  <div className={styles.infoBadge}>
                    <FaVenusMars className={styles.infoBadgeIcon} aria-hidden="true" />
                    <span>{patientData.gender}</span>
                  </div>
                  <div className={`${styles.infoBadge} ${styles.infoBadgeFull}`}>
                    <FaEnvelope className={styles.infoBadgeIcon} aria-hidden="true" />
                    <span>{patientData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.notesCardHeader}>
            <h3 className={styles.notesTitle}>
              <FaFileAlt className={styles.notesTitleIcon} aria-hidden="true" />
              Personal Notes
            </h3>
            <button
              type="button"
              className={styles.historyLink}
              onClick={() => show('Loading note history...', 'info')}
            >
              <FaHistory aria-hidden="true" />
              View History
            </button>
          </div>
          <div className={styles.cardBody}>
            {latestNote && (
              <div className={styles.noteItem}>
                <div className={styles.noteMeta}>
                  <span>{latestNote.date} • {latestNote.author}</span>
                  {latestNote.latest && <span className={styles.latestBadge}>Latest</span>}
                </div>
                <p className={styles.noteText}>{latestNote.text}</p>
              </div>
            )}

            <label className={styles.formLabel} htmlFor="patient-note">
              Add New Note
            </label>
            <textarea
              id="patient-note"
              className={styles.textarea}
              rows={4}
              placeholder="Type a new personal note here..."
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
            />
            <div className={styles.formActions}>
              <button type="button" className={styles.btnLight} onClick={() => setDraftNote('')}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSaveNote}
                disabled={!draftNote.trim()}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`${styles.notification} ${toastClass}`} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}
    </AppLayout>
  );
}