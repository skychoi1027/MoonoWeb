import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getMyInfo } from '../services/api';
import './UserInputPage.css';

function UserInputPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [user1, setUser1] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '',
  });
  const [user2, setUser2] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '',
  });

  const handleUser1Change = (e) => {
    setUser1({
      ...user1,
      [e.target.name]: e.target.value,
    });
  };

  const handleUser2Change = (e) => {
    setUser2({
      ...user2,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoadMyInfo = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const result = await getMyInfo();
      if (result.success && result.data) {
        setUser1({
          name: result.data.name || '',
          birthDate: result.data.birthDate || '',
          birthTime: result.data.birthTime || '',
          gender: result.data.gender || '',
        });
        alert('내 정보를 불러왔습니다!');
      } else {
        alert('저장된 내 정보가 없습니다. 내 정보 페이지에서 먼저 정보를 저장해주세요.');
      }
    } catch (error) {
      console.error('내 정보 불러오기 오류:', error);
      alert('내 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 궁합 계산 API 호출
    console.log('사용자 정보:', { user1, user2 });
    navigate('/loading', { state: { user1, user2 } });
  };

  return (
    <div className="user-input-page">
      <Header />
      <div className="user-input-container">
        <h2 className="page-title">사용자 정보 입력</h2>
        <form onSubmit={handleSubmit} className="user-input-form">
          <div className="user-section">
            <div className="user-section-header">
              <h3 className="user-label">사용자 1</h3>
              {isAuthenticated && (
                <button
                  type="button"
                  className="load-myinfo-button"
                  onClick={handleLoadMyInfo}
                >
                  내정보 불러오기
                </button>
              )}
            </div>
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={user1.name}
                onChange={handleUser1Change}
                required
              />
            </div>
            <div className="form-group">
              <label>생년월일</label>
              <input
                type="date"
                name="birthDate"
                value={user1.birthDate}
                onChange={handleUser1Change}
                required
              />
            </div>
            <div className="form-group">
              <label>생시 (선택사항)</label>
              <input
                type="time"
                name="birthTime"
                value={user1.birthTime}
                onChange={handleUser1Change}
              />
            </div>
            <div className="form-group">
              <label>성별</label>
              <div className="gender-buttons">
                <button
                  type="button"
                  className={`gender-button ${user1.gender === 'male' ? 'active' : ''}`}
                  onClick={() => setUser1({ ...user1, gender: 'male' })}
                >
                  남성
                </button>
                <button
                  type="button"
                  className={`gender-button ${user1.gender === 'female' ? 'active' : ''}`}
                  onClick={() => setUser1({ ...user1, gender: 'female' })}
                >
                  여성
                </button>
              </div>
            </div>
          </div>

          <div className="user-section">
            <h3 className="user-label">사용자 2</h3>
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={user2.name}
                onChange={handleUser2Change}
                required
              />
            </div>
            <div className="form-group">
              <label>생년월일</label>
              <input
                type="date"
                name="birthDate"
                value={user2.birthDate}
                onChange={handleUser2Change}
                required
              />
            </div>
            <div className="form-group">
              <label>생시 (선택사항)</label>
              <input
                type="time"
                name="birthTime"
                value={user2.birthTime}
                onChange={handleUser2Change}
              />
            </div>
            <div className="form-group">
              <label>성별</label>
              <div className="gender-buttons">
                <button
                  type="button"
                  className={`gender-button ${user2.gender === 'male' ? 'active' : ''}`}
                  onClick={() => setUser2({ ...user2, gender: 'male' })}
                >
                  남성
                </button>
                <button
                  type="button"
                  className={`gender-button ${user2.gender === 'female' ? 'active' : ''}`}
                  onClick={() => setUser2({ ...user2, gender: 'female' })}
                >
                  여성
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="start-button">
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserInputPage;

