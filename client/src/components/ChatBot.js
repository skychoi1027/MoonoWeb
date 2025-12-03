import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import './ChatBot.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 환영 메시지
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: '안녕하세요! 무엇을 도와드릴까요?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 대화 기록을 API 형식으로 변환
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // API 호출
      const response = await sendChatMessage(inputMessage, conversationHistory);

      // AI 응답 추가
      const aiMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        usage: response.usage,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // 에러 메시지 추가
      const errorMessage = {
        role: 'assistant',
        content: `오류가 발생했습니다: ${error.message}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>🐙 궁합문어 채팅봇</h2>
        <p>gpt-4o-mini와 대화해보세요</p>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-content">
              <div className="message-role">
                {message.role === 'user' ? '👤 사용자' : '🐙 궁합문어'}
              </div>
              <div className="message-text">{message.content}</div>
              {message.usage && (
                <div className="message-usage">
                  토큰: {message.usage.total_tokens} (프롬프트: {message.usage.prompt_tokens}, 
                  완성: {message.usage.completion_tokens})
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
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

      <form className="chatbot-input-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chatbot-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요... (Enter로 전송)"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chatbot-send-button"
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </form>
    </div>
  );
}

export default ChatBot;

