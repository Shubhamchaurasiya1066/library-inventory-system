export const logTelemetry = (actionName) => {
  return (req, res, next) => {
    console.log(`[Analytics] User interacted with Express API: ${actionName}`);
    next();
  };
};