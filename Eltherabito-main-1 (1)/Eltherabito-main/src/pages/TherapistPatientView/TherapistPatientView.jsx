import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  FaArrowLeft, FaEdit, FaPhone, FaVenusMars, FaEnvelope,
  FaFileAlt, FaHistory,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import { getPatientFromState } from '../../utils/patientRecords';
import { loadClinicalNotes, addClinicalNote } from '../../utils/clinicalNotesStorage';
import { getAvatarUrl } from '../../utils/imageUrl';
import adminService from '../../services/adminService';
import styles from './TherapistPatientView.module.css';

function useNotification() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

export default function TherapistPatientView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        const state = location.state;
        console.log('📋 Location state:', state);
        
        // If patientId is provided, fetch real data from API
        if (state?.patientId) {
          console.log('🔄 Fetching patient data for ID:', state.patientId);
          const data = await adminService.getPatientProfile(state.patientId);
          console.log('✅ API Response:', data);
          
          // Handle case where response might be wrapped in an array
          let patientData = Array.isArray(data) ? data[0] : data;
          
          if (!patientData || !patientData.patientName) {
            console.error('❌ Invalid patient data:', patientData);
            throw new Error('Invalid patient data received from API');
          }
          
          const patientPhoto = getAvatarUrl(patientData.pictureUrl, patientData.patientName);
          
          const newPatient = {
            name: patientData.patientName || 'Unknown Patient',
            photo: patientPhoto,
            phone: patientData.patientPhone || 'N/A',
            email: patientData.patientEmail || 'N/A',
            gender: 'Unknown',
            notesKey: `patient-${state.patientId}`,
          };
          console.log('👤 Setting patient:', newPatient);
          setPatient(newPatient);
          setError(null);
        } else {
          // Fall back to state data
          console.log('ℹ️ No patientId, using state data');
          const statePatient = getPatientFromState(state);
          if (!statePatient) {
            setError('Patient data not found');
            setPatient(null);
          } else {
            setPatient(statePatient);
            setError(null);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching patient data:', err);
        setError(err.message || 'Failed to load patient data');
        // Fall back to state data on error
        const statePatient = getPatientFromState(location.state);
        if (statePatient) {
          console.log('⚠️ Falling back to state data');
          setPatient(statePatient);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, [location.state]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '16px' }}>
        Loading patient data...
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</p>
        <button onClick={() => navigate(ROUTES.therapist.agenda)}>Back to Agenda</button>
      </div>
    );
  }

  if (!patient) {
    return <Navigate to={ROUTES.therapist.agenda} replace />;
  }

  return <TherapistPatientViewContent key={patient.notesKey} patient={patient} />;
}

function TherapistPatientViewContent({ patient }) {
  const navigate = useNavigate();
  const { toast, show } = useNotification();
  const [notes, setNotes] = useState(() => loadClinicalNotes(patient.notesKey));
  const [draftNote, setDraftNote] = useState('');

  const latestNote = notes.find((n) => n.latest) ?? notes[0];

  function handleSaveNote() {
    const text = draftNote.trim();
    if (!text) {
      show('Please enter a note', 'warning');
      return;
    }
    setNotes(addClinicalNote(patient.notesKey, text));
    setDraftNote('');
    show('Note saved successfully!', 'success');
  }

  const toastClass =
    toast?.type === 'success'
      ? styles.notificationSuccess
      : toast?.type === 'warning'
        ? styles.notificationWarning
        : styles.notificationInfo;

  if (!patient || !patient.name) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTES.therapist.agenda)}
            aria-label="Back to agenda"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <div className={styles.headerText}>
            <h1>Patient Profile</h1>
            <p>Error loading patient</p>
          </div>
        </header>
        <main className={styles.main}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Unable to load patient data. Please go back and try again.</p>
            <button onClick={() => navigate(ROUTES.therapist.agenda)}>Back to Agenda</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTES.therapist.agenda)}
          aria-label="Back to agenda"
        >
          <FaArrowLeft aria-hidden="true" />
        </button>
        <div className={styles.headerText}>
          <h1>Patient Profile</h1>
          <p>Clinical view — {patient.name}</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Patient Profile</h2>
          <button
            type="button"
            className={styles.updateBtn}
            onClick={() => show('Update patient data — coming soon', 'info')}
          >
            <FaEdit aria-hidden="true" />
            Update Data
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.profileRow}>
              <img src={patient.photo} alt={patient.name} className={styles.avatar} />
              <div>
                <h3 className={styles.patientName}>{patient.name}</h3>
                <div className={styles.badgesGrid}>
                  <div className={styles.infoBadge}>
                    <FaPhone className={styles.infoBadgeIcon} aria-hidden="true" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className={styles.infoBadge}>
                    <FaVenusMars className={styles.infoBadgeIcon} aria-hidden="true" />
                    <span>{patient.gender}</span>
                  </div>
                  <div className={`${styles.infoBadge} ${styles.infoBadgeFull}`}>
                    <FaEnvelope className={styles.infoBadgeIcon} aria-hidden="true" />
                    <span>{patient.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.notesHeader}>
            <h3 className={styles.notesTitle}>
              <FaFileAlt aria-hidden="true" />
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

            <label className={styles.formLabel} htmlFor="clinical-note">
              Add New Note
            </label>
            <textarea
              id="clinical-note"
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
      </main>

      {toast && (
        <div className={`${styles.notification} ${toastClass}`} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  );
}
