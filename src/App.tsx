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
import SmartBlock from './pages/studies/SmartBlock';
import OHealth from './pages/studies/OHealth';
import CognitiveShifts from './pages/studies/CognitiveShifts';
import ShiftStudyLogin from './pages/studies/ShiftStudyLogin';
import ShiftStudyDashboard from './pages/studies/ShiftStudyDashboard';
import ShiftStudyAssessment from './pages/studies/ShiftStudyAssessment';
import ShiftStudyInvestigator from './pages/studies/ShiftStudyInvestigator';
import ShiftStudyEditor from './pages/studies/ShiftStudyEditor';
import Contact from './pages/Contact';
import Surveys from './pages/Surveys';
import SurveyTake from './pages/SurveyTake';
import SurveySubmit from './pages/SurveySubmit';
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
import BulkImport from './pages/dashboard/BulkImport';
import SendLinks from './pages/dashboard/SendLinks';
import ReviewQueue from './pages/dashboard/ReviewQueue';
import ReviewDetail from './pages/dashboard/ReviewDetail';
import SurveyManager from './pages/dashboard/SurveyManager';
import SetPassword from './pages/dashboard/SetPassword';
import NotFound from './pages/NotFound';
import ResidentLayout from './components/ResidentLayout';
import HelpChatbot from './components/HelpChatbot';
import ResidentLogin from './pages/resident/ResidentLogin';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import QuestionnaireForm from './pages/resident/QuestionnaireForm';
import WeeklyCheckin from './pages/resident/WeeklyCheckin';
import EventLog from './pages/resident/EventLog';
import DemographicsForm from './pages/resident/DemographicsForm';
import BaselineAssessment from './pages/resident/BaselineAssessment';
import ResearcherPortal from './pages/ResearcherPortal';
import ResidentSetPassword from './pages/resident/SetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HelpChatbot />
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
          <Route path="/active-research/smartblock" element={<SmartBlock />} />
          <Route path="/active-research/resident-burnout" element={<ResidentBurnout />} />
          <Route path="/active-research/parenthood" element={<ResidencyParenthood />} />
          <Route path="/active-research/ohealth" element={<OHealth />} />
          <Route path="/active-research/cognitive-shifts" element={<CognitiveShifts />} />
          <Route path="/active-research/cognitive-shifts/login" element={<ShiftStudyLogin />} />
          <Route path="/active-research/cognitive-shifts/dashboard" element={<ShiftStudyDashboard />} />
          <Route path="/active-research/cognitive-shifts/assessment/:timepoint" element={<ShiftStudyAssessment />} />
          <Route path="/active-research/cognitive-shifts/investigator" element={<ShiftStudyInvestigator />} />
          <Route path="/active-research/cognitive-shifts/settings" element={<ShiftStudyEditor />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/survey/:id" element={<SurveyTake />} />
          <Route path="/surveys/submit" element={<SurveySubmit />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/enroll/whoop" element={<EnrollWhoop />} />
          <Route path="/researcher" element={<ResearcherPortal />} />

          {/* ── Auth ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/set-password" element={<SetPassword />} />

          {/* ── Dashboard (gated by DashboardLayout) ── */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="residents" element={<Residents />} />
            <Route path="residents/:id" element={<ResidentDetail />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="import" element={<BulkImport />} />
            <Route path="send-links" element={<SendLinks />} />
            <Route path="review" element={<ReviewQueue />} />
            <Route path="review/:instrument/:id" element={<ReviewDetail />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="exports" element={<Exports />} />
            <Route path="surveys" element={<SurveyManager />} />
          </Route>

          {/* ── Resident Portal ── */}
          <Route path="/resident/login" element={<ResidentLogin />} />
          <Route path="/resident" element={<ResidentLayout />}>
            <Route path="dashboard" element={<ResidentDashboard />} />
            <Route path="demographics" element={<DemographicsForm />} />
            <Route path="baseline" element={<BaselineAssessment />} />
            <Route path="questionnaire" element={<QuestionnaireForm />} />
            <Route path="checkin" element={<WeeklyCheckin />} />
            <Route path="events" element={<EventLog />} />
            <Route path="set-password" element={<ResidentSetPassword />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
