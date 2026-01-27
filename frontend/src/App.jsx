import { useState, useEffect } from 'react'

let requestId = 0

function App() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState(5)

  // Poll for token count every second
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens')
        const data = await res.json()
        setTokens(data.tokens)
      } catch (err) {
        // ignore
      }
    }

    fetchTokens()
    const interval = setInterval(fetchTokens, 1000)
    return () => clearInterval(interval)
  }, [])

  const makeRequest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hello')
      const data = await res.json()
      if (typeof data.tokens === 'number') {
        setTokens(data.tokens)
      }
      setHistory(prev => [{
        id: ++requestId,
        server: data.server || '?',
        allowed: res.status === 200
      }, ...prev].slice(0, 10))
    } catch (err) {
      setHistory(prev => [{
        id: ++requestId,
        server: '?',
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
          A rate limiter controls how many requests you can make. Too many requests? You get blocked.
          This project shows how rate limiting works when you have multiple servers.
        </p>

        <pre style={styles.diagram}>You → Nginx → Server 1, 2, or 3 → Redis</pre>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Nginx (Load Balancer)</div>
            <p style={styles.cardText}>
              When you send a request, Nginx decides which server handles it.
              It uses <strong>round-robin</strong>: first request goes to server 1,
              second to server 2, third to server 3, then back to server 1.
              This spreads the work evenly.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Redis (Shared Memory)</div>
            <p style={styles.cardText}>
              Here's the problem: if each server tracks requests separately,
              you could hit server 1 five times, then server 2 five times — 10 requests total!
              Redis fixes this. All servers read and write to Redis,
              so they share the same count.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Token Bucket (The Algorithm)</div>
            <p style={styles.cardText}>
              You start with 5 tokens. Each request costs 1 token.
              When you run out, you're blocked. But tokens refill — 1 new token every 2 seconds.
              Wait 10 seconds and you're back to 5.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.tokenDisplay}>
          <span>Tokens: </span>
          <span style={styles.tokenCount}>{tokens}</span>
          <span style={styles.tokenBar}>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.tokenDot,
                  backgroundColor: i < tokens ? '#16a34a' : '#e5e5e5'
                }}
              />
            ))}
          </span>
        </div>

        <div style={styles.buttonRow}>
          <button
            onClick={makeRequest}
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            Send request
          </button>
          <button
            onClick={spamRequests}
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
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
              </div>
            ))}
          </div>
        )}
      </section>

      <a
        href="https://github.com/AryaShrestha05/rateLimiter"
        target="_blank"
        rel="noopener noreferrer"
        style={styles.link}
      >
        View the code behind it:
        <svg style={styles.githubIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
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
    marginBottom: '20px',
    fontSize: '13px',
    overflow: 'auto',
    textAlign: 'center'
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  card: {
    border: '1px solid #e5e5e5',
    padding: '16px',
    borderRadius: '6px'
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: '14px',
    marginBottom: '8px'
  },
  cardText: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
    lineHeight: '1.5'
  },
  tokenDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    fontFamily: 'monospace',
    fontSize: '14px'
  },
  tokenCount: {
    fontWeight: 600,
    minWidth: '12px'
  },
  tokenBar: {
    display: 'flex',
    gap: '4px'
  },
  tokenDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
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
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
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
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none'
  },
  githubIcon: {
    width: '16px',
    height: '16px'
  }
}

export default App
