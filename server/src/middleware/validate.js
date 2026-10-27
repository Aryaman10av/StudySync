export function validateBody(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) return next(result.error);
    request.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) return next(result.error);
    request.validatedQuery = result.data;
    next();
  };
}