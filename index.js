import { AppRegistry } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { name as appName } from './app.json';
import App from './src/App';

if (__DEV__) {
  void import('./src/reactotron.config');
}

//AppRegistry.registerComponent(appName, () => App);

const queryClient = new QueryClient();

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

AppRegistry.registerComponent(appName, () => Root);
