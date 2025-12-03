import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { calculateCompatibility } from '../services/api';
import './LoadingPage.css';

function CalculatingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fortuneData } = location.state || {};
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculate = async () => {
      try {
        if (!fortuneData) {
          navigate('/input');
          return;
        }

        // 궁합 계산
        const result = await calculateCompatibility(
          fortuneData.user1.fortune,
          fortuneData.user2.fortune
        );

        // 결과 페이지로 이동
        navigate('/result', {
          state: {
            result: {
              compatibility: result.compatibility,
              description: result.description,
              radarData: result.radarData,
              radarLabels: result.radarLabels,
              details: result.details,
              detailedAnalysis: result.detailedAnalysis, // 상세 분석 추가
              user1: fortuneData.user1,
              user2: fortuneData.user2,
            },
          },
        });
      } catch (error) {
        console.error('궁합 계산 오류:', error);
        setError(error.message || '궁합 계산 중 오류가 발생했습니다.');
      }
    };

    calculate();
  }, [navigate, fortuneData]);

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
            onClick={() => navigate('/fortune-info', { state: { fortuneData } })}
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
        <h2 className="loading-text">궁합 계산중...</h2>
        <p className="loading-subtext">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

export default CalculatingPage;

