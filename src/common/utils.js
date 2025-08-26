export function logInfo(msg) {
  console.log(`INFO: ${msg}`);
}

export function logError(msg) {
  console.error(`ERROR: ${msg}`);
}

export function formatDate(date) {
  return new Date(date).toISOString().slice(0,10); // YYYY-MM-DD
}
