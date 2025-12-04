# 코드 분석 문서

## 1. 자료구조 분석

### 1.1 데이터베이스 모델 (MongoDB/Mongoose)

#### 1.1.1 User 모델 (`server/models/User.js`)

**사용 목적:**
사용자 인증 정보(회원가입, 로그인)를 저장하는 핵심 모델입니다. 사용자명, 이메일, 비밀번호를 관리하며, 비밀번호는 bcrypt로 해싱되어 저장됩니다. UserInfo 모델과 분리하여 인증 정보와 개인 정보를 구분합니다. 회원가입(`POST /api/auth/signup`)과 로그인(`POST /api/auth/login`) API에서 사용됩니다.

**스키마 구조:**
```javascript
{
  username: String,        // 사용자명 (3-20자, unique, required, trim)
  email: String,           // 이메일 (unique, required, lowercase, 정규식 검증)
  password: String,        // 비밀번호 (해시됨, 6자 이상, required)
  createdAt: Date,        // 생성일시 (자동, timestamps 옵션)
  updatedAt: Date          // 수정일시 (자동, timestamps 옵션)
}
```

**인덱스:**
- `email`: 1 (unique) - 로그인 시 빠른 조회를 위한 인덱스
- `username`: 1 (unique) - 사용자명 중복 확인을 위한 인덱스

**메서드:**
- `comparePassword(candidatePassword)`: 
  - 평문 비밀번호와 해시된 비밀번호를 비교하는 메서드
  - bcrypt.compare()를 사용하여 안전하게 비교
  - 로그인 시 비밀번호 확인에 사용
- `toJSON()`: 
  - 사용자 정보를 JSON으로 변환할 때 비밀번호를 자동으로 제외
  - API 응답에서 비밀번호가 노출되지 않도록 보호

**미들웨어:**
- `pre('save')`: 
  - 문서 저장 전에 실행되는 미들웨어
  - 비밀번호가 변경된 경우에만 bcrypt로 해싱 (salt rounds: 10)
  - 비밀번호가 변경되지 않았다면 해싱을 건너뛰어 성능 최적화

**사용 위치:**
- `POST /api/auth/signup`: 회원가입 시 새 사용자 생성
- `POST /api/auth/login`: 로그인 시 사용자 조회 및 비밀번호 확인

---

#### 1.1.2 UserInfo 모델 (`server/models/UserInfo.js`)

**사용 목적:**
사용자의 사주 정보(이름, 생년월일, 출생시간)를 저장하는 모델입니다. User 모델과 분리하여 사용자 인증 정보와 개인 정보를 구분합니다. "내 정보 불러오기" 기능에서 사용됩니다.

**스키마 구조:**
```javascript
{
  userId: String,          // 사용자 ID (User 모델의 _id와 연결, unique, indexed, required)
  name: String,           // 이름 (default: '')
  birthDate: String,      // 생년월일 (default: '', "YYYY-MM-DD" 형식)
  birthTime: String,      // 출생시간 (default: '', "HH:MM" 형식)
  createdAt: Date,        // 생성일시 (자동, timestamps 옵션)
  updatedAt: Date          // 수정일시 (자동, timestamps 옵션)
}
```

**인덱스:**
- `userId`: 1 (unique, index) - 빠른 조회를 위한 인덱스

**사용 위치:**
- `POST /api/user/myinfo`: 내 정보 저장 (upsert 방식)
- `GET /api/user/myinfo`: 내 정보 조회
- `UserInputPage`: "내정보 불러오기" 버튼 클릭 시 사용

---

#### 1.1.3 Data 모델 (`server/models/Data.js`)

**사용 목적:**
범용 데이터 저장을 위한 모델입니다. 현재 프로젝트에서는 직접 사용되지 않지만, 향후 확장성을 위해 준비된 CRUD API가 있습니다. 제목과 내용을 통한 텍스트 검색이 가능하도록 인덱스가 설정되어 있습니다.

**스키마 구조:**
```javascript
{
  title: String,          // 제목 (required, trim - 앞뒤 공백 제거)
  content: String,        // 내용 (required)
  metadata: Map,          // 메타데이터 (Mixed 타입, default: {}, 유연한 추가 정보 저장용)
  createdAt: Date,        // 생성일시 (자동, timestamps 옵션)
  updatedAt: Date          // 수정일시 (자동, timestamps 옵션)
}
```

