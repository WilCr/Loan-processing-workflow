import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import HardMoneyLoanProcessor from './components/HardMoneyLoanProcessor';
import Resources from './components/Resources';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HardMoneyLoanProcessor />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App
