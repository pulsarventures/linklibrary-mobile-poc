import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export enum Paths {
  // System
  Startup = 'Startup',

  // Auth
  Login = 'Login',
  SignUp = 'SignUp',
  ForgotPassword = 'ForgotPassword',
  
  // Main
  Auth = 'Auth',
  Main = 'Main',
  Links = 'Links',
  Collections = 'Collections',
  Tags = 'Tags',
  Settings = 'Settings',
}
