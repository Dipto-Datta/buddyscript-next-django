"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8011/api";

class APIError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  data?: any;
}

let inMemoryAccessToken: string | null = null;
let isLoggedOut = false;

const getAccessToken = () => {
  return inMemoryAccessToken;
};

const getRefreshToken = () => {
  return isLoggedOut ? null : "cookie";
};

const setTokens = (access: string, refresh?: string) => {
  inMemoryAccessToken = access;
  isLoggedOut = false;
};

const clearTokens = () => {
  inMemoryAccessToken = null;
  isLoggedOut = true;
};


let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    setTokens(data.access);
    return data.access;
  } catch (error) {
    clearTokens();
    return null;
  }
};

export const apiRequest = async (
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> => {
  const { data, headers, ...customConfig } = options;
  const token = getAccessToken();

  const defaultHeaders: HeadersInit = {};

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (data instanceof FormData) {

  } else if (data) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...customConfig,
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (data) {
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }


  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    let response = await fetch(url, config);


    if (response.status === 401 && getRefreshToken()) {
      let newToken: string | null = null;

      if (!isRefreshing) {
        isRefreshing = true;
        newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);
        } else {
          onRefreshed(null);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("unauthorized"));
          }
          throw new APIError(401, { detail: "Authentication expired." });
        }
      }

      if (newToken) {
        const retryHeaders = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(url, {
          ...config,
          headers: retryHeaders,
        });
        response = retryResponse;
      } else {
        const retryFetch = new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (token) => {
            if (!token) {
              reject(new APIError(401, { detail: "Authentication expired." }));
              return;
            }
            try {
              const retryHeaders = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
              };
              const retryResponse = await fetch(url, {
                ...config,
                headers: retryHeaders,
              });
              resolve(retryResponse);
            } catch (e) {
              reject(e);
            }
          });
        });

        response = (await retryFetch) as Response;
      }
    }


    if (response.status === 204) {
      return null;
    }

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new APIError(response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, { detail: "Network connection error." });
  }
};

export const api = {
  get: (endpoint: string, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: "POST", data }),
  put: (endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: "PUT", data }),
  patch: (endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: "PATCH", data }),
  delete: (endpoint: string, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
};
