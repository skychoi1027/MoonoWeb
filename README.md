# MoonoWeb - 사주 궁합 분석 웹 애플리케이션

MoonoWeb은 사주 정보를 기반으로 두 사람의 궁합을 분석하고 AI 상담을 제공하는 풀스택 웹 애플리케이션입니다.

## 📋 목차

- [시스템 요구사항](#시스템-요구사항)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [환경 변수 설정](#환경-변수-설정)
- [개발 모드 실행](#개발-모드-실행)
- [프로덕션 빌드](#프로덕션-빌드)
- [문제 해결](#문제-해결)

## 🔧 시스템 요구사항

- **Node.js**: v14 이상 (권장: v18 이상)
- **npm**: v6 이상 (또는 yarn)
- **MongoDB**: v4.4 이상 (로컬 설치 또는 MongoDB Atlas)
- **OpenAI API 키**: GPT 모델 사용을 위한 API 키

## 📁 프로젝트 구조

```
MoonoWeb/
├── client/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── contexts/      # React Context
│   └── package.json
│
└── server/          # Node.js/Express 백엔드
    ├── models/      # MongoDB 모델
    ├── routes/      # API 라우트
    ├── utils/       # 유틸리티 함수
    └── package.json
```

## 🚀 설치 및 실행

### 1. 저장소 클론 (또는 프로젝트 다운로드)

```bash
cd MoonoWeb
```

### 2. 서버 설정

```bash
# server 디렉토리로 이동
cd server

# 의존성 패키지 설치
npm install
```

### 3. 클라이언트 설정

```bash
# client 디렉토리로 이동
cd ../client

# 의존성 패키지 설치
npm install
```

### 4. MongoDB 설정

#### 옵션 A: 로컬 MongoDB 사용

1. MongoDB를 로컬에 설치하고 실행
2. 기본 연결 URI: `mongodb://localhost:27017/moonoweb`

#### 옵션 B: MongoDB Atlas 사용 (클라우드)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에서 계정 생성
2. 클러스터 생성 및 데이터베이스 사용자 설정
3. 연결 문자열 복사 (예: `mongodb+srv://username:password@cluster.mongodb.net/moonoweb`)

## ⚙️ 환경 변수 설정

### 클라이언트 환경 변수 (client/.env)

`client` 디렉토리에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# 백엔드 API 서버 URL (기본값: http://localhost:5000)
REACT_APP_API_URL=http://localhost:5000
```

> 💡 **팁**: `client/.env.example` 파일을 복사하여 `.env` 파일을 만들 수 있습니다.
> ```bash
> cd client
> cp .env.example .env
> ```

## 💻 개발 모드 실행

### 서버 실행

터미널 1에서:

```bash
cd server
npm start
# 또는 개발 모드 (nodemon 사용, 자동 재시작)
npm run dev
```

서버가 성공적으로 실행되면 다음 메시지가 표시됩니다:
```
✅ MongoDB 연결 성공
🚀 서버가 포트 5000에서 실행 중입니다.
```

### 클라이언트 실행

터미널 2에서:

```bash
cd client
npm start
```

클라이언트가 성공적으로 실행되면 브라우저가 자동으로 열리고 `http://localhost:3000`에서 애플리케이션을 확인할 수 있습니다.

## 🏗️ 프로덕션 빌드

### 클라이언트 빌드

```bash
cd client
npm run build
```

빌드된 파일은 `client/build` 디렉토리에 생성됩니다.

### 서버 실행 (프로덕션)

```bash
cd server
NODE_ENV=production npm start
```

## 🔍 문제 해결

### 백엔드 서버가 시작되지 않는 경우

#### 1. 서버 실행 확인
```bash
cd server
npm start
```

**문제 증상:**
- `Error: Cannot find module 'xxx'` → 의존성 패키지 미설치
- `EADDRINUSE: address already in use :::5000` → 포트 충돌
- `MongoServerError: connect ECONNREFUSED` → MongoDB 연결 실패

#### 2. 의존성 패키지 재설치
```bash
cd server
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```

#### 3. Node.js 버전 확인
```bash
node --version  # v14 이상 권장
npm --version
```

### MongoDB 연결 실패

**증상:** `❌ MongoDB 연결 실패` 메시지가 표시됨

**해결 방법:**

1. **로컬 MongoDB 사용 시:**
   ```bash
   # MongoDB 서비스가 실행 중인지 확인
   # Windows
   Get-Service MongoDB
   
   # MongoDB 시작 (Windows)
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

2. **MongoDB Atlas 사용 시:**
   - Atlas 대시보드에서 클러스터가 실행 중인지 확인
   - IP 화이트리스트에 현재 IP 주소 추가
   - 연결 문자열 확인 (username, password 포함)
   - 방화벽 설정 확인

3. **연결 테스트:**
   ```bash
   # MongoDB 연결 테스트
   mongosh "mongodb://localhost:27017/moonoweb"
   ```

### OpenAI API 오류

**증상:** 
- `OpenAI API 키가 설정되지 않았습니다.`
- `AI 응답 생성 중 오류가 발생했습니다.`

**해결 방법:**

1. **환경 변수 확인:**
   - 서버 코드에서 `process.env.OPENAI_API_KEY`가 필요한데, 백엔드에 .env가 없다고 했으므로
   - 코드에서 직접 설정하거나 다른 방법으로 API 키를 제공해야 함

2. **API 키 유효성 확인:**
   - [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 상태 확인
   - 크레딧 잔액 확인
   - API 키 권한 확인

3. **에러 로그 확인:**
   ```bash
   # 서버 콘솔에서 상세 에러 메시지 확인
   # 개발 모드에서는 상세한 에러 정보가 표시됨
   ```

### 포트 충돌

**증상:** `EADDRINUSE: address already in use :::5000`

**해결 방법:**

1. **포트 사용 중인 프로세스 확인:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID [PID번호] /F
   
   # Mac/Linux
   lsof -ti:5000
   kill -9 [PID번호]
   ```

2. **다른 포트 사용:**
   - 서버 코드에서 `PORT` 환경 변수 변경 불가능하므로
   - 코드에서 기본 포트를 변경하거나
   - 다른 포트를 사용하는 프로세스를 종료

### API 엔드포인트 오류

**증상:** 클라이언트에서 API 호출 시 404 또는 500 에러

**해결 방법:**

1. **서버가 실행 중인지 확인:**
   ```bash
   # 브라우저에서 확인
   http://localhost:5000/
   # 응답: {"message":"MoonoWeb API Server is running!"}
   ```

2. **라우트 확인:**
   - `/api/ai/chat` - AI 채팅
   - `/api/fortune/info` - 사주 정보
   - `/api/fortune/calculate` - 궁합 계산
   - `/api/auth/signup` - 회원가입
   - `/api/auth/login` - 로그인

3. **CORS 오류 확인:**
   - 서버의 `cors` 미들웨어가 활성화되어 있는지 확인
   - 클라이언트의 `REACT_APP_API_URL`이 올바른지 확인

### 공공데이터포털 API 오류

**증상:** 사주 정보 조회 실패

**해결 방법:**

1. **API 키 확인:**
   - 코드에 기본 API 키가 하드코딩되어 있음
   - 필요시 [공공데이터포털](https://www.data.go.kr)에서 새 API 키 발급

2. **네트워크 확인:**
   - 인터넷 연결 확인
   - 방화벽 설정 확인
   - API 서버 상태 확인

### 일반적인 디버깅 방법

1. **서버 로그 확인:**
   ```bash
   cd server
   npm start
   # 콘솔에 표시되는 모든 로그 확인
   ```

2. **개발 모드로 실행:**
   ```bash
   # 더 상세한 에러 메시지 확인
   NODE_ENV=development npm start
   ```

3. **API 테스트:**
   ```bash
   # Postman 또는 curl로 API 테스트
   curl http://localhost:5000/
   curl -X POST http://localhost:5000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"테스트"}'
   ```

### 클라이언트 연결 오류

**증상:** 프론트엔드에서 백엔드에 연결할 수 없음

**해결 방법:**

1. **환경 변수 확인:**
   ```bash
   # client/.env 파일 확인
   REACT_APP_API_URL=http://localhost:5000
   ```

2. **서버 실행 확인:**
   - 백엔드 서버가 실행 중인지 확인
   - 포트 번호가 일치하는지 확인

3. **브라우저 콘솔 확인:**
   - 개발자 도구(F12) → Console 탭
   - Network 탭에서 API 요청 상태 확인

## 📝 주요 기능

- 사용자 인증 (회원가입, 로그인)
- 사주 정보 조회 (공공데이터포털 API 연동)
- 궁합 분석 및 계산
- AI 상담 챗봇 (OpenAI GPT 모델)
- 사용자 정보 관리

## 🛠️ 기술 스택

### 프론트엔드
- React 19.2.0
- React Router DOM 7.10.0
- Chart.js 4.5.1
- React Chart.js 2

### 백엔드
- Node.js
- Express 4.18.2
- MongoDB (Mongoose 8.0.3)
- OpenAI API 4.20.1
- Axios 1.13.2

## 📄 라이선스

ISC

## 👥 기여

이슈나 개선 사항이 있으면 언제든지 알려주세요!

