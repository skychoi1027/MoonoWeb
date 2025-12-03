const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, '사용자명은 최소 3자 이상이어야 합니다.'],
    maxlength: [20, '사용자명은 최대 20자까지 가능합니다.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '올바른 이메일 형식이 아닙니다.']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.']
  }
}, {
  timestamps: true
});

// 비밀번호 해싱 (저장 전)
userSchema.pre('save', async function(next) {
  // 비밀번호가 변경되지 않았다면 해싱하지 않음
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 사용자 정보에서 비밀번호 제외
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// 인덱스 추가
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);

