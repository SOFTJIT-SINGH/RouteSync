// types/navigation.ts

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Signup: undefined;
  OTP: { email: string };

  // Main Tabs
  Home: undefined;
  Matches: undefined;
  Community: undefined;
  Profile: undefined;

  // Stack Screens
  RootTabs: undefined;
  Chat: { buddyId?: string; tripId?: string };
  UserProfile: { userId?: string; profile?: any };
  CreateTrip: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Settings: undefined;

  // Drawer
  MainApp: undefined;
  SavedTrips: undefined;
  DrawerSettings: undefined;
};