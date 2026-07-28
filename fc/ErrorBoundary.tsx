import React, { Component } from 'react';

// NOTE: This component is intentionally NOT converted to a function component.
// React has no hook equivalent for `componentDidCatch` / `getDerivedStateFromError` —
// error boundaries must be class components. This is a framework limitation, not a
// stylistic choice. (See: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

export interface ErrorBoundaryProps {
  fallback: any,
  children: any,
}

export interface ErrorBoundaryState {
  hasError: boolean,
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary');
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
