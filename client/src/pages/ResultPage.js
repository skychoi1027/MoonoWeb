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
          }
        },
        pointLabels: {
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#333'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
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
              <div key={index} className="radar-detail-item">
                <span className="radar-detail-label">{label}:</span>
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

