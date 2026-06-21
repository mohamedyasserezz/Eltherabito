import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaUtensils, FaMoon, FaPlus,
  FaCircle, FaTimes, FaCheck, FaUser,
  FaChevronLeft, FaChevronRight, FaTimes as FaClose,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import AppLayout from '../../components/layout/AppLayout';
import adminService from '../../services/adminService';
import bookingService from '../../services/bookingService';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';
import styles from './DailyAgenda.module.css';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    cells.push({ day: prevMonthDays - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, inMonth: false });
  }
  return cells;
}

/* ── Toast ── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  function show(msg, type = 'info') {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }
  return { toasts, show };
}

export default function DailyAgenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. Alex Carter');
  const [doctorAvatar, setDoctorAvatar] = useState(() => getInitialsAvatar());
  const { toasts, show } = useToast();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = useMemo(() => buildCalendarDays(year, month), [year, month]);
  const dateChip = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const dateStr = formatLocalDate(selectedDate);
        const data = await adminService.getAppointmentAgenda(dateStr);
        const mappedSessions = data.map(apt => ({
          id: apt.appointmentId,
          time: formatTime(apt.startTime),
          ampm: getAmPm(apt.startTime),
          duration: calculateDuration(apt.startTime, apt.endTime),
          name: apt.patientName,
          img: getAvatarUrl(apt.pictureUrl, apt.patientName),
          status: mapStatus(apt.status),
          patientId: apt.patientId,
        }));
        setSessions(mappedSessions);
      } catch (error) {
        show(error.message, 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const data = await bookingService.getDoctorProfile();
        setDoctorName(data.fullName || 'Dr. Alex Carter');
        setDoctorAvatar(getAvatarUrl(data.profilePictureUrl, data.fullName));
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
      }
    }
    fetchDoctor();
  }, []);

  function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes}`;
  }

  function getAmPm(timeStr) {
    const [hours] = timeStr.split(':');
    const hour = parseInt(hours);
    return hour >= 12 ? 'PM' : 'AM';
  }

  function calculateDuration(startTime, endTime) {
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMins;
    const endTotal = endHours * 60 + endMins;
    const diff = endTotal - startTotal;
    return `${diff} min`;
  }

  function mapStatus(status) {
    const statusMap = {
      0: null,      // Pending
      1: 'done',    // Done
      2: 'cancelled', // Cancelled
      3: 'missed',   // Missed
    };
    return statusMap[status] || null;
  }

  function mapStatusToBackend(status) {
    const statusMap = {
      'done': 1,
      'cancelled': 2,
      'missed': 3,
    };
    return statusMap[status];
  }

  function navigateMonth(direction) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  function handleSelectDay(day, inMonth) {
    if (!inMonth) return;
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    setShowCalendar(false);
    setLoading(true);
    show(`📅 Date selected: ${newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
  }

  function updateSession(id, patch) {
    setSessions(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  async function handleCancel(s) {
    if (!window.confirm(`Cancel session with ${s.name}?`)) return;
    try {
      await adminService.updateAppointmentStatus(s.id, 2); // Cancelled = 2
      updateSession(s.id, { status: 'cancelled' });
      show(`Session with ${s.name} cancelled.`, 'warning');
    } catch (error) {
      show(error.message, 'danger');
    }
  }

  async function handleMissed(s) {
    try {
      await adminService.updateAppointmentStatus(s.id, 3); // Missed = 3
      updateSession(s.id, { status: 'missed' });
      show(`${s.name} marked as missed.`, 'danger');
    } catch (error) {
      show(error.message, 'danger');
    }
  }

  async function handleDone(s) {
    try {
      await adminService.updateAppointmentStatus(s.id, 1); // Done = 1
      updateSession(s.id, { status: 'done' });
      show(`Session with ${s.name} marked as done! ✓`, 'success');
    } catch (error) {
      show(error.message, 'danger');
    }
  }
  function handleProfile(session) {
    navigate(ROUTES.therapist.viewPatient, {
      state: {
        sessionId: session.id,
        patientId: session.patientId,
        name: session.name,
        photo: session.img,
      },
    });
  }

  const beforeLunch = sessions.filter(s => ['09:00','10:30','12:00'].includes(s.time));
  const afterLunch  = sessions.filter(s => !['09:00','10:30','12:00'].includes(s.time));

  const therapistHeader = (
    <div className={styles.navRight}>
      <div className={styles.liveBadge}>
        <span className={styles.liveDot} /> LIVE
      </div>
      <button
        type="button"
        className={styles.therapistPill}
        onClick={() => navigate(ROUTES.therapist.profile)}
        aria-label="Open therapist profile"
      >
        <div className={styles.therapistInfo}>
          <div className={styles.therapistName}>{doctorName}</div>
          <div className={styles.therapistRole}>Therapist</div>
        </div>
        <img
          className={styles.therapistAvatar}
          src={doctorAvatar}
          alt={doctorName}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <AppLayout variant="therapist" showSidebar={false} headerSlot={therapistHeader}>
        <div className={styles.wrapper}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Daily Agenda</h1>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout variant="therapist" showSidebar={false} headerSlot={therapistHeader}>
      <div className={styles.wrapper}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Daily Agenda</h1>
          <div className={styles.pageMeta}>
            <span className={styles.dateChip}>{dateChip}</span>
            <button
              type="button"
              className={styles.calendarLink}
              onClick={() => setShowCalendar(true)}
              aria-label="Open calendar"
            >
              <FaCalendarAlt /> Full Calendar
            </button>
            <span className={styles.sessionsCount}>
              <strong>{sessions.filter(s => s.status !== 'cancelled').length}</strong> sessions today
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>

          {/* Before lunch */}
          {beforeLunch.map((s) => (
            <SessionRow key={s.id} session={s}
              onCancel={() => handleCancel(s)}
              onMissed={() => handleMissed(s)}
              onDone={() => handleDone(s)}
              onProfile={() => handleProfile(s)}
            />
          ))}

          {/* Lunch break */}
          <div className={styles.breakRow}>
            <div className={styles.breakTimeLabel}>01:00 PM</div>
            <div className={styles.breakLabel}><FaUtensils /> Lunch Break</div>
          </div>

          {/* After lunch */}
          {afterLunch.map((s) => (
            <SessionRow key={s.id} session={s}
              onCancel={() => handleCancel(s)}
              onMissed={() => handleMissed(s)}
              onDone={() => handleDone(s)}
              onProfile={() => handleProfile(s)}
            />
          ))}

          {/* End of day */}
          <div className={styles.endRow}>
            <div className={styles.endTime}>END</div>
            <div className={styles.endLabel}><FaMoon /> Rest &amp; Recharge</div>
          </div>

        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarModal
          year={year}
          month={month}
          monthLabel={monthLabel}
          calendarDays={calendarDays}
          selectedDay={selectedDate.getDate()}
          currentMonthYear={new Date(year, month)}
          onNavigateMonth={navigateMonth}
          onSelectDay={handleSelectDay}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* FAB */}
      <button className={styles.fab} onClick={() => show('Add new session — coming soon!', 'info')}>
        <FaPlus />
      </button>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerCopy}>© 2026 ELTHERABITO PROTOCOL. SYSTEMS OPERATIONAL.</span>
        <nav className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Security</a>
          <a href="#">Support</a>
        </nav>
      </footer>

      {/* Toasts */}
      <div className={styles.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[`toast_${t.type}`]}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

