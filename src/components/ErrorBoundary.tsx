import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorDetails = null;
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorDetails = parsed;
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm max-w-md w-full">
            <h1 className="text-xl font-bold text-status-error mb-4">Something went wrong</h1>
            {errorDetails ? (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl text-sm text-red-900 font-mono break-all">
                  <p className="font-bold mb-2">Firestore Permission Error</p>
                  <p>Operation: {errorDetails.operationType}</p>
                  <p>Path: {errorDetails.path}</p>
                  <p className="mt-2 text-xs opacity-70">{errorDetails.error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium"
                >
                  Reload Application
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-text text-sm mb-4">
                  {this.state.error?.message || 'An unexpected error occurred.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium"
                >
                  Reload Application
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
