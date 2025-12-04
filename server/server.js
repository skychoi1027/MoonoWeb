const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moonoweb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB 연결 성공');
})
.catch((error) => {
  console.error('❌ MongoDB 연결 실패:', error);
});

// 라우트
app.use('/api/ai', require('./routes/ai'));
app.use('/api/fortune', require('./routes/fortune'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'MoonoWeb API Server is running!' });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: '서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

