# 코드 분석 문서

## 1. 자료구조 분석

### 1.1 데이터베이스 모델 (MongoDB/Mongoose)

#### 1.1.1 User 모델 (`server/models/User.js`)

**스키마 구조:**
```javascript
{
  username: String,        // 사용자명 (3-20자, unique, required)
  email: String,           // 이메일 (unique, required, lowercase)
  password: String,        // 비밀번호 (해시됨, 6자 이상, required)
  createdAt: Date,        // 생성일시 (자동)
  updatedAt: Date          // 수정일시 (자동)
}
```

**인덱스:**
- `email`: 1 (unique)
- `username`: 1 (unique)

**메서드:**
- `comparePassword(candidatePassword)`: 비밀번호 비교
- `toJSON()`: 비밀번호 제외한 사용자 정보 반환

**미들웨어:**
- `pre('save')`: 비밀번호 저장 전 bcrypt 해싱 (salt rounds: 10)

---

#### 1.1.2 UserInfo 모델 (`server/models/UserInfo.js`)

**스키마 구조:**
```javascript
{
  userId: String,          // 사용자 ID (unique, indexed, required)
  name: String,           // 이름 (default: '')
  birthDate: String,      // 생년월일 (default: '')
  birthTime: String,      // 출생시간 (default: '')
  createdAt: Date,        // 생성일시 (자동)
  updatedAt: Date          // 수정일시 (자동)
}
```

**인덱스:**
- `userId`: 1 (unique, index)

---

#### 1.1.3 Data 모델 (`server/models/Data.js`)

**스키마 구조:**
```javascript
{
  title: String,          // 제목 (required, trim)
  content: String,        // 내용 (required)
  metadata: Map,          // 메타데이터 (Mixed 타입, default: {})
  createdAt: Date,        // 생성일시 (자동)
  updatedAt: Date          // 수정일시 (자동)
}
```

**인덱스:**
- `title`, `content`: text (전체 텍스트 검색)
- `createdAt`: -1 (최신순 정렬)

---

### 1.2 API 요청/응답 구조

#### 1.2.1 인증 API

**POST `/api/auth/signup`**
```javascript
// 요청
{
  username: String,
  email: String,
  password: String,
  confirmPassword: String
}

// 응답 (성공)
{
  success: true,
  message: String,
  user: {
    _id: String,
    username: String,
    email: String,
    createdAt: Date,
    updatedAt: Date
  }
}

// 응답 (실패)
{
  error: String
}
```

**POST `/api/auth/login`**
```javascript
// 요청
{
  email: String,
  password: String
}

// 응답 (성공)
{
  success: true,
  message: String,
  user: {
    _id: String,
    username: String,
    email: String
  }
}
```

---

#### 1.2.2 사주 정보 API

**POST `/api/fortune/info`**
```javascript
// 요청
{
  user1: {
    name: String,
    birthDate: String,    // "YYYY-MM-DD"
    birthTime: String,
    gender: String
  },
  user2: {
    name: String,
    birthDate: String,
    birthTime: String,
    gender: String
  }
}

// 응답
{
  success: true,
  user1: {
    name: String,
    birthDate: String,
    birthTime: String,
    fortune: {
      solarDate: String,      // "YYYY-MM-DD"
      lunarDate: String,       // "YYYY-MM-DD"
      ganji: {
        year: String,          // 한자 간지
        month: String,
        day: String
      },
      ganjiFull: {
        year: String,          // "기묘(己卯)" 형식
        month: String,
        day: String
      },
      leapMonth: String,
      solWeek: String,
      rawData: Object          // API 원본 데이터
    }
  },
  user2: { /* 동일 구조 */ }
}
```

**POST `/api/fortune/calculate`**
```javascript
// 요청
{
  user1Fortune: Object,   // fortune/info 응답의 fortune 객체
  user2Fortune: Object
}

// 응답
{
  success: true,
  compatibility: Number,   // 0-100 종합 점수
  description: String,
  radarData: [Number],    // [8개 지표 점수]
  radarLabels: [String],  // [8개 지표 이름]
  details: [
    {
      label: String,
      score: Number
    }
  ],
  detailedAnalysis: [
    {
      index: Number,
      label: String,
      score: Number,
      analysis: String
    }
  ]
}
```

