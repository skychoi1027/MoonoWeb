import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { sendChatMessage } from '../services/api';
import './AIAdvicePage.css';

function AIAdvicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {};
  const [showDetailedTable, setShowDetailedTable] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 초기 환영 메시지 설정
    const user1Name = result?.user1?.name || '사용자1';
    const user2Name = result?.user2?.name || '사용자2';
    const compatibility = result?.compatibility || 85;
    
    setChatMessages([
      {
        role: 'assistant',
        content: `안녕하세요! 🐙 ${user1Name}님과 ${user2Name}님의 궁합 점수는 ${compatibility}점이에요! 궁합에 대해 궁금한 점이 있으시면 언제든 물어보세요~ 재미있게 설명해드릴게요! 😊`,
        timestamp: new Date()
      }
    ]);
  }, [result]);

  // 채팅 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const user1Name = result?.user1?.name || '사용자1';
      const user2Name = result?.user2?.name || '사용자2';
      const compatibility = result?.compatibility || 85;
      const detailedAnalysis = result?.detailedAnalysis || [];
      
      // 상세 분석 정보를 텍스트로 변환
      const detailedAnalysisText = detailedAnalysis.length > 0
        ? detailedAnalysis.map(item => 
            `${item.index}. ${item.label} (${item.score}점): ${item.analysis}`
          ).join('\n')
        : '상세 분석 정보가 없습니다.';
      
      // 대화 기록 생성 (시스템 프롬프트에 상세 분석 정보 포함)
      const conversationHistory = [
        {
          role: 'system',
          content: `당신은 발랄하고 친근한 사주 궁합 전문가 "궁합문어" 캐릭터입니다! 🐙 ${user1Name}와 ${user2Name}의 궁합 점수는 ${compatibility}점이에요!

**8대 궁합 지표 상세 분석 정보:**
${detailedAnalysisText}

위 상세 분석 정보를 참고해서 사용자의 질문에 답변해주세요. 말투는 밝고 발랄하게, 친근하고 재미있게 대화해주세요! 이모티콘도 적절히 사용하고, 너무 딱딱하지 않게 편안하게 설명해주세요. 하지만 전문적인 내용은 정확하게 전달해야 해요! 상세 분석에서 언급된 내용을 바탕으로 구체적이고 정확하면서도 재미있게 답변해주세요.`
        },
        ...chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await sendChatMessage(chatInput, conversationHistory);
      
      const aiMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('채팅 오류:', error);
      const errorMessage = {
        role: 'assistant',
        content: '오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const detailedAnalysis = result?.detailedAnalysis || [];

  return (
    <div className="ai-advice-page">
      <Header />
      <div className="ai-advice-container">
        <h2 className="advice-title">궁합문어 조언</h2>
        
        {/* 상세 분석 테이블 */}
        {showDetailedTable && detailedAnalysis.length > 0 && (
          <div className="detailed-analysis-table">
            <h3 className="table-title">8대 궁합 지표 상세 분석</h3>
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>지표</th>
                  <th>점수</th>
                  <th>로직 해석</th>
                </tr>
              </thead>
              <tbody>
                {detailedAnalysis.map((item, index) => (
                  <tr key={index}>
                    <td className="index-cell">{item.index}</td>
                    <td className="label-cell">{item.label}</td>
                    <td className="score-cell">{item.score}점</td>
                    <td className="analysis-cell">{item.analysis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              className="toggle-table-button"
              onClick={() => setShowDetailedTable(false)}
            >
              테이블 숨기기
            </button>
          </div>
        )}

        {!showDetailedTable && (
          <button 
            className="toggle-table-button show"
            onClick={() => setShowDetailedTable(true)}
          >
            상세 분석 보기
          </button>
        )}

        {/* AI 채팅 */}
        <div className="ai-chat-section">
          <h3 className="chat-title">궁합문어와 대화하기</h3>
          <div className="chat-messages">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.role} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-content">
                  <div className="message-role">
                    {message.role === 'user' ? '👤 사용자' : '🐙 궁합문어'}
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="chat-message assistant loading">
                <div className="message-content">
                  <div className="message-role">🐙 궁합문어</div>
                  <div className="message-text">
                    <span className="typing-indicator">생각 중...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-form" onSubmit={handleChatSend}>
            <input
              type="text"
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="궁합문어에게 결과에 대해 더 물어보세요... (Enter로 전송)"
              disabled={isChatLoading}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={isChatLoading || !chatInput.trim()}
            >
              {isChatLoading ? '전송 중...' : '전송'}
            </button>
          </form>
        </div>

        <div className="advice-buttons">
          <button 
            className="back-button"
            onClick={() => navigate('/result', { state: { result } })}
          >
            결과로 돌아가기
          </button>
          <button 
            className="home-button-bottom"
            onClick={() => navigate('/home')}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAdvicePage;

