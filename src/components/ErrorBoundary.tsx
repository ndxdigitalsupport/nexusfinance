import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-md text-center space-y-4">
            <div className="text-5xl">⚠</div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.reload()} className="premium-btn-primary px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