**인덱스:**
- `title`, `content`: text (전체 텍스트 검색 인덱스 - MongoDB text search 사용)
- `createdAt`: -1 (최신순 정렬을 위한 인덱스)

**API 엔드포인트:**
- `GET /api/data`: 모든 데이터 조회 (최신순)
- `GET /api/data/:id`: 특정 데이터 조회
- `POST /api/data`: 데이터 생성
- `PUT /api/data/:id`: 데이터 업데이트
- `DELETE /api/data/:id`: 데이터 삭제

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
  email: String,        // 이메일 (소문자로 변환됨)
  password: String      // 평문 비밀번호
}

// 응답 (성공)
{
  success: true,
  message: String,      // "로그인 성공"
  user: {
    _id: String,        // MongoDB ObjectId
    username: String,
    email: String       // 비밀번호는 toJSON()으로 제외됨
  }
}

// 응답 (실패)
{
  error: String        // "이메일 또는 비밀번호가 올바르지 않습니다." 등
}
```

**참고사항:**
- 로그인 성공 후 클라이언트는 `AuthContext.login()`을 호출하여 localStorage에 사용자 정보를 저장합니다.
- 현재는 JWT 토큰을 사용하지 않으므로, 인증 상태는 클라이언트의 localStorage에만 의존합니다.

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

**참고사항:**
- **외부 API 의존성**: 공공데이터포털 API(`getLunCalInfo`)를 사용하므로, API 서버 상태에 따라 응답 시간이 달라질 수 있습니다.
- **순차 처리**: 두 사용자의 사주 정보를 순차적으로 조회합니다 (API 호출 제한 고려). 병렬 처리 시 API 제한에 걸릴 수 있습니다.
- **응답 형식**: XML 또는 JSON 응답을 자동으로 감지하여 처리합니다. XML 응답은 `xml2js`로 파싱됩니다.
- **타임아웃**: API 호출 타임아웃은 10초로 설정되어 있습니다. 타임아웃 발생 시 에러를 반환합니다.
- **간지 정보**: `ganji` 필드는 한자만 포함하고, `ganjiFull` 필드는 "기묘(己卯)" 형식의 전체 정보를 포함합니다.
- **에러 처리**: 간지 정보가 부족하거나 API 오류가 발생하면 기본값을 반환하거나 에러 메시지를 반환합니다.
- **API 키**: `PUBLIC_DATA_API_KEY` 환경 변수가 필요하며, 없으면 기본값을 사용합니다.

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

**참고사항:**
- **AI 분석 통합**: 궁합 계산 시 OpenAI API를 사용하여 각 지표별 상세 분석을 자동으로 생성합니다. AI 분석이 실패하면 기본 분석을 사용합니다.
- **간지 파싱**: `parseGanjiToPillars()` 함수로 공공데이터포털 API 응답을 `SajuCompatibility` 클래스가 사용할 수 있는 형식으로 변환합니다.
- **8개 지표 계산**: `SajuCompatibility` 클래스의 `getRadarData()` 메서드로 8개 지표 점수를 계산합니다.
- **종합 점수**: 가중치를 적용하여 종합 점수를 계산하며, 갈등 점수가 40점 미만이면 과락 로직으로 감점됩니다.
- **AI 프롬프트**: 사용자 이름을 반드시 사용하도록 프롬프트에 명시되어 있으며, "사용자1", "사용자2" 같은 일반적인 표현은 금지됩니다.
- **JSON 파싱**: AI 응답이 JSON 형식이 아니거나 파싱에 실패하면 기본 분석을 반환합니다.
- **응답 시간**: AI 분석 생성에 시간이 걸릴 수 있으므로, 클라이언트에서 적절한 로딩 처리가 필요합니다.

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

**참고사항:**
- **OpenAI API 키 필요**: `OPENAI_API_KEY` 환경 변수가 반드시 설정되어 있어야 합니다. 없으면 500 에러를 반환합니다.
- **대화 기록 관리**: `conversationHistory` 배열에 이전 대화 기록을 포함하면 컨텍스트를 유지한 채팅이 가능합니다. 빈 배열이면 단일 메시지로 처리됩니다.
- **메시지 형식 변환**: 클라이언트에서 전달한 대화 기록을 OpenAI 메시지 형식(`role`, `content`)으로 자동 변환합니다.
- **토큰 사용량**: 응답에 `usage` 객체가 포함되어 프롬프트 토큰, 완성 토큰, 총 토큰 수를 확인할 수 있습니다. 비용 관리에 유용합니다.
- **모델 설정**: `OPENAI_MODEL` 환경 변수로 모델을 변경할 수 있으며, 기본값은 `gpt-4o-mini`입니다.
- **Temperature 설정**: `0.7`로 설정되어 있어 창의적이면서도 일관된 응답을 생성합니다. 낮추면 더 일관된 응답, 높이면 더 창의적인 응답을 얻을 수 있습니다.
- **최대 토큰 수**: `max_tokens: 1000`으로 제한되어 있어 긴 응답은 잘릴 수 있습니다. 필요에 따라 조정 가능합니다.
- **에러 처리**: OpenAI API 오류 시 상세한 에러 정보를 로그에 출력하며, 개발 환경에서만 상세 정보를 클라이언트에 반환합니다.
- **AIAdvicePage 연동**: `AIAdvicePage`에서 이 API를 사용하며, 상세 분석 정보를 시스템 프롬프트에 포함하여 더 정확한 답변을 생성합니다.

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
- `login(userData)`: 
  - 사용자 정보를 상태에 저장하고 localStorage에 JSON 문자열로 저장합니다.
  - 새로고침 시에도 로그인 상태가 유지됩니다.
- `logout()`: 
  - 사용자 정보를 상태에서 제거하고 localStorage에서도 삭제합니다.
  - 로그아웃 후 홈 페이지로 이동합니다.

**저장소:**
- `localStorage.getItem('user')`: JSON 문자열로 저장
- 키: `'user'`
- 값: `JSON.stringify(userData)` 형식

**주의사항:**
- 현재는 JWT 토큰을 사용하지 않으므로, 인증 상태는 클라이언트의 localStorage에만 의존합니다.
- 서버에서 인증 상태를 검증하지 않으므로, 보안이 중요한 기능에는 추가 인증이 필요합니다.

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
- 공공데이터포털 API에서 받은 간지 정보를 `SajuCompatibility` 클래스가 사용할 수 있는 형식으로 변환합니다.
- 각 문자열은 천간(첫 글자)과 지지(두 번째 글자)로 구성됩니다.
- 예: "기묘" → 천간: "기", 지지: "묘"

---

#### 1.4.2 오행 관계 맵

**SKY_MAP (천간 오행 맵):**
천간(天干) 10개를 오행으로 변환하는 맵입니다. 천간은 갑을병정무기경신임계 10개로 구성되며, 각각 오행에 대응됩니다.
```javascript
{
  '갑': 'wood', '을': 'wood',    // 갑을: 목(木)
  '병': 'fire', '정': 'fire',    // 병정: 화(火)
  '무': 'earth', '기': 'earth',  // 무기: 토(土)
  '경': 'metal', '신': 'metal',  // 경신: 금(金)
  '임': 'water', '계': 'water'    // 임계: 수(水)
}
```
**사용 목적:** 일간(日干)의 오행을 파악하여 일간 친밀도 계산에 사용됩니다.

---

**EARTH_MAP (지지 오행 및 계절 맵):**
지지(地支) 12개를 오행과 계절로 변환하는 맵입니다. 지지는 인묘진사오미신유술해자축 12개로 구성되며, 각각 오행과 계절 정보를 포함합니다.
```javascript
{
  '인': { el: 'wood', season: 1 },   // 인: 목, 봄
  '묘': { el: 'wood', season: 1 },   // 묘: 목, 봄
  '진': { el: 'earth', season: 0 },  // 진: 토, 환절기
  '사': { el: 'fire', season: 2 },   // 사: 화, 여름
  '오': { el: 'fire', season: 2 },   // 오: 화, 여름
  '미': { el: 'earth', season: 0 },  // 미: 토, 환절기
  '신': { el: 'metal', season: 3 },  // 신: 금, 가을
  '유': { el: 'metal', season: 3 },  // 유: 금, 가을
  '술': { el: 'earth', season: 0 },  // 술: 토, 환절기
  '해': { el: 'water', season: 4 },  // 해: 수, 겨울
  '자': { el: 'water', season: 4 },  // 자: 수, 겨울
  '축': { el: 'earth', season: 0 }   // 축: 토, 환절기
}
```
**사용 목적:** 
- `el`: 지지의 오행을 파악하여 오행 상생성, 지지 합 계산에 사용
- `season`: 월지(月支)의 계절을 파악하여 조후 균형 계산에 사용

---

**ELEMENT_RELATION (오행 상생/상극 관계):**
오행 간의 상생(相生)과 상극(相剋) 관계를 정의한 맵입니다. 전통적인 사주학의 오행 상생상극 이론을 기반으로 합니다.
```javascript
{
  'wood': { gen: 'fire', con: 'earth' },    // 목생화(木生火), 목극토(木剋土)
  'fire': { gen: 'earth', con: 'metal' },   // 화생토(火生土), 화극금(火剋金)
  'earth': { gen: 'metal', con: 'water' },  // 토생금(土生金), 토극수(土剋水)
  'metal': { gen: 'water', con: 'wood' },   // 금생수(金生水), 금극목(金剋木)
  'water': { gen: 'wood', con: 'fire' }     // 수생목(水生木), 수극화(水剋火)
}
```
**의미:**
- `gen` (generate): 상생 관계 - 한 오행이 다른 오행을 도와주는 관계 (긍정적)
- `con` (conflict): 상극 관계 - 한 오행이 다른 오행을 극하는 관계 (부정적)

**사용 목적:** 일간 친밀도, 오행 상생성 계산에 사용됩니다.

---

**SPECIAL_RELATION (천간/지지 특수 관계):**
천간과 지지 간의 합(合)과 충(沖) 관계를 정의한 맵입니다. 사주학에서 중요한 특수 관계입니다.
```javascript
{
  // 천간 합 (天干合) - 정신적 조화
  skyHap: ['갑기', '을경', '병신', '정임', '무계'],
  // 천간 충 (天干沖) - 정신적 충돌
  skyChung: ['갑경', '을신', '병임', '정계'],
  
  // 지지 합 (地支合) - 육체/현실적 조화
  groundHap: ['자축', '인해', '묘술', '진유', '사신', '오미'],
  // 지지 충 (地支沖) - 육체/현실적 충돌
  groundChung: ['자오', '축미', '인신', '묘유', '진술', '사해']
}
```
**의미:**
- **합(合)**: 두 간지가 만나 조화를 이루는 관계 (긍정적, 점수 가산)
- **충(沖)**: 두 간지가 만나 충돌하는 관계 (부정적, 점수 감산)

**사용 목적:**
- `skyHap`, `skyChung`: 천간 합 계산에 사용
- `groundHap`, `groundChung`: 지지 합, 갈등 제어 계산에 사용

---

**SAMHAP_GROUPS (삼합 그룹):**
삼합(三合)은 세 개의 지지가 모여 강력한 결속력을 만드는 특수 관계입니다. 일반 합보다 훨씬 강력한 관계로, 지지 합 계산에서 만점(100점)을 부여합니다.
```javascript
[
  { name: '화국(Fire)', req: ['인', '오', '술'] },    // 인오술 삼합
  { name: '금국(Metal)', req: ['사', '유', '축'] },   // 사유축 삼합
  { name: '수국(Water)', req: ['신', '자', '진'] },  // 신자진 삼합
  { name: '목국(Wood)', req: ['해', '묘', '미'] }     // 해묘미 삼합
]
```
**의미:**
- 두 사람의 지지(띠)를 모두 합쳐서 세 개가 모이면 삼합이 완성됩니다.
- 예: 사용자1이 '인'띠, 사용자2가 '오'띠와 '술'띠를 가지고 있으면 화국 삼합 완성

**사용 목적:** 
- `checkSamhap()` 메서드에서 삼합 여부 확인
- 삼합이 발견되면 지지 합 점수에 보너스(100점) 부여
- 에너지 시너지 계산에도 반영

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
- 공공데이터포털 API 응답을 간지 배열로 변환하는 유틸리티 함수입니다.
- API 응답에서 `ganjiFull` 또는 `ganji` 필드의 년/월/일 간지 정보를 추출합니다.
- "기묘(己卯)" 형식에서 "기묘"만 추출하여 배열로 반환합니다.
- 파라미터: `fortune` (API 응답 객체, `ganjiFull` 또는 `ganji` 필드 포함)
- 반환: `["기묘", "병자", "무오"]` 형식 배열 (년, 월, 일 순서)
- 에러 처리: 간지 정보가 부족하면 경고 로그 출력

---

#### 2.1.3 라우트 핸들러

**POST `/api/fortune/info`** (`server/routes/fortune.js`)

**함수: getFortuneInfo(solYear, solMonth, solDay)**
- 공공데이터포털의 음력 정보 조회 API(`getLunCalInfo`)를 호출하는 함수입니다.
- 양력 날짜를 입력받아 음력 날짜와 간지 정보를 조회합니다.
- XML 또는 JSON 응답을 자동으로 감지하여 파싱합니다.
- 파라미터:
  - `solYear`: 양력 연도 (String)
  - `solMonth`: 양력 월 (String)
  - `solDay`: 양력 일 (String)
- 반환: 파싱된 사주 정보 객체 (XML이면 xml2js로 파싱)
- 에러 처리: API 오류 코드 확인, 타임아웃 10초 설정

**함수: parseFortuneData(apiResponse, dateInfo)**
- 공공데이터포털 API의 원시 응답을 애플리케이션에서 사용할 수 있는 구조화된 형식으로 변환하는 함수입니다.
- API 응답 구조: `response.body.items.item`에서 간지 정보 추출
- 간지 정보 형식: "기묘(己卯)"에서 괄호 안의 한자만 추출하여 `ganji`에 저장, 전체는 `ganjiFull`에 저장
- 파라미터:
  - `apiResponse`: 공공데이터포털 API 원시 응답 객체
  - `dateInfo`: `{ year, month, day }` 형식의 날짜 정보
- 반환: `{ solarDate, lunarDate, ganji, ganjiFull, leapMonth, solWeek, rawData }`
- 에러 처리: 간지 정보가 없으면 기본값 반환

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
- OpenAI Chat Completions API를 사용하여 AI 채팅 응답을 생성하는 엔드포인트입니다.
- 대화 기록(`conversationHistory`)을 OpenAI 메시지 형식으로 변환하여 전달합니다.
- 파라미터:
  - `message`: 사용자 메시지 (String, required)
  - `conversationHistory`: 이전 대화 기록 배열 (선택)
- 사용 모델: `process.env.OPENAI_MODEL` 또는 기본값 `gpt-4o-mini`
- 설정: `temperature: 0.7`, `max_tokens: 1000`
- 반환: `{ success, response, usage }` (usage에는 토큰 사용량 포함)
- 에러 처리: 상세한 에러 로그 출력 (status, code, type, stack)

---

**POST `/api/auth/signup`** (`server/routes/auth.js`)

**핸들러: router.post('/signup', ...)**
- 회원가입을 처리하는 엔드포인트입니다.
- 입력 검증:
  - 필수 필드 확인 (username, email, password, confirmPassword)
  - 비밀번호 일치 확인
  - 비밀번호 최소 길이 확인 (6자 이상)
- 중복 확인:
  - 이메일과 사용자명을 동시에 조회 (`$or` 연산자)
  - 중복 시 구체적인 필드명과 함께 에러 반환
- 비밀번호 처리:
  - Mongoose `pre('save')` 훅에서 자동으로 bcrypt 해싱 (salt rounds: 10)
  - 저장 후 `toJSON()` 메서드로 비밀번호 제외하여 반환
- 에러 처리:
  - MongoDB 중복 키 오류 (code 11000): 구체적인 필드명 반환
  - 유효성 검사 오류: 첫 번째 에러 메시지 반환
  - 기타 오류: 500 상태 코드 및 개발 환경에서만 상세 메시지

---

**POST `/api/auth/login`** (`server/routes/auth.js`)

**핸들러: router.post('/login', ...)**
- 로그인을 처리하는 엔드포인트입니다.
- 입력 검증: 이메일과 비밀번호 필수 확인
- 사용자 조회:
  - 이메일을 소문자로 변환하여 조회 (대소문자 구분 없음)
  - 사용자가 없으면 401 에러 반환
- 비밀번호 확인:
  - `user.comparePassword()` 메서드로 bcrypt 해시 비교
  - 일치하지 않으면 401 에러 반환 (보안을 위해 구체적인 실패 원인은 표시하지 않음)
- 성공 시:
  - `user.toJSON()`으로 비밀번호 제외한 사용자 정보 반환
  - 클라이언트는 이 정보를 localStorage에 저장
- 에러 처리: 401 (인증 실패), 500 (서버 오류)

---

**POST `/api/user/myinfo`** (`server/routes/user.js`)

**POST `/api/user/myinfo`** (`server/routes/user.js`)

**핸들러: router.post('/myinfo', ...)**
- 사용자의 사주 정보(이름, 생년월일, 출생시간)를 저장하는 엔드포인트입니다.
- 파라미터:
  - `userId`: 사용자 ID (String, required)
  - `name`: 이름 (String, 선택)
  - `birthDate`: 생년월일 (String, 선택)
  - `birthTime`: 출생시간 (String, 선택)
- 동작:
  - `findOneAndUpdate()`로 upsert 방식 사용 (없으면 생성, 있으면 업데이트)
  - `new: true`: 업데이트 후 새 문서 반환
  - `runValidators: true`: 스키마 유효성 검사 실행
- 반환: 저장된 사용자 정보 객체

**GET `/api/user/myinfo`** (`server/routes/user.js`)

**핸들러: router.get('/myinfo', ...)**
- 사용자의 저장된 사주 정보를 조회하는 엔드포인트입니다.
- 쿼리 파라미터: `userId` (String, required)
- 동작:
  - `findOne()`으로 userId에 해당하는 UserInfo 조회
  - 없으면 `{ success: true, data: null, message: '저장된 정보가 없습니다.' }` 반환
- 반환: 사용자 정보 객체 또는 null

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
- 홈 버튼 및 로고: 클릭 시 `/home` 페이지로 이동
- 인증 상태에 따른 조건부 렌더링:
  - 로그인 전: "로그인", "회원가입" 버튼 표시
  - 로그인 후: "내 정보", "로그아웃" 버튼 표시
- 라우팅 네비게이션: React Router의 `useNavigate` 훅 사용

**프롭스:** 없음 (useNavigate, useAuth 훅 사용)

**상태 의존성:**
- `useAuth()`: 인증 상태 및 사용자 정보
- `isAuthenticated`: 로그인 여부 확인

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
- Chart.js Radar 차트 설정:
  - `RadialLinearScale`: 방사형 축 설정
  - `PointElement`, `LineElement`: 점과 선 스타일
  - `Filler`: 영역 채우기
  - `Tooltip`, `Legend`: 툴팁 및 범례
- 8개 지표 시각화:
  - 레이더 차트로 8개 궁합 지표를 팔각형 그래프로 표시
  - 점수 범위: 0-100
  - 색상: 빨간 계열 그라데이션
- 툴팁 기능:
  - 각 지표 이름 옆에 정보 아이콘 버튼
  - 클릭 시 해당 지표의 상세 설명 표시
  - 외부 클릭 시 자동으로 닫힘

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
- 8개 지표 상세 분석 테이블:
  - 각 지표의 인덱스, 이름, 점수, 상세 분석 텍스트 표시
  - 토글 버튼으로 표시/숨김 제어
  - `detailedAnalysis` 배열을 테이블 형식으로 렌더링
- AI 채팅 인터페이스:
  - 궁합문어 캐릭터와의 대화형 인터페이스
  - 초기 환영 메시지에 사용자 이름과 궁합 점수 포함
  - 대화 기록을 시스템 프롬프트에 포함하여 컨텍스트 유지
  - 상세 분석 정보를 프롬프트에 포함하여 정확한 답변 생성
- 궁합 점수 및 사용자 정보 표시:
  - 종합 궁합 점수 표시
  - 사용자1, 사용자2 이름 표시

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
- 궁합 계산 API 호출:
  - `location.state`에서 `fortuneData` 추출
  - `calculateCompatibility()` API 호출
  - 계산 완료 후 결과를 `/result` 페이지로 전달
- 로딩 화면 표시:
  - 스피너 애니메이션
  - "궁합 계산중..." 메시지
- 결과 페이지로 자동 이동:
  - 계산 완료 후 `navigate('/result', { state: { result } })` 호출
- 에러 처리:
  - 계산 실패 시 에러 메시지 표시
  - "다시 시도" 버튼으로 `/fortune-info` 페이지로 이동

**효과:**
- `useEffect`: 컴포넌트 마운트 시 계산 실행
- 의존성: `[navigate, fortuneData]`

---

**FortuneInfoPage** (`client/src/pages/FortuneInfoPage.js`)

**기능:**
- 사주 정보 확인 화면:
  - 두 사용자의 사주 정보(양력/음력 날짜, 간지 정보) 표시
  - 사용자가 정보를 확인하고 수정할 수 있는 기회 제공
- 계산 페이지로 이동:
  - "확인" 버튼 클릭 시 `/calculating` 페이지로 이동
  - `fortuneData`를 state로 전달

**메서드:**
- `handleConfirm()`: 
  - 확인 버튼 클릭 시 `navigate('/calculating', { state: { fortuneData } })` 호출
  - 계산 페이지로 사주 정보 전달

**에러 처리:**
- `fortuneData`가 없으면 에러 메시지 표시 및 `/input` 페이지로 이동 버튼 제공

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

- **MongoDB 연결 실패**: 
  - 연결 실패 시 콘솔에 에러 로그 출력
  - 애플리케이션은 계속 실행되지만 데이터베이스 작업은 실패
- **API 호출 실패**: 
  - 공공데이터포털 API 호출 실패 시 상세한 에러 로그 출력
  - 클라이언트에 에러 메시지 반환
  - 타임아웃 10초 설정
- **유효성 검사 실패**: 
  - 400 상태 코드 반환
  - 구체적인 에러 메시지 포함 (예: "비밀번호는 최소 6자 이상이어야 합니다.")
- **인증 실패**: 
  - 401 상태 코드 반환
  - 보안을 위해 구체적인 실패 원인은 표시하지 않음 ("이메일 또는 비밀번호가 올바르지 않습니다.")
- **서버 오류**: 
  - 500 상태 코드 반환
  - 전역 에러 핸들러 미들웨어에서 처리
  - 개발 환경에서만 상세한 에러 메시지 반환

### 5.2 클라이언트 측

- **API 호출 실패**: 
  - `try-catch` 블록으로 에러 처리
  - `api.js`의 각 함수에서 에러를 catch하여 재발생
- **에러 메시지 표시**: 
  - 사용자에게 친화적인 에러 메시지 표시
  - 빨간색 에러 박스로 시각적 피드백 제공
  - 예: "이메일 형식에 맞지 않습니다", "회원가입 중 오류가 발생했습니다"
- **로딩 상태 관리**: 
  - API 호출 중 로딩 상태 표시
  - 버튼 비활성화로 중복 요청 방지
  - 스피너 또는 "처리 중..." 텍스트 표시

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

- **CORS 설정**: 
  - 현재는 모든 오리진(`*`) 허용 (개발 환경)
  - 프로덕션 환경에서는 특정 도메인만 허용하도록 수정 권장
  - `server.js`에서 `app.use(cors())`로 설정

### 7.4 인증 보안

- **현재 상태**: 
  - JWT 토큰 미사용
  - 인증 상태는 클라이언트의 localStorage에만 저장
  - 서버에서 인증 상태를 검증하지 않음
- **보안 취약점**: 
  - localStorage는 XSS 공격에 취약
  - 토큰 없이 API 호출 시 인증 검증 불가
- **개선 권장사항**: 
  - JWT 토큰 기반 인증 구현
  - httpOnly 쿠키 사용 고려
  - 토큰 만료 시간 설정
  - 리프레시 토큰 구현

---

이 문서는 프로젝트의 자료구조와 함수/클래스 구조를 상세히 분석한 것입니다. 코드 수정 시 이 문서를 참고하여 일관성을 유지하세요.

