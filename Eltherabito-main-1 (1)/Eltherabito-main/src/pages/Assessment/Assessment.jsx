import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AppLayout from '../../components/layout/AppLayout';
import { ROUTES } from '../../routes/paths';
import bookingService from '../../services/bookingService';
import styles from './Assessment.module.css';

const ASSESSMENT_ANSWERS_KEY = 'assessmentAnswers';
const ASSESSMENT_TIME_KEY = 'assessmentTime';
const ASSESSMENT_RESULT_KEY = 'assessmentResult';

const QUESTIONS = [
  { id: 1, text: 'How often do you feel sad or emotionally low?', options: ['Seldom', 'Sometimes', 'Usually', 'Most Often'] },
  { id: 2, text: "How often do you feel unusually euphoric or 'on top of the world'?", options: ['Seldom', 'Sometimes', 'Usually', 'Most Often'] },
  { id: 3, text: 'How often do you feel mentally or physically exhausted?', options: ['Seldom', 'Sometimes', 'Usually', 'Most Often'] },
  { id: 4, text: 'How often do you experience sleep problems?', options: ['Seldom', 'Sometimes', 'Usually', 'Most Often'] },
  { id: 5, text: 'Do you experience noticeable mood swings?', options: ['No', 'Yes'] },
  { id: 6, text: 'Have you had any thoughts of harming yourself or not wanting to be alive?', options: ['No', 'Yes'] },
  { id: 7, text: 'Have you had significant changes in appetite or eating habits?', options: ['No', 'Yes'] },
  { id: 8, text: 'Do you generally respect and comply with rules or authority figures?', options: ['No', 'Yes'] },
  { id: 9, text: 'When there is a conflict, do you try to explain your point of view calmly?', options: ['No', 'Yes'] },
  { id: 10, text: 'Do you have a tendency toward aggressive or impulsive reactions?', options: ['No', 'Yes'] },
  { id: 11, text: 'When something upsets you, can you ignore it and move on easily?', options: ['No', 'Yes'] },
  { id: 12, text: 'Have you experienced nervous breakdowns or emotional collapses?', options: ['No', 'Yes'] },
  { id: 13, text: 'Can you admit your mistakes without excessive guilt or defensiveness?', options: ['No', 'Yes'] },
  { id: 14, text: 'Do you often find yourself overthinking or unable to stop repetitive thoughts?', options: ['No', 'Yes'] },
  { id: 15, text: 'How would you rate your current level of sexual drive or activity?', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 16, text: 'How well can you concentrate on tasks or conversations?', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  { id: 17, text: 'How optimistic do you generally feel about your life and future?', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
];

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

function mapAnswersToApiFormat(answers) {
  const options1_4 = ['Seldom', 'Sometimes', 'Usually', "Most-Often"];
const optionsYesNo = ['NO', 'YES'];  
  return {
    sadness: options1_4[answers['1']] || 'Seldom',
    euphoric: options1_4[answers['2']] || 'Seldom',
    exhausted: options1_4[answers['3']] || 'Seldom',
    'Sleep dissorder': options1_4[answers['4']] || 'Seldom',
    'Mood Swing': optionsYesNo[answers['5']] || 'No',
    'Suicidal thoughts': optionsYesNo[answers['6']] || 'No',
    Anorxia: optionsYesNo[answers['7']] || 'No',
    'Authority Respect': optionsYesNo[answers['8']] || 'No',
    'Try-Explanation': optionsYesNo[answers['9']] || 'No',
    'Aggressive Response': optionsYesNo[answers['10']] || 'No',
    'Ignore & Move-On': optionsYesNo[answers['11']] || 'No',
    'Nervous Break-down': optionsYesNo[answers['12']] || 'No',
    'Admit Mistakes': optionsYesNo[answers['13']] || 'No',
    overthinking: optionsYesNo[answers['14']] || 'No',
    'Sexual Activity': parseInt(answers['15']) + 1 || 1,
    concentration: parseInt(answers['16']) + 1 || 1,
    Optimisim: parseInt(answers['17']) + 1 || 1,
  };
}

export default function Assessment() {
  const navigate = useNavigate();
  const total = QUESTIONS.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => safeLoadAnswers());
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const stepNum = currentIndex + 1;
  const percent = useMemo(() => (stepNum / total) * 100, [stepNum, total]);

  const canGoNext = useMemo(() => {
    const id = currentQuestion?.id;
    return id != null && Object.prototype.hasOwnProperty.call(answers, String(id));
  }, [answers, currentQuestion?.id]);

  const saveAnswers = useCallback(
    (nextAnswers) => {
      try {
        localStorage.setItem(ASSESSMENT_ANSWERS_KEY, JSON.stringify(nextAnswers));
        localStorage.setItem(ASSESSMENT_TIME_KEY, new Date().toISOString());
      } catch {
        // ignore
      }
    },
    [],
  );

  useEffect(() => {
    saveAnswers(answers);
  }, [answers, saveAnswers]);

  useEffect(() => {
    function handleKeyboard(e) {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (canGoNext) {
          nextQuestion();
        }
      }
    }
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [canGoNext, currentIndex, total]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  function selectOption(optionIndex) {
    setAnswers((prev) => {
      const next = { ...prev, [String(currentQuestion.id)]: optionIndex };
      return next;
    });
  }

  function previousQuestion() {
    setCurrentIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function nextQuestion() {
    if (!canGoNext) {
      setToast({ type: 'warning', message: 'Please select an answer' });
      return;
    }
    if (currentIndex === total - 1) {
      setLoading(true);
      setToast({ type: 'info', message: 'Analyzing your responses...' });
      try {
        const apiData = mapAnswersToApiFormat(answers);
        const result = await bookingService.predictAssessment(apiData);
        localStorage.setItem(ASSESSMENT_RESULT_KEY, JSON.stringify(result));
        setToast({ type: 'success', message: 'Assessment Complete! Redirecting...' });
        window.setTimeout(() => navigate(ROUTES.patient.assessmentResult), 800);
      } catch (error) {
        setToast({ type: 'warning', message: error.message || 'Failed to analyze assessment' });
      } finally {
        setLoading(false);
      }
      return;
    }
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exitAssessment() {
    const ok = window.confirm('Exit Assessment? Your progress will be saved.');
    if (!ok) return;
    saveAnswers(answers);
    navigate(ROUTES.patient.dashboard);
  }

  const toastClass =
    toast?.type === 'success'
      ? styles.toastSuccess
      : toast?.type === 'warning'
        ? styles.toastWarning
        : styles.toastInfo;

  return (
    <AppLayout variant="patient" showSidebar={false}>
      <div className={styles.page}>
        <nav className={styles.navbar}>
          <span className={styles.navbarBrand}>Eltherabito</span>
          <button type="button" className={styles.exitBtn} onClick={exitAssessment} title="Exit Assessment">
            <FaTimes className={styles.exitIcon} aria-hidden="true" />
            <span>Exit Assessment</span>
          </button>
        </nav>

        <div className={styles.containerMain}>
          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressLabel}>ASSESSMENT PROGRESS</span>
              <span className={styles.progressCounter}>
                Step <span>{stepNum}</span> of {total}
              </span>
            </div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBar} style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className={styles.questionCard}>
            <h2 className={styles.questionText}>{currentQuestion.text}</h2>

            <div className={styles.optionsList}>
              {currentQuestion.options.map((option, idx) => {
                const selected = answers[String(currentQuestion.id)] === idx;
                return (
                  <div
                    key={`${currentQuestion.id}-${option}`}
                    className={`${styles.optionItem} ${selected ? styles.optionItemSelected : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectOption(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') selectOption(idx);
                    }}
                  >
                    <div className={styles.radioCircle} aria-hidden="true">
                      <div className={styles.radioDot} />
                    </div>
                    <span className={styles.optionText}>{option}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.navFooter}>
              <button type="button" className={styles.btnBack} onClick={previousQuestion} disabled={currentIndex === 0 || loading}>
                <FaChevronLeft aria-hidden="true" /> Back
              </button>
              <button type="button" className={styles.btnNext} onClick={nextQuestion} disabled={!canGoNext || loading}>
                {loading ? 'Analyzing...' : currentIndex === total - 1 ? 'Predict' : 'Next'} <FaChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={styles.securityNote}>
            <p>Your answers are secure and confidential.</p>
          </div>
        </div>

        {toast && (
          <div className={`${styles.toast} ${toastClass}`} role="alert" aria-live="polite">
            {toast.message}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

