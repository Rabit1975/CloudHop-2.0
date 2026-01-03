import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050819] text-white p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <div className="bg-[#080C22] p-6 rounded-xl border border-white/10 max-w-2xl w-full overflow-auto">
            <h2 className="text-xl font-semibold mb-2 text-[#53C8FF]">Error:</h2>
            <pre className="text-red-400 mb-4 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
            <h2 className="text-xl font-semibold mb-2 text-[#53C8FF]">Stack Trace:</h2>
            <pre className="text-gray-400 text-sm whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-[#53C8FF] text-[#050819] font-bold rounded-lg hover:bg-[#53C8FF]/80 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;