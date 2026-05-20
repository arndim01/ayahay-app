const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const defaultHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json',
};

export const getVoyageByTripId = async (tripId: number) => {
  try {
    const response = await fetch(`${API_URL}/api/voyages/trip/${tripId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).catch(() => {
      // Silently handle network errors
      return null;
    });

    // If the fetch itself failed and returned null
    if (!response) {
      return null;
    }

    // Handle 404s silently - this is expected for trips without voyages
    if (response.status === 404) {
      return null;
    }

    // Only try to parse JSON if we got a successful response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if there's actually content to parse
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    // Now parse the JSON once we know it's valid
    return JSON.parse(text);
  } catch (error) {
    // Avoid logging to console to prevent browser console errors
    return null;
  }
};

export const updateVoyage = async (tripId: number, data: any) => {
  try {
    const payload = {
      shipId: Number(data.shipId),
      tripId: Number(data.tripId),
      number: Number(data.number),
      date: data.date,
      remarks: data.remarks
    };

    // Use form-urlencoded format to avoid CORS preflight
    const formBody = Object.keys(payload)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
      .join('&');

    const response = await fetch(`${API_URL}/api/voyages/${tripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formBody
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating voyage:', error);
    throw error;
  }
};

export const createVoyage = async (data: any) => {
  try {
    // Ensure all numeric fields are properly converted to numbers
    const payload = {
      shipId: Number(data.shipId),
      tripId: Number(data.tripId),
      number: Number(data.number),
      date: data.date,
      remarks: data.remarks
    };

    const response = await fetch(`${API_URL}/api/voyages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create voyage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating voyage:', error);
    throw error;
  }
};

export const deleteVoyage = async (tripId: number) => {
  try {
    const response = await fetch(`${API_URL}/api/voyages/${tripId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete voyage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting voyage:', error);
    throw error;
  }
};
