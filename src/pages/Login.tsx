import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export const Login = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Controle de Embarcações Hidroviárias</h1>
        <p className="subtitle">Faça login para acessar o sistema</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="google-signin-button"
        >
          {loading ? 'Entrando...' : 'Entrar com Google'}
        </button>
      </div>
    </div>
  );
};

