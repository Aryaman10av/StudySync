const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details ?? [];
  }
}

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Unable to reach StudySync. Check that the server is running.", 0, "NETWORK_ERROR");
  }

  const result = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      result?.error?.message ?? "The request could not be completed.",
      response.status,
      result?.error?.code ?? "REQUEST_FAILED",
      result?.error?.details,
    );
  }
  return result?.data;
}

export function jsonBody(value) {
  return JSON.stringify(value);
}