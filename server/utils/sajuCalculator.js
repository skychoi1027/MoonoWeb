const SKY_MAP = {
  '갑': 'wood', '을': 'wood', '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth', '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water'
};

const EARTH_MAP = {
  // season: 1(봄), 2(여름), 3(가을), 4(겨울), 0(환절기)
  '인': { el: 'wood', season: 1 }, '묘': { el: 'wood', season: 1 }, '진': { el: 'earth', season: 0 },
  '사': { el: 'fire', season: 2 }, '오': { el: 'fire', season: 2 }, '미': { el: 'earth', season: 0 },
  '신': { el: 'metal', season: 3 }, '유': { el: 'metal', season: 3 }, '술': { el: 'earth', season: 0 },
  '해': { el: 'water', season: 4 }, '자': { el: 'water', season: 4 }, '축': { el: 'earth', season: 0 }
};

const ELEMENT_RELATION = {
  'wood': { gen: 'fire', con: 'earth' }, 'fire': { gen: 'earth', con: 'metal' },
  'earth': { gen: 'metal', con: 'water' }, 'metal': { gen: 'water', con: 'wood' },
  'water': { gen: 'wood', con: 'fire' }
};

const SPECIAL_RELATION = {
  skyHap: ['갑기', '을경', '병신', '정임', '무계'],
  skyChung: ['갑경', '을신', '병임', '정계'],
  groundHap: ['자축', '인해', '묘술', '진유', '사신', '오미'],
  groundChung: ['자오', '축미', '인신', '묘유', '진술', '사해']
};

// ★ 삼합(Three Harmony) 정의
const SAMHAP_GROUPS = [
  { name: '화국(Fire)', req: ['인', '오', '술'] },
  { name: '금국(Metal)', req: ['사', '유', '축'] },
  { name: '수국(Water)', req: ['신', '자', '진'] },
  { name: '목국(Wood)', req: ['해', '묘', '미'] }
];

/**
 * ---------------------------------------------------------
 * 2. 분석 엔진 클래스
 * ---------------------------------------------------------
 */
class SajuCompatibility {
  constructor(personA, personB) {
    this.p1 = this.parseInput(personA);
    this.p2 = this.parseInput(personB);
  }

  parseInput(pillars) {
    const parsed = pillars.map(p => {
      const sky = p.charAt(0);
      const earth = p.charAt(1);
      return { 
        sky, 
        earth, 
        skyEl: SKY_MAP[sky], 
        earthEl: EARTH_MAP[earth].el, 
        season: EARTH_MAP[earth].season 
      };
    });
    
    // 오행 개수 카운트
    const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    parsed.forEach(p => { 
      counts[p.skyEl]++; 
      counts[p.earthEl]++; 
    });
    
    // 지지 목록만 추출 (삼합 계산용)
    const earthBranches = parsed.map(p => p.earth);
    return { raw: parsed, counts, earthBranches };
  }

  // --- [Helper] 삼합 체크 로직 ---
  checkSamhap() {
    // 두 사람의 지지를 모두 합쳐서 삼합이 완성되는지 확인
    const pool = new Set([...this.p1.earthBranches, ...this.p2.earthBranches]);
    let bonus = 0;
    let found = false;
    SAMHAP_GROUPS.forEach(group => {
      if (group.req.every(char => pool.has(char))) {
        bonus = 30; // 삼합 발견 시 가산점
        found = true;
      }
    });
    return { found, bonus };
  }

  // --- [Helper] 패턴 점수 ---
  checkPatternScore(type, hapList, chungList) {
    let score = 50;
    for (let i = 0; i < 3; i++) {
      const p = [this.p1.raw[i][type], this.p2.raw[i][type]].sort().join('');
      if (hapList && hapList.includes(p)) score += 20;
      if (chungList && chungList.includes(p)) score -= 20;
    }
    return Math.max(0, Math.min(100, score));
  }