---

#### 1.2.3 AI 채팅 API

**POST `/api/ai/chat`**
```javascript
// 요청
{
  message: String,
  conversationHistory: [
    {
      role: String,        // "user" | "assistant" | "system"
      content: String
    }
  ]
}

// 응답
{
  success: true,
  response: String,
  usage: {
    prompt_tokens: Number,
    completion_tokens: Number,
    total_tokens: Number
  }
}
```

---

### 1.3 React 상태 구조

#### 1.3.1 AuthContext (`client/src/contexts/AuthContext.js`)

**상태:**
```javascript
{
  user: {
    _id: String,
    username: String,
    email: String
  } | null,
  isLoading: Boolean,
  isAuthenticated: Boolean
}
```

**메서드:**
- `login(userData)`: 사용자 로그인 및 localStorage 저장
- `logout()`: 로그아웃 및 localStorage 제거

**저장소:**
- `localStorage.getItem('user')`: JSON 문자열로 저장

---

#### 1.3.2 ResultPage 상태 (`client/src/pages/ResultPage.js`)

**Location State:**
```javascript
{
  result: {
    compatibility: Number,
    description: String,
    user1: {
      name: String,
      birthDate: String,
      birthTime: String,
      gender: String
    },
    user2: { /* 동일 */ },
    radarData: [Number],      // [8개 점수]
    radarLabels: [String],    // [8개 이름]
    detailedAnalysis: [
      {
        index: Number,
        label: String,
        score: Number,
        analysis: String
      }
    ]
  }
}
```

**컴포넌트 상태:**
```javascript
{
  activeTooltip: Number | null  // 활성화된 툴팁 인덱스
}
```

---

#### 1.3.3 AIAdvicePage 상태 (`client/src/pages/AIAdvicePage.js`)

**Location State:**
```javascript
{
  result: {
    compatibility: Number,
    user1: { name: String, ... },
    user2: { name: String, ... },
    detailedAnalysis: Array
  }
}
```

**컴포넌트 상태:**
```javascript
{
  showDetailedTable: Boolean,
  chatMessages: [
    {
      role: String,        // "user" | "assistant"
      content: String,
      timestamp: Date,
      isError?: Boolean
    }
  ],
  chatInput: String,
  isChatLoading: Boolean
}
```

---

### 1.4 사주 계산 데이터 구조

#### 1.4.1 간지 파싱 결과 (`server/utils/sajuCalculator.js`)

**parseInput 결과:**
```javascript
{
  raw: [
    {
      sky: String,        // "갑", "을", "병", ...
      earth: String,       // "인", "묘", "진", ...
      skyEl: String,      // "wood", "fire", "earth", "metal", "water"
      earthEl: String,
      season: Number       // 0(환절기), 1(봄), 2(여름), 3(가을), 4(겨울)
    }
  ],                      // [년, 월, 일]
  counts: {
    wood: Number,
    fire: Number,
    earth: Number,
    metal: Number,
    water: Number
  },
  earthBranches: [String] // ["인", "묘", "진"]
}
```

**parseGanjiToPillars 결과:**
```javascript
["기묘", "병자", "무오"]  // [년간지, 월간지, 일간지]
```

---

#### 1.4.2 오행 관계 맵

**SKY_MAP:**
```javascript
{
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water'
}
```

**EARTH_MAP:**
```javascript
{
  '인': { el: 'wood', season: 1 },
  '묘': { el: 'wood', season: 1 },
  '진': { el: 'earth', season: 0 },
  // ...
}
```

**ELEMENT_RELATION:**
```javascript
{
  'wood': { gen: 'fire', con: 'earth' },    // gen: 상생, con: 상극
  'fire': { gen: 'earth', con: 'metal' },
  // ...
}
```

**SPECIAL_RELATION:**
```javascript
{
  skyHap: ['갑기', '을경', '병신', '정임', '무계'],
  skyChung: ['갑경', '을신', '병임', '정계'],
  groundHap: ['자축', '인해', '묘술', '진유', '사신', '오미'],
  groundChung: ['자오', '축미', '인신', '묘유', '진술', '사해']
}
```

