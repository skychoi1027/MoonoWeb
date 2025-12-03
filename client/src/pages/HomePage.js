import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Header />
      <div className="home-content">
        <div className="home-logo">궁합문어</div>
        <button 
          className="compatibility-button"
          onClick={() => navigate('/input')}
        >
          궁합 보기
        </button>
      </div>
    </div>
  );
}

export default HomePage;

