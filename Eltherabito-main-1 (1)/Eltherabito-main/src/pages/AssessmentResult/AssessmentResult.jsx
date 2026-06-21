import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisV, FaCog, FaInfoCircle, FaCalendarCheck } from 'react-icons/fa';
import AppLayout from '../../components/layout/AppLayout';
import { ROUTES } from '../../routes/paths';
import styles from './AssessmentResult.module.css';

const ASSESSMENT_ANSWERS_KEY = 'assessmentAnswers';
const ASSESSMENT_RESULT_KEY = 'assessmentResult';

function safeLoadAnswers() {
  try {
    const saved = localStorage.getItem(ASSESSMENT_ANSWERS_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function safeLoadResult() {
  try {
    const saved = localStorage.getItem(ASSESSMENT_RESULT_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function computePercent(answers) {
  const entries = Object.entries(answers);
  if (!entries.length) return 0;

  // Simple, deterministic heuristic until API/ML is wired:
  // normalize each answer to 0..1 then average.
  let sum = 0;
  let count = 0;

  for (const [, idx] of entries) {
    const n = typeof idx === 'number' ? idx : Number(idx);
    if (Number.isNaN(n)) continue;
    // Most questions are 0..3 or 0..1 or 0..8
    // We clamp to 0..8 and normalize by 8 to avoid depending on options length.
    const clamped = Math.max(0, Math.min(8, n));
    sum += clamped / 8;
    count += 1;
  }

  if (!count) return 0;
  return Math.round((sum / count) * 100);
}

function recommendationFor(percent) {
  if (percent >= 67) {
    return 'Your responses indicate moderate to severe symptoms. We strongly recommend booking a session with one of our specialists to discuss these results and get the appropriate support.';
  }
  if (percent >= 34) {
    return 'Your responses indicate mild to moderate symptoms. Consider booking a session to talk through your results and explore helpful coping strategies.';
  }
  return 'Your responses indicate low symptom severity. Keep monitoring how you feel, and consider supportive resources if anything changes.';
}

export default function AssessmentResult() {
  const navigate = useNavigate();
  const circleRef = useRef(null);
  const [toast, setToast] = useState(null);

  const result = useMemo(() => safeLoadResult(), []);
  const targetPercent = useMemo(() => Math.round((result?.confidence || 0) * 100), [result]);
  const diagnosis = useMemo(() => result?.diagnosis || 'Unable to determine', [result]);
  const disclaimer = useMemo(() => result?.disclaimer || 'This assessment is for guidance only and does not replace a consultation with medical professionals.', [result]);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return undefined;

    const duration = 2000;
    const start = performance.now();

    function frame(now) {
      const ratio = Math.min((now - start) / duration, 1);
      const currentValue = ratio * targetPercent;
      const degrees = (currentValue / 100) * 360;
      circle.style.background = `conic-gradient(#0d6efd ${degrees}deg, #e9ecef 0deg)`;
      if (ratio < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    return undefined;
  }, [targetPercent]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <AppLayout variant="patient" showSidebar={false}>
      <div className={styles.page}>
        <header className={styles.navbarHeader}>
          <div className={styles.navInner}>
            <h4 className={styles.brand}>Eltherabito</h4>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setToast({ type: 'info', message: 'Menu options would appear here' })}
              aria-label="Menu"
            >
              <FaEllipsisV aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.pageContent}>
            <div className={styles.card}>
              <div className={styles.bgDecoration} aria-hidden="true" />

              <div className={styles.content}>
                <div className={styles.iconCircle} aria-hidden="true">
                  <FaCog />
                </div>

                <h3 className={styles.title}>Assessment Result</h3>
                <p className={styles.lead}>
                  Thank you for completing the assessment. This result is based on your responses. Please remember
                  that this is for guidance only and does not replace a consultation with medical professionals.
                </p>

                <div className={styles.progressCircleContainer}>
                  <div ref={circleRef} className={styles.progressCircle}>
                    <div className={styles.progressValue}>
                      <p className={styles.percent}>{targetPercent}%</p>
                      <span className={`${styles.extraSmall}`}>Confidence</span>
                    </div>
                  </div>
                </div>

                <div className={styles.recommendationBox}>
                  <div className={styles.recommendationRow}>
                    <FaInfoCircle className={styles.infoIcon} aria-hidden="true" />
                    <div>
                      <h6 className={styles.recTitle}>Diagnosis</h6>
                      <p className={styles.recText}>{diagnosis}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.recommendationBox}>
                  <div className={styles.recommendationRow}>
                    <FaInfoCircle className={styles.infoIcon} aria-hidden="true" />
                    <div>
                      <h6 className={styles.recTitle}>Disclaimer</h6>
                      <p className={styles.recText}>{disclaimer}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.btnDarkBlue}
                    onClick={() => navigate(ROUTES.patient.booking)}
                  >
                    <FaCalendarCheck aria-hidden="true" /> Book Session Now
                  </button>
                  <button
                    type="button"
                    className={styles.btnOutlineSecondary}
                    onClick={() => navigate(ROUTES.patient.dashboard)}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {toast && (
          <div
            className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastInfo}`}
            role="alert"
            aria-live="polite"
          >
            {toast.message}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

