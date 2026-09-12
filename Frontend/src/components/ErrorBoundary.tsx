import { Component, type ErrorInfo, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('UI error', error.message, info.componentStack); }
  render() {
    if (this.state.hasError) return <div className="page-center"><div className="card error-card"><h1>Something went wrong</h1><p>Reload this page to continue.</p><button className="btn primary" onClick={() => location.reload()}>Reload</button></div></div>;
    return this.props.children;
  }
}
