import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import Header from '../components/Header';
import './ResultPage.css';

// Chart.js 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTooltip, setActiveTooltip] = useState(null);
  const { result } = location.state || {
    result: {
      compatibility: 85,
      description: '두 분의 궁합이 매우 좋습니다!',
      user1: { name: '사용자1' },
      user2: { name: '사용자2' },
      radarData: [70, 75, 80, 85, 90, 75, 70, 80],
      radarLabels: [
        '일간 친밀도',
        '오행 상생성',
        '천간 합',
        '지지 합',
        '갈등 제어',
        '결핍 보완',
        '조후 균형',
        '에너지 시너지'
      ],
    },
  };

  // 각 지표에 대한 설명 (간결하게)
  const indicatorDescriptions = {
    '일간 친밀도': '두 사람의 일간(日干) 오행 관계. 상생 관계일수록 서로를 도와주며 함께 성장합니다.',
    '오행 상생성': '전체 오행 분포의 상생 관계. 한 사람의 최다 오행이 다른 사람의 오행을 생(生)해주면 좋습니다.',
    '천간 합': '천간(天干) 간의 합(合)과 충(沖) 관계. 합이 많을수록 정신적 조화가 좋습니다.',
    '지지 합': '지지(地支) 간의 합(合) 관계. 삼합(三合)이 있으면 매우 강한 결속력을 의미합니다.',
    '갈등 제어': '지지 충(沖) 관계 분석. 충이 적을수록 갈등이 적고 안정적인 관계입니다.',
    '결핍 보완': '한 사람에게 없는 오행을 상대방이 보완하는지 확인. 서로의 부족한 부분을 채워주는 관계입니다.',
    '조후 균형': '월지(月支) 계절의 균형 분석. 수화기제(水火旣濟)는 매우 좋은 균형을 의미합니다.',
    '에너지 시너지': '오행 상생성과 지지 합의 종합 평가. 전체적인 에너지 조화를 나타냅니다.'
  };

  const handleTooltipClick = (index) => {
    if (activeTooltip === index) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(index);
    }
  };

  // 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.tooltip-container')) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeTooltip]);

  // 레이더 차트 데이터 설정
  const radarData = {
    labels: result.radarLabels || [
      '일간 친밀도',
      '오행 상생성',
      '천간 합',
      '지지 합',
      '갈등 제어',
      '결핍 보완',
      '조후 균형',
      '에너지 시너지'
    ],
    datasets: [
      {
        label: '궁합 지표',
        data: result.radarData || [70, 75, 80, 85, 90, 75, 70, 80],
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: {
            size: 12
          },
          color: '#666',
          backdropColor: 'transparent'
        },
        pointLabels: {
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#333'
        },
        grid: {
          color: 'rgba(102, 126, 234, 0.2)'
        },
        ticks: {
          color: '#666',
          backdropColor: 'transparent'
        }
      },
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r}점`;
          }
        }
      }
    }
  };

  return (
    <div className="result-page">
      <Header />
      <div className="result-container">
        <h2 className="result-title">궁합 결과</h2>
        
        <div className="users-info">
          <div className="user-card">
            <div className="user-name">{result.user1?.name || '사용자1'}</div>
          </div>
          <div className="vs-divider">VS</div>
          <div className="user-card">
            <div className="user-name">{result.user2?.name || '사용자2'}</div>
          </div>
        </div>

        <div className="compatibility-score">
          <div className="score-circle">
            <div className="score-number">{result.compatibility || 85}</div>
            <div className="score-label">점</div>
          </div>
        </div>

        <div className="result-description">
          <p>{result.description || '두 분의 궁합이 매우 좋습니다!'}</p>
        </div>

        {/* 방사형 그래프 */}
        <div className="radar-chart-container">
          <h3 className="radar-chart-title">8대 궁합 지표 분석</h3>
          <div className="radar-chart-wrapper">
            <Radar data={radarData} options={chartOptions} />
          </div>
          <div className="radar-details">
            {result.radarLabels && result.radarData && result.radarLabels.map((label, index) => (
              <div key={index} className="radar-detail-item tooltip-container">
                <div className="radar-detail-label-container">
                  <button
                    className="info-icon-button"
                    onClick={() => handleTooltipClick(index)}
                    aria-label="정보 보기"
                  >
                    <span className="info-icon">!</span>
                  </button>
                  {activeTooltip === index && (
                    <div className="tooltip-popup">
                      <div className="tooltip-content">
                        {indicatorDescriptions[label] || ''}
                      </div>
                      <div className="tooltip-arrow"></div>
                    </div>
                  )}
                  <span className="radar-detail-label">{label}:</span>
                </div>
                <span className="radar-detail-score">{result.radarData[index]}점</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="ai-advice-button"
          onClick={() => navigate('/advice', { state: { result } })}
        >
          궁합문어 조언 듣기
        </button>
      </div>
    </div>
  );
}

export default ResultPage;

