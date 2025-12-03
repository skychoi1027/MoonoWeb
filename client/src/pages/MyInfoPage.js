import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { saveMyInfo, getMyInfo } from '../services/api';
import './MyInfoPage.css';

function MyInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 저장된 내 정보 불러오기
    const loadMyInfo = async () => {
      if (user && user._id) {
        try {
          const info = await getMyInfo();
          if (info && info.success) {
            setFormData({
              name: info.data?.name || '',
              birthDate: info.data?.birthDate || '',
              birthTime: info.data?.birthTime || '',
            });
          }
        } catch (error) {
          console.error('내 정보 불러오기 오류:', error);
        }
      }
    };
    loadMyInfo();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await saveMyInfo(formData);
      if (result.success) {
        setMessage('내 정보가 저장되었습니다!');
      }
    } catch (error) {
      setMessage(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="myinfo-page">
        <Header />
        <div className="myinfo-container">
          <p>로그인이 필요합니다.</p>
          <button onClick={() => navigate('/login')}>로그인하기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="myinfo-page">
      <Header />
      <div className="myinfo-container">
        <h2 className="page-title">내 정보</h2>
        {message && (
          <div className={`message ${message.includes('저장되었습니다') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="myinfo-form">
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className="form-group">
            <label>생년월일</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>생시 (선택사항)</label>
            <input
              type="time"
              name="birthTime"
              value={formData.birthTime}
              onChange={handleChange}
            />
          </div>
          <button 
            type="submit" 
            className="save-button"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </form>
        <div className="info-note">
          <p>💡 저장한 정보는 사용자 정보 입력 페이지에서 불러올 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

export default MyInfoPage;

