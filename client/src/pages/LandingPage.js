import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">궁합문어</h1>
        <button 
          className="start-button"
          onClick={() => navigate('/home')}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

export default LandingPage;

