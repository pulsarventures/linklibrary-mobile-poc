import { createNavigationContainerRef } from '@react-navigation/native';

import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export enum Paths {
  // System
  Startup = 'Startup',

  // Auth
  ForgotPassword = 'ForgotPassword',
  Login = 'Login',
  SignUp = 'SignUp',
  
  // Main
  Auth = 'Auth',
  Collections = 'Collections',
  Links = 'Links',
  Main = 'Main',
  Settings = 'Settings',
  Tags = 'Tags',
}
