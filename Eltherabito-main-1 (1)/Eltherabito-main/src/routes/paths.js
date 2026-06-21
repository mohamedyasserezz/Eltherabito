/**
 * Central route paths — keep all navigation in sync from here.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',

  patient: {
    dashboard: '/patient/dashboard',
    chat: '/patient/chat',
    assessment: '/patient/assessment',
    assessmentResult: '/patient/assessment/result',
    profile: '/patient/profile',
    editProfile: '/patient/profile/edit',
    booking: '/patient/booking',
    bookingConfirm: '/patient/booking/confirm',
    bookings: '/patient/bookings',
    settings: '/patient/settings',
  },

  therapist: {
    agenda: '/therapist/agenda',
    profile: '/therapist/profile',
    editProfile: '/therapist/profile/edit',
    editSchedule: '/therapist/schedule/edit',
    /** Patient clinical view — pass patient via location.state (no id in URL until API) */
    viewPatient: '/therapist/patientprofile',
  },

  admin: {
    home: '/admin',
    addDoctor: '/admin/add-doctor',
    viewUsers: '/admin/users',
  },
};

/** Old paths → new paths (bookmarks / old links) */
export const LEGACY_REDIRECTS = {
  '/dashboard': ROUTES.patient.dashboard,
  '/chat': ROUTES.patient.chat,
  '/patient-profile': ROUTES.patient.profile,
  '/edit-profile': ROUTES.patient.editProfile,
  '/assessment': ROUTES.patient.assessment,
  '/assessment/result': ROUTES.patient.assessmentResult,
  '/book-appointment': ROUTES.patient.booking,
  '/confirm-session': ROUTES.patient.bookingConfirm,
  '/my-booking': ROUTES.patient.bookings,
  '/display-preferences': ROUTES.patient.settings,
  '/agenda': ROUTES.therapist.agenda,
  '/therapist-profile': ROUTES.therapist.profile,
  '/therapist-update-profile': ROUTES.therapist.editProfile,
  '/edit-schedule': ROUTES.therapist.editSchedule,
};

export function shouldHideNavbar(pathname) {
  if (pathname === ROUTES.home) return false;
  if (pathname === ROUTES.login || pathname === ROUTES.signup) return true;
  if (pathname.startsWith('/patient/')) return true;
  if (pathname.startsWith('/therapist/')) return true;
  if (pathname.startsWith('/admin')) return true;
  if (LEGACY_REDIRECTS[pathname]) return true;
  return false;
}
