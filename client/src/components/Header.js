import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="home-button" onClick={() => navigate('/home')}>
          🐙 홈
        </button>
        <div className="logo" onClick={() => navigate('/home')}>
          궁합문어
        </div>
      </div>
      <div className="header-right">
        {isAuthenticated ? (
          <>
            <button 
              className="auth-button myinfo-button"
              onClick={() => navigate('/myinfo')}
            >
              내 정보
            </button>
            <button 
              className="auth-button logout-button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button 
              className="auth-button login-button"
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
            <button 
              className="auth-button signup-button"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

