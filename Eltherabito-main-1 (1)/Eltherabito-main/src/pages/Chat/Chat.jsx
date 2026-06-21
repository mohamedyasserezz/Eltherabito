import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaShieldAlt,
  FaBook,
  FaCog,
  FaComments,
  FaSignOutAlt,
  FaArrowUp,
  FaLightbulb,
  FaChevronDown,
  FaQuoteLeft,
} from 'react-icons/fa';
import styles from './Chat.module.css';
import aiService from '../../services/aiService';
import { parseBotMessage, truncate, toSentenceCase } from './parseBotMessage';

function BotMessage({ content, sources }) {
  const { heading, bullets, disclaimer } = parseBotMessage(content);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className={styles.messageContent}>
      {heading && (
        <div className={styles.botHeading}>
          <FaLightbulb />
          <span>{heading}</span>
        </div>
      )}

      {bullets.length > 1 ? (
        <ul className={styles.botList}>
          {bullets.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      ) : (
        bullets.map((point, i) => <p key={i} className={styles.botParagraph}>{point}</p>)
      )}

      {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}

      {sources && sources.length > 0 && (
        <div className={styles.sources}>
          <button
            type="button"
            className={styles.sourcesToggle}
            onClick={() => setSourcesOpen((open) => !open)}
          >
            <span>Sources ({sources.length})</span>
            <FaChevronDown className={sourcesOpen ? styles.chevronOpen : ''} />
          </button>

          {sourcesOpen && (
            <div className={styles.sourcesList}>
              {sources.map((source, i) => (
                <div key={i} className={styles.sourceItem}>
                  {source.title && (
                    <p className={styles.sourceTitle}>{toSentenceCase(source.title)}</p>
                  )}
                  {source.concern && (
                    <p className={styles.sourceConcern}>
                      <FaQuoteLeft className={styles.quoteIcon} />
                      {truncate(toSentenceCase(source.concern))}
                    </p>
                  )}
                  {source.suggestions && source.suggestions.length > 0 && (
                    <div className={styles.sourceSuggestions}>
                      {source.suggestions.map((suggestion, j) => (
                        <span key={j} className={styles.suggestionTag}>
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmptyChat, setShowEmptyChat] = useState(true);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage() {
    const message = input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { sender: 'user', content: message }]);
    setShowEmptyChat(false);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.getAIRecommendation(message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          content: response.answer,
          sources: response.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          content: 'Sorry, I encountered an error. Please try again later.',
          sources: [],
        },
      ]);
      console.error('AI Recommendation error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSettings() {
    navigate('/patient/settings');
  }

  return (
    <div className={styles.chatWrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <FaShieldAlt />
            <span>Eltherabito</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div
            className={`${styles.navItem} ${styles.navItemActive}`}
            onClick={() => window.open('https://healthunlocked.com/', '_blank')}
            style={{ cursor: 'pointer' }}
          >
            <FaBook />
            <span>Resources</span>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.settingsBtn} onClick={handleSettings} title="Settings">
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={styles.chatMain}>
        {/* Header */}
        <header className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.supportAssistant}>
              <div className={styles.supportDot}></div>
              <div>
                <h1 className={styles.headerTitle}>Support Assistant</h1>
                <p className={styles.headerSubtitle}>Always available</p>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.headerBtn} onClick={() => navigate('/patient/dashboard')} title="Back to Home">
              <FaSignOutAlt />
              <span>Back to Home</span>
            </button>
          </div>
        </header>

        {/* Chat Container */}
        <div className={styles.chatContainer} ref={chatContainerRef}>
          {/* Empty Chat */}
          {showEmptyChat && (
            <div className={styles.emptyChat}>
              <div className={styles.emptyIcon}>
                <FaComments />
              </div>
              <p className={styles.emptyText}>Start a conversation</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) =>
            msg.sender === 'bot' ? (
              <div key={index} className={`${styles.message} ${styles.messageBot}`}>
                <BotMessage content={msg.content} sources={msg.sources} />
              </div>
            ) : (
              <div key={index} className={`${styles.message} ${styles.messageUser}`}>
                <div className={styles.messageContent}>
                  <p>{msg.content}</p>
                </div>
              </div>
            )
          )}

          {/* Loading indicator */}
          {loading && (
            <div className={`${styles.message} ${styles.messageBot}`}>
              <div className={styles.messageContent}>
                <p className={styles.typingDots}>
                  <span>.</span><span>.</span><span>.</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <footer className={styles.chatFooter}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              className={styles.inputBtn}
              onClick={sendMessage}
              title="Send"
              disabled={loading}
            >
              <FaArrowUp />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