**SAMHAP_GROUPS:**
```javascript
[
  { name: '화국(Fire)', req: ['인', '오', '술'] },
  { name: '금국(Metal)', req: ['사', '유', '축'] },
  { name: '수국(Water)', req: ['신', '자', '진'] },
  { name: '목국(Wood)', req: ['해', '묘', '미'] }
]
```

---

## 2. 함수/클래스 분석

### 2.1 서버 측

#### 2.1.1 SajuCompatibility 클래스 (`server/utils/sajuCalculator.js`)

**클래스 개요:**
사주 궁합 계산을 위한 핵심 클래스. 두 사람의 사주 정보를 입력받아 8개 지표를 계산하고 종합 점수를 산출합니다.

**생성자:**
```javascript
constructor(personA, personB)
```
- `personA`: `["기묘", "병자", "무오"]` 형식의 배열 (년, 월, 일)
- `personB`: 동일 형식

**주요 메서드:**

1. **parseInput(pillars)**
   - 간지 문자열 배열을 파싱하여 오행 정보 추출
   - 반환: `{ raw, counts, earthBranches }`

2. **checkSamhap()**
   - 삼합(三合) 관계 확인
   - 반환: `{ found: Boolean, bonus: Number }`

3. **checkPatternScore(type, hapList, chungList)**
   - 천간/지지 합/충 패턴 점수 계산
   - `type`: `'sky'` | `'earth'`
   - 반환: `Number` (0-100)

4. **calcDayMaster()**
   - 일간 친밀도 계산 (두 사람의 일간 오행 관계)
   - 반환: `Number` (0-100)

5. **calcSupport()**
   - 오행 상생성 계산 (최다 오행 간 상생 관계)
   - 반환: `Number` (0-100)

6. **calcSkyHarmony()**
   - 천간 합 계산 (정신적 조화)
   - 반환: `Number` (0-100)

7. **calcGroundHarmony()**
   - 지지 합 계산 (육체/현실적 조화, 삼합 포함)
   - 반환: `Number` (0-100)

8. **calcConflictControl()**
   - 갈등 제어 계산 (지지 충 관계 분석)
   - 반환: `Number` (0-100)

9. **calcComplement()**
   - 결핍 보완 계산 (오행 결핍 보완 여부)
   - 반환: `Number` (0-100)

10. **calcSeasonBalance()**
    - 조후 균형 계산 (월지 계절 균형)
    - 반환: `Number` (0-100)

11. **calcSynergy()**
    - 에너지 시너지 계산 (오행 상생성 + 지지 합 종합)
    - 반환: `Number` (0-100)

12. **getRadarData()**
    - 8개 지표 점수 배열 반환
    - 반환: `[Number, Number, ...]` (8개)

13. **getDetailedAnalysis()**
    - 각 지표별 상세 분석 텍스트 생성
    - 반환: `Array<{ index, label, score, analysis }>`

14. **getTotalScore()**
    - 가중치 적용 종합 점수 계산
    - 가중치: `[1.0, 1.2, 0.8, 1.5, 1.5, 1.2, 0.8, 1.0]`
    - 과락 로직: 갈등 점수 < 40이면 감점
    - 반환: `Number` (0-100)

---

#### 2.1.2 유틸리티 함수

**parseGanjiToPillars(fortune)**
- 공공데이터포털 API 응답을 간지 배열로 변환
- 파라미터: `fortune` (API 응답 객체)
- 반환: `["기묘", "병자", "무오"]` 형식 배열

---

#### 2.1.3 라우트 핸들러

**POST `/api/fortune/info`** (`server/routes/fortune.js`)

**함수: getFortuneInfo(solYear, solMonth, solDay)**
- 공공데이터포털 API 호출
- XML 응답 파싱 (xml2js)
- 반환: 파싱된 사주 정보 객체

**함수: parseFortuneData(apiResponse, dateInfo)**
- API 응답을 구조화된 사주 정보로 변환
- 반환: `{ solarDate, lunarDate, ganji, ganjiFull, ... }`

