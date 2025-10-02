import Reactotron from 'reactotron-react-native';

import config from '../app.json';

Reactotron.configure({
  name: config.name,
})
  .useReactNative()
  .connect();
