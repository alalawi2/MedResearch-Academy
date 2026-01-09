import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Programs from "@/pages/Programs";
import Resources from "@/pages/Resources";
import WallOfImpact from './pages/WallOfImpact';
import ActiveResearch from './pages/ActiveResearch';

import Contact from "./pages/Contact";
import News from "./pages/News";
import Lectures from "@/pages/Lectures";
import LectureDetail from "@/pages/LectureDetail";
import QSofaCalculator from "@/pages/QSofaCalculator";
import AdminLectures from "./pages/AdminLectures";
import AdminQuestions from "./pages/AdminQuestions";
import AdminSessions from "./pages/AdminSessions";
import AdminAnalytics from "./pages/AdminAnalytics";
import Unsubscribe from "./pages/Unsubscribe";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/programs" component={Programs} />
      <Route path="/resources" component={Resources} />
      <Route path="/qsofa-calculator" component={QSofaCalculator} />
      <Route path="/wall-of-impact" component={WallOfImpact} />
          <Route path="/active-research" component={ActiveResearch} />
      
      <Route path="/news" component={News} />
      <Route path="/contact" component={Contact} />
        <Route path="/lectures" component={Lectures} />
        <Route path="/lectures/:id" component={LectureDetail} />
          <Route path="/admin/lectures" component={AdminLectures} />
          <Route path="/admin/questions" component={AdminQuestions} />
          <Route path="/admin/sessions" component={AdminSessions} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route path="/unsubscribe" component={Unsubscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
