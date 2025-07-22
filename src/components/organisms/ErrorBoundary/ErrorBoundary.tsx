import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  readonly children: React.ReactNode;
  readonly onReset?: () => void;
}

type State = {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', {
      componentStack: info.componentStack,
      error: error.message,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Text style={{ color: 'red', fontSize: 16 }}>
            Something went wrong. Please try again.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
