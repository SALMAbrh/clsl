import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import CalendarComponent from './CalendarComponent'; // Utiliser CalendarComponent pour afficher le calendrier
import './App.css';
import LoginProvider from './LoginProvider';
import AdminPage from "./AdminPage";
function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Bienvenue dans le système de réservation</h1>
        </header>
        <main>
          <Routes>
            {/* Route pour la page de connexion */}
            <Route path="/" element={<Login />} />

            {/* Route pour la page du calendrier */}
            <Route path="/calendar" element={<CalendarComponent />} />
            <Route path="/provider-login" element={<LoginProvider />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
