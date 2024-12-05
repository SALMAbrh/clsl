import React from 'react';
import { useNavigate } from 'react-router-dom'; // Pour gérer la navigation
import './Login.css'; // Importer le fichier CSS pour le style

const Login = () => {
  const navigate = useNavigate(); // Hook pour naviguer vers une autre page

  // Redirige le Client vers Google Login
  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/login'; // URL backend pour Google OAuth
  };

  // Redirige vers la page LoginProvider
  const handleProviderLogin = () => {
    navigate('/provider-login'); // Redirection vers la page LoginProvider
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Section Client */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(to right, #6a11cb, #2575fc)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2>Client</h2>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={handleGoogleLogin}
        >
          Login with Google
        </button>
      </div>

      {/* Section Provider */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(to right, #f12711, #f5af19)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2>Provider</h2>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={handleProviderLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
