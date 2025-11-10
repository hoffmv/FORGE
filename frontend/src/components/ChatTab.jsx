import { useState, useEffect, useRef } from 'react';
import { getMessages, submitJob } from '../api';

export default function ChatTab({ projectId, onJobCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (projectId) {
      loadMessages();
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!projectId) return;
    try {
      const data = await getMessages(projectId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !projectId || loading) return;

    setLoading(true);
    try {
      // Submit as a 'modify' job
      const result = await submitJob({
        project_name: `project_${projectId.slice(0, 8)}`,
        spec: input.trim(),
        project_id: projectId,
        mode: 'modify'
      });

      if (onJobCreated) {
        // Pass a full job object with the expected shape
        onJobCreated({ 
          id: result.job_id, 
          status: result.status || 'queued',
          project_name: `project_${projectId.slice(0, 8)}`
        });
      }

      setInput('');
      
      // Reload messages after a delay to see the new message
      setTimeout(loadMessages, 1000);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  if (!projectId) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#888'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <div>Select a project to start chatting</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: '#1C1C1C'
    }}>
      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
            No messages yet. Start the conversation below!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={msg.id || idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: msg.role === 'user' ? '#2B2B2B' : '#1a1a1a',
                borderLeft: msg.role === 'user' ? '3px solid #FF6E00' : '3px solid #666'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ 
                  color: msg.role === 'user' ? '#FF6E00' : '#aaa',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase'
                }}>
                  {msg.role === 'user' ? 'You' : 'FORGE'}
                </span>
                <span style={{ color: '#666', fontSize: '11px' }}>
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <div style={{ 
                color: '#fff',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Larger and More Prominent */}
      <form 
        onSubmit={handleSubmit}
        style={{ 
          padding: '20px',
          borderTop: '2px solid #FF6E00',
          background: '#1a1a1a'
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <label style={{ 
            display: 'block',
            color: '#FF6E00',
            fontSize: '13px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            💬 Chat with FORGE
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask FORGE to modify your project...&#10;&#10;Examples:&#10;• Add error handling to the API&#10;• Make the UI responsive&#10;• Add unit tests for the main function"
            disabled={loading}
            rows={4}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: '#2B2B2B',
              border: '2px solid #444',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#FF6E00'}
            onBlur={(e) => e.target.style.borderColor = '#444'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Press <kbd style={{ 
                background: '#2B2B2B', 
                padding: '2px 6px', 
                borderRadius: '3px',
                border: '1px solid #444'
              }}>Enter</kbd> to send, <kbd style={{ 
                background: '#2B2B2B', 
                padding: '2px 6px', 
                borderRadius: '3px',
                border: '1px solid #444'
              }}>Shift+Enter</kbd> for new line
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '12px 32px',
                background: loading || !input.trim() ? '#444' : '#FF6E00',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: 'all 0.2s',
                boxShadow: loading || !input.trim() ? 'none' : '0 2px 8px rgba(255, 110, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.background = '#ff8533';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.background = '#FF6E00';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? '⏳ Sending...' : '🚀 Send Message'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
