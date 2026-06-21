import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/paths';

// Where each role lands by default (used when an unauthorized user is bounced out).
const HOME_BY_ROLE = {
  Patient: ROUTES.patient.dashboard,
  Doctor: ROUTES.therapist.agenda,
  Admin: ROUTES.admin.home,
};

export function homePathForRole(role) {
  return HOME_BY_ROLE[role] || ROUTES.login;
}

/**
 * Guards a route so only the given role(s) can reach it.
 * - Not logged in  -> sent to login
 * - Wrong role     -> sent to their own home (prevents e.g. a patient hitting a doctor-only API and getting 403)
 */
export default function RequireRole({ allow, children }) {
  const { isLoggedIn, role } = useAuth();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowed.includes(role)) {
    return <Navigate to={homePathForRole(role)} replace />;
  }

  return children;
}
