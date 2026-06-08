# Alice Accounting

Example Huglo module that stores invoices as JSON files on disk.

Built with `@huglo/module-sdk`

## Scopes

| Scope | Description |
|-------|-------------|
| `invoices:write` | Create an invoice (supports `dryRun`) |
| `invoices:read` | Read an invoice by id |
| `invoices:list` | List all invoices for the subject |

Invoices are persisted under `data/invoices/<id>.json` (gitignored). Each invoice is scoped to the verified grant subject.
In production, use a durable database instead of plain files on disk.

## Setup

Edit `.env` as needed:

- `MODULE_PRIVATE_KEY_PATH=./private.pem` — required
- `PORT=3200` — optional (default 3200)
- `MODULE_CHALLENGE` / `MODULE_ENDPOINT` — set when registering with Huglo UI

## Registration

1. Register endpoint URL in the Huglo UI.
2. Set `MODULE_CHALLENGE` and `MODULE_ENDPOINT` in `.env`.
3. Restart the module - so the env vars are loaded
4. Click **Verify** in the Huglo UI.
