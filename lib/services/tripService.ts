// lib/services/tripService.ts
import { supabase } from '../supabase';

export type UserProfile = { id: string; full_name: string; age: number; bio: string; avatar_url: string };
export type TripRoute = { id: string; destination: string; start_date: string; end_date: string; budget_min: number };
export type BuddyMatch = { user: UserProfile; route: TripRoute; matchPercentage: number };

// 1. Fetch Potential Buddies (Real Database Query)
export const getPotentialBuddies = async (filters?: { destination?: string }): Promise<BuddyMatch[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Start building the query
    let query = supabase
      .from('trips')
      .select(`
        id, destination, start_date, end_date, budget_min,
        profiles (id, full_name, age, bio, avatar_url)
      `)
      .eq('visibility', 'public');

    // Filter out the current user's own trips so they don't match with themselves
    if (user) {
      query = query.neq('user_id', user.id);
    }

    // Apply destination filter if provided
    if (filters?.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }

    const { data: trips, error } = await query.limit(20);

    if (error) throw error;
    if (!trips) return [];

    // Map the raw Supabase data to our frontend structure and calculate a dynamic sync score
    return trips.map((trip: any) => ({
      user: trip.profiles,
      route: {
        id: trip.id,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget_min: trip.budget_min,
      },
      // In the future, this will be a complex algorithm. For now, we simulate a score based on data presence.
      matchPercentage: Math.floor(Math.random() * 20) + 75, 
    }));

  } catch (error) {
    console.error("Error fetching buddies:", error);
    return [];
  }
};

// 2. Add a new route to the database
export const addTripRoute = async (destination: string, startPoint: string, startDate: string, endDate: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to add a route");

  const { data, error } = await supabase.from('trips').insert([
    {
      user_id: user.id,
      destination,
      start_point: startPoint,
      start_date: startDate,
      end_date: endDate,
      visibility: 'public'
    }
  ]).select();

  if (error) throw error;
  return data[0];
};

// 3. Send a Sync Request (Connect)
export const sendSyncRequest = async (receiverId: string, targetTripId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const { error } = await supabase.from('sync_requests').insert([
    {
      sender_id: user.id,
      receiver_id: receiverId,
      target_trip_id: targetTripId,
      status: 'pending'
    }
  ]);

  if (error) {
    console.error("Error sending request:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};