import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { ROUTES } from '../../routes/paths';
import styles from './AppLayout.module.css';

export default function AppLayout({
  children,
  variant = 'patient',
  showSidebar = true,
  showHeader = true,
  showSearch = false,
  sidebarSubtitle,
  headerProps = {},
  headerSlot,
  footer,
  className = '',
}) {
  const isPatientShell = variant === 'patient';
  const useSidebarLayout = isPatientShell && showSidebar;
  const bodyClass = useSidebarLayout
    ? `${styles.body} ${isPatientShell ? styles.bodyPatient : ''}`
    : styles.bodyNoSidebar;
  const bodyStyle = useSidebarLayout && isPatientShell
    ? { '--app-header-offset': showHeader ? '58px' : '0px' }
    : undefined;

  return (
    <div className={`${styles.page} ${className}`}>
      {showHeader && (
        <AppHeader
          variant={variant}
          showSearch={showSearch}
          {...headerProps}
          logoHref={headerProps.logoHref ?? (variant === 'patient' ? ROUTES.patient.dashboard : undefined)}
        >
          {headerSlot}
        </AppHeader>
      )}

      {useSidebarLayout ? (
        <div className={bodyClass} style={bodyStyle}>
          <AppSidebar subtitle={sidebarSubtitle} hasHeader={showHeader} />
          <div className={styles.main}>{children}</div>
        </div>
      ) : (
        <div className={bodyClass}>
          <div className={styles.mainFull}>{children}</div>
        </div>
      )}

      {footer}
    </div>
  );
}
