import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { getFortuneInfo } from '../services/api';
import './LoadingPage.css';

function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user1, user2 } = location.state || {};
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFortuneInfo = async () => {
      try {
        // 공공데이터포털에서 사주 정보 가져오기
        const fortuneData = await getFortuneInfo(user1, user2);
        
        // 사주 정보 확인 페이지로 이동
        navigate('/fortune-info', { state: { fortuneData } });
      } catch (error) {
        console.error('사주 정보 조회 오류:', error);
        setError(error.message || '사주 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    if (user1 && user2) {
      fetchFortuneInfo();
    } else {
      navigate('/input');
    }
  }, [navigate, user1, user2]);

  if (error) {
    return (
      <div className="loading-page">
        <Header />
        <div className="loading-content">
          <div className="error-icon">❌</div>
          <h2 className="loading-text">오류 발생</h2>
          <p className="loading-subtext">{error}</p>
          <button 
            className="retry-button"
            onClick={() => navigate('/input')}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-page">
      <Header />
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-text">사주 정보 받아오는중...</h2>
        <p className="loading-subtext">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

export default LoadingPage;

