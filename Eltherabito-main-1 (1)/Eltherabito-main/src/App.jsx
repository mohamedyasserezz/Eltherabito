import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import Dashboard from "./pages/Dashboard/Dashboard";
import DailyAgenda from "./pages/DailyAgenda/DailyAgenda";
import DisplayPreferences from "./pages/DisplayPreferences/DisplayPreferences";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import SignUp from "./pages/Signup/Signup";
import AddDoctor from "./pages/AddDoctor/AddDoctor";
import AdminViewUsers from "./pages/AdminViewUsers/AdminViewUsers";
import PatientProfile from "./pages/PatientProfile/PatientProfile";
import EditProfile from "./pages/EditProfile/EditProfile";
import MyBookings from "./pages/MyBooking/MyBooking";
import BookAppointment from "./pages/BookAppointment/BookAppointment";
import ConfirmSession from "./pages/ConfirmSession/ConfirmSession";
import Assessment from "./pages/Assessment/Assessment";
import AssessmentResult from "./pages/AssessmentResult/AssessmentResult";
import TherapistProfile from "./pages/TherapistProfile/TherapistProfile";
import EditSchedule from "./pages/EditSchedule/EditSchedule";
import TherapistUpdateProfile from "./pages/TherapistUpdateProfile/TherapistUpdateProfile";
import TherapistPatientView from "./pages/TherapistPatientView/TherapistPatientView";
import TherapistPatientProfile from "./pages/TherapistPatientProfile/TherapistPatientProfile";
import { ROUTES, LEGACY_REDIRECTS, shouldHideNavbar } from "./routes/paths";
import { initDisplayPreferences } from "./utils/displayPreferencesStorage";
import RequireRole from "./components/RequireRole";

initDisplayPreferences();

function Layout() {
  const location = useLocation();
  const showNavbar = !shouldHideNavbar(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.signup} element={<SignUp />} />
        <Route path={ROUTES.login} element={<Login />} />

        {/* Patient */}
        <Route path={ROUTES.patient.dashboard} element={<RequireRole allow="Patient"><Dashboard /></RequireRole>} />
        <Route path={ROUTES.patient.chat} element={<RequireRole allow="Patient"><Chat /></RequireRole>} />
        <Route path={ROUTES.patient.assessment} element={<RequireRole allow="Patient"><Assessment /></RequireRole>} />
        <Route path={ROUTES.patient.assessmentResult} element={<RequireRole allow="Patient"><AssessmentResult /></RequireRole>} />
        <Route path={ROUTES.patient.profile} element={<RequireRole allow="Patient"><PatientProfile /></RequireRole>} />
        <Route path={ROUTES.patient.editProfile} element={<RequireRole allow="Patient"><EditProfile /></RequireRole>} />
        <Route path={ROUTES.patient.booking} element={<RequireRole allow="Patient"><BookAppointment /></RequireRole>} />
        <Route path={ROUTES.patient.bookingConfirm} element={<RequireRole allow="Patient"><ConfirmSession /></RequireRole>} />
        <Route path={ROUTES.patient.bookings} element={<RequireRole allow="Patient"><MyBookings /></RequireRole>} />
        <Route path={ROUTES.patient.settings} element={<RequireRole allow="Patient"><DisplayPreferences /></RequireRole>} />

        {/* Therapist */}
        <Route path={ROUTES.therapist.agenda} element={<RequireRole allow="Doctor"><DailyAgenda /></RequireRole>} />
        <Route path={ROUTES.therapist.profile} element={<RequireRole allow="Doctor"><TherapistProfile /></RequireRole>} />
        <Route path={ROUTES.therapist.editProfile} element={<RequireRole allow="Doctor"><TherapistUpdateProfile /></RequireRole>} />
        <Route path={ROUTES.therapist.editSchedule} element={<RequireRole allow="Doctor"><EditSchedule /></RequireRole>} />
        <Route path={ROUTES.therapist.viewPatient} element={<RequireRole allow="Doctor"><TherapistPatientProfile /></RequireRole>} />

        {/* Admin */}
        <Route path={ROUTES.admin.home} element={<RequireRole allow="Admin"><AdminDashboard /></RequireRole>} />
        <Route path={ROUTES.admin.addDoctor} element={<RequireRole allow="Admin"><AddDoctor /></RequireRole>} />
        <Route path={ROUTES.admin.viewUsers} element={<RequireRole allow="Admin"><AdminViewUsers /></RequireRole>} />

        {/* Legacy redirects */}
        {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
