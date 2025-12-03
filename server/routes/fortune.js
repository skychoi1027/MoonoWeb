const express = require('express');
const router = express.Router();
const axios = require('axios');
const xml2js = require('xml2js');
const OpenAI = require('openai');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const API_BASE_URL = 'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService';
const API_KEY = process.env.PUBLIC_DATA_API_KEY || '9a5e6c814ffe6613524941b7ed7094a9b3fff41079376cbb9d031cc0e6b0598a';

/**
 * 공공데이터포털에서 사주 정보 가져오기
 * @param {string} solYear - 양력 연도
 * @param {string} solMonth - 양력 월
 * @param {string} solDay - 양력 일
 * @returns {Promise} 사주 정보
 */
async function getFortuneInfo(solYear, solMonth, solDay) {
  try {
    // 공공데이터포털 API 호출
    // serviceKey는 URL 인코딩된 상태로 전달해야 함
    const encodedKey = encodeURIComponent(API_KEY);
    
    // 공공데이터포털 API 엔드포인트
    // getLunCalInfo operation 사용 (음력 정보 조회)
    const url = `${API_BASE_URL}/getLunCalInfo`;
    const params = {
      serviceKey: encodedKey,
      solYear: solYear,
      solMonth: solMonth,
      solDay: solDay,
      numOfRows: 10,
      pageNo: 1,
    };

    console.log('API 호출:', url);
    console.log('파라미터:', { ...params, serviceKey: '***' });

    const response = await axios.get(url, {
      params: params,
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000, // 10초 타임아웃
    });

    console.log('API 응답 상태:', response.status);
    console.log('API 응답 타입:', typeof response.data);
    console.log('API 응답 데이터 (처음 500자):', 
      typeof response.data === 'string' 
        ? response.data.substring(0, 500)
        : JSON.stringify(response.data).substring(0, 500)
    );

    let parsedData = response.data;

    // XML 응답인 경우 파싱
    if (typeof response.data === 'string' && response.data.includes('<?xml')) {
      console.log('XML 응답 감지, 파싱 시작...');
      try {
        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
        parsedData = await parser.parseStringPromise(response.data);
        console.log('XML 파싱 완료');
      } catch (parseError) {
        console.error('XML 파싱 오류:', parseError);
        throw new Error(`XML 파싱 실패: ${parseError.message}`);
      }
    }

    // 에러 응답 확인
    const responseObj = parsedData.response || parsedData;
    if (responseObj.header) {
      const header = responseObj.header;
      const resultCode = header.resultCode || header.resultCode;
      if (resultCode && resultCode !== '00' && resultCode !== '0') {
        const errorMsg = header.resultMsg || header.resultMsg || `오류 코드: ${resultCode}`;
        throw new Error(`API 오류: ${errorMsg}`);
      }
    }

    return parsedData;
  } catch (error) {
    console.error('공공데이터 API 오류 상세:');
    console.error('메시지:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    if (error.request) {
      console.error('요청 데이터:', error.request);
    }
    throw new Error(`사주 정보 조회 실패: ${error.message}`);
  }
}

