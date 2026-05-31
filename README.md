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

## Setup

Edit `.env` as needed:

- `MODULE_PRIVATE_KEY_PATH=./private.pem` — required
- `PORT=3200` — optional (default 3200)
- `DATA_DIR=./data/invoices` — optional invoice storage path
- `MODULE_CHALLENGE` / `MODULE_ENDPOINT` — set when registering with Huglo UI

## Run

```bash
npm run dev    # watch mode
npm run start  # single run
npm run build  # compile to dist/
```

The module listens on `http://localhost:3200` by default and exposes:

- `GET /health`
- `GET /manifest`
- `GET /.well-known/huglo-challenge` (when registration env is set)
- `GET /grant/callback`
- `POST /invoke/invoices:write`
- `POST /invoke/invoices:read`
- `POST /invoke/invoices:list`

## Registration

1. Register endpoint URL in the Huglo UI.
2. Set `MODULE_CHALLENGE` and `MODULE_ENDPOINT` in `.env`.
3. Restart the module — it serves the signed challenge at `/.well-known/huglo-challenge`.
4. Click **Verify** in the Huglo UI.
