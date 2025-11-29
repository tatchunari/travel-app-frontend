import type { Trip } from "../types/types";

const BASE_URL = "http://localhost:8080/api";

/**
 * A centralized API client wrapper.
 * Handles token injection, content types, and error parsing.
 */
async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  token: string | null = null
): Promise<any> {
  const url = `${BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  }; // 1. Authentication Logic

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (endpoint.startsWith("trips/")) {
    // Security check: Ensure token is present for protected routes
    throw new Error("Missing authentication token for a protected route.");
  } // 2. Content Type

  if (options.method === "POST" || options.method === "PUT") {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    // 3. Network Call (Robust Catch for pure network failures)
    response = await fetch(url, {
      ...options,
      headers: headers,
    });
  } catch (networkError) {
    // Catches DNS, connection refused, or general CORS network errors.
    console.error("Network Fetch Error:", networkError);
    throw new Error(
      "Could not connect to the backend API. Check server status."
    );
  } // 4. Handle HTTP Status Codes (Post-Fetch)

  if (response.status === 401 || response.status === 403) {
    console.error("Access denied:", response.statusText);
    throw new Error(`Authentication failed. Status: ${response.status}`);
  }

  if (!response.ok) {
    // If it's not JSON, just get the text error body
    const errorBody = await response.text();
    throw new Error(
      `API call failed with status ${response.status}: ${errorBody}`
    );
  } // 5. Handle No Content (204) for DELETE requests

  if (response.status === 204) {
    return null;
  } // 6. Success: Return parsed JSON data

  return response.json();
}

/**
 * --- Public Endpoints (No Token Required) ---
 */

// GET /api/public/trips?search=keyword
export const getPublicTrips = (search?: string): Promise<Trip[]> => {
  const hasSearch = typeof search === "string" && search.trim().length > 0;
  let endpoint = "public/trips";

  if (hasSearch) {
    endpoint += `?search=${encodeURIComponent(search!.trim())}`;
  }

  // FIX: Directly return the result of fetchApi (which is the JSON data)
  return fetchApi(endpoint, { method: "GET" });
};

// GET /api/public/trips/{id}
export const getPublicTripById = (id: number): Promise<Trip> => {
  return fetchApi(`public/trips/${id}`, { method: "GET" });
};

/**
 * --- Protected Endpoints (Token Required) ---
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
export const deleteTrip = (
  id: number | undefined,
  token: string
): Promise<null> => {
  return fetchApi(`trips/${id}`, { method: "DELETE" }, token);
};
