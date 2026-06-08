/* =============================================================================
 * Environment
 *
 * Single place that reads process.env. Persistence paths are fixed constants below.
 * ============================================================================= */

/** Port the HTTP server listens on. Falls back to 3200 when PORT is not set. */
export const PORT = Number(process.env["PORT"] ?? 3200);

/** Public base URL this module is registered under in Huglo. */
export const MODULE_ENDPOINT = process.env["MODULE_ENDPOINT"] ?? `http://localhost:${PORT}`;

/** Directory where invoice JSON files are stored. */
export const DATA_DIR = "./data/invoices";