/* ── Session Row Component ── */
function SessionRow({ session: s, onCancel, onMissed, onDone, onProfile }) {
  const isCancelled = s.status === 'cancelled';
  const isMissed    = s.status === 'missed';
  const isDone      = s.status === 'done';
  const isPending   = s.status === null; // Pending = 0 from backend

  return (
    <div className={`${styles.timeSlot} ${isCancelled ? styles.slotCancelled : ''}`}>
      <div className={`${styles.timeLabel} ${!isCancelled ? '' : styles.timeLabelMuted}`}>
        <div className={styles.hour}>{s.time}</div>
        <div className={styles.ampm}>{s.ampm}</div>
        <div className={styles.duration}>{s.duration}</div>
      </div>

      <div className={`${styles.sessionCard}
        ${isMissed ? styles.cardMissed : ''}
        ${isDone   ? styles.cardDone   : ''}
      `}>
        <div className={styles.sessionLeft}>
          <img className={styles.clientAvatar} src={s.img} alt={s.name} />
          <div>
            <div className={styles.clientName}>{s.name}</div>
            <div className={styles.onlineTag}><FaCircle className={styles.onlineDot} /> Online</div>
          </div>
        </div>

        <div className={styles.sessionActions}>
          {isPending && (
            <>
              <button className={`${styles.btnAction} ${styles.btnCancel}`} onClick={onCancel}>
                <FaTimes /> Cancel
              </button>
              <button className={`${styles.btnAction} ${styles.btnMissed}`} onClick={onMissed}>
                Missed
              </button>
              <button className={`${styles.btnAction} ${styles.btnDone}`} onClick={onDone}>
                <FaCheck /> Done
              </button>
            </>
          )}
          {!isPending && (
            <div className={styles.statusBadge}>
              {isDone && <span className={styles.statusDone}>Done</span>}
              {isCancelled && <span className={styles.statusCancelled}>Cancelled</span>}
              {isMissed && <span className={styles.statusMissed}>Missed</span>}
            </div>
          )}
          <button className={`${styles.btnAction} ${styles.btnProfile}`} onClick={onProfile}>
            <FaUser /> View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Calendar Modal Component ── */
function CalendarModal({ year, month, monthLabel, calendarDays, selectedDay, onNavigateMonth, onSelectDay, onClose }) {
  return (
    <div className={styles.calendarModalOverlay} onClick={onClose}>
      <div className={styles.calendarModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.calendarModalHeader}>
          <h2 className={styles.calendarModalTitle}>Select Date</h2>
          <button
            type="button"
            className={styles.calendarModalClose}
            onClick={onClose}
            aria-label="Close calendar"
          >
            <FaClose />
          </button>
        </div>

        <div className={styles.calendarModalContent}>
          <div className={styles.calendarNav}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Previous month"
              onClick={() => onNavigateMonth(-1)}
            >
              <FaChevronLeft />
            </button>
            <h3 className={styles.calendarMonth}>{monthLabel}</h3>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Next month"
              onClick={() => onNavigateMonth(1)}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.calendarHeader}>
            {DAY_LABELS.map((label, i) => (
              <div key={`${label}-${i}`} className={styles.dayLabel}>{label}</div>
            ))}
          </div>
          <div className={styles.calendarBody}>
            {calendarDays.map((cell, i) => (
              <button
                key={`${cell.day}-${i}`}
                type="button"
                className={`${styles.calendarDay} ${
                  !cell.inMonth ? styles.calendarDayEmpty : ''
                } ${cell.inMonth && cell.day === selectedDay ? styles.calendarDaySelected : ''}`}
                onClick={() => onSelectDay(cell.day, cell.inMonth)}
                disabled={!cell.inMonth}
              >
                {cell.day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}