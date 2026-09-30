import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { getCurrentUser } from './services/auth/authService';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import { ApplicationsPage, ApplicationDetailPage, ApplyPage, CitizenLandPage, DocumentsPage, ProfilePage } from './pages/citizen/CitizenPages';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import { AnalyticsPage, ConflictsPage, OfficerDocumentsPage } from './pages/officer/OfficerPages';
import LandProfilePage from './pages/land/LandProfilePage';
import MapPage from './pages/map/MapPage';
import SearchPage from './pages/search/SearchPage';
import NotificationsPage from './pages/common/NotificationsPage';

function RoutedShell({ children }) { const user = getCurrentUser(); return <AppShell user={user}>{children}</AppShell>; }
function CitizenPage({ children }) { const user = getCurrentUser(); return user.role === 'Citizen' ? <RoutedShell>{children}</RoutedShell> : <Navigate to="/officer/dashboard" replace />; }
function OfficerPage({ children }) { const user = getCurrentUser(); return user.role !== 'Citizen' ? <RoutedShell>{children}</RoutedShell> : <Navigate to="/citizen/dashboard" replace />; }
function SharedPage({ children }) { return <RoutedShell>{children}</RoutedShell>; }
const citizen = (node) => <CitizenPage>{node}</CitizenPage>;
const officer = (node) => <OfficerPage>{node}</OfficerPage>;
const shared = (node) => <SharedPage>{node}</SharedPage>;

export default function App() {
  const user = getCurrentUser();
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} />
    <Route path="/citizen/dashboard" element={citizen(<CitizenDashboard user={user} />)} />
    <Route path="/citizen/land" element={citizen(<CitizenLandPage />)} />
    <Route path="/citizen/applications" element={citizen(<ApplicationsPage />)} /><Route path="/citizen/applications/:id" element={citizen(<ApplicationDetailPage />)} /><Route path="/citizen/apply" element={citizen(<ApplyPage />)} />
    <Route path="/citizen/documents" element={citizen(<DocumentsPage />)} /><Route path="/citizen/profile" element={citizen(<ProfilePage user={user} />)} />
    <Route path="/officer/dashboard" element={officer(<OfficerDashboard />)} /><Route path="/officer/applications" element={officer(<ApplicationsPage officer />)} /><Route path="/officer/applications/:id" element={officer(<ApplicationDetailPage officer />)} />
    <Route path="/officer/documents" element={officer(<OfficerDocumentsPage />)} /><Route path="/officer/conflicts" element={officer(<ConflictsPage />)} /><Route path="/officer/analytics" element={officer(<AnalyticsPage />)} />
    <Route path="/search" element={shared(<SearchPage />)} /><Route path="/map" element={shared(<MapPage />)} /><Route path="/land/:ulpin" element={shared(<LandProfilePage />)} /><Route path="/notifications" element={shared(<NotificationsPage />)} />
    <Route path="*" element={shared(<div className="not-found"><span className="eyebrow">PAGE NOT FOUND</span><h1>We couldn't find that page.</h1><p>The link may be outdated or the route may not exist in this prototype.</p><a className="button button-primary" href="/">Return to dashboard</a></div>)} />
  </Routes>;
}
