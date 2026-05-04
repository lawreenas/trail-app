import { createRoot } from 'react-dom/client';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import './index.css';
import { App } from './App';

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RootErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', background: '#1c1c1e', color: '#fff', minHeight: '100vh' }}>
          <h2 style={{ color: '#ef4444' }}>App Error</h2>
          <pre style={{ color: '#fca5a5', whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {(this.state.error as Error).stack ?? String(this.state.error)}
          </pre>
          <button
            style={{ marginTop: 16, padding: '8px 16px', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
