// Types to keep our data structured
export type User = { id: string; name: string; age: number; bio: string; avatar: string };
export type Route = { id: string; destination: string; startDate: string; endDate: string; style: string };
export type BuddyMatch = { user: User; route: Route; matchPercentage: number };

// Dynamic Mock Data Generation
const generateMockBuddies = (): BuddyMatch[] => [
  {
    user: { id: 'u1', name: 'Aarav', age: 24, bio: 'Backpacker and photographer.', avatar: 'https://i.pravatar.cc/150?u=u1' },
    route: { id: 'r1', destination: 'Manali', startDate: '2026-04-10', endDate: '2026-04-20', style: 'Budget' },
    matchPercentage: 92,
  },
  {
    user: { id: 'u2', name: 'Priya', age: 27, bio: 'Foodie looking for a chill weekend.', avatar: 'https://i.pravatar.cc/150?u=u2' },
    route: { id: 'r2', destination: 'Goa', startDate: '2026-05-01', endDate: '2026-05-05', style: 'Luxury' },
    matchPercentage: 78,
  }
];

// Simulated Database Queries
export const getPotentialBuddies = async (filters?: { destination?: string }): Promise<BuddyMatch[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let buddies = generateMockBuddies();
  if (filters?.destination) {
    buddies = buddies.filter(b => b.route.destination.toLowerCase().includes(filters.destination!.toLowerCase()));
  }
  return buddies;
};

export const syncUserRoutes = async (routeId: string) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  // In a real app, this would find intersecting routes in the DB
  return { status: 'success', syncedWith: 3, sharedWaypoints: ['Delhi', 'Chandigarh', 'Kasol'] };
};