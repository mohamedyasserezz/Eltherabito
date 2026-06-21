import { FaHome, FaComments, FaBrain, FaBriefcaseMedical, FaCalendarCheck } from 'react-icons/fa';
import { ROUTES } from '../../routes/paths';

export const BRAND = {
  name: 'Eltherabito',
  tagline: 'Mental Wellness',
  portalTagline: 'Patient Portal',
  adminTagline: 'Admin Portal',
};

export const PATIENT_NAV = [
  { id: 'dashboard', label: 'Home', Icon: FaHome, path: ROUTES.patient.dashboard },
  { id: 'chat', label: 'AI Support', Icon: FaComments, path: ROUTES.patient.chat },
  { id: 'assessment', label: 'Assessment', Icon: FaBrain, path: ROUTES.patient.assessment },
  { id: 'findDoctor', label: 'Find Doctor', Icon: FaBriefcaseMedical, path: ROUTES.patient.booking },
  { id: 'myBooking', label: 'My Booking', Icon: FaCalendarCheck, path: ROUTES.patient.bookings },
];

export function getPatientActiveNav(pathname) {
  if (pathname === ROUTES.patient.chat || pathname === '/chat') return 'chat';
  if (pathname.startsWith('/patient/assessment') || pathname === '/assessment') return 'assessment';
  if (
    pathname.startsWith('/patient/booking')
    || pathname === '/book-appointment'
    || pathname === '/confirm-session'
  ) {
    return 'findDoctor';
  }
  if (pathname.startsWith('/patient/bookings') || pathname === '/my-booking') return 'myBooking';
  if (pathname === ROUTES.patient.settings || pathname === '/display-preferences') return 'settings';
  if (pathname === ROUTES.patient.profile || pathname === '/patient-profile') {
    return 'dashboard';
  }
  if (pathname.startsWith('/patient/profile/edit') || pathname === '/edit-profile') {
    return 'dashboard';
  }
  return 'dashboard';
}

export const THERAPIST_BRAND = {
  name: 'ELTHERABITO',
  Icon: FaBrain,
};
