import { Component } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error:', error, info?.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) return this.props.fallback({ error: this.state.error, reset: this.reset });

    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30">
          <AlertOctagon className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white">This section failed to load</h2>
        <p className="mt-2 text-sm text-white/55">
          An unexpected error occurred. You can try again or reload the page.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-ink-950 hover:brightness-110"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium text-white/80 ring-1 ring-white/15 hover:bg-white/5"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
