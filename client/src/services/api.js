const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * AI 채팅 API 호출
 * @param {string} message - 사용자 메시지
 * @param {Array} conversationHistory - 대화 기록
 * @returns {Promise} AI 응답
 */
export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || 'API 호출 실패';
      const errorDetails = error.message ? `: ${error.message}` : '';
      console.error('서버 에러 응답:', error);
      throw new Error(errorMessage + errorDetails);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API 오류:', error);
    throw error;
  }
};

/**
 * 사주 정보 가져오기 (공공데이터포털)
 * @param {Object} user1 - 사용자1 정보
 * @param {Object} user2 - 사용자2 정보
 * @returns {Promise} 사주 정보
 */
export const getFortuneInfo = async (user1, user2) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fortune/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user1, user2 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '사주 정보 조회 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fortune Info API 오류:', error);
    throw error;
  }
};

/**
 * 궁합 계산
 * @param {Object} user1Fortune - 사용자1 사주 정보
 * @param {Object} user2Fortune - 사용자2 사주 정보
 * @returns {Promise} 궁합 결과
 */
export const calculateCompatibility = async (user1Fortune, user2Fortune) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fortune/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user1Fortune, user2Fortune }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '궁합 계산 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Compatibility Calculate API 오류:', error);
    throw error;
  }
};

/**
 * 회원가입
 * @param {Object} userData - 회원가입 정보 (username, email, password, confirmPassword)
 * @returns {Promise} 회원가입 결과
 */
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '회원가입 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Signup API 오류:', error);
    throw error;
  }
};

/**
 * 로그인
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise} 로그인 결과
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '로그인 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login API 오류:', error);
    throw error;
  }
};

/**
 * 내 정보 저장
 * @param {Object} infoData - 내 정보 (name, birthDate, birthTime)
 * @returns {Promise} 저장 결과
 */
export const saveMyInfo = async (infoData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await fetch(`${API_BASE_URL}/api/user/myinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        ...infoData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '내 정보 저장 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Save MyInfo API 오류:', error);
    throw error;
  }
};

/**
 * 내 정보 조회
 * @returns {Promise} 내 정보
 */
export const getMyInfo = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await fetch(`${API_BASE_URL}/api/user/myinfo?userId=${user._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '내 정보 조회 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get MyInfo API 오류:', error);
    throw error;
  }
};

