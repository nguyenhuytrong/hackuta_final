import { useState, useRef, useEffect } from 'react';

export default function GeminiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ command: userMessage }),
      });

      const data = await res.json();
      console.log('[GeminiChat] Response:', data);

      if (!data || (!data.response && !data.advice))
        throw new Error('Invalid response from Gemini.');

      let botText = '';

      // Case 1️⃣: Gemini summary object (weekly/monthly)
      if (data.response?.categoryBreakdown && data.response?.goal) {
        const summary = data.response;
        botText = `
📊 **Expense Summary**
Total expense: $${summary.totalExpense.toFixed(2)}

Expense each category:
${Object.entries(summary.categoryBreakdown)
  .map(([cat, amt]) => `• ${cat}: $${amt.toFixed(2)}`)
  .join('\n')}

Goal: $${summary.goal}
Comparison: ${summary.comparison}

💡 Gemini advice:
${summary.advice}
        `;
      }
      // Case 2️⃣: Normal chat reply (plain text)
      else if (data.response?.text || typeof data.response === 'string') {
        botText = data.response.text || data.response;
      }
      // Case 3️⃣: Legacy format (advice only)
      else if (data.advice) {
        botText = data.advice;
      } else {
        botText = '🤔 I couldn’t generate a proper response.';
      }

      setMessages((prev) => [...prev, { sender: 'gemini', text: botText }]);
    } catch (err) {
      console.error('[GeminiChat] Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: '⚠️ Something went wrong while contacting Gemini.',
        },
      ]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {/* Floating Icon */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#8666cfff',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          G
        </button>
      )}

      {/* Chat Box */}
      {open && (
        <div
          style={{
            width: '45vw',
            height: '80vh',
            maxWidth: '600px',
            maxHeight: '600px',
            border: '1px solid #ccc',
            borderRadius: 10,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#8666cfff',
              color: 'white',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>💬 Gemini</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              background: '#f9fafb',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign: m.sender === 'user' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: m.sender === 'user' ? '#8666cfff' : '#e5e7eb',
                    color: m.sender === 'user' ? 'white' : 'black',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '80%',
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              display: 'flex',
              borderTop: '1px solid #ccc',
              background: 'white',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini anything..."
              style={{
                flex: 1,
                border: 'none',
                padding: '12px',
                fontSize: '14px',
                outline: 'none',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '0 16px',
                background: '#8666cfff',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
