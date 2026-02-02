import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-container">
        <h1 className="title">🎰 Wits & Wagers Vegas 🎰</h1>
        <p className="subtitle">¡Apuesta, Arriesga y Gana!</p>

        <div className="home-cards">
          <div className="home-card fade-in">
            <h2>🎮 Crear Partida (Host)</h2>
            <p>Inicia una nueva partida y comparte el código con tus amigos</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/host')}
            >
              Crear Partida
            </button>
          </div>

          <div className="home-card fade-in" style={{ animationDelay: '0.1s' }}>
            <h2>👤 Unirse a Partida</h2>
            <p>Entra con un código de 6 dígitos para jugar</p>
            <button
              className="btn btn-success"
              onClick={() => navigate('/player')}
            >
              Unirse
            </button>
          </div>
        </div>

        <div className="home-info">
          <p>
            🎯 3-7 jugadores | 📱 Juega en horizontal | 🎲 7 rondas de emoción
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
