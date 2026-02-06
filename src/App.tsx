import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { IvrDemoPage } from './components/IvrDemoPage';
import { NavBar } from './components/NavBar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/demo" element={<IvrDemoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
