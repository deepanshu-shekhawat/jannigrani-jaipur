import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { ReportWizard } from './components/report/ReportWizard';
import { DashboardPage } from './pages/DashboardPage';
import { ComplaintsListPage } from './pages/ComplaintsListPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { PublicWorksPage } from './pages/PublicWorksPage';
import { AuthoritiesPage } from './pages/AuthoritiesPage';
import { AdminPage } from './pages/AdminPage';
import { CivicIssue } from './types';

const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const getAppPath = (pathname: string) => {
  if (!appBasePath) return pathname || '/';
  if (pathname === appBasePath) return '/';
  if (pathname.startsWith(`${appBasePath}/`)) return pathname.slice(appBasePath.length);
  return pathname || '/';
};

const getBrowserPath = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getAppPath(window.location.pathname);
  });
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = getAppPath(window.location.pathname);
      setCurrentPath(path);
      if (path.startsWith('/complaints/') && path !== '/complaints') {
        const id = path.replace('/complaints/', '').split('#')[0];
        setSelectedIssueId(id);
      } else {
        setSelectedIssueId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', getBrowserPath(path));
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (path.startsWith('/complaints/') && path !== '/complaints') {
      const id = path.replace('/complaints/', '').split('#')[0];
      setSelectedIssueId(id);
    } else {
      setSelectedIssueId(null);
    }
  };

  const handleSelectIssue = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    navigateTo(`/complaints/${issue.id}`);
  };

  const handleReportAtLocation = (lat: number, lng: number) => {
    setReportCoords({ lat, lng });
    navigateTo('/report');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F2] text-[#202724]">
      {/* Shared Header Navigation */}
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {currentPath === '/map' && (
          <MapPage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
            onReportAtLocation={handleReportAtLocation}
          />
        )}

        {currentPath === '/report' && (
          <ReportWizard
            initialCoords={reportCoords}
            onComplete={(issueId) => {
              setReportCoords(undefined);
              navigateTo(`/complaints/${issueId}`);
            }}
            onCancel={() => {
              setReportCoords(undefined);
              navigateTo('/map');
            }}
          />
        )}

        {currentPath === '/dashboard' && (
          <DashboardPage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {currentPath === '/complaints' && (
          <ComplaintsListPage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {currentPath.startsWith('/complaints/') && selectedIssueId && (
          <ComplaintDetailPage
            issueId={selectedIssueId}
            onNavigate={navigateTo}
            onBack={() => navigateTo('/complaints')}
          />
        )}

        {currentPath === '/public-works' && (
          <PublicWorksPage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {currentPath === '/authorities' && (
          <AuthoritiesPage />
        )}

        {currentPath === '/admin' && (
          <AdminPage />
        )}
      </main>

      {/* Shared Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;
