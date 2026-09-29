# Database plan

Planned PostgreSQL/PostGIS database; no schema is implemented. Candidate tables include:

| Table | Purpose |
| --- | --- |
| `users`, `roles` | Identity references and authorization assignments |
| `parcels`, `owners` | ULPIN, parcel attributes and owner references |
| `ownership_history`, `ror_records` | Effective-dated ownership and rights records |
| `transactions`, `mutation_applications` | Registered transactions and service workflow |
| `documents` | Secure object metadata, provenance and verification state |
| `ai_alerts` | Versioned, explainable review indicators |
| `disputes`, `grievances` | Case and citizen support workflows |
| `notifications` | User delivery preferences and notification records |
| `audit_logs` | Append-only record of authorized state changes |
| `department_records` | Source snapshots and reconciliation metadata |
| `land_use_changes` | Effective-dated classifications and evidence references |

Use PostGIS geometry with explicit CRS, geometry validation and spatial indexes. Keep immutable source references, timestamps, actor identifiers and correction history. Review PII minimization, role access, retention and encryption before loading any non-demo data.
