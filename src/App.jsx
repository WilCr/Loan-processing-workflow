import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HardMoneyLoanProcessor from './components/HardMoneyLoanProcessor';
import Resources from './components/Resources';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HardMoneyLoanProcessor />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </Router>
  );
}

export default App
