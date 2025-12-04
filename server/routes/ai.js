const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI API를 사용한 채팅 엔드포인트
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API 키가 설정되지 않았습니다.' });
    }

    // 대화 기록을 OpenAI 형식으로 변환
    const messages = conversationHistory.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || msg.message
    }));

    // 현재 메시지 추가
    messages.push({
      role: 'user',
      content: message
    });

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    console.error('에러 상세:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'AI 응답 생성 중 오류가 발생했습니다.',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        status: error.status,
        code: error.code,
        type: error.type
      } : undefined
    });
  }
});

module.exports = router;

