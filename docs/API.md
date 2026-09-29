# API integration plan

No backend API currently exists. The frontend service modules return fictional local records. Contracts below are **PROPOSED API** examples for team discussion, not live endpoints.

## Proposed resource groups

- `PROPOSED API` `GET /api/v1/parcels?query=&district=` — authorized parcel search.
- `PROPOSED API` `GET /api/v1/parcels/{ulpin}` — parcel profile, current record and linked history.
- `PROPOSED API` `GET /api/v1/parcels/{ulpin}/geometry` — GeoJSON geometry for an authorized map view.
- `PROPOSED API` `GET /api/v1/applications` and `GET /api/v1/applications/{id}` — role-scoped work queue and detail.
- `PROPOSED API` `POST /api/v1/applications` — validate and create an application.
- `PROPOSED API` `POST /api/v1/applications/{id}/decisions` — authorized, audited officer decision.
- `PROPOSED API` `GET /api/v1/documents` and `POST /api/v1/documents` — metadata and secure upload workflow.
- `PROPOSED API` `GET /api/v1/alerts`, `GET /api/v1/disputes`, `GET /api/v1/grievances`, `GET /api/v1/notifications` — role-scoped queues.

Specify request/response shapes, pagination, validation, error format and permissions before implementation. Never trust a client-side role selector for access control. Keep credentials and service keys out of browser code. Proposed endpoints should change only after the backend team agrees to a versioned contract.
