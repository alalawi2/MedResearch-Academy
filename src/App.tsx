import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import Programs from './pages/Programs';
import Lectures from './pages/Lectures';
import Resources from './pages/Resources';
import WallOfImpact from './pages/WallOfImpact';
import ActiveResearch from './pages/ActiveResearch';
import ResidentBurnout from './pages/studies/ResidentBurnout';
import ResidencyParenthood from './pages/studies/ResidencyParenthood';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Privacy from './pages/Privacy';
import EnrollWhoop from './pages/EnrollWhoop';
import Login from './pages/dashboard/Login';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Residents from './pages/dashboard/Residents';
import ResidentDetail from './pages/dashboard/ResidentDetail';
import DataEntry from './pages/dashboard/DataEntry';
import Enrollment from './pages/dashboard/Enrollment';
import Exports from './pages/dashboard/Exports';
import SetPassword from './pages/dashboard/SetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public pages ── */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/lectures" element={<Lectures />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/wall-of-impact" element={<WallOfImpact />} />
          <Route path="/active-research" element={<ActiveResearch />} />
          <Route path="/active-research/resident-burnout" element={<ResidentBurnout />} />
          <Route path="/active-research/parenthood" element={<ResidencyParenthood />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/enroll/whoop" element={<EnrollWhoop />} />

          {/* ── Auth ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/set-password" element={<SetPassword />} />

          {/* ── Dashboard (gated by DashboardLayout) ── */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="residents" element={<Residents />} />
            <Route path="residents/:id" element={<ResidentDetail />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="exports" element={<Exports />} />
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