  // --- [8대 지표 계산] ---
  // 1. 일간 친밀도
  calcDayMaster() {
    const d1 = this.p1.raw[2].skyEl;
    const d2 = this.p2.raw[2].skyEl;
    if (d1 === d2) return 70;
    if (ELEMENT_RELATION[d1].gen === d2 || ELEMENT_RELATION[d2].gen === d1) return 100; // 상생
    if (ELEMENT_RELATION[d1].con === d2 || ELEMENT_RELATION[d2].con === d1) return 40;  // 상극
    return 60;
  }

  // 2. 오행 상생성
  calcSupport() {
    const getMax = (c) => Object.keys(c).reduce((a, b) => c[a] > c[b] ? a : b);
    const m1 = getMax(this.p1.counts), m2 = getMax(this.p2.counts);
    let score = 50;
    if (ELEMENT_RELATION[m1].gen === m2) score += 25;
    if (ELEMENT_RELATION[m2].gen === m1) score += 25;
    return Math.min(100, score);
  }

  // 3. 천간 합 (정신)
  calcSkyHarmony() {
    return this.checkPatternScore('sky', SPECIAL_RELATION.skyHap, SPECIAL_RELATION.skyChung);
  }

  // 4. 지지 합 (육체/현실) ★ 삼합 적용
  calcGroundHarmony() {
    let score = this.checkPatternScore('earth', SPECIAL_RELATION.groundHap, null);
    const samhap = this.checkSamhap();
    if (samhap.found) {
      score = 100; // 삼합이 있으면 무조건 만점 처리 (강력한 결속)
    }
    return score;
  }

  // 5. 갈등 제어 (안정성)
  calcConflictControl() {
    let clashCount = 0;
    for(let i=0; i<3; i++) {
      const pair = [this.p1.raw[i].earth, this.p2.raw[i].earth].sort().join('');
      if (SPECIAL_RELATION.groundChung.includes(pair)) clashCount++;
    }
    // 충이 없으면 100점, 하나당 30점 감점
    return Math.max(0, 100 - (clashCount * 30));
  }

  // 6. 결핍 보완
  calcComplement() {
    let score = 0;
    ['wood', 'fire', 'earth', 'metal', 'water'].forEach(el => {
      if (this.p1.counts[el] === 0 && this.p2.counts[el] >= 1) score += 20;
      if (this.p2.counts[el] === 0 && this.p1.counts[el] >= 1) score += 20;
    });
    return Math.min(100, 40 + score);
  }

  // 7. 조후 균형
  calcSeasonBalance() {
    const s1 = this.p1.raw[1].season, s2 = this.p2.raw[1].season;
    if ((s1 === 4 && s2 === 2) || (s1 === 2 && s2 === 4)) return 100; // 수화기제
    if (s1 === s2) return 40; // 같은 계절
    return 70;
  }

  // 8. 에너지 시너지 ★ 삼합 적용
  calcSynergy() {
    let synergy = (this.calcSupport() + this.calcGroundHarmony()) / 2;
    if (this.checkSamhap().found) synergy += 10; // 보너스
    return Math.min(100, Math.floor(synergy));
  }

  // ★ API: 8각 데이터 추출
  getRadarData() {
    return [
      this.calcDayMaster(), 
      this.calcSupport(), 
      this.calcSkyHarmony(), 
      this.calcGroundHarmony(),
      this.calcConflictControl(), 
      this.calcComplement(), 
      this.calcSeasonBalance(), 
      this.calcSynergy()
    ];
  }

