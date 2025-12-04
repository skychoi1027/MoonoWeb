# 궁합문어 프로젝트 상세 분석

## 📋 목차
1. [로그인/회원가입/사용자 정보 불러오기](#1-로그인회원가입사용자-정보-불러오기)
2. [사용자 사주 정보 받아오기](#2-사용자-사주-정보-받아오기)
3. [궁합 결과 계산](#3-궁합-결과-계산)
4. [궁합문어 파트 (AI 사용)](#4-궁합문어-파트-ai-사용)

---

## 1. 로그인/회원가입/사용자 정보 불러오기

### 1.1 회원가입 흐름

#### 프론트엔드 (`client/src/pages/SignUpPage.js`)
1. 사용자가 입력: `username`, `email`, `password`, `confirmPassword`
2. 이메일 형식 실시간 검증 (정규식: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
3. `signup()` 함수 호출 (`client/src/services/api.js`)

#### API 호출 (`client/src/services/api.js`)
```javascript
POST /api/auth/signup
Body: { username, email, password, confirmPassword }
```

#### 백엔드 처리 (`server/routes/auth.js`)
1. **입력 검증**
   - 모든 필드 필수 확인
   - 비밀번호 일치 확인
   - 비밀번호 길이 확인 (최소 6자)

2. **중복 확인**
   - MongoDB에서 `User.findOne()`로 이메일/사용자명 중복 체크
   - 중복 시 400 에러 반환

3. **사용자 생성**
   - `new User()` 생성
   - `User` 모델의 `pre('save')` 훅에서 **bcrypt**로 비밀번호 해싱
     - Salt rounds: 10
     - 해시된 비밀번호 저장

4. **응답**
   - `user.toJSON()` 호출 (비밀번호 제외)
   - 성공 시 201 상태 코드 반환

#### 데이터베이스 스키마 (`server/models/User.js`)
```javascript
{
  username: String (unique, 3-20자),
  email: String (unique, lowercase),
  password: String (hashed, 최소 6자),
  timestamps: true (createdAt, updatedAt)
}
```

### 1.2 로그인 흐름

#### 프론트엔드 (`client/src/pages/LoginPage.js`)
1. 사용자가 입력: `email`, `password`
2. `login()` 함수 호출

#### API 호출
```javascript
POST /api/auth/login
Body: { email, password }
```

#### 백엔드 처리 (`server/routes/auth.js`)
1. **입력 검증**
   - 이메일, 비밀번호 필수 확인

2. **사용자 찾기**
   - `User.findOne({ email: email.toLowerCase() })`
   - 사용자 없으면 401 에러

3. **비밀번호 확인**
   - `user.comparePassword(password)` 호출
   - 내부적으로 `bcrypt.compare()` 사용
   - 일치하지 않으면 401 에러

4. **응답**
   - `user.toJSON()` 반환 (비밀번호 제외)
   - 프론트엔드에서 `localStorage`에 저장

### 1.3 사용자 정보 저장/불러오기

#### 저장 흐름 (`client/src/pages/MyInfoPage.js`)
1. 사용자가 입력: `name`, `birthDate`, `birthTime`
2. `saveMyInfo()` 호출

#### API 호출
```javascript
POST /api/user/myinfo
Body: { userId, name, birthDate, birthTime }
```

#### 백엔드 처리 (`server/routes/user.js`)
1. **Upsert 작업**
   - `UserInfo.findOneAndUpdate()` 사용
   - `upsert: true` 옵션으로 없으면 생성, 있으면 업데이트
   - `userId` 기준으로 검색

2. **응답**
   - 저장된 `UserInfo` 반환

#### 불러오기 흐름 (`client/src/pages/UserInputPage.js`)
1. "내정보 불러오기" 버튼 클릭
2. `getMyInfo()` 호출

#### API 호출
```javascript
GET /api/user/myinfo?userId=xxx
```

#### 백엔드 처리
1. `UserInfo.findOne({ userId })` 조회
2. 없으면 `data: null` 반환
3. 있으면 `UserInfo` 반환

#### 데이터베이스 스키마 (`server/models/UserInfo.js`)
```javascript
{
  userId: String (unique, indexed),
  name: String,
  birthDate: String,
  birthTime: String,
  timestamps: true
}
```

---

## 2. 사용자 사주 정보 받아오기

### 2.1 전체 흐름

#### 프론트엔드 (`client/src/pages/UserInputPage.js`)
1. 사용자가 입력: `user1`, `user2` (각각 `name`, `birthDate`, `birthTime`, `gender`)
2. "시작하기" 버튼 클릭
3. `/loading` 페이지로 이동하며 `state`에 사용자 정보 전달

#### 로딩 페이지 (`client/src/pages/LoadingPage.js`)
1. `location.state`에서 사용자 정보 받기
2. `getFortuneInfo(user1, user2)` 호출

#### API 호출 (`client/src/services/api.js`)
```javascript
POST /api/fortune/info
Body: { user1, user2 }
```

### 2.2 백엔드 처리 (`server/routes/fortune.js`)

#### 2.2.1 날짜 파싱
```javascript
parseDate(birthDate) → { year, month, day }
// 예: "1990-01-01" → { year: "1990", month: "01", day: "01" }
```

#### 2.2.2 공공데이터포털 API 호출 (`getFortuneInfo()`)
1. **API 엔드포인트**
   ```
   https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo
   ```

2. **요청 파라미터**
   ```javascript
   {
     serviceKey: encodeURIComponent(API_KEY),
     solYear: "1990",
     solMonth: "01",
     solDay: "01",
     numOfRows: 10,
     pageNo: 1
   }
   ```

3. **응답 처리**
   - XML 또는 JSON 응답 받기
   - XML인 경우 `xml2js`로 파싱
   - 에러 코드 확인 (`resultCode !== '00'`)

4. **두 사용자 순차 호출**
   - `user1` 먼저 호출
   - `user2` 그 다음 호출
   - 각각 에러 처리

#### 2.2.3 사주 정보 파싱 (`parseFortuneData()`)
1. **응답 데이터 구조 분석**
   - `response.body.items.item` 또는 `response.body.response.body.items.item`에서 데이터 추출

2. **추출하는 정보**
   - **양력 날짜**: `solYear-solMonth-solDay`
   - **음력 날짜**: `lunYear-lunMonth-lunDay`
   - **간지 정보**:
     - `lunSecha` → 년간지 (예: "경오(庚午)")
     - `lunWolgeon` → 월간지
     - `lunIljin` → 일간지
   - **추가 정보**: `lunLeapmonth`, `solWeek`

3. **간지 추출 로직**
   ```javascript
   extractGanji("경오(庚午)") → "庚午"
   // 괄호 안의 한자만 추출
   ```

4. **반환 데이터 구조**
   ```javascript
   {
     solarDate: "1990-01-01",
     lunarDate: "1989-12-05",
     ganji: {
       year: "庚午",
       month: "戊子",
       day: "甲子"
     },
     ganjiFull: {
       year: "경오(庚午)",
       month: "무자(戊子)",
       day: "갑자(甲子)"
     },
     leapMonth: "평",
     solWeek: "월"
   }
   ```

#### 2.2.4 응답 반환
```javascript
{
  success: true,
  user1: { name, birthDate, birthTime, fortune: {...} },
  user2: { name, birthDate, birthTime, fortune: {...} }
}
```

#### 2.2.5 프론트엔드 처리 (`client/src/pages/FortuneInfoPage.js`)
1. 사주 정보 표시 (양력/음력, 간지 정보)
2. "결과 확인" 버튼 클릭
3. `/calculating` 페이지로 이동하며 사주 정보 전달

---

## 3. 궁합 결과 계산

### 3.1 전체 흐름

#### 프론트엔드 (`client/src/pages/CalculatingPage.js`)
1. `location.state`에서 사주 정보 받기
2. `calculateCompatibility(user1Fortune, user2Fortune)` 호출

#### API 호출
```javascript
POST /api/fortune/calculate
Body: { user1Fortune, user2Fortune }
```

### 3.2 백엔드 처리 (`server/routes/fortune.js`)

#### 3.2.1 간지 정보 변환 (`parseGanjiToPillars()`)
1. **입력**: 공공데이터포털에서 받은 간지 정보
   ```javascript
   {
     ganji: { year: "庚午", month: "戊子", day: "甲子" }
   }
   ```

2. **변환 로직** (`server/utils/sajuCalculator.js`)
   - 한자 간지를 한글 간지로 변환
   - 예: "庚午" → "경오"
   - 년, 월, 일 각각 변환

3. **출력**: `["경오", "무자", "갑자"]` (년, 월, 일 순서)

#### 3.2.2 궁합 계산 (`SajuCompatibility` 클래스)

##### 클래스 초기화
```javascript
const calculator = new SajuCompatibility(personA, personB);
// personA = ["경오", "무자", "갑자"]
// personB = ["을축", "정해", "신미"]
```

##### 입력 파싱 (`parseInput()`)
1. **간지 분해**
   - 각 간지를 천간(天干)과 지지(地支)로 분리
   - 예: "경오" → `{ sky: "경", earth: "오" }`

2. **오행 변환**
   - 천간 → 오행: `SKY_MAP` 사용
     - 갑,을 → wood
     - 병,정 → fire
     - 무,기 → earth
     - 경,신 → metal
     - 임,계 → water
   - 지지 → 오행: `EARTH_MAP` 사용
     - 인,묘 → wood (봄)
     - 사,오 → fire (여름)
     - 신,유 → metal (가을)
     - 해,자 → water (겨울)
     - 진,미,술,축 → earth (환절기)

3. **오행 개수 카운트**
   - 각 오행(wood, fire, earth, metal, water)이 몇 번 나타나는지 계산

4. **지지 목록 추출** (삼합 계산용)

##### 8대 지표 계산

###### 1. 일간 친밀도 (`calcDayMaster()`)
- **계산**: 두 사람의 일간(日干, 3번째 간지의 천간) 오행 관계
- **점수**:
  - 상생 관계: 100점
  - 같은 오행: 70점
  - 중화 관계: 60점
  - 상극 관계: 40점
- **오행 관계**:
  - 상생: wood→fire→earth→metal→water→wood
  - 상극: wood→earth, fire→metal, earth→water, metal→wood, water→fire

###### 2. 오행 상생성 (`calcSupport()`)
- **계산**: 각 사람의 최다 오행 간 상생 여부
- **점수**: 기본 50점 + 상생 시 +25점씩 (최대 100점)

###### 3. 천간 합 (`calcSkyHarmony()`)
- **계산**: 년, 월, 일 천간 간의 합(合)과 충(沖) 관계
- **합**: 갑기, 을경, 병신, 정임, 무계 → +20점
- **충**: 갑경, 을신, 병임, 정계 → -20점
- **점수**: 기본 50점 + 합/충 점수 (0-100점)

###### 4. 지지 합 (`calcGroundHarmony()`)
- **계산**: 지지 간의 합과 삼합(三合)
- **합**: 자축, 인해, 묘술, 진유, 사신, 오미 → +20점
- **삼합**: 
  - 화국: 인, 오, 술
  - 금국: 사, 유, 축
  - 수국: 신, 자, 진
  - 목국: 해, 묘, 미
- **점수**: 삼합 발견 시 100점, 합만 있으면 50점 + 합 점수

###### 5. 갈등 제어 (`calcConflictControl()`)
- **계산**: 지지 충(沖) 관계 개수
- **충**: 자오, 축미, 인신, 묘유, 진술, 사해
- **점수**: 100점 - (충 개수 × 30점)

###### 6. 결핍 보완 (`calcComplement()`)
- **계산**: 한 사람에게 없는 오행을 상대방이 보완하는지
- **점수**: 기본 40점 + 보완 1개당 +20점 (최대 100점)

###### 7. 조후 균형 (`calcSeasonBalance()`)
- **계산**: 월지(月支) 계절의 균형
- **점수**:
  - 수화기제(겨울-여름): 100점
  - 같은 계절: 40점
  - 기타: 70점

###### 8. 에너지 시너지 (`calcSynergy()`)
- **계산**: 오행 상생성과 지지 합의 평균
- **점수**: 삼합 발견 시 +10점 보너스

##### 종합 점수 계산 (`getTotalScore()`)
1. **가중치 적용**
   ```javascript
   weights = [1.0, 1.2, 0.8, 1.5, 1.5, 1.2, 0.8, 1.0]
   // 일간, 상생, 천간, 지지, 갈등, 결핍, 조후, 시너지
   ```

2. **가중 평균 계산**
   ```javascript
   totalScore = Σ(점수[i] × 가중치[i]) / Σ(가중치[i])
   ```

3. **과락 감점**
   - 갈등 점수가 40점 미만이면 감점
   - `finalScore -= (40 - 갈등점수) × 0.5`

4. **최종 점수**: 0-100점 범위로 제한

#### 3.2.3 AI 상세 분석 생성 (`generateAIAnalysis()`)

##### 기본 분석 수집
```javascript
const basicAnalysis = calculator.getDetailedAnalysis();
// 8개 지표에 대한 기본 분석 텍스트 반환
```

##### OpenAI API 호출
1. **시스템 프롬프트**
   - 사주 궁합 전문가 역할
   - 사용자 이름 사용 규칙 강조

2. **사용자 프롬프트 구성**
   - 사용자 정보 (이름, 양력/음력 날짜, 간지)
   - 8개 지표 점수
   - 기본 분석 정보

3. **요청**
   ```javascript
   POST https://api.openai.com/v1/chat/completions
   {
     model: "gpt-4o-mini",
     messages: [
       { role: "system", content: "..." },
       { role: "user", content: "..." }
     ],
     temperature: 0.7,
     max_tokens: 2000
   }
   ```

4. **응답 파싱**
   - JSON 형식 응답 파싱
   - 마크다운 코드 블록 제거
   - 8개 지표 분석 추출

5. **기본 분석과 병합**
   - AI 분석이 실패하면 기본 분석 사용
   - 점수는 기본 분석에서 가져오기

#### 3.2.4 응답 반환
```javascript
{
  success: true,
  compatibility: 85,  // 종합 점수
  description: "두 분의 궁합이 매우 좋습니다!...",
  radarData: [70, 80, 90, 75, 85, 70, 80, 85],  // 8개 지표 점수
  radarLabels: ["일간 친밀도", "오행 상생성", ...],
  details: [
    { label: "일간 친밀도", score: 70 },
    ...
  ],
  detailedAnalysis: [
    {
      index: 1,
      label: "일간 친밀도",
      score: 70,
      analysis: "상세한 로직 해석..."
    },
    ...
  ]
}
```

#### 3.2.5 프론트엔드 처리 (`client/src/pages/ResultPage.js`)
1. **방사형 그래프 생성** (Chart.js)
   - `radarData`를 사용하여 8각형 그래프 그리기
   - `radarLabels`로 축 레이블 설정

2. **종합 점수 표시**
   - `compatibility` 점수를 크게 표시

3. **"궁합문어 조언 듣기" 버튼**
   - `/advice` 페이지로 이동하며 `result` 전달

---

## 4. 궁합문어 파트 (AI 사용)

### 4.1 초기 화면 (`client/src/pages/AIAdvicePage.js`)

#### 초기 환영 메시지
```javascript
{
  role: 'assistant',
  content: `안녕하세요! 🐙 ${user1Name}님과 ${user2Name}님의 궁합 점수는 ${compatibility}점이에요!...`
}
```

#### 상세 분석 테이블 표시
- 8개 지표의 상세 분석 테이블
- 각 지표별 점수와 로직 해석 표시
- "테이블 숨기기" 버튼으로 토글 가능

### 4.2 실시간 채팅

#### 사용자 메시지 전송
1. 사용자가 메시지 입력
2. `handleChatSend()` 호출

#### 대화 기록 구성
```javascript
const conversationHistory = [
  {
    role: 'system',
    content: `당신은 발랄하고 친근한 사주 궁합 전문가 "궁합문어" 캐릭터입니다! 🐙
    
**8대 궁합 지표 상세 분석 정보:**
${detailedAnalysisText}

위 상세 분석 정보를 참고해서 사용자의 질문에 답변해주세요...`
  },
  ...chatMessages  // 이전 대화 기록
];
```

#### API 호출 (`client/src/services/api.js`)
```javascript
POST /api/ai/chat
Body: {
  message: "사용자 메시지",
  conversationHistory: [...]
}
```

#### 백엔드 처리 (`server/routes/ai.js`)
1. **대화 기록 변환**
   ```javascript
   messages = conversationHistory.map(msg => ({
     role: msg.role,
     content: msg.content
   }));
   messages.push({ role: 'user', content: message });
   ```

2. **OpenAI API 호출**
   ```javascript
   POST https://api.openai.com/v1/chat/completions
   {
     model: "gpt-4o-mini",
     messages: messages,
     temperature: 0.7,
     max_tokens: 1000
   }
   ```

3. **응답 반환**
   ```javascript
   {
     success: true,
     response: "AI 응답 텍스트",
     usage: {
       prompt_tokens: 100,
       completion_tokens: 50,
       total_tokens: 150
     }
   }
   ```

#### 프론트엔드 처리
1. AI 응답을 `chatMessages`에 추가
2. 채팅 영역 자동 스크롤
3. "생각 중..." 표시 (로딩 중)

### 4.3 AI 캐릭터 설정

#### 시스템 프롬프트 특징
- **캐릭터**: 발랄하고 친근한 "궁합문어" 🐙
- **톤**: 밝고 발랄하게, 친근하고 재미있게
- **이모티콘**: 적절히 사용
- **전문성**: 정확한 내용 전달
- **컨텍스트**: 상세 분석 정보를 항상 참고

#### 대화 기록 관리
- 모든 대화 기록이 `conversationHistory`에 유지
- 시스템 프롬프트에 상세 분석 정보 포함
- 사용자 이름(`user1Name`, `user2Name`) 사용 강조

---

## 🔄 전체 플로우 다이어그램

```
1. 회원가입/로그인
   └─> MongoDB (User, UserInfo)
   
2. 사용자 정보 입력
   └─> 내정보 불러오기 (선택)
   └─> 공공데이터포털 API 호출
       └─> 사주 정보 파싱
       
3. 궁합 계산
   └─> 간지 정보 변환
   └─> SajuCompatibility 클래스
       └─> 8대 지표 계산
       └─> 종합 점수 계산
   └─> OpenAI API (상세 분석)
   └─> 방사형 그래프 생성
   
4. 궁합문어 채팅
   └─> OpenAI API (실시간 채팅)
       └─> 대화 기록 유지
       └─> 상세 분석 정보 참고
```

---

## 📊 데이터 흐름

### 사용자 정보
```
UserInputPage → LoadingPage → FortuneInfoPage → CalculatingPage → ResultPage → AIAdvicePage
     ↓              ↓                ↓                  ↓              ↓            ↓
  사용자 입력   API 호출       사주 정보 표시      궁합 계산      결과 표시    AI 채팅
```

### API 호출 순서
1. `POST /api/fortune/info` - 사주 정보 조회
2. `POST /api/fortune/calculate` - 궁합 계산
3. `POST /api/ai/chat` - AI 채팅 (여러 번 호출 가능)

### 데이터 저장
- **MongoDB**: User, UserInfo
- **localStorage**: 로그인한 사용자 정보
- **React State**: 현재 세션의 궁합 결과

---

## 🔑 핵심 기술 포인트

### 1. 비밀번호 보안
- bcrypt 해싱 (salt rounds: 10)
- 저장 시 자동 해싱 (`pre('save')` 훅)
- 비교 시 `bcrypt.compare()` 사용

### 2. 사주 정보 파싱
- XML/JSON 응답 모두 처리
- 한자 간지를 한글 간지로 변환
- 에러 처리 및 기본값 제공

### 3. 궁합 계산 알고리즘
- 오행 상생/상극 관계 매핑
- 천간/지지 합/충 관계 체크
- 삼합 특별 처리
- 가중치 기반 종합 점수

### 4. AI 통합
- OpenAI GPT-4o-mini 사용
- 대화 기록 유지로 컨텍스트 보존
- 시스템 프롬프트로 캐릭터 설정
- JSON 파싱 및 에러 처리

---

## 🐛 에러 처리

### 공공데이터포털 API
- 타임아웃: 10초
- XML 파싱 실패 시 에러 반환
- `resultCode` 확인

### OpenAI API
- API 키 확인
- 토큰 제한 처리
- JSON 파싱 실패 시 기본 분석 사용
- 상세한 에러 로깅

### 사용자 입력
- 이메일 형식 검증
- 비밀번호 일치 확인
- 필수 필드 검증
- 중복 확인

---

이 문서는 프로젝트의 전체적인 구조와 각 기능의 상세한 작동 방식을 설명합니다.