**핸들러: router.post('/info', ...)**
- 두 사용자의 사주 정보를 순차적으로 조회
- 에러 처리 및 응답 구조화

---

**POST `/api/fortune/calculate`** (`server/routes/fortune.js`)

**함수: generateAIAnalysis(calculator, user1Fortune, user2Fortune, radarData)**
- OpenAI API를 사용한 상세 분석 생성
- 프롬프트 생성 및 JSON 파싱
- 반환: `Array<{ index, label, score, analysis }>`

**핸들러: router.post('/calculate', ...)**
- 간지 파싱 및 SajuCompatibility 인스턴스 생성
- 8개 지표 계산 및 종합 점수 산출
- AI 분석 통합

---

**POST `/api/ai/chat`** (`server/routes/ai.js`)

**핸들러: router.post('/chat', ...)**
- OpenAI Chat Completions API 호출
- 대화 기록 관리
- 에러 처리 및 토큰 사용량 반환

---

**POST `/api/auth/signup`** (`server/routes/auth.js`)

**핸들러: router.post('/signup', ...)**
- 입력 검증 (필수 필드, 비밀번호 확인, 길이)
- 중복 확인 (이메일, 사용자명)
- 비밀번호 해싱 (Mongoose pre-save hook)
- 에러 처리 (MongoDB 중복 키, 유효성 검사)

---

**POST `/api/auth/login`** (`server/routes/auth.js`)

**핸들러: router.post('/login', ...)**
- 이메일로 사용자 조회
- 비밀번호 비교 (bcrypt)
- 사용자 정보 반환 (비밀번호 제외)

---

**POST `/api/user/myinfo`** (`server/routes/user.js`)

**핸들러: router.post('/myinfo', ...)**
- UserInfo 업데이트 또는 생성 (upsert)
- 반환: 저장된 사용자 정보

**GET `/api/user/myinfo`** (`server/routes/user.js`)

**핸들러: router.get('/myinfo', ...)**
- userId로 사용자 정보 조회
- 반환: 사용자 정보 또는 null

---

### 2.2 클라이언트 측

#### 2.2.1 API 서비스 함수 (`client/src/services/api.js`)

**sendChatMessage(message, conversationHistory)**
- AI 채팅 API 호출
- 파라미터:
  - `message`: 사용자 메시지
  - `conversationHistory`: 대화 기록 배열
- 반환: `{ success, response, usage }`

**getFortuneInfo(user1, user2)**
- 사주 정보 조회 API 호출
- 파라미터: 두 사용자 정보 객체
- 반환: 사주 정보 객체

**calculateCompatibility(user1Fortune, user2Fortune)**
- 궁합 계산 API 호출
- 파라미터: 두 사용자의 사주 정보
- 반환: 궁합 결과 객체

**signup(userData)**
- 회원가입 API 호출
- 파라미터: `{ username, email, password, confirmPassword }`
- 반환: 회원가입 결과

**login(email, password)**
- 로그인 API 호출
- 반환: 로그인 결과 및 사용자 정보

**saveMyInfo(infoData)**
- 내 정보 저장 API 호출
- localStorage에서 userId 추출
- 파라미터: `{ name, birthDate, birthTime }`
- 반환: 저장 결과

**getMyInfo()**
- 내 정보 조회 API 호출
- localStorage에서 userId 추출
- 반환: 사용자 정보

---

#### 2.2.2 React 컴포넌트

**AuthProvider** (`client/src/contexts/AuthContext.js`)

**상태:**
- `user`: 사용자 정보 또는 null
- `isLoading`: 초기 로딩 상태

**메서드:**
- `login(userData)`: 사용자 로그인 및 localStorage 저장
- `logout()`: 로그아웃 및 localStorage 제거

**훅:**
- `useAuth()`: AuthContext 사용 훅

---

**Header** (`client/src/components/Header.js`)

**기능:**
- 홈 버튼 및 로고
- 인증 상태에 따른 버튼 표시 (로그인/회원가입 또는 내정보/로그아웃)
- 라우팅 네비게이션

