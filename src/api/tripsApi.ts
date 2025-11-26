import { useAuth } from "@clerk/vue";
import type { Trip } from "../types/types"; // Assuming you have a types.ts defining the Trip interface

const BASE_URL = "http://localhost:8080/api";

/**
 * A secure, authenticated fetch wrapper that automatically includes the Clerk JWT.
 * It handles token refresh for protected endpoints seamlessly.
 * @param endpoint The API path (e.g., 'trips/my-trips')
 * @param options Standard fetch options (method, body, etc.)
 * @param isProtected Whether the endpoint requires authentication. Defaults to true.
 * @returns The JSON response data
 */
async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  isProtected: boolean = true
): Promise<any> {
  const url = `${BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  let token: string | null = null;

  // 1. Authentication Logic: Only run for protected routes
  if (isProtected) {
    // Get access to the Clerk authentication context
    const { getToken, isLoaded } = useAuth();

    // Wait for the Clerk SDK to be ready
    if (!isLoaded.value) {
      // In a real application, you might use a store or wait more gracefully.
      // For simplicity here, we'll assume the component using this waits for Clerk readiness.
      throw new Error("Clerk SDK is not ready.");
    }

    // getToken() automatically handles refreshing the token in the background
    // and provides a valid, current token for the API call.
    // Use { skipCache: true } to force fetching a fresh token, though it's often not needed.
    token = await getToken.value();

    if (!token) {
      throw new Error(
        "No authentication token found. User may not be signed in."
      );
    }

    // 2. Inject the Bearer Token into the headers
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 3. Set content type for POST/PUT requests
  if (options.method === "POST" || options.method === "PUT") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  // 4. Handle HTTP Status Codes
  if (response.status === 401 || response.status === 403) {
    console.error("Access denied:", response.statusText);
    // In a real app, you would redirect the user to the login page here.
    throw new Error(`Authentication failed. Status: ${response.status}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API call failed with status ${response.status}: ${errorBody}`
    );
  }

  // 5. Handle No Content (204) for DELETE requests
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * --- Public Endpoints ---
 */

// GET /api/public/trips
export const getPublicTrips = (): Promise<Trip[]> => {
  return fetchApi("public/trips", { method: "GET" }, false); // isProtected: false
};

// GET /api/public/trips/{id}
export const getPublicTripById = (id: number): Promise<Trip> => {
  return fetchApi(`public/trips/${id}`, { method: "GET" }, false); // isProtected: false
};

/**
 * --- Protected Endpoints ---
 */

// GET /api/trips/my-trips
export const getMyTrips = (): Promise<Trip[]> => {
  return fetchApi("trips/my-trips", { method: "GET" }, true); // isProtected: true
};

// GET /api/trips/{id} (For editing/fetching owned trip)
export const getTripById = (id: number): Promise<Trip> => {
  return fetchApi(`trips/${id}`, { method: "GET" }, true); // isProtected: true
};

// POST /api/trips (Create or Update)
export const saveTrip = (tripData: Trip): Promise<Trip> => {
  return fetchApi(
    "trips",
    {
      method: "POST",
      body: JSON.stringify(tripData),
    },
    true
  ); // isProtected: true
};

// DELETE /api/trips/{id}
export const deleteTrip = (id: number): Promise<null> => {
  return fetchApi(`trips/${id}`, { method: "DELETE" }, true); // isProtected: true
};