// 사주 정보 조회 엔드포인트
router.post('/info', async (req, res) => {
  try {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
      return res.status(400).json({ error: '사용자 정보가 필요합니다.' });
    }

    // 날짜 파싱
    const parseDate = (dateString) => {
      const date = new Date(dateString);
      return {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, '0'),
        day: date.getDate().toString().padStart(2, '0'),
      };
    };

    const user1Date = parseDate(user1.birthDate);
    const user2Date = parseDate(user2.birthDate);

    // 두 사용자의 사주 정보를 순차적으로 가져오기 (API 호출 제한 고려)
    let fortune1, fortune2;
    try {
      console.log('사용자1 사주 정보 조회 시작:', user1Date);
      fortune1 = await getFortuneInfo(user1Date.year, user1Date.month, user1Date.day);
      console.log('사용자1 사주 정보 조회 완료');
    } catch (error) {
      console.error('사용자1 사주 정보 조회 실패:', error);
      throw new Error(`사용자1 사주 정보 조회 실패: ${error.message}`);
    }

    try {
      console.log('사용자2 사주 정보 조회 시작:', user2Date);
      fortune2 = await getFortuneInfo(user2Date.year, user2Date.month, user2Date.day);
      console.log('사용자2 사주 정보 조회 완료');
    } catch (error) {
      console.error('사용자2 사주 정보 조회 실패:', error);
      throw new Error(`사용자2 사주 정보 조회 실패: ${error.message}`);
    }

    // 실제 API 응답 구조에 맞게 파싱 필요
    // 여기서는 임시로 구조화된 데이터 반환
    res.json({
      success: true,
      user1: {
        name: user1.name,
        birthDate: user1.birthDate,
        birthTime: user1.birthTime,
        fortune: parseFortuneData(fortune1, user1Date),
      },
      user2: {
        name: user2.name,
        birthDate: user2.birthDate,
        birthTime: user2.birthTime,
        fortune: parseFortuneData(fortune2, user2Date),
      },
    });
  } catch (error) {
    console.error('사주 정보 조회 오류:', error);
    res.status(500).json({
      error: '사주 정보를 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
});

// API 응답 데이터 파싱 함수 (실제 API 응답 구조에 맞게 수정)
function parseFortuneData(apiResponse, dateInfo) {
  try {
    // API 응답 구조 확인
    const items = apiResponse?.response?.body?.items;
    const item = items?.item;
    
    // item이 배열인지 단일 객체인지 확인
    const fortuneItem = Array.isArray(item) ? item[0] : item;

    if (!fortuneItem) {
      console.warn('사주 정보 파싱: item을 찾을 수 없음', JSON.stringify(apiResponse).substring(0, 500));
      // 기본값 반환
      return {
        solarDate: `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}`,
        lunarDate: '정보 없음',
        ganji: {
          year: '정보 없음',
          month: '정보 없음',
          day: '정보 없음',
        },
        rawData: apiResponse,
      };
    }

    // 실제 API 응답 구조에 맞게 파싱
    // getLunCalInfo 응답 구조:
    // - lunYear, lunMonth, lunDay: 음력 날짜
    // - lunIljin: 일간지 (예: "무오(戊午)")
    // - lunSecha: 세차/년간지 (예: "기묘(己卯)")
    // - lunWolgeon: 월건/월간지 (예: "병자(丙子)")
    
    // 간지 추출 (괄호 안의 한자 추출)
    const extractGanji = (str) => {
      if (!str) return '정보 없음';
      const match = str.match(/\(([^)]+)\)/);
      return match ? match[1] : str;
    };

    return {
      solarDate: `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}`,
      lunarDate: fortuneItem.lunYear && fortuneItem.lunMonth && fortuneItem.lunDay
        ? `${fortuneItem.lunYear}-${String(fortuneItem.lunMonth).padStart(2, '0')}-${String(fortuneItem.lunDay).padStart(2, '0')}`
        : '정보 없음',
      ganji: {
        year: extractGanji(fortuneItem.lunSecha) || '정보 없음', // 세차에서 년간지 추출
        month: extractGanji(fortuneItem.lunWolgeon) || '정보 없음', // 월건에서 월간지 추출
        day: extractGanji(fortuneItem.lunIljin) || '정보 없음', // 일진에서 일간지 추출
      },
      // 전체 간지 정보 (한글 포함)
      ganjiFull: {
        year: fortuneItem.lunSecha || '정보 없음',
        month: fortuneItem.lunWolgeon || '정보 없음',
        day: fortuneItem.lunIljin || '정보 없음',
      },
      // 추가 정보
      leapMonth: fortuneItem.lunLeapmonth || '평',
      solWeek: fortuneItem.solWeek || '',
      rawData: apiResponse,
    };
  } catch (error) {
    console.error('사주 정보 파싱 오류:', error);
    // 기본값 반환
    return {
      solarDate: `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}`,
      lunarDate: '정보 없음',
      ganji: {
        year: '정보 없음',
        month: '정보 없음',
        day: '정보 없음',
      },
      rawData: apiResponse,
    };
  }
}

// 궁합 계산 엔드포인트
router.post('/calculate', async (req, res) => {
  try {
    const { user1Fortune, user2Fortune } = req.body;

    if (!user1Fortune || !user2Fortune) {
      return res.status(400).json({ error: '사주 정보가 필요합니다.' });
    }

    // 사주 계산식 사용
    const { SajuCompatibility, parseGanjiToPillars } = require('../utils/sajuCalculator');

    // 공공데이터포털에서 받은 간지 정보를 계산식 형식으로 변환
    const personA = parseGanjiToPillars(user1Fortune);
    const personB = parseGanjiToPillars(user2Fortune);

    if (personA.length < 3 || personB.length < 3) {
      return res.status(400).json({ 
        error: '사주 정보가 부족합니다. 년, 월, 일 간지 정보가 모두 필요합니다.' 
      });
    }

    // 궁합 계산
    const calculator = new SajuCompatibility(personA, personB);
    const radarData = calculator.getRadarData();
    const totalScore = calculator.getTotalScore();
    
    // AI를 사용하여 상세 분석 생성
    const detailedAnalysis = await generateAIAnalysis(
      calculator,
      user1Fortune,
      user2Fortune,
      radarData
    );

    // 8개 지표 이름
    const radarLabels = [
      '일간 친밀도',
      '오행 상생성',
      '천간 합',
      '지지 합',
      '갈등 제어',
      '결핍 보완',
      '조후 균형',
      '에너지 시너지'
    ];

    // 설명 생성
    let description = '';
    if (totalScore >= 80) {
      description = '두 분의 궁합이 매우 좋습니다! 서로를 보완하며 함께 성장할 수 있는 관계입니다.';
    } else if (totalScore >= 60) {
      description = '두 분의 궁합이 좋습니다. 서로 이해하고 배려하면 더욱 좋은 관계가 될 수 있습니다.';
    } else if (totalScore >= 40) {
      description = '두 분의 궁합이 보통입니다. 서로의 차이를 인정하고 소통하면 좋은 관계를 유지할 수 있습니다.';
    } else {
      description = '두 분의 궁합에서 보완이 필요한 부분이 있습니다. 서로의 차이를 이해하고 노력하면 좋은 관계를 만들 수 있습니다.';
    }

    res.json({
      success: true,
      compatibility: totalScore,
      description: description,
      radarData: radarData,
      radarLabels: radarLabels,
      details: radarData.map((score, index) => ({
        label: radarLabels[index],
        score: score
      })),
      detailedAnalysis: detailedAnalysis // 상세 분석 추가
    });
  } catch (error) {
    console.error('궁합 계산 오류:', error);
    res.status(500).json({
      error: '궁합 계산 중 오류가 발생했습니다.',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// 기존 임시 계산 함수는 제거됨 (sajuCalculator.js의 SajuCompatibility 클래스 사용)

/**
 * AI를 사용하여 각 지표별 상세 분석 생성
 */
async function generateAIAnalysis(calculator, user1Fortune, user2Fortune, radarData) {
  try {
    const radarLabels = [
      '일간 친밀도',
      '오행 상생성',
      '천간 합',
      '지지 합',
      '갈등 제어',
      '결핍 보완',
      '조후 균형',
      '에너지 시너지'
    ];

    // 기본 분석 데이터 수집
    const basicAnalysis = calculator.getDetailedAnalysis();
    
    // AI 프롬프트 생성
    const user1Name = user1Fortune.name || '사용자1';
    const user2Name = user2Fortune.name || '사용자2';
    
    const prompt = `당신은 사주 궁합 전문가입니다. 다음 두 사람의 사주 정보를 바탕으로 8개 지표에 대한 상세한 로직 해석을 작성해주세요.

**사용자 정보:**
- ${user1Name}: ${user1Fortune.solarDate} (양력), ${user1Fortune.lunarDate} (음력)
  - 년간지: ${user1Fortune.ganjiFull?.year || user1Fortune.ganji?.year}
  - 월간지: ${user1Fortune.ganjiFull?.month || user1Fortune.ganji?.month}
  - 일간지: ${user1Fortune.ganjiFull?.day || user1Fortune.ganji?.day}

- ${user2Name}: ${user2Fortune.solarDate} (양력), ${user2Fortune.lunarDate} (음력)
  - 년간지: ${user2Fortune.ganjiFull?.year || user2Fortune.ganji?.year}
  - 월간지: ${user2Fortune.ganjiFull?.month || user2Fortune.ganji?.month}
  - 일간지: ${user2Fortune.ganjiFull?.day || user2Fortune.ganji?.day}

**8개 지표 점수:**
${radarLabels.map((label, index) => `${index + 1}. ${label}: ${radarData[index]}점`).join('\n')}

**기본 분석 정보 (참고용):**
${basicAnalysis.map((item, index) => `${index + 1}. ${item.label}: ${item.analysis}`).join('\n')}

각 지표에 대해 다음 형식으로 상세한 로직 해석을 작성해주세요:
- 간지 비교 (예: "신(辛,금) vs 정(丁,화) → 화극금(火剋金)")
- 관계 설명: **절대적으로 필수입니다.** 반드시 "${user1Name}"과 "${user2Name}"이라는 실제 이름만 사용하세요. 
  예시: "${user2Name}가 ${user1Name}를 녹이는(극하는) 관계입니다" 또는 "${user1Name}와 ${user2Name}는 서로를 도와주며..."
- 실용적 조언 (예: "초반에 긴장감이 있거나 스트레스가 있을 수 있습니다")

**절대 금지 사항:**
- "사용자1", "사용자2" 사용 금지
- "A", "B" 사용 금지
- "첫 번째 사용자", "두 번째 사용자" 사용 금지
- 반드시 "${user1Name}"과 "${user2Name}"만 사용하세요.

JSON 형식으로 응답해주세요:
{
  "analyses": [
    {
      "index": 1,
      "label": "일간 친밀도",
      "score": 40,
      "analysis": "상세한 로직 해석..."
    },
    ...
  ]
}`;

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 사주 궁합 전문가입니다. 정확하고 상세한 분석을 제공합니다. 

**중요 규칙:** 분석에서 사용자 이름을 언급할 때는 반드시 "${user1Name}"과 "${user2Name}"만 사용하세요. 절대로 "사용자1", "사용자2", "A", "B" 같은 일반적인 표현을 사용하지 마세요.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // JSON 파싱 시도 (코드 블록 제거)
    try {
      let jsonStr = aiResponse.trim();
      // 마크다운 코드 블록 제거
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonStr);
      if (parsed.analyses && Array.isArray(parsed.analyses) && parsed.analyses.length === 8) {
        // 기본 분석과 병합 (점수는 기본 분석에서 가져오기)
        const aiAnalyses = parsed.analyses.map((aiItem, index) => ({
          index: index + 1,
          label: basicAnalysis[index].label,
          score: basicAnalysis[index].score,
          analysis: aiItem.analysis || basicAnalysis[index].analysis
        }));
        
        return aiAnalyses;
      }
    } catch (parseError) {
      console.warn('AI 응답 JSON 파싱 실패, 기본 분석 사용:', parseError);
      console.warn('AI 응답:', aiResponse.substring(0, 500));
    }

    // JSON 파싱 실패 시 기본 분석 사용
    return basicAnalysis;
  } catch (error) {
    console.error('AI 분석 생성 오류:', error);
    // 오류 발생 시 기본 분석 반환
    const basicAnalysis = calculator.getDetailedAnalysis();
    return basicAnalysis;
  }
}

// 테스트 엔드포인트 (개발용)
router.get('/test', async (req, res) => {
  try {
    const { year = '2000', month = '01', day = '01' } = req.query;
    console.log('테스트 요청:', { year, month, day });
    
    const fortune = await getFortuneInfo(year, month, day);
    
    res.json({
      success: true,
      testData: fortune,
      parsed: parseFortuneData(fortune, { year, month, day }),
    });
  } catch (error) {
    console.error('테스트 오류:', error);
    res.status(500).json({
      error: '테스트 실패',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

module.exports = router;

