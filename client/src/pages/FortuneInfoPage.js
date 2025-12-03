import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './FortuneInfoPage.css';

function FortuneInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fortuneData } = location.state || {};

  const handleConfirm = () => {
    // 계산 로딩 페이지로 이동
    navigate('/calculating', { state: { fortuneData } });
  };

  if (!fortuneData) {
    return (
      <div className="fortune-info-page">
        <Header />
        <div className="error-message">
          <p>사주 정보를 불러올 수 없습니다.</p>
          <button onClick={() => navigate('/input')}>다시 입력하기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fortune-info-page">
      <Header />
      <div className="fortune-info-container">
        <h2 className="page-title">사주 정보 확인</h2>
        
        <div className="fortune-cards">
          <div className="fortune-card">
            <h3 className="user-name">{fortuneData.user1.name}</h3>
            <div className="fortune-details">
              <div className="detail-item">
                <span className="label">양력:</span>
                <span className="value">{fortuneData.user1.fortune.solarDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">음력:</span>
                <span className="value">{fortuneData.user1.fortune.lunarDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">년간지:</span>
                <span className="value">{fortuneData.user1.fortune.ganjiFull?.year || fortuneData.user1.fortune.ganji.year}</span>
              </div>
              <div className="detail-item">
                <span className="label">월간지:</span>
                <span className="value">{fortuneData.user1.fortune.ganjiFull?.month || fortuneData.user1.fortune.ganji.month}</span>
              </div>
              <div className="detail-item">
                <span className="label">일간지:</span>
                <span className="value">{fortuneData.user1.fortune.ganjiFull?.day || fortuneData.user1.fortune.ganji.day}</span>
              </div>
            </div>
          </div>

          <div className="fortune-card">
            <h3 className="user-name">{fortuneData.user2.name}</h3>
            <div className="fortune-details">
              <div className="detail-item">
                <span className="label">양력:</span>
                <span className="value">{fortuneData.user2.fortune.solarDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">음력:</span>
                <span className="value">{fortuneData.user2.fortune.lunarDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">년간지:</span>
                <span className="value">{fortuneData.user2.fortune.ganjiFull?.year || fortuneData.user2.fortune.ganji.year}</span>
              </div>
              <div className="detail-item">
                <span className="label">월간지:</span>
                <span className="value">{fortuneData.user2.fortune.ganjiFull?.month || fortuneData.user2.fortune.ganji.month}</span>
              </div>
              <div className="detail-item">
                <span className="label">일간지:</span>
                <span className="value">{fortuneData.user2.fortune.ganjiFull?.day || fortuneData.user2.fortune.ganji.day}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="confirm-button" onClick={handleConfirm}>
          결과 확인
        </button>
      </div>
    </div>
  );
}

export default FortuneInfoPage;

