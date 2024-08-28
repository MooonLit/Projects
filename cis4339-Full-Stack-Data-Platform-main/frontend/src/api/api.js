import axios from "axios";

// Create HTTP client with the base URL, and specify that the data sent in the request body is JSON
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API Base URL:", apiClient.defaults.baseURL);

// Login related API calls
// If user logs in successfully, this login sets a header to "apiClient" called "Authorization" with the value of "Bearer <token>" This security token is used to validate API calls
function setAuthHeader(token) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// When user logs out, this function removes the Authorization header from apiClient
function removeAuthHeader() {
  delete apiClient.defaults.headers.common["Authorization"];
}

export function handleLoginSuccess(token) {
  localStorage.setItem("authToken", token);
  setAuthHeader(token);
}

export function initializeAuthHeader() {
  const token = localStorage.getItem("authToken");
  if (token) {
    setAuthHeader(token);
  }
}

// Call initializeAuthHeader when the app or page loads
initializeAuthHeader();

// parsing out error messages from API calls see https://stackoverflow.com/questions/67089014/how-to-read-error-messages-from-javascript-error-object
function getErrorMessageFromResponseBody(string) {
  let errorString = string;

  try {
    let json = JSON.parse(string);
    if (json.errors) {
      errorString = json.errors[0].msg;
    }
  } catch (parseOrAccessError) {}

  return errorString;
}

// API call to log the user in
export async function loginUser(username, password) {
  try {
    const response = await apiClient.post("/users/login", {
      username,
      password,
    });
    if (!response.data || !response.data.token) {
      console.error("No token received:", response.data);
      throw new Error("Authentication failed, no token received.");
    }
    console.log("Received token:", response.data.token); // Log for debugging
    handleLoginSuccess(response.data.token);

    return response.data.token;
  } catch (error) {
    console.error("API Error during login:", error);
    throw new Error(
      getErrorMessageFromResponseBody(
        error.response?.data?.message || "Login failed."
      )
    );
  }
}

// API call to log the user out
export function logoutUser() {
  localStorage.removeItem("authToken");
  removeAuthHeader();
}

// Org related API calls
// API call to get org name based on the org ID
export async function getOrgName(orgId) {
  const response = await apiClient.get(`/orgs/${orgId}`);
  return response.data.name;
}

// Events related API calls
// API call to get all events for org
export const getEvents = async () => {
  try {
    const response = await apiClient.get("/events");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to GET single event by ID
export const getEventById = async (id) => {
  try {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to GET events based on search query
export const searchEvents = async (query) => {
  try {
    let params = {};
    if (query.searchBy === "name") {
      params.searchBy = query.searchBy;
      params.name = query.name || "";
    } else if (query.searchBy === "date") {
      params.searchBy = "date";
      params.eventDate = query.eventDate || "";
    }
    const response = await apiClient.get(`/events/search`, {
      params: params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to GET events for which a client is signed up
export const getClientEvents = async (id) => {
  try {
    const response = await apiClient.get(`/events/client/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to GET events for which a client is not signed up
export const getNonClientEvents = async (id) => {
  try {
    const response = await apiClient.get(`/events/client/${id}/not-registered`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to GET all attendees for an event
export const getEventAttendees = async (id) => {
  try {
    const response = await apiClient.get(`/events/attendees/${id}`);
    console.log("API Response:", response); // Log the full response object
    return response.data;
  } catch (error) {
    console.error("Error getting event attendees:", error);
    throw new Error("Failed to fetch attendees");
  }
};

// API call to GET all events for a given service
export const getEventsByServiceId = async (id) => {
  try {
    const response = await apiClient.get(`/events/service/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to POST new event
export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post("/events", eventData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to PUT update event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data; // Assuming the server responds with the updated event data or a success message
  } catch (error) {
    // Log the detailed error to the console for debugging
    console.error("Error updating event:", error);

    // Throw a new error with a more user-friendly message or a specific message from the server
    // Ensure to check if the error.response and error.response.data exist
    const errorMessage =
      error.response?.data?.message || "Failed to update event.";
    throw new Error(errorMessage);
  }
};

// API call to PUT add attendee to event
export const registerAttendee = async (eventId, clientId) => {
  try {
    const response = await apiClient.put(
      `/events/register`,
      {},
      {
        params: {
          event: eventId,
          client: clientId,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to PUT remove attendee from event
export const deregisterAttendee = async (eventId, clientId) => {
  try {
    const response = await apiClient.put(
      `/events/deregister`,
      {},
      {
        params: {
          event: eventId,
          client: clientId,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call to get events for last two month for dashboard
export const getAttendance = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No token available");
    }
    const response = await apiClient.get("/events/attendance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};

// API call to DELETE event by ID
export const deleteEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Clients related API calls
// API call to GET all clients for org
export const getClients = async () => {
  try {
    const response = await apiClient.get("/clients");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// API call to GET single client by ID
export const createClient = async (clientData) => {
  try {
    const response = await apiClient.post("/clients", clientData);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Failed to create client.");
  }
};

export const getClientById = async (id) => {
  try {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response.data.message || "Failed to get client details."
    );
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Failed to update client.");
  }
};

export const searchClients = async (query) => {
  try {
    let params = {};
    if (query.searchBy === "name") {
      params.searchBy = query.searchBy;
      params.firstName = query.firstName || "";
      params.lastName = query.lastName || "";
    } else if (query.searchBy === "number") {
      params.searchBy = query.searchBy;
      params.phoneNumber = query.phoneNumber || "";
    }
    const response = await apiClient.get("/clients/search", {
      params: params,
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteClientById = async (id) => {
  try {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Failed to delete client.");
  }
};

// API call to get events for dashboard
export const getClientsByZipCode = async () => {
  try {
    const response = await apiClient.get("/clients/byzip");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// API calls related to services
// API call to get all services for org
export const getServices = async () => {
  try {
    console.log("Base URL:", apiClient.defaults.baseURL); // Check if baseURL is defined
    const response = await apiClient.get("/services");
    console.log("Response:", response.data); // Log the response data for debugging
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    // Log the problematic value if 'error.response.data' exists
    if (error.response && error.response.data) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const getServiceById = async (id) => {
  try {
    // Ensure this URL matches your Express route exactly
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// API call to GET services based on search query
export const searchServices = async (query) => {
  try {
    const response = await apiClient.get("/services/search", { params: query });
    return response.data;
  } catch (error) {
    console.error("Search services failed:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};

// API call to POST new service
export const createService = async (newService) => {
  try {
    const response = await apiClient.post("/services", newService);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// API call to PUT update service
export const updateService = async (id, updatedService) => {
  try {
    const response = await apiClient.put(`/services/${id}`, updatedService);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// API call to DELETE service by ID
export const deleteService = async (id) => {
  try {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