**프롭스:** 없음 (useNavigate, useAuth 사용)

---

**ChatBot** (`client/src/components/ChatBot.js`)

**상태:**
- `messages`: 대화 메시지 배열
- `inputMessage`: 입력 메시지
- `isLoading`: 로딩 상태

**메서드:**
- `handleSend(e)`: 메시지 전송
- `handleKeyPress(e)`: Enter 키 처리
- `scrollToBottom()`: 스크롤 하단 이동

**효과:**
- `useEffect`: 메시지 업데이트 시 스크롤
- `useEffect`: 초기 환영 메시지 설정

---

**ResultPage** (`client/src/pages/ResultPage.js`)

**상태:**
- `activeTooltip`: 활성화된 툴팁 인덱스

**메서드:**
- `handleTooltipClick(index)`: 툴팁 토글

**효과:**
- `useEffect`: 외부 클릭 시 툴팁 닫기

**차트 데이터:**
- Chart.js Radar 차트 설정
- 8개 지표 시각화

---

**AIAdvicePage** (`client/src/pages/AIAdvicePage.js`)

**상태:**
- `showDetailedTable`: 상세 테이블 표시 여부
- `chatMessages`: 채팅 메시지 배열
- `chatInput`: 입력 메시지
- `isChatLoading`: 채팅 로딩 상태

**메서드:**
- `handleChatSend(e)`: 채팅 메시지 전송
- `handleToggleTable()`: 테이블 토글

**효과:**
- `useEffect`: 초기 환영 메시지 설정
- `useEffect`: 채팅 스크롤

**기능:**
- 8개 지표 상세 분석 테이블 표시
- AI 채팅 인터페이스
- 궁합 점수 및 사용자 정보 표시

---

**UserInputPage** (`client/src/pages/UserInputPage.js`)

**상태:**
- `user1`: `{ name, birthDate, birthTime, gender }`
- `user2`: 동일 구조

**메서드:**
- `handleUser1Change(e)`: 사용자1 정보 업데이트
- `handleUser2Change(e)`: 사용자2 정보 업데이트
- `handleUser1GenderChange(gender)`: 사용자1 성별 변경
- `handleUser2GenderChange(gender)`: 사용자2 성별 변경
- `handleLoadMyInfo()`: 내 정보 불러오기
- `handleSubmit(e)`: 폼 제출 및 라우팅

---

**CalculatingPage** (`client/src/pages/CalculatingPage.js`)

**기능:**
- 궁합 계산 API 호출
- 로딩 화면 표시
- 결과 페이지로 자동 이동

**효과:**
- `useEffect`: 컴포넌트 마운트 시 계산 실행

---

**FortuneInfoPage** (`client/src/pages/FortuneInfoPage.js`)

**기능:**
- 사주 정보 확인 화면
- 계산 페이지로 이동

**메서드:**
- `handleConfirm()`: 확인 버튼 클릭 시 계산 페이지로 이동

---

### 2.3 서버 설정

**server.js** (`server/server.js`)

**미들웨어:**
- `cors()`: CORS 설정
- `express.json()`: JSON 파싱
- `express.urlencoded()`: URL 인코딩 파싱

**라우트:**
- `/api/ai`: AI 관련 라우트
- `/api/data`: 데이터 CRUD 라우트
- `/api/fortune`: 사주/궁합 라우트
- `/api/auth`: 인증 라우트
- `/api/user`: 사용자 정보 라우트

**데이터베이스:**
- MongoDB 연결 (Mongoose)
- 연결 문자열: `process.env.MONGODB_URI` 또는 기본값

**에러 핸들링:**
- 전역 에러 핸들러 미들웨어

---

## 3. 데이터 흐름

### 3.1 궁합 계산 플로우

1. **사용자 입력** (`UserInputPage`)
   - 사용자1, 사용자2 정보 입력
   - `/loading` 페이지로 이동

2. **사주 정보 조회** (`LoadingPage` → `FortuneInfoPage`)
   - `POST /api/fortune/info` 호출
   - 공공데이터포털 API 호출 (2회)
   - 사주 정보 파싱 및 반환

