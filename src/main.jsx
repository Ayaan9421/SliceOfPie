import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Output from './pages/Output';
import Contact from './pages/Contact';
import About from './pages/About';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="upload" element={<Upload />} />
          <Route path="output" element={<Output />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
