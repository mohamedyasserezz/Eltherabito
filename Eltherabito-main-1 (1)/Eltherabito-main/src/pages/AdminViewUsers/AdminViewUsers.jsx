import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { getPictureUrl } from '../../utils/imageUrl';
import styles from './AdminViewUsers.module.css';


export default function AdminViewUsers() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await adminService.getPatients();
        const mappedPatients = data.map(p => ({
          id: p.id,
          name: p.fullName,
          email: p.email,
          phone: p.phoneNumber,
          avatar: getPictureUrl(p.profilePictureUrl),
          initials: (p.fullName || '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase(),
        }));
        setPatients(mappedPatients);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = patients.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/admin');
  };

  // Handle delete patient
  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await adminService.deletePatient(patientId);
        setPatients((prev) => {
          const updated = prev.filter((p) => p.id !== patientId);

          // Adjust current page if necessary
          const newTotalPages = Math.ceil(updated.length / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }

          return updated;
        });
      } catch (err) {
        console.error('Failed to delete patient:', err);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        {/* Back to Home Link */}
        <div className={styles.backLink}>
          <a onClick={handleBackToHome}>
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </a>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>User Directory</h1>
          <p className={styles.pageSubtitle}>
            Total registered patients: <span className={styles.totalCount}>{patients.length}</span>
          </p>
        </div>

        {/* Table Container */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading patients...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colPatient}>PATIENT NAME</th>
                  <th className={styles.colEmail}>EMAIL ADDRESS</th>
                  <th className={styles.colPhone}>PHONE NUMBER</th>
                  <th className={styles.colActions}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((patient) => (
                <tr key={patient.id}>
                  {/* Patient Name Cell */}
                  <td>
                    <div className={styles.patientCell}>
                      <div
                        className={`${styles.patientAvatar} ${patient.avatar ? styles.image : ''}`}
                        style={patient.avatar ? { backgroundImage: `url('${patient.avatar}')` } : {}}
                      >
                        {!patient.avatar && patient.initials}
                      </div>
                      <p className={styles.patientName}>{patient.name}</p>
                    </div>
                  </td>

                  {/* Email Cell */}
                  <td>
                    <span className={styles.emailCell}>{patient.email}</span>
                  </td>

                  {/* Phone Cell */}
                  <td>
                    <span className={styles.phoneCell}>{patient.phone}</span>
                  </td>

                  {/* Actions Cell */}
                  <td>
                    <button
                      className={styles.actionBtn}
                      title="Delete patient"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination and Info */}
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, patients.length)} of {patients.length} results
            </span>
          </div>
          <nav aria-label="Page navigation">
            <ul className={styles.pagination}>
              {/* Previous button */}
              <li className={`${styles.pageItem} ${currentPage === 1 ? styles.pageItemDisabled : ''}`}>
                <a
                  className={styles.pageLink}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </a>
              </li>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li
                  key={page}
                  className={`${styles.pageItem} ${page === currentPage ? styles.pageItemActive : ''}`}
                >
                  <a
                    className={styles.pageLink}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </a>
                </li>
              ))}

              {/* Next button */}
              <li className={`${styles.pageItem} ${currentPage === totalPages ? styles.pageItemDisabled : ''}`}>
                <a
                  className={styles.pageLink}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
          <div className={styles.paginationInfoRight}>
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, patients.length)} of {patients.length} results
            </span>
            <span>{totalPages}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footerSection}>
        <div className={`${styles.container} ${styles.footerContainer}`}>
          <div className={styles.footerRow}>
            <p className={styles.footerText}>
              © 2024 Eltherabito Mental Health Platform. Professional Administration Suite.
            </p>
            <div className={styles.footerLinks}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">HIPAA Compliance</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
