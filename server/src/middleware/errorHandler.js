export function notFound(_request, response) {
  response.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "The requested resource was not found." },
  });
}

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) return;

  if (error?.name === "ZodError") {
    return response.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the submitted fields.",
        details: error.issues.map(({ message, path }) => ({ field: path.join("."), message })),
      },
    });
  }

  if (error?.code === 11000) {
    return response.status(409).json({
      success: false,
      error: { code: "CONFLICT", message: "A record with those details already exists." },
    });
  }

  if (error?.name === "CastError") {
    return response.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "The supplied identifier is invalid." },
    });
  }

  const status = Number.isInteger(error?.status) ? error.status : 500;
  const code = error?.codeName ?? (status === 503 ? "DATABASE_UNAVAILABLE" : "INTERNAL_ERROR");
  const message = status < 500 ? error.message : status === 503 ? "The database is temporarily unavailable." : "An unexpected error occurred.";

  if (status >= 500) console.error(error);
  return response.status(status).json({ success: false, error: { code, message } });
}