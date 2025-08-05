import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import VideoCapture from './components/VideoCapture.jsx';
import ImageTest from './pages/ImageTest.jsx'; // <-- Asegúrate de la ruta correcta

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/capture" element={<VideoCapture />} />
      <Route path="/image-test" element={<ImageTest />} /> {/* <-- Agrega esta línea */}
    </Routes>
  </BrowserRouter>
);
