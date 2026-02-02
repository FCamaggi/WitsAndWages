import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './components/shared/ToastContainer';

// Componentes temporales hasta crear los reales
import Home from './components/Home';
import HostView from './components/host/HostView';
import PlayerView from './components/player/PlayerView';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/host" element={<HostView />} />
            <Route path="/player" element={<PlayerView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
