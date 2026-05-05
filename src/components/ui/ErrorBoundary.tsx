import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 max-w-sm mx-auto text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Error</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {this.state.error?.message ?? 'Something went wrong.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-sm text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-md px-3 py-1.5 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
