// types/navigation.ts

export type RootStackParamList = {
  HomeDashboard: undefined; // undefined means this screen doesn't require any params/data
  Chat: undefined;
  Profile: undefined;
  
  // Example for the future when you need to pass data:
  // TripDetails: { tripId: string; destination: string };
};