import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidatures from './pages/Candidatures';
import CandidatureDetail from './pages/CandidatureDetail';
import AjoutRapide from './pages/AjoutRapide';
import Calendrier from './pages/Calendrier';
import APreparer from './pages/APreparer';

function App() {
  // BASE_URL is '/' locally and '/<repo>/' in the GitHub Pages build: the
  // router must strip that prefix for routes to work in both cases.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidatures" element={<Candidatures />} />
          <Route path="/candidature/:id" element={<CandidatureDetail />} />
          <Route path="/ajout" element={<AjoutRapide />} />
          <Route path="/calendrier" element={<Calendrier />} />
          <Route path="/a-preparer" element={<APreparer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;