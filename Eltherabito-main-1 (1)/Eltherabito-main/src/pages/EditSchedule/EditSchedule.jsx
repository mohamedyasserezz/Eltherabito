import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell, FaQuestionCircle, FaUserCircle, FaClock, FaTrash,
  FaPlusCircle, FaTimes,
} from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';
import {
  SCHEDULE_DAYS,
} from '../../utils/scheduleStorage';
import bookingService from '../../services/bookingService';
import styles from './EditSchedule.module.css';

function sanitizeHours(value) {
  let v = value.replace(/[^0-9]/g, '').slice(0, 2);
  if (v.length === 2) {
    const h = parseInt(v, 10);
    if (h > 12) v = '12';
    else if (h === 0) v = '12';
  }
  return v;
}

function sanitizeMinutes(value) {
  let v = value.replace(/[^0-9]/g, '').slice(0, 2);
  if (v.length === 2 && parseInt(v, 10) > 59) v = '59';
  return v;
}

export default function EditSchedule() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(() => {
    const initial = {};
    SCHEDULE_DAYS.forEach(d => {
      initial[d.id] = { active: true, slots: [] };
    });
    return initial;
  });
  const [activeDay, setActiveDay] = useState('monday');
  const [showInput, setShowInput] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [period, setPeriod] = useState('AM');
  const [endHours, setEndHours] = useState('');
  const [endMinutes, setEndMinutes] = useState('');
  const [endPeriod, setEndPeriod] = useState('AM');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const minutesRef = useRef(null);
  const hoursRef = useRef(null);
  const endMinutesRef = useRef(null);
  const endHoursRef = useRef(null);

  const activeDayMeta = SCHEDULE_DAYS.find((d) => d.id === activeDay);
  const dayData = schedule[activeDay];

  const dayOfWeekMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // Map backend day strings to day IDs
  const dayStringToIdMap = {
    'Sunday': 'sunday',
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
  };

  useEffect(() => {
    async function fetchSchedules() {
      try {
        console.log('🔄 Fetching doctor schedules...');
        const data = await bookingService.getDoctorSchedules();
        console.log('✅ API Response:', data);
        
        const mappedSchedule = {};
        SCHEDULE_DAYS.forEach(d => {
          mappedSchedule[d.id] = { active: true, slots: [] };
        });
        
        // Map slots with their IDs from backend
        data.forEach(s => {
          console.log('📍 Processing API slot:', {
            apiDayValue: s.dayOfWeek || s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            id: s.id,
          });
          
          // Map day string from API (e.g., "Monday") to day ID (e.g., "monday")
          const dayId = dayStringToIdMap[s.day];
          
          if (dayId && mappedSchedule[dayId]) {
            mappedSchedule[dayId].slots.push({
              id: s.id,
              startTime: s.startTime,
              endTime: s.endTime,
              display: `${s.startTime} - ${s.endTime}`,
            });
            console.log(`✅ Added slot to ${dayId}:`, s);
          } else {
            console.warn('⚠️ Could not map day:', s.day, 'Available maps:', Object.keys(dayStringToIdMap));
          }
        });
        
        console.log('📋 Final mapped schedule:', mappedSchedule);
        setSchedule(mappedSchedule);
      } catch (error) {
        console.error('❌ Failed to load schedule:', error);
        showError('Failed to load schedule: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, []);

  function showError(msg) {
    setAlert({ type: 'error', text: msg });
    setTimeout(() => setAlert(null), 4000);
  }

  function showSuccess(msg) {
    setAlert({ type: 'success', text: msg });
    setTimeout(() => setAlert(null), 3000);
  }

  const persistSchedule = useCallback((data) => {
    // saveSchedule(data);
  }, []);

  useEffect(() => {
    function onBeforeUnload() {
      persistSchedule(schedule);
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [schedule, persistSchedule]);

  function selectDay(dayId) {
    console.log('📅 Selecting day:', dayId, 'dayOfWeek:', dayOfWeekMap[dayId]);
    setActiveDay(dayId);
    closeInput();
    // Refetch slots for the newly selected day
    refetchSlotsForDay(dayOfWeekMap[dayId]);
  }

  async function refetchSlotsForDay(dayOfWeek) {
    try {
      console.log('🔄 Refetching slots for day of week:', dayOfWeek);
      
      // Get ALL schedules and filter for this specific day
      const allSlots = await bookingService.getDoctorSchedules();
      console.log('✅ All fetched schedules:', allSlots);
      
      // Find the day name from dayOfWeek number
      const dayNames = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
      };
      
      const targetDayName = dayNames[dayOfWeek];
      console.log('🔍 Looking for day:', targetDayName, '(dayOfWeek:', dayOfWeek + ')');
      
      // Filter slots for this day
      const slotsForDay = allSlots.filter(s => s.day === targetDayName);
      console.log('✅ Filtered slots for', targetDayName + ':', slotsForDay);
      
      // Find the day ID from dayOfWeek
      const dayId = Object.keys(dayOfWeekMap).find(key => dayOfWeekMap[key] === dayOfWeek);
      
      if (dayId) {
        const mappedSlots = slotsForDay.map(s => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          display: `${s.startTime} - ${s.endTime}`,
        }));

        console.log('📋 Mapped slots for', dayId + ':', mappedSlots);

        setSchedule((prev) => ({
          ...prev,
          [dayId]: {
            ...prev[dayId],
            slots: mappedSlots,
          },
        }));
      }
    } catch (error) {
      console.error('❌ Error refetching slots:', error);
      // Don't show error to user on refetch, just log it
    }
  }

  function closeInput() {
    setShowInput(false);
    setHours('');
    setMinutes('');
    setPeriod('AM');
    setEndHours('');
    setEndMinutes('');
    setEndPeriod('AM');
  }

  function openAddInput() {
    if (showInput) {
      closeInput();
      return;
    }
    setHours('');
    setMinutes('');
    setPeriod('AM');
    setEndHours('');
    setEndMinutes('');
    setEndPeriod('AM');
    setShowInput(true);
    setTimeout(() => hoursRef.current?.focus(), 100);
  }

  async function confirmSlot() {
    const h = hours.trim();
    const m = minutes.trim();
    const eh = endHours.trim();
    const em = endMinutes.trim();
    
    if (!h || !m || !eh || !em) {
      showError('Please enter start and end times');
      return;
    }
    if (h.length !== 2 || m.length !== 2 || eh.length !== 2 || em.length !== 2) {
      showError('Please enter time as HH:MM for both start and end');
      return;
    }

    try {
      // Convert 12-hour format to 24-hour format for start time
      let hour24 = parseInt(h, 10);
      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;

      // Convert 12-hour format to 24-hour format for end time
      let endHour24 = parseInt(eh, 10);
      if (endPeriod === 'PM' && endHour24 !== 12) endHour24 += 12;
      if (endPeriod === 'AM' && endHour24 === 12) endHour24 = 0;

      const startTime = `${hour24.toString().padStart(2, '0')}:${m}`;
      const endTime = `${endHour24.toString().padStart(2, '0')}:${em}`;
      const dayOfWeek = dayOfWeekMap[activeDay];

      console.log('═══════════════════════════════════════');
      console.log('🕐 ADDING SLOT - DETAILED DEBUG:');
      console.log('  Selected Day ID:', activeDay);
      console.log('  Day Label:', activeDayMeta?.label);
      console.log('  dayOfWeekMap[activeDay]:', dayOfWeek);
      console.log('  Start Time Input:', `${h}:${m} ${period}`);
      console.log('  End Time Input:', `${eh}:${em} ${endPeriod}`);
      console.log('  Converted Start (24h):', startTime);
      console.log('  Converted End (24h):', endTime);
      console.log('  Full Payload:', {
        dayOfWeek,
        startTime,
        endTime,
      });
      console.log('═══════════════════════════════════════');

      const response = await bookingService.addScheduleSlot(dayOfWeek, startTime, endTime);
      console.log('✅ Slot added response status:', response?.status || 'unknown');
      console.log('✅ Response:', response);
      
      // After adding, wait a moment then refetch all schedules
      console.log('⏳ Waiting 500ms before refetching...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch all schedules to get the newly created slot
      console.log('🔄 Refetching ALL schedules after adding slot for day:', dayOfWeek);
      const allSlots = await bookingService.getDoctorSchedules();
      console.log('✅ Refetched all schedules:', allSlots);
      
      // Find the day name from dayOfWeek number
      const dayNames = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
      };
      
      const targetDayName = dayNames[dayOfWeek];
      console.log('🔍 Looking for day:', targetDayName);
      
      // Filter slots for this day
      const slotsForDay = allSlots.filter(s => s.day === targetDayName);
      console.log('✅ Slots for', targetDayName + ':', slotsForDay);
      
      // Map the fetched slots to local format
      const mappedSlots = slotsForDay.map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        display: `${s.startTime} - ${s.endTime}`,
      }));

      // Update state with refetched data
      setSchedule((prev) => ({
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          slots: mappedSlots,
        },
      }));
      
      closeInput();
      showSuccess('Time slot added successfully');
    } catch (error) {
      console.error('❌ Failed to add slot:', error);
      // Show the detailed error message from backend
      const errorMsg = error.message.includes('validation errors occurred') 
        ? 'Please check the time format and try again'
        : error.message;
      showError(errorMsg || 'Failed to add time slot');
    }
  }

  async function deleteSlot(slot) {
    if (!window.confirm('Delete this time slot?')) return;
    try {
      console.log('🗑️ Deleting slot:', slot);
      const dayOfWeek = dayOfWeekMap[activeDay];
      
      // Delete from backend using slot ID
      if (slot.id) {
        await bookingService.deleteScheduleSlot(slot.id);
      }
      
      // After deleting, wait a moment then refetch all schedules
      console.log('⏳ Waiting 500ms before refetching...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch all schedules to confirm deletion
      console.log('🔄 Refetching ALL schedules after deletion for day:', dayOfWeek);
      const allSlots = await bookingService.getDoctorSchedules();
      console.log('✅ Refetched all schedules:', allSlots);
      
      // Find the day name from dayOfWeek number
      const dayNames = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
      };
      
      const targetDayName = dayNames[dayOfWeek];
      console.log('🔍 Looking for day:', targetDayName);
      
      // Filter slots for this day
      const slotsForDay = allSlots.filter(s => s.day === targetDayName);
      console.log('✅ Slots for', targetDayName, 'after deletion:', slotsForDay);
      
      // Map the fetched slots to local format
      const mappedSlots = slotsForDay.map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        display: `${s.startTime} - ${s.endTime}`,
      }));

      setSchedule((prev) => ({
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          slots: mappedSlots,
        },
      }));
      showSuccess('Time slot removed');
    } catch (error) {
      console.error('❌ Failed to delete slot:', error);
      showError(error.message || 'Failed to delete time slot');
    }
  }

  async function handleDayToggle(dayId, isActive) {
    try {
      await bookingService.changeDayStatus(dayOfWeekMap[dayId], isActive);
      setSchedule((prev) => ({
        ...prev,
        [dayId]: { ...prev[dayId], active: isActive },
      }));
      showSuccess(`${dayId.charAt(0).toUpperCase() + dayId.slice(1)} ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showError('Failed to change day status');
    }
  }

  function handleSave() {
    showSuccess('Changes saved successfully');
    setTimeout(() => {
      window.alert('Your schedule has been saved successfully!');
      navigate(ROUTES.therapist.profile);
    }, 500);
  }

  function handleCancel() {
    if (window.confirm('Leave without saving changes?')) {
      navigate(ROUTES.therapist.profile);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  function handleDayKeyDown(e, index) {
    if (e.key === 'ArrowRight' && index < SCHEDULE_DAYS.length - 1) {
      e.preventDefault();
      selectDay(SCHEDULE_DAYS[index + 1].id);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      selectDay(SCHEDULE_DAYS[index - 1].id);
    }
  }

  function handleTimeKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmSlot();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeInput();
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.logoBtn}
          onClick={() => navigate(ROUTES.therapist.profile)}
        >
          Eltherabito
        </button>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconBtn}
            title="Notifications"
            onClick={() => showSuccess('No new notifications')}
          >
            <FaBell aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Help"
            onClick={() => showSuccess('Help center — coming soon')}
          >
            <FaQuestionCircle aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Profile"
            onClick={() => navigate(ROUTES.therapist.profile)}
          >
            <FaUserCircle aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Edit Schedule</h1>
          <p className={styles.pageSubtitle}>
            Set your specific session slots for each day of the week.
          </p>
        </div>

        {alert && (
          <div
            className={`${styles.alert} ${alert.type === 'error' ? styles.alertError : styles.alertSuccess}`}
            role="alert"
          >
            {alert.text}
          </div>
        )}

        <nav className={styles.daysNav} aria-label="Days of the week">
          {SCHEDULE_DAYS.map(({ id, label }, index) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeDay === id}
              aria-label={`Select ${label}`}
              className={`${styles.dayBtn} ${activeDay === id ? styles.dayBtnActive : ''}`}
              onClick={() => selectDay(id)}
              onKeyDown={(e) => handleDayKeyDown(e, index)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.scheduleCard} role="tabpanel">
          <div className={styles.scheduleHeaderRow}>
            <h2 className={styles.scheduleDayTitle}>{activeDayMeta?.label} Time Slots</h2>
            <div className={styles.dayToggle}>
              <span className={styles.toggleLabel}>Day Active</span>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id={`${activeDay}-toggle`}
                  className={styles.toggleInput}
                  checked={dayData.active}
                  onChange={(e) => handleDayToggle(activeDay, e.target.checked)}
                />
                <label htmlFor={`${activeDay}-toggle`} className={styles.toggleSlider} />
              </div>
            </div>
          </div>

          <div className={styles.slotsList}>
            {dayData.slots.map((slot, index) => (
              <div key={`${slot.id}-${index}`} className={styles.timeSlot}>
                <div className={styles.timeSlotLeft}>
                  <FaClock className={styles.slotIcon} aria-hidden="true" />
                  <span className={styles.timeText}>{slot.display}</span>
                </div>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  title="Delete"
                  onClick={() => deleteSlot(slot)}
                >
                  <FaTrash aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addSlotBtn}
            aria-label="Add new time slot"
            onClick={openAddInput}
          >
            <FaPlusCircle aria-hidden="true" />
            <span>Add New Time Slot</span>
          </button>

          {showInput && (
            <div className={styles.newSlotInput}>
              <div className={styles.inputWrapper}>
                <div className={styles.timeInputSection}>
                  <label className={styles.timeLabel}>Start Time</label>
                  <div className={styles.timeInputGroup}>
                    <FaClock className={styles.inputIcon} aria-hidden="true" />
                    <input
                      ref={hoursRef}
                      type="text"
                      className={styles.timeInput}
                      placeholder="HH"
                      maxLength={2}
                      value={hours}
                      aria-label="Start hours"
                      onChange={(e) => {
                        const v = sanitizeHours(e.target.value);
                        setHours(v);
                        if (v.length === 2) minutesRef.current?.focus();
                      }}
                      onKeyDown={handleTimeKeyDown}
                    />
                    <span className={styles.timeSep}>:</span>
                    <input
                      ref={minutesRef}
                      type="text"
                      className={styles.timeInput}
                      placeholder="MM"
                      maxLength={2}
                      value={minutes}
                      aria-label="Start minutes"
                      onChange={(e) => setMinutes(sanitizeMinutes(e.target.value))}
                      onKeyDown={handleTimeKeyDown}
                    />
                  </div>

                  <div className={styles.periodSelector}>
                    {['AM', 'PM'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                        onClick={() => setPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.timeInputSection}>
                  <label className={styles.timeLabel}>End Time</label>
                  <div className={styles.timeInputGroup}>
                    <FaClock className={styles.inputIcon} aria-hidden="true" />
                    <input
                      ref={endHoursRef}
                      type="text"
                      className={styles.timeInput}
                      placeholder="HH"
                      maxLength={2}
                      value={endHours}
                      aria-label="End hours"
                      onChange={(e) => {
                        const v = sanitizeHours(e.target.value);
                        setEndHours(v);
                        if (v.length === 2) endMinutesRef.current?.focus();
                      }}
                      onKeyDown={handleTimeKeyDown}
                    />
                    <span className={styles.timeSep}>:</span>
                    <input
                      ref={endMinutesRef}
                      type="text"
                      className={styles.timeInput}
                      placeholder="MM"
                      maxLength={2}
                      value={endMinutes}
                      aria-label="End minutes"
                      onChange={(e) => setEndMinutes(sanitizeMinutes(e.target.value))}
                      onKeyDown={handleTimeKeyDown}
                    />
                  </div>

                  <div className={styles.periodSelector}>
                    {['AM', 'PM'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.periodBtn} ${endPeriod === p ? styles.periodBtnActive : ''}`}
                        onClick={() => setEndPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.confirmSlotBtn}
                  aria-label="Confirm new time slot"
                  onClick={confirmSlot}
                >
                  Confirm Slot
                </button>

                <button
                  type="button"
                  className={styles.closeInputBtn}
                  title="Close"
                  aria-label="Close"
                  onClick={closeInput}
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.btnCancel}
            aria-label="Cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnSave}
            aria-label="Save changes"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
