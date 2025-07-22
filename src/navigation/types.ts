import type { Paths } from '@/navigation/paths';
import type { StackScreenProps } from '@react-navigation/stack';

import { NavigatorScreenParams } from '@react-navigation/native';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  Dashboard: { collection: number };
  ForgotPassword: undefined;
  Landing: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<RootTabParamList>;
  SignUp: undefined;
  Startup: undefined;
};

export type RootTabParamList = {
  Add: { sharedUrl?: string }; // Keep Add for share functionality, but not in tabs
  Collections: undefined;
  Links: undefined;
  Search: undefined;
  Settings: undefined;
  Tags: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
