# Database plan (not implemented)

PostgreSQL with PostGIS is planned. No schema, migration, database connection, or real records are included in this prototype.

Potential entities: `users`, `roles`, `parcels`, `owners`, `ownership_history`, `ror_records`, `transactions`, `mutation_applications`, `documents`, `ai_alerts`, `disputes`, `grievances`, `notifications`, `audit_logs`, `department_records`, and `land_use_changes`.

Use stable identifiers and foreign keys; model parcel boundaries with appropriate PostGIS geometry and spatial indexes; preserve source department, effective dates, provenance, and audit history. Define retention, access and consent rules before loading personal or government data. See `../docs/DATABASE.md`.
