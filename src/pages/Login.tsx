import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export const Login = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se foi redirecionado por falta de permissão
    const state = location.state as { unauthorized?: boolean } | null;
    if (state?.unauthorized) {
      setError('Acesso negado. Apenas usuários com perfil de administrador podem acessar o sistema.');
    }
  }, [location]);

  useEffect(() => {
    // Se o usuário já está logado e é admin, redirecionar para o dashboard
    if (currentUser && currentUser.profile === 'admin') {
      navigate('/dashboard', { replace: true });
    } else if (currentUser && currentUser.profile !== 'admin') {
      setError('Acesso negado. Apenas usuários com perfil de administrador podem acessar o sistema.');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      // O redirecionamento será feito pelo useEffect quando o currentUser for atualizado
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

