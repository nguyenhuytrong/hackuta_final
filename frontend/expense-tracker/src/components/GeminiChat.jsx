import { useState, useRef, useEffect } from 'react';

export default function GeminiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Display user message first
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);

    try {
      const res = await fetch('http://localhost:8000/api/v1/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ command: input }),
      });

      const data = await res.json();

      if (!data.response) throw new Error('No response from Gemini.');

      const summary = data.response;

      // Format summary
      const summaryText = `
Total expense: $${summary.totalExpense}
Expense each category:
${Object.entries(summary.categoryBreakdown)
  .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
  .join('\n')}
Goal: $${summary.goal}
Comparison: ${summary.comparison}
Gemini response: ${summary.advice}
`;

      setMessages((prev) => [...prev, { sender: 'gemini', text: summaryText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'gemini', text: 'Something went wrong.' },
      ]);
    }

    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
      {/* Icon */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#0ea5e9',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          G
        </button>
      )}

      {/* Chat box */}
      {open && (
        <div
          style={{
            width: '45vw',
            height: '80vh',
            border: '1px solid #ccc',
            borderRadius: 10,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxWidth: '600px',
            maxHeight: '600px',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Gemini</span>
            <button onClick={() => setOpen(false)}>X</button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  textAlign: m.sender === 'user' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    borderRadius: 8,
                    background: m.sender === 'user' ? '#0ea5e9' : '#f3f4f6',
                    color: m.sender === 'user' ? 'white' : 'black',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command..."
              style={{ flex: 1, border: 'none', padding: '10px' }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} style={{ padding: '0 10px' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