  // ★ API: 각 지표별 상세 설명 생성
  getDetailedAnalysis() {
    const scores = this.getRadarData();
    const labels = [
      '일간 친밀도',
      '오행 상생성',
      '천간 합',
      '지지 합',
      '갈등 제어',
      '결핍 보완',
      '조후 균형',
      '에너지 시너지'
    ];

    const analyses = [];

    // 1. 일간 친밀도
    const d1 = this.p1.raw[2];
    const d2 = this.p2.raw[2];
    let dayMasterAnalysis = '';
    if (d1.skyEl === d2.skyEl) {
      dayMasterAnalysis = `${d1.sky}(${d1.skyEl}) vs ${d2.sky}(${d2.skyEl}) → 같은 오행. 서로 비슷한 성향을 가지고 있어 이해하기 쉽지만, 변화가 부족할 수 있습니다.`;
    } else if (ELEMENT_RELATION[d1.skyEl].gen === d2.skyEl || ELEMENT_RELATION[d2.skyEl].gen === d1.skyEl) {
      dayMasterAnalysis = `${d1.sky}(${d1.skyEl}) vs ${d2.sky}(${d2.skyEl}) → 상생 관계. 서로를 도와주며 함께 성장할 수 있는 이상적인 관계입니다.`;
    } else if (ELEMENT_RELATION[d1.skyEl].con === d2.skyEl || ELEMENT_RELATION[d2.skyEl].con === d1.skyEl) {
      dayMasterAnalysis = `${d1.sky}(${d1.skyEl}) vs ${d2.sky}(${d2.skyEl}) → 상극 관계. 서로를 극하는 관계로 초반에 긴장감이나 스트레스가 있을 수 있습니다.`;
    } else {
      dayMasterAnalysis = `${d1.sky}(${d1.skyEl}) vs ${d2.sky}(${d2.skyEl}) → 중화 관계. 서로를 보완하며 균형잡힌 관계를 유지할 수 있습니다.`;
    }
    analyses.push(dayMasterAnalysis);

    // 2. 오행 상생성
    const getMax = (c) => Object.keys(c).reduce((a, b) => c[a] > c[b] ? a : b);
    const m1 = getMax(this.p1.counts);
    const m2 = getMax(this.p2.counts);
    let supportAnalysis = '';
    if (ELEMENT_RELATION[m1].gen === m2 || ELEMENT_RELATION[m2].gen === m1) {
      supportAnalysis = `${m1}생${m2} 또는 ${m2}생${m1}. 한쪽의 거대한 기운이 다른 쪽을 크게 키워주는 구조입니다. 서로 헌신적인 서포터가 되는 관계입니다.`;
    } else {
      supportAnalysis = `${m1} vs ${m2}. 오행 상생 관계가 약하지만, 서로 다른 특성을 보완할 수 있습니다.`;
    }
    analyses.push(supportAnalysis);

    // 3. 천간 합
    let skyHarmonyAnalysis = '';
    const skyHaps = [];
    const skyChungs = [];
    for (let i = 0; i < 3; i++) {
      const pair = [this.p1.raw[i].sky, this.p2.raw[i].sky].sort().join('');
      if (SPECIAL_RELATION.skyHap.includes(pair)) skyHaps.push(pair);
      if (SPECIAL_RELATION.skyChung.includes(pair)) skyChungs.push(pair);
    }
    if (skyHaps.length > 0) {
      skyHarmonyAnalysis = `${skyHaps.join(', ')} → 천간 합. 정신적인 가치관에서 조화가 이루어집니다.`;
    } else if (skyChungs.length > 0) {
      skyHarmonyAnalysis = `${skyChungs.join(', ')} → 천간 충. 정신적인 가치관에서 충돌이 발생합니다. 생각의 결이 다를 수 있습니다.`;
    } else {
      skyHarmonyAnalysis = '천간 합이나 충이 없습니다. 정신적인 영역에서 중립적인 관계입니다.';
    }
    analyses.push(skyHarmonyAnalysis);

    // 4. 지지 합
    let groundHarmonyAnalysis = '';
    const groundHaps = [];
    const samhap = this.checkSamhap();
    if (samhap.found) {
      groundHarmonyAnalysis = '삼합 발견! 연주(띠)끼리의 합이 매우 강력합니다. 현실적/육체적 속궁합이나 배경적 조화가 매우 좋습니다.';
    } else {
      for (let i = 0; i < 3; i++) {
        const pair = [this.p1.raw[i].earth, this.p2.raw[i].earth].sort().join('');
        if (SPECIAL_RELATION.groundHap.includes(pair)) groundHaps.push(pair);
      }
      if (groundHaps.length > 0) {
        groundHarmonyAnalysis = `${groundHaps.join(', ')} → 지지 합. 현실적/육체적 속궁합이 좋습니다.`;
      } else {
        groundHarmonyAnalysis = '지지 합이 없습니다. 현실적인 영역에서 보완이 필요할 수 있습니다.';
      }
    }
    analyses.push(groundHarmonyAnalysis);

    // 5. 갈등 제어
    let conflictAnalysis = '';
    const conflicts = [];
    for (let i = 0; i < 3; i++) {
      const pair = [this.p1.raw[i].earth, this.p2.raw[i].earth].sort().join('');
      if (SPECIAL_RELATION.groundChung.includes(pair)) conflicts.push(pair);
    }
    if (conflicts.length === 0) {
      conflictAnalysis = '충(沖)이 없습니다. 안정적인 관계를 유지할 수 있습니다.';
    } else {
      conflictAnalysis = `${conflicts.join(', ')} → 충 발생. 서로의 지지가 부딪힙니다. 다툼이 발생하면 격렬할 수 있어 안전장치 점수가 낮습니다.`;
    }
    analyses.push(conflictAnalysis);

    // 6. 결핍 보완
    let complementAnalysis = '';
    const missing = [];
    ['wood', 'fire', 'earth', 'metal', 'water'].forEach(el => {
      if (this.p1.counts[el] === 0 && this.p2.counts[el] >= 1) missing.push(`${el} (B가 보완)`);
      if (this.p2.counts[el] === 0 && this.p1.counts[el] >= 1) missing.push(`${el} (A가 보완)`);
    });
    if (missing.length > 0) {
      complementAnalysis = `완벽한 보완. ${missing.join(', ')}. 서로가 서로의 '용신(필수 아이템)'입니다.`;
    } else {
      complementAnalysis = '오행이 고르게 분포되어 있어 보완이 덜 필요합니다.';
    }
    analyses.push(complementAnalysis);

    // 7. 조후 균형
    const s1 = this.p1.raw[1].season;
    const s2 = this.p2.raw[1].season;
    const seasonNames = { 0: '환절기', 1: '봄', 2: '여름', 3: '가을', 4: '겨울' };
    let seasonAnalysis = '';
    if ((s1 === 4 && s2 === 2) || (s1 === 2 && s2 === 4)) {
      seasonAnalysis = `수화기제. ${seasonNames[s1]} vs ${seasonNames[s2]}. 서로 다른 계절로 균형이 잘 맞습니다.`;
    } else if (s1 === s2) {
      seasonAnalysis = `둘 다 ${seasonNames[s1]}생입니다. 기본적으로 계절적 배경이 너무 비슷해 신선함은 떨어지지만, 서로를 잘 이해할 수 있습니다.`;
    } else {
      seasonAnalysis = `${seasonNames[s1]} vs ${seasonNames[s2]}. 서로 다른 계절로 적당한 균형을 이룹니다.`;
    }
    analyses.push(seasonAnalysis);

    // 8. 에너지 시너지
    let synergyAnalysis = '';
    if (samhap.found) {
      synergyAnalysis = '삼합으로 인한 강력한 시너지. 함께 무언가를 도모하면 폭발적인 시너지가 납니다.';
    } else {
      const supportScore = this.calcSupport();
      const groundScore = this.calcGroundHarmony();
      if (supportScore > 70 && groundScore > 70) {
        synergyAnalysis = '에너지가 서로에게 흘러들어가는 파이프라인이 확실합니다. 함께하면 큰 시너지를 낼 수 있습니다.';
      } else {
        synergyAnalysis = '에너지 흐름이 원활하지 않을 수 있지만, 서로 노력하면 좋은 시너지를 만들 수 있습니다.';
      }
    }
    analyses.push(synergyAnalysis);

    return labels.map((label, index) => ({
      index: index + 1,
      label: label,
      score: scores[index],
      analysis: analyses[index]
    }));
  }