3. **궁합 계산** (`CalculatingPage`)
   - `POST /api/fortune/calculate` 호출
   - `SajuCompatibility` 클래스로 계산
   - AI 분석 생성
   - `/result` 페이지로 이동

4. **결과 표시** (`ResultPage`)
   - 레이더 차트 표시
   - 8개 지표 점수 표시
   - 상세 분석 표시

5. **AI 조언** (`AIAdvicePage`)
   - 상세 분석 테이블
   - AI 채팅 인터페이스

---

### 3.2 인증 플로우

1. **회원가입**
   - `POST /api/auth/signup`
   - 비밀번호 해싱 (bcrypt)
   - MongoDB 저장
   - 사용자 정보 반환

2. **로그인**
   - `POST /api/auth/login`
   - 비밀번호 비교
   - `AuthContext.login()` 호출
   - localStorage 저장

3. **내 정보 저장/조회**
   - `POST /api/user/myinfo`: 저장
   - `GET /api/user/myinfo`: 조회
   - UserInfo 모델 사용

---

## 4. 주요 알고리즘

### 4.1 사주 궁합 계산 알고리즘

**8개 지표 계산:**
1. 일간 친밀도: 두 일간의 오행 관계 (상생/상극/중화)
2. 오행 상생성: 최다 오행 간 상생 관계
3. 천간 합: 천간 합/충 패턴 분석
4. 지지 합: 지지 합 패턴 분석 (삼합 포함)
5. 갈등 제어: 지지 충 패턴 분석
6. 결핍 보완: 오행 결핍 보완 여부
7. 조후 균형: 월지 계절 균형 (수화기제)
8. 에너지 시너지: 오행 상생성 + 지지 합 종합

**종합 점수 계산:**
- 가중치 적용: `[1.0, 1.2, 0.8, 1.5, 1.5, 1.2, 0.8, 1.0]`
- 과락 로직: 갈등 점수 < 40이면 감점
- 최종 점수: 0-100 범위

---

### 4.2 삼합 검사 알고리즘

**로직:**
1. 두 사람의 지지(띠)를 모두 합쳐서 Set 생성
2. 4개 삼합 그룹 중 하나라도 완성되는지 확인
3. 완성되면 보너스 점수 부여 (지지 합: 100점)

**삼합 그룹:**
- 화국: 인, 오, 술
- 금국: 사, 유, 축
- 수국: 신, 자, 진
- 목국: 해, 묘, 미

---

## 5. 에러 처리

### 5.1 서버 측

- **MongoDB 연결 실패**: 에러 로그 출력
- **API 호출 실패**: 에러 메시지 반환
- **유효성 검사 실패**: 400 상태 코드 및 에러 메시지
- **인증 실패**: 401 상태 코드
- **서버 오류**: 500 상태 코드 및 에러 핸들러

### 5.2 클라이언트 측

- **API 호출 실패**: try-catch로 에러 처리
- **에러 메시지 표시**: 사용자에게 친화적인 메시지
- **로딩 상태 관리**: 로딩 중 UI 표시

---

## 6. 성능 최적화

### 6.1 데이터베이스

- **인덱스**: email, username, userId에 인덱스 설정
- **텍스트 검색**: title, content에 텍스트 인덱스

### 6.2 클라이언트

- **React.memo**: 불필요한 리렌더링 방지 (필요 시)
- **useEffect 의존성**: 최적화된 의존성 배열
- **로컬 스토리지**: 사용자 정보 캐싱

---

## 7. 보안

### 7.1 비밀번호

- **bcrypt 해싱**: salt rounds 10
- **비밀번호 제외**: toJSON() 메서드로 비밀번호 제외

### 7.2 입력 검증

- **이메일 형식**: 정규식 검증
- **비밀번호 길이**: 최소 6자
- **사용자명 길이**: 3-20자

### 7.3 CORS

- **CORS 설정**: 모든 오리진 허용 (개발 환경)

---

이 문서는 프로젝트의 자료구조와 함수/클래스 구조를 상세히 분석한 것입니다. 코드 수정 시 이 문서를 참고하여 일관성을 유지하세요.

