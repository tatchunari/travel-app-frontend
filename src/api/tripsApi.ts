import type { Trip } from "../types/types";

const BASE_URL = "http://localhost:8080/api";

/**
 * A centralized API client wrapper.
 * This function requires the authentication token to be passed explicitly
 * by the component for protected routes, as it runs outside the Vue component context.
 * * @param endpoint The API path (e.g., 'trips/my-trips')
 * @param options Standard fetch options (method, body, etc.)
 * @param token The JWT string (required for protected endpoints, null otherwise)
 * @returns The JSON response data
 */
async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  token: string | null = null
): Promise<any> {
  const url = `${BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // 1. Authentication Logic: Inject the Bearer Token if provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (endpoint.startsWith("trips/")) {
    // If a protected endpoint is called without a token, throw a clear error
    throw new Error("Missing authentication token for a protected route.");
  }

  // 2. Set content type for POST/PUT requests
  if (options.method === "POST" || options.method === "PUT") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  // 3. Handle HTTP Status Codes
  if (response.status === 401 || response.status === 403) {
    console.error("Access denied:", response.statusText);
    // In a production app, redirect to login
    throw new Error(`Authentication failed. Status: ${response.status}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API call failed with status ${response.status}: ${errorBody}`
    );
  }

  // 4. Handle No Content (204) for DELETE requests
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * --- Public Endpoints (No Token Required) ---
 */

// GET /api/public/trips
export const getPublicTrips = (): Promise<Trip[]> => {
  return fetchApi("public/trips", { method: "GET" });
};

// GET /api/public/trips/{id}
export const getPublicTripById = (id: number): Promise<Trip> => {
  return fetchApi(`public/trips/${id}`, { method: "GET" });
};

/**
 * --- Protected Endpoints (Token Required) ---
 * Caller MUST provide the token (e.g., await getToken() from a Vue component)
 */

// GET /api/trips/my-trips
export const getMyTrips = (token: string): Promise<Trip[]> => {
  return fetchApi("trips/my-trips", { method: "GET" }, token);
};

// GET /api/trips/{id} (For editing/fetching owned trip)
export const getTripById = (id: number, token: string): Promise<Trip> => {
  return fetchApi(`trips/${id}`, { method: "GET" }, token);
};

// POST /api/trips (Create or Update)
export const saveTrip = (tripData: Trip, token: string): Promise<Trip> => {
  return fetchApi(
    "trips",
    {
      method: "POST",
      body: JSON.stringify(tripData),
    },
    token
  );
};

// DELETE /api/trips/{id}
export const deleteTrip = (id: number, token: string): Promise<null> => {
  return fetchApi(`trips/${id}`, { method: "DELETE" }, token);
};
