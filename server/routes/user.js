const express = require('express');
const router = express.Router();
const UserInfo = require('../models/UserInfo');

/**
 * 내 정보 저장
 * POST /api/user/myinfo
 */
router.post('/myinfo', async (req, res) => {
  try {
    const { userId, name, birthDate, birthTime } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: '사용자 ID가 필요합니다.' 
      });
    }

    // 기존 정보가 있으면 업데이트, 없으면 생성
    const userInfo = await UserInfo.findOneAndUpdate(
      { userId },
      {
        userId,
        name: name || '',
        birthDate: birthDate || '',
        birthTime: birthTime || '',
      },
      {
        new: true,
        upsert: true, // 없으면 생성
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: '내 정보가 저장되었습니다.',
      data: userInfo
    });

  } catch (error) {
    console.error('내 정보 저장 오류:', error);
    res.status(500).json({ 
      error: '내 정보 저장 중 오류가 발생했습니다.',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 내 정보 조회
 * GET /api/user/myinfo?userId=xxx
 */
router.get('/myinfo', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: '사용자 ID가 필요합니다.' 
      });
    }

    const userInfo = await UserInfo.findOne({ userId });

    if (!userInfo) {
      return res.json({
        success: true,
        data: null,
        message: '저장된 정보가 없습니다.'
      });
    }

    res.json({
      success: true,
      data: userInfo
    });

  } catch (error) {
    console.error('내 정보 조회 오류:', error);
    res.status(500).json({ 
      error: '내 정보 조회 중 오류가 발생했습니다.',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

