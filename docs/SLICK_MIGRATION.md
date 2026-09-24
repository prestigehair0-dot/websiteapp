# Migrating from Slick

A one-time runbook for moving a salon's data out of Slick and into this
app's Supabase schema, using `scripts/import-slick.ts`.

Slick exports vary by salon (different column names, different subsets of
columns), so the importer doesn't assume a fixed set of headers. It tries to
auto-match each target field against your CSV's header row (`Price`,
`Price (GBP)`, `service_price` all match a `price` field, for example), and
falls back to an explicit column mapping for anything it can't guess.

## Before you start

- Export each type of data from Slick as its own CSV file (Slick's own export
  tools — check Settings → Export/Reports in Slick's dashboard, since exact
  steps vary by plan).
- Set the same Supabase credentials the app's Production environment uses:

  ```
  export NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=<service role key>
  ```

  Never run this against a database you don't have a fresh backup of.

## Run order

Later imports look up records earlier ones create, so run them in this order:

1. `categories`
2. `services` (needs categories)
3. `staff`
4. `customers`
5. `opening_hours`
6. `appointments` (needs staff, services and customers)

## Usage

```sh
# Preview first -- validates and reports without writing anything.
npx tsx scripts/import-slick.ts import services slick-services.csv --dry-run

# If the auto-detected columns are wrong, or a required field couldn't be
# matched, point it at the right column explicitly:
npx tsx scripts/import-slick.ts import services slick-services.csv \
  --mapping services-mapping.json --dry-run

# Looks good -- run it for real.
npx tsx scripts/import-slick.ts import services slick-services.csv
```

A `--mapping` file is a JSON object of `{ "target_field": "Your CSV Column Name" }`, e.g.:

```json
{ "price": "Retail Price", "duration_minutes": "Length (mins)" }
```

Multiple salon locations: pass `--salon <slug>` to target a specific salon
row; without it, the importer uses the oldest salon in the database (fine
for a single-location salon).

Each real (non `--dry-run`) run prints an import run id and, if anything was
created, how to undo it:

```sh
npx tsx scripts/import-slick.ts rollback <import-run-id>
```

Rollback only removes the records *that run created* -- rows it updated
(e.g. correcting an existing service's price on a re-run) are left alone.

## What each kind expects

| Kind | Required fields | Notes |
| --- | --- | --- |
| `categories` | `name` | `slug` derived from `name` if not given |
| `services` | `name`, `duration_minutes`, `price` | `category` (name or slug) links to an already-imported category; `buffer_minutes` and `deposit` default to 0 |
| `staff` | `display_name` | `specialties` is a comma/semicolon separated list |
| `customers` | `email` | Creates a passwordless account per new email (this app uses magic-link sign-in, no password to set); an existing profile for that email is left untouched |
| `opening_hours` | `day_of_week`, plus `opens_at`/`closes_at` unless closed | `day_of_week` accepts `1`-`7` (ISO, Monday=1) or a weekday name; always upserts the one row for that day |
| `appointments` | `customer_email`, `staff_name`, `service_name`, `date`, `time` | `staff_name`/`service_name` must match an already-imported (or existing) row; `date`/`time` are read as Europe/London local time; `status` defaults to `completed` (this is historical data) |

## Known limits

- This is a one-time migration tool, not a live sync -- Slick and this app's
  data will drift apart the moment both are used. Retire Slick once the
  import is verified.
- `appointments` inserts bookings directly (`source: "import"`), bypassing
  the normal hold → book flow. The database's own overlap constraint still
  applies: two imported appointments for the same stylist at overlapping
  times will fail as an error row, which usually means a data entry mistake
  worth checking in Slick.
- A row that fails validation (bad date, unknown category, etc.) is skipped
  and reported -- it does not stop the rest of the file from importing.
