# 궁합문어 (MoonoWeb)

사주 궁합 분석 웹 애플리케이션으로, 공공데이터포털 API를 활용하여 두 사람의 사주 정보를 조회하고, 8대 궁합 지표를 계산하여 AI 기반의 상세한 궁합 분석과 조언을 제공합니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [API 엔드포인트](#api-엔드포인트)
- [페이지 구조](#페이지-구조)
- [환경 변수](#환경-변수)
- [주요 기능 상세](#주요-기능-상세)

## ✨ 주요 기능

### 1. 사용자 인증
- 회원가입 및 로그인
- 비밀번호 암호화 (bcrypt)
- 세션 관리 (localStorage)

### 2. 사용자 정보 관리
- 생년월일, 생시 등 개인 정보 저장
- 저장된 정보 불러오기 기능

### 3. 사주 정보 조회
- 공공데이터포털 API를 통한 양력/음력 변환
- 간지(干支) 정보 추출
- 사주 팔자 정보 제공

### 4. 궁합 분석
- **8대 궁합 지표 계산**:
  1. 일간 친밀도 (Day Master Compatibility)
  2. 오행 상생성 (Five Elements Support)
  3. 천간 합 (Sky Harmony)
  4. 지지 합 (Ground Harmony)
  5. 갈등 제어 (Conflict Control)
  6. 결핍 보완 (Complement)
  7. 조후 균형 (Season Balance)
  8. 에너지 시너지 (Synergy)
- 종합 궁합 점수 계산 (가중치 적용)
- 방사형 그래프(Radar Chart) 시각화

### 5. AI 기반 조언
- 각 지표별 상세 분석 (로직 해석)
- AI 종합 조언
- 실시간 AI 채팅 (궁합문어와 대화)
- 발랄하고 친근한 캐릭터 톤

## 🛠 기술 스택

### 프런트엔드
- **React** 19.2.0 - UI 프레임워크
- **React Router** 7.10.0 - 라우팅
- **Chart.js** 4.5.1 - 데이터 시각화
- **react-chartjs-2** 5.3.1 - React용 Chart.js 래퍼

### 백엔드
- **Node.js** - 서버 런타임
- **Express** 4.18.2 - 웹 프레임워크
- **MongoDB** (Mongoose 8.0.3) - 데이터베이스
- **OpenAI API** 4.20.1 - AI 분석
- **bcrypt** 6.0.0 - 비밀번호 암호화
- **axios** 1.13.2 - HTTP 클라이언트
- **xml2js** 0.6.2 - XML 파싱

### 외부 API
- **공공데이터포털** - 사주 정보 조회 API
- **OpenAI GPT-4o-mini** - AI 분석 및 채팅

## 📁 프로젝트 구조

```
MoonoWeb/
├── client/                    # React 프런트엔드
│   ├── public/                # 정적 파일
│   ├── src/
│   │   ├── components/        # 공통 컴포넌트
│   │   │   ├── Header.js      # 헤더 컴포넌트
│   │   │   └── ChatBot.js     # 챗봇 컴포넌트
│   │   ├── contexts/          # React Context
│   │   │   └── AuthContext.js # 인증 상태 관리
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── LandingPage.js      # 랜딩 페이지
│   │   │   ├── HomePage.js         # 홈 페이지
│   │   │   ├── SignUpPage.js       # 회원가입
│   │   │   ├── LoginPage.js        # 로그인
│   │   │   ├── UserInputPage.js    # 사용자 정보 입력
│   │   │   ├── LoadingPage.js      # 로딩 화면
│   │   │   ├── FortuneInfoPage.js  # 사주 정보 확인
│   │   │   ├── CalculatingPage.js  # 계산 중 화면
│   │   │   ├── ResultPage.js       # 결과 화면
│   │   │   ├── AIAdvicePage.js     # AI 조언 페이지
│   │   │   └── MyInfoPage.js       # 내 정보 페이지
│   │   ├── services/          # API 서비스
│   │   │   └── api.js        # API 호출 함수
│   │   ├── App.js            # 메인 앱 컴포넌트
│   │   └── index.js          # 진입점
│   └── package.json
│
├── server/                    # Node.js 백엔드
│   ├── models/                # MongoDB 모델
│   │   ├── User.js            # 사용자 모델
│   │   ├── UserInfo.js        # 사용자 정보 모델
│   │   └── Data.js            # 데이터 모델
│   ├── routes/                # API 라우트
│   │   ├── auth.js            # 인증 라우트
│   │   ├── user.js            # 사용자 정보 라우트
│   │   ├── fortune.js         # 사주/궁합 라우트
│   │   ├── ai.js              # AI 라우트
│   │   └── data.js            # 데이터 라우트
│   ├── utils/                 # 유틸리티
│   │   └── sajuCalculator.js  # 사주 궁합 계산 로직
│   ├── server.js              # 서버 진입점
│   ├── env.example.txt        # 환경 변수 예제
│   └── package.json
│
└── README.md
```

## 🚀 시작하기

### 사전 요구사항

- **Node.js** (v14 이상)
- **MongoDB** (로컬 설치 또는 MongoDB Atlas)
- **OpenAI API 키**
- **공공데이터포털 API 키** (선택사항, 기본값 제공)

### 설치

1. **저장소 클론 또는 다운로드**

2. **환경 변수 설정**

   `server` 디렉토리에 `.env` 파일을 생성하세요:
   ```bash
   cd server
   cp env.example.txt .env
   ```
   
   `.env` 파일을 열어 다음 값들을 설정하세요:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # MongoDB 연결 문자열
   MONGODB_URI=mongodb://localhost:27017/moonoweb
   # 또는 MongoDB Atlas 사용 시:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moonoweb
   
   # OpenAI API 설정
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   
   # 공공데이터포털 API 키 (선택사항)
   PUBLIC_DATA_API_KEY=your_public_data_api_key_here
   ```

3. **클라이언트 의존성 설치**
   ```bash
   cd client
   npm install
   ```

4. **서버 의존성 설치**
   ```bash
   cd server
   npm install
   ```

### 실행

#### 개발 모드

**터미널 1 - 백엔드 서버 실행:**
```bash
cd server
npm run dev
```
서버는 `http://localhost:5000`에서 실행됩니다.

**터미널 2 - 프런트엔드 실행:**
```bash
cd client
npm start
```
클라이언트는 `http://localhost:3000`에서 실행됩니다.

#### 프로덕션 모드

**백엔드 빌드 및 실행:**
```bash
cd server
npm start
```

**프런트엔드 빌드:**
```bash
cd client
npm run build
```

## 📡 API 엔드포인트

### 인증 (Authentication)

#### 회원가입
- **POST** `/api/auth/signup`
- **Request Body:**
  ```json
  {
    "username": "사용자명",
    "email": "user@example.com",
    "password": "비밀번호",
    "confirmPassword": "비밀번호"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "회원가입이 완료되었습니다.",
    "user": {
      "_id": "user_id",
      "username": "사용자명",
      "email": "user@example.com"
    }
  }
  ```

#### 로그인
- **POST** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "비밀번호"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "로그인 성공",
    "user": { ... },
    "token": "jwt_token"
  }
  ```

### 사용자 정보 (User)

#### 내 정보 저장
- **POST** `/api/user/myinfo`
- **Request Body:**
  ```json
  {
    "userId": "user_id",
    "name": "이름",
    "birthDate": "1990-01-01",
    "birthTime": "12:00"
  }
  ```

#### 내 정보 조회
- **GET** `/api/user/myinfo?userId=user_id`

### 사주/궁합 (Fortune)

#### 사주 정보 조회
- **POST** `/api/fortune/info`
- **Request Body:**
  ```json
  {
    "user1": {
      "name": "사용자1",
      "birthDate": "1990-01-01",
      "birthTime": "12:00"
    },
    "user2": {
      "name": "사용자2",
      "birthDate": "1995-05-15",
      "birthTime": "14:30"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user1": {
        "solarDate": "1990-01-01",
        "lunarDate": "1989-12-05",
        "ganjiFull": "기묘(己卯) 경오(庚午) 갑자(甲子) ..."
      },
      "user2": { ... }
    }
  }
  ```

#### 궁합 계산
- **POST** `/api/fortune/calculate`
- **Request Body:**
  ```json
  {
    "user1": { ... },
    "user2": { ... },
    "fortune": {
      "user1": { ... },
      "user2": { ... }
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "result": {
      "user1": { "name": "사용자1", ... },
      "user2": { "name": "사용자2", ... },
      "compatibility": 85,
      "description": "궁합 설명",
      "radarData": [70, 80, 90, 75, 85, 70, 80, 85],
      "detailedAnalysis": [
        {
          "index": 1,
          "label": "일간 친밀도",
          "score": 70,
          "analysis": "상세 분석 내용..."
        },
        ...
      ]
    }
  }
  ```

### AI (Artificial Intelligence)

#### AI 채팅
- **POST** `/api/ai/chat`
- **Request Body:**
  ```json
  {
    "message": "질문 내용",
    "conversationHistory": [
      {
        "role": "user",
        "content": "이전 메시지"
      },
      {
        "role": "assistant",
        "content": "AI 응답"
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "response": "AI 응답 내용",
    "usage": {
      "prompt_tokens": 100,
      "completion_tokens": 50,
      "total_tokens": 150
    }
  }
  ```

## 📄 페이지 구조

### 1. 랜딩 페이지 (`/`)
- "궁합문어" 로고 및 시작하기 버튼

### 2. 홈 페이지 (`/home`)
- 헤더 (홈 버튼, 로그인/회원가입 또는 내 정보/로그아웃)
- "궁합 보기" 버튼

### 3. 회원가입 페이지 (`/signup`)
- 사용자명, 이메일, 비밀번호 입력 폼

### 4. 로그인 페이지 (`/login`)
- 이메일, 비밀번호 입력 폼

### 5. 사용자 정보 입력 페이지 (`/input`)
- 사용자 1, 사용자 2 정보 입력
- "내정보 불러오기" 버튼 (로그인 시 표시)

### 6. 로딩 페이지 (`/loading`)
- 사주 정보 조회 중 표시

### 7. 사주 정보 확인 페이지 (`/fortune-info`)
- 양력/음력 날짜 및 간지 정보 표시
- "결과 확인" 버튼

### 8. 계산 중 페이지 (`/calculating`)
- 궁합 계산 중 표시

### 9. 결과 페이지 (`/result`)
- 종합 궁합 점수
- 8대 지표 방사형 그래프
- "궁합문어 조언 듣기" 버튼

### 10. AI 조언 페이지 (`/advice`)
- 8대 지표 상세 분석 테이블
- 궁합문어와 실시간 채팅

### 11. 내 정보 페이지 (`/myinfo`)
- 이름, 생년월일, 생시 저장/수정

## 🔧 환경 변수

| 변수 | 설명 | 기본값 | 필수 |
|------|------|--------|------|
| `PORT` | 서버 포트 | 5000 | ❌ |
| `NODE_ENV` | 환경 (development/production) | development | ❌ |
| `MONGODB_URI` | MongoDB 연결 문자열 | mongodb://localhost:27017/moonoweb | ✅ |
| `OPENAI_API_KEY` | OpenAI API 키 | - | ✅ |
| `OPENAI_MODEL` | OpenAI 모델 | gpt-4o-mini | ❌ |
| `PUBLIC_DATA_API_KEY` | 공공데이터포털 API 키 | (기본값 제공) | ❌ |

## 🎯 주요 기능 상세

### 8대 궁합 지표

1. **일간 친밀도 (Day Master Compatibility)**
   - 두 사람의 일간(日干) 오행 관계 분석
   - 상생: 100점, 동일: 70점, 중화: 60점, 상극: 40점

2. **오행 상생성 (Five Elements Support)**
   - 전체 오행 분포의 상생 관계 분석
   - 최다 오행 간 상생 여부 확인

3. **천간 합 (Sky Harmony)**
   - 천간(天干) 간의 합(合)과 충(沖) 관계
   - 합: +20점, 충: -20점

4. **지지 합 (Ground Harmony)**
   - 지지(地支) 간의 합(合) 관계
   - 삼합(三合) 발견 시 100점

5. **갈등 제어 (Conflict Control)**
   - 지지 충(沖) 관계 분석
   - 충 1개당 30점 감점

6. **결핍 보완 (Complement)**
   - 한 사람에게 없는 오행을 상대방이 보완하는지 확인
   - 보완 1개당 20점 가산

7. **조후 균형 (Season Balance)**
   - 월지(月支) 계절의 균형 분석
   - 수화기제(水火旣濟): 100점

8. **에너지 시너지 (Synergy)**
   - 오행 상생성과 지지 합의 종합 평가
   - 삼합 발견 시 보너스 +10점

### 종합 점수 계산

- 각 지표에 가중치 적용
- 갈등 제어와 지지 합에 높은 가중치 (1.5)
- 갈등 점수 40점 미만 시 과락 감점 적용

### AI 분석

- 각 지표별 상세 분석 생성 (OpenAI GPT-4o-mini)
- 실시간 채팅을 통한 추가 질문 응답
- 발랄하고 친근한 "궁합문어" 캐릭터 톤

## 📝 라이선스

ISC

## 👥 기여

프로젝트에 기여하고 싶으시다면 이슈를 등록하거나 풀 리퀘스트를 보내주세요.

---

**궁합문어** - AI 기반 사주 궁합 분석 서비스 🐙
