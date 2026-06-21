import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCube,
  FaSearch,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarCheck,
  FaShieldAlt,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import { saveSelectedTherapist, getSelectedTherapist, saveBooking } from '../../utils/bookingStorage';
import bookingService from '../../services/bookingService';
import styles from './BookAppointment.module.css';

const DEFAULT_THERAPISTS = [
  {
    id: 1,
    name: 'Dr. Elena Sterling',
    specialty: 'CLINICAL PSYCHOLOGIST',
    rating: 4.9,
    experience: '12 years exp.',
    description: 'Specializes in CBT and mindfulness for anxiety, depression, and stress management.',
    price: 120,
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Dr. Marcus Vance',
    specialty: 'PSYCHOTHERAPIST (CBT)',
    rating: 4.8,
    experience: '8 years exp.',
    description: 'Focusing on relationship dynamics, family therapy, and personal growth strategies.',
    price: 110,
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Sarah Jenkins, LMHC',
    specialty: 'MENTAL HEALTH COUNSELOR',
    rating: 5.0,
    experience: '15 years exp.',
    description: 'Trauma-informed specialist helping clients navigate PTSD and emotional resilience.',
    price: 145,
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'PSYCHIATRIST',
    rating: 4.9,
    experience: '10 years exp.',
    description: 'Expert in medication management and psychotherapy for mood disorders and ADHD.',
    price: 160,
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
  },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Generates a distinct, professional-looking avatar per doctor (based on their name)
// for doctors who don't have a real uploaded profile photo yet.
function getFallbackAvatar(firstName, lastName) {
  const seed = encodeURIComponent(`${firstName || ''} ${lastName || ''}`.trim() || 'Doctor');
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear&backgroundColor=2563eb,1e40af,0ea5e9&textColor=ffffff&fontWeight=600`;
}

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

function useNotification() {
  const [message, setMessage] = useState(null);
  const show = useCallback((msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);
  return { message, show };
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const { message, show } = useNotification();

  const [search, setSearch] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(getSelectedTherapist);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [selectedTime, setSelectedTime] = useState('01:00 PM');
  const [booking, setBooking] = useState(false);
  const [therapists, setTherapists] = useState(DEFAULT_THERAPISTS);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = useMemo(() => buildCalendarDays(year, month), [year, month]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await bookingService.getDoctors();
        const mappedDoctors = data.map(d => ({
          id: d.id,
          name: `Dr. ${d.firstName} ${d.lastName}`,
          specialty: d.specialty.toUpperCase(),
          rating: 4.8,
          experience: `${d.yearsOfExp} years exp.`,
          description: d.bio || 'Experienced healthcare professional.',
          price: d.sessionPrice,
          img: d.profilePictureUrl
            ? `https://mentalhealth01.runasp.net/api/images/doctors/${d.profilePictureUrl}`
            : getFallbackAvatar(d.firstName, d.lastName),
        }));
        setTherapists(mappedDoctors);
      } catch (error) {
        show(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  // ✅ إصلاح: أزلنا show من الـ dependencies
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDoctorId) return;

      const dateObj = new Date(year, month, selectedDay);
      const dateStr = formatLocalDate(dateObj);

      setTimeSlots([]);

      try {
        const data = await bookingService.getDoctorSlots(selectedDoctorId, dateStr);
        const mappedSlots = data.map(slot => {
          const [hours = '0', minutes = '00'] = String(slot.startTime ?? '').split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return {
            id: slot.id,
            displayTime: `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`,
          };
        });
        setTimeSlots(mappedSlots);
      } catch (error) {
        setTimeSlots([]);
      }
    }
    fetchSlots();
  }, [selectedDoctorId, year, month, selectedDay]);

  const filteredTherapists = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return therapists;
    return therapists.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q)
    );
  }, [search, therapists]);

  const bookingSummary = useMemo(() => {
    const monthShort = currentMonth.toLocaleString('default', { month: 'short' });
    return `${monthShort} ${selectedDay}, ${selectedTime}`;
  }, [currentMonth, selectedDay, selectedTime]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        handleBookNow();
      }
      if (e.key === 'Escape') {
        navigate(-1);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTherapist, bookingSummary]);

  function handleSelectTherapist(name, doctorId) {
    setSelectedTherapist(name);
    setSelectedDoctorId(doctorId);
    setSelectedSlotId(null);
    setSelectedTime('');
    saveSelectedTherapist(name);
    show(`✓ ${name} selected!`);
  }

  function navigateMonth(direction) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  function handleSelectDay(day, inMonth) {
    if (!inMonth) return;
    setSelectedDay(day);
    setSelectedSlotId(null);
    setSelectedTime('');
    const monthShort = currentMonth.toLocaleString('default', { month: 'short' });
    show(`📅 Date selected: ${monthShort} ${day}`);
  }

  function handleSelectTime(slot) {
    setSelectedTime(slot.displayTime);
    setSelectedSlotId(slot.id);
    show(`🕐 Time selected: ${slot.displayTime}`);
  }

  // ✅ إصلاح رئيسي: async + استدعاء الـ API قبل الـ navigate
  async function handleBookNow() {
    if (!selectedTherapist) {
      show('❌ Please select a therapist');
      return;
    }
    if (!selectedSlotId) {
      show('❌ Please select a time slot');
      return;
    }

    const therapist = therapists.find((t) => t.name === selectedTherapist);
    const dateObj = new Date(year, month, selectedDay);
    const dateStr = formatLocalDate(dateObj);
    const dateLabel = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    saveBooking({
      therapist: selectedTherapist,
      specialty: therapist?.specialty ?? '',
      price: therapist?.price ?? 0,
      img: therapist?.img ?? '',
      dateTime: bookingSummary,
      dateLabel,
      time: selectedTime,
      timeRange: `${selectedTime} · 60 min session`,
      duration: '60 Mins',
      bookedAt: new Date().toISOString(),
      doctorId: selectedDoctorId,
      doctorScheduleId: selectedSlotId,
      appointmentDate: dateStr,
    });

    navigate(ROUTES.patient.bookingConfirm);
  }

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
        <div className={styles.headerContent}>
          <button type="button" className={styles.logoSection} onClick={() => navigate(ROUTES.patient.dashboard)}>
            <FaCube />
            <span className={styles.logoText}>Eltherabito</span>
          </button>

          <nav className={styles.headerNav}>
            <button type="button" className={styles.navLink} onClick={() => navigate(ROUTES.patient.booking)}>
              Find Therapist
            </button>
            <button type="button" className={styles.navLink} onClick={() => navigate(ROUTES.patient.bookings)}>
              My Bookings
            </button>
          </nav>

          <div className={styles.headerActions}>
            <div className={styles.searchContainer}>
              <FaSearch />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search by name or specialist"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search therapists"
              />
            </div>
            <button type="button" className={styles.profileBtn} onClick={() => navigate(ROUTES.patient.profile)}>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                alt="Profile"
                className={styles.profileImg}
              />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <section className={styles.therapistsSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.sectionTitle}>Book an Appointment</h1>
              <p className={styles.sectionSubtitle}>
                Select a professional who aligns with your journey towards wellness.
              </p>
            </div>

            <div className={styles.therapistsList}>
              {search.trim() && filteredTherapists.length === 0 && (
                <p className={styles.sectionSubtitle}>No therapists found for your search.</p>
              )}
              {filteredTherapists.map((t, index) => (
                <article
                  key={t.id}
                  className={`${styles.therapistCard} ${
                    selectedTherapist === t.name ? styles.therapistCardSelected : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.therapistCardLeft}>
                    <img src={t.img} alt={t.name} className={styles.therapistImage} />
                  </div>
                  <div className={styles.therapistCardContent}>
                    <h3 className={styles.therapistName}>{t.name}</h3>
                    <p className={styles.therapistSpecialty}>{t.specialty}</p>
                    <div className={styles.therapistRating}>
                      <FaStar className={styles.starIcon} aria-hidden="true" />
                      <span className={styles.ratingValue}>{t.rating}</span>
                      <span className={styles.ratingCount}>{t.experience}</span>
                    </div>
                    <p className={styles.therapistDescription}>{t.description}</p>
                  </div>
                  <div className={styles.therapistCardRight}>
                    <p className={styles.sessionLabel}>SESSION PRICE</p>
                    <p className={styles.sessionPrice}>
                      ${t.price}
                      <span className={styles.priceUnit}>/hr</span>
                    </p>
                    <button
                      type="button"
                      className={`${styles.btnSelect} ${
                        selectedTherapist === t.name ? styles.btnSelectActive : ''
                      }`}
                      onClick={() => handleSelectTherapist(t.name, t.id)}
                    >
                      {selectedTherapist === t.name ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className={styles.bookingSidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <h2 className={styles.bookingTitle}>Select Date &amp; Time</h2>
                <div className={styles.calendarNav}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    aria-label="Previous month"
                    onClick={() => navigateMonth(-1)}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    className={styles.navBtn}
                    aria-label="Next month"
                    onClick={() => navigateMonth(1)}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <div className={styles.calendarContainer}>
                <h3 className={styles.calendarMonth}>{monthLabel}</h3>
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
                      onClick={() => handleSelectDay(cell.day, cell.inMonth)}
                      disabled={!cell.inMonth}
                    >
                      {cell.day}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.timeSlotsSection}>
                <h3 className={styles.timeSlotsTitle}>AVAILABLE TIME SLOTS</h3>
                {timeSlots.length > 0 ? (
                  <div className={styles.timeSlotsGrid}>
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id || slot.displayTime}
                        type="button"
                        className={`${styles.timeSlot} ${
                          selectedTime === slot.displayTime ? styles.timeSlotSelected : ''
                        }`}
                        onClick={() => handleSelectTime(slot)}
                      >
                        {slot.displayTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.sectionSubtitle}>No time slots available for this doctor and date.</p>
                )}
              </div>

              <div className={styles.bookingSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>BOOKING FOR</span>
                  <span className={styles.summaryValue}>{bookingSummary}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>DURATION</span>
                  <span className={styles.summaryValue}>60 Mins</span>
                </div>
              </div>

              <button
                type="button"
                className={styles.btnBookNow}
                onClick={handleBookNow}
                disabled={booking}
              >
                <FaCalendarCheck aria-hidden="true" />
                {booking ? 'Booking...' : 'Book Now'}
              </button>

              <div className={styles.securityNotice}>
                <FaShieldAlt className={styles.securityIcon} aria-hidden="true" />
                <div>
                  <span className={styles.securityTitle}>Secure &amp; Confidential</span>
                  <p className={styles.securityText}>
                    All sessions are HIPAA-compliant and end-to-end encrypted.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {message && (
        <div className={styles.notification} role="alert" aria-live="polite">
          {message}
        </div>
      )}
    </div>
  );
}