import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import Programs from './pages/Programs';
import Lectures from './pages/Lectures';
import Resources from './pages/Resources';
import WallOfImpact from './pages/WallOfImpact';
import ActiveResearch from './pages/ActiveResearch';
import Contact from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/lectures" element={<Lectures />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/wall-of-impact" element={<WallOfImpact />} />
        <Route path="/active-research" element={<ActiveResearch />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
