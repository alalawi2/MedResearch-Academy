import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
const SignIn = lazy(() => import('./pages/SignIn'));
const About = lazy(() => import('./pages/About'));
const News = lazy(() => import('./pages/News'));
const Programs = lazy(() => import('./pages/Programs'));
const Lectures = lazy(() => import('./pages/Lectures'));
const Resources = lazy(() => import('./pages/Resources'));
const WallOfImpact = lazy(() => import('./pages/WallOfImpact'));
const ActiveResearch = lazy(() => import('./pages/ActiveResearch'));
const ResidentBurnout = lazy(() => import('./pages/studies/ResidentBurnout'));
const ResidencyParenthood = lazy(() => import('./pages/studies/ResidencyParenthood'));
const SmartBlock = lazy(() => import('./pages/studies/SmartBlock'));
const CognitiveShifts = lazy(() => import('./pages/studies/CognitiveShifts'));
const ShiftStudyLogin = lazy(() => import('./pages/studies/ShiftStudyLogin'));
const ShiftStudyDashboard = lazy(() => import('./pages/studies/ShiftStudyDashboard'));
const ShiftStudyAssessment = lazy(() => import('./pages/studies/ShiftStudyAssessment'));
const ShiftStudyInvestigator = lazy(() => import('./pages/studies/ShiftStudyInvestigator'));
const ShiftStudyEditor = lazy(() => import('./pages/studies/ShiftStudyEditor'));
const Thalassemia = lazy(() => import('./pages/studies/Thalassemia'));
const RafiqReading = lazy(() => import('./pages/studies/RafiqReading'));
const ThalassemiaOverview = lazy(() => import('./pages/dashboard/thalassemia/Overview'));
const ThalassemiaPatientList = lazy(() => import('./pages/dashboard/thalassemia/PatientList'));
const ThalassemiaPatientNew = lazy(() => import('./pages/dashboard/thalassemia/PatientNew'));
const ThalassemiaPatientDetail = lazy(() => import('./pages/dashboard/thalassemia/PatientDetail'));
const ThalassemiaForm = lazy(() => import('./pages/dashboard/thalassemia/ThalassemiaForm'));
const ThalassemiaExport = lazy(() => import('./pages/dashboard/thalassemia/Export'));
const Contact = lazy(() => import('./pages/Contact'));
const Surveys = lazy(() => import('./pages/Surveys'));
const SurveyTake = lazy(() => import('./pages/SurveyTake'));
const SurveySubmit = lazy(() => import('./pages/SurveySubmit'));
const Events = lazy(() => import('./pages/Events'));
const Privacy = lazy(() => import('./pages/Privacy'));
const EnrollWhoop = lazy(() => import('./pages/EnrollWhoop'));
const Login = lazy(() => import('./pages/dashboard/Login'));
import DashboardLayout from './components/DashboardLayout';
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const WhoopCoverage = lazy(() => import('./pages/dashboard/WhoopCoverage'));
const Residents = lazy(() => import('./pages/dashboard/Residents'));
const ResidentDetail = lazy(() => import('./pages/dashboard/ResidentDetail'));
const DataEntry = lazy(() => import('./pages/dashboard/DataEntry'));
const Enrollment = lazy(() => import('./pages/dashboard/Enrollment'));
const Exports = lazy(() => import('./pages/dashboard/Exports'));
const BulkImport = lazy(() => import('./pages/dashboard/BulkImport'));
const SendLinks = lazy(() => import('./pages/dashboard/SendLinks'));
const ReviewQueue = lazy(() => import('./pages/dashboard/ReviewQueue'));
const ReviewDetail = lazy(() => import('./pages/dashboard/ReviewDetail'));
const SurveyManager = lazy(() => import('./pages/dashboard/SurveyManager'));
const SetPassword = lazy(() => import('./pages/dashboard/SetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
import ResidentLayout from './components/ResidentLayout';
import HelpChatbot from './components/HelpChatbot';
const ResidentLogin = lazy(() => import('./pages/resident/ResidentLogin'));
const ResidentDashboard = lazy(() => import('./pages/resident/ResidentDashboard'));
const QuestionnaireForm = lazy(() => import('./pages/resident/QuestionnaireForm'));
const WeeklyCheckin = lazy(() => import('./pages/resident/WeeklyCheckin'));
const EventLog = lazy(() => import('./pages/resident/EventLog'));
const DemographicsForm = lazy(() => import('./pages/resident/DemographicsForm'));
const BaselineAssessment = lazy(() => import('./pages/resident/BaselineAssessment'));
const ResearcherPortal = lazy(() => import('./pages/ResearcherPortal'));
const ResidentSetPassword = lazy(() => import('./pages/resident/SetPassword'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HelpChatbot />
        <Suspense fallback={<main className="container section" role="status">Loading page…</main>}>
        <Routes>
          {/* ── Public pages ── */}
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
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
          <Route path="/active-research/cognitive-shifts" element={<CognitiveShifts />} />
          <Route path="/active-research/cognitive-shifts/login" element={<ShiftStudyLogin />} />
          <Route path="/active-research/cognitive-shifts/dashboard" element={<ShiftStudyDashboard />} />
          <Route path="/active-research/cognitive-shifts/assessment/:timepoint" element={<ShiftStudyAssessment />} />
          <Route path="/active-research/cognitive-shifts/investigator" element={<ShiftStudyInvestigator />} />
          <Route path="/active-research/cognitive-shifts/settings" element={<ShiftStudyEditor />} />
          <Route path="/active-research/thalassemia-cardiac" element={<Thalassemia />} />
          <Route path="/active-research/rafiq-reading" element={<RafiqReading />} />
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
            <Route path="whoop-coverage" element={<WhoopCoverage />} />
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
            {/* Thalassemia study portal */}
            <Route path="thalassemia" element={<ThalassemiaOverview />} />
            <Route path="thalassemia/patients" element={<ThalassemiaPatientList />} />
            <Route path="thalassemia/patients/new" element={<ThalassemiaPatientNew />} />
            <Route path="thalassemia/patients/:id" element={<ThalassemiaPatientDetail />} />
            <Route path="thalassemia/patients/:id/edit" element={<ThalassemiaPatientNew />} />
            <Route path="thalassemia/patients/:id/:modality/new" element={<ThalassemiaForm />} />
            <Route path="thalassemia/patients/:id/:modality/:rowId" element={<ThalassemiaForm />} />
            <Route path="thalassemia/export" element={<ThalassemiaExport />} />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
