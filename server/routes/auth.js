const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * 회원가입
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 입력 검증
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: '모든 필드를 입력해주세요.' 
      });
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: '비밀번호가 일치하지 않습니다.' 
      });
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
      });
    }

    // 중복 확인
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          error: '이미 사용 중인 이메일입니다.' 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          error: '이미 사용 중인 사용자명입니다.' 
        });
      }
    }

    // 새 사용자 생성
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: savedUser.toJSON() // 비밀번호 제외
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    
    // MongoDB 중복 키 오류 처리
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `이미 사용 중인 ${field === 'email' ? '이메일' : '사용자명'}입니다.` 
      });
    }

    // 유효성 검사 오류
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: messages[0] || '입력 정보를 확인해주세요.' 
      });
    }

    res.status(500).json({ 
      error: '회원가입 중 오류가 발생했습니다.',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 로그인
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({ 
        error: '이메일과 비밀번호를 입력해주세요.' 
      });
    }

    // 사용자 찾기
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 로그인 성공
    res.json({
      success: true,
      message: '로그인 성공',
      user: user.toJSON() // 비밀번호 제외
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ 
      error: '로그인 중 오류가 발생했습니다.',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 사용자 정보 조회
 * GET /api/auth/me
 * (추후 JWT 토큰으로 인증 구현 시 사용)
 */
router.get('/me', async (req, res) => {
  try {
    // TODO: JWT 토큰 인증 구현 후 사용자 정보 반환
    res.json({ 
      message: '인증 기능은 추후 구현 예정입니다.' 
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ 
      error: '사용자 정보 조회 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;

