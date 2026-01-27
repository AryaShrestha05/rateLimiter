import { useState } from 'react'

function App() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState(null)

  const makeRequest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hello')
      const data = await res.json()
      setTokens(data.tokens)
      setHistory(prev => [{
        id: Date.now(),
        server: data.server,
        tokens: data.tokens,
        allowed: res.status === 200
      }, ...prev].slice(0, 10))
    } catch (err) {
      setHistory(prev => [{
        id: Date.now(),
        server: '?',
        tokens: '?',
        allowed: false
      }, ...prev].slice(0, 10))
    }
    setLoading(false)
  }

  const spamRequests = async () => {
    for (let i = 0; i < 8; i++) {
      await makeRequest()
      await new Promise(r => setTimeout(r, 100))
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Distributed Rate Limiter</h1>

      <section style={styles.section}>
        <p style={styles.text}>
          A rate limiter controls how many requests a client can make.
          This project demonstrates rate limiting across multiple servers using the token bucket algorithm.
        </p>

        <pre style={styles.diagram}>Client → Nginx → Node servers (3) → Redis</pre>

        <p style={styles.text}>
          <strong>Token bucket:</strong> Each user has 5 tokens. Each request consumes 1 token.
          Tokens refill at 1 per 2 seconds. No tokens = blocked.
        </p>
      </section>

      <section style={styles.section}>
        {tokens !== null && (
          <p style={styles.tokenDisplay}>Tokens remaining: {tokens}</p>
        )}

        <div style={styles.buttonRow}>
          <button onClick={makeRequest} disabled={loading} style={styles.button}>
            Send request
          </button>
          <button onClick={spamRequests} disabled={loading} style={styles.button}>
            Send 8 requests
          </button>
        </div>

        {history.length > 0 && (
          <div style={styles.history}>
            {history.map(item => (
              <div key={item.id} style={styles.row}>
                <span style={{ color: item.allowed ? '#16a34a' : '#dc2626' }}>
                  {item.allowed ? 'allowed' : 'blocked'}
                </span>
                <span style={styles.muted}>server {item.server}</span>
                <span style={styles.muted}>{item.tokens} tokens left</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <a href="https://github.com/aryashrestha/rateLimiter" style={styles.link}>
        GitHub
      </a>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: '500px',
    margin: '60px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#000'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '30px'
  },
  section: {
    marginBottom: '40px'
  },
  text: {
    color: '#444',
    marginBottom: '15px'
  },
  diagram: {
    background: '#f5f5f5',
    padding: '12px 16px',
    marginBottom: '15px',
    fontSize: '13px',
    overflow: 'auto'
  },
  tokenDisplay: {
    fontFamily: 'monospace',
    fontSize: '14px',
    marginBottom: '15px',
    color: '#000'
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  button: {
    padding: '8px 16px',
    fontSize: '14px',
    background: '#fff',
    border: '1px solid #ccc',
    cursor: 'pointer'
  },
  history: {
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #eee'
  },
  muted: {
    color: '#999'
  },
  link: {
    fontSize: '13px',
    color: '#666'
  }
}

export default App
