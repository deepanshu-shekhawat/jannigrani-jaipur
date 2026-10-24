import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('JanNigrani Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F7F2',
          padding: '24px',
          fontFamily: "'Inter', sans-serif",
          color: '#202724'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #E1E5DF',
            boxShadow: '0 10px 25px -5px rgba(21, 63, 53, 0.08)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#FDF2F2',
              color: '#B94343',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              JanNigrani Platform Notice
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#153F35', fontFamily: "'Manrope', sans-serif" }}>
              Something interrupted the view
            </h2>
            <p style={{ fontSize: '13px', color: '#6D7771', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              The application encountered a client runtime exception. You can reload the page or reset the local demo cache to restore initial seed data.
            </p>
            {this.state.error && (
              <pre style={{
                fontSize: '11px',
                backgroundColor: '#F4F5F4',
                padding: '12px',
                borderRadius: '8px',
                overflowX: 'auto',
                color: '#B94343',
                marginBottom: '20px',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#153F35',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: '#6D7771',
                  border: '1px solid #E1E5DF',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset Demo Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

