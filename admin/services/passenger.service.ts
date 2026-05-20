const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getPassengersByTripId = async (tripId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/booking-trip-passengers/trip/${tripId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching passengers:', error);
    throw error;
  }
};