  // ★ API: 최종 종합 점수 (가중치 + 과락 적용)
  getTotalScore() {
    const scores = this.getRadarData();
    // 가중치: [일간, 상생, 천간, 지지, 갈등, 결핍, 조후, 시너지]
    // 갈등(안정성)과 지지(속궁합)에 높은 가중치 부여
    const weights = [1.0, 1.2, 0.8, 1.5, 1.5, 1.2, 0.8, 1.0];
    
    let totalW = 0, sumW = 0;
    scores.forEach((s, i) => { 
      totalW += s * weights[i]; 
      sumW += weights[i]; 
    });
    
    let finalScore = totalW / sumW;
    // 과락(Penalty) 로직: 갈등 점수가 40점 미만이면 감점
    if (scores[4] < 40) {
      finalScore -= (40 - scores[4]) * 0.5;
    }
    return Math.round(Math.max(0, Math.min(100, finalScore)));
  }
}

/**
 * 공공데이터포털에서 받은 간지 정보를 계산식에 맞는 형식으로 변환
 * @param {Object} fortune - 공공데이터포털에서 받은 사주 정보
 * @returns {Array} ['갑인', '병자', '무오'] 형식의 배열 (년, 월, 일)
 */
function parseGanjiToPillars(fortune) {
  // 간지 정보에서 한글 간지 추출
  const extractGanji = (str) => {
    if (!str) return null;
    
    // "기묘(己卯)" 형식에서 "기묘" 추출
    // 또는 이미 "기묘" 형식인 경우 그대로 사용
    if (typeof str !== 'string') return null;
    
    // 괄호가 있으면 괄호 앞부분 추출, 없으면 전체 사용
    const match = str.match(/^([가-힣]+)/);
    if (match) {
      return match[1];
    }
    
    // 한글이 없으면 null 반환
    return null;
  };

  // 년간지(세차), 월간지(월건), 일간지(일진) 추출
  // fortune.ganjiFull에 "기묘(己卯)" 형식으로 저장되어 있음
  const yearGanji = extractGanji(fortune.ganjiFull?.year || fortune.ganji?.year || '');
  const monthGanji = extractGanji(fortune.ganjiFull?.month || fortune.ganji?.month || '');
  const dayGanji = extractGanji(fortune.ganjiFull?.day || fortune.ganji?.day || '');

  // 각 간지에서 천간(첫 글자)과 지지(두 번째 글자) 추출
  // 예: "기묘" -> 천간: "기", 지지: "묘" -> "기묘"
  const yearPillar = yearGanji && yearGanji.length >= 2 
    ? `${yearGanji.charAt(0)}${yearGanji.charAt(1)}` 
    : null;
  const monthPillar = monthGanji && monthGanji.length >= 2
    ? `${monthGanji.charAt(0)}${monthGanji.charAt(1)}`
    : null;
  const dayPillar = dayGanji && dayGanji.length >= 2
    ? `${dayGanji.charAt(0)}${dayGanji.charAt(1)}`
    : null;

  // 년, 월, 일 순서로 반환 (시주는 없으므로 3개만)
  const pillars = [yearPillar, monthPillar, dayPillar].filter(p => p !== null);
  
  if (pillars.length < 3) {
    console.warn('사주 정보 부족:', { yearPillar, monthPillar, dayPillar, fortune });
  }
  
  return pillars;
}

module.exports = {
  SajuCompatibility,
  parseGanjiToPillars
};

