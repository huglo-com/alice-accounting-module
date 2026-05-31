// Environment configuration for the module.
//
// This is the ONE place that reads from process.env. Everything else in the
// codebase imports these constants instead of touching process.env directly,
// which keeps configuration easy to find and change.

// Port the HTTP server listens on. Falls back to 3200 when PORT is not set.
export const PORT = Number(process.env["PORT"] ?? 3200);


// Public base URL this module is registered under in Huglo.
export const MODULE_ENDPOINT = process.env["MODULE_ENDPOINT"] ?? `http://localhost:${PORT}`;


// Folder on disk where invoice JSON files are stored.
export const DATA_DIR = process.env["DATA_DIR"] ?? "./data/invoices";