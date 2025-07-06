import type { Paths } from '@/navigation/paths';
import type { StackScreenProps } from '@react-navigation/stack';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootTabParamList = {
  Links: undefined;
  Collections: undefined;
  Add: undefined;
  Tags: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Startup: undefined;
  Landing: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Main: NavigatorScreenParams<RootTabParamList>;
  Dashboard: { collection: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
