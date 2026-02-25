# WorkOrderHub

work order management system for tracking maintenance requests. residents submit requests, managers assign technicians, technicians update progress. everything goes through one system instead of emails and phone calls.

built for Assignment 1 — Modern Web Technologies, CPAN 212.


## TPS alignment

this system is loosely based on Toyota Production System principles, which is the business framing for the assignment.

standard work maps to the validation layer — every work order goes through the same intake checks before it gets saved. no request skips validation. same rules apply whether a work order comes in through the form or through a CSV bulk upload.

jidoka (quality at source) maps to rejecting bad data immediately at the API boundary, with field-level error details so the problem is obvious. errors dont get buried in the system. if a field is wrong, you know exactly which field and why.

flow control maps to the status lifecycle. a work order can only move to statuses that make sense from its current state. you cant close something that was never started. transition rules are enforced in the service layer, not left to the frontend.


## how to run

backend:
cd backend
npm install
npm run dev

the backend reads from .env in the backend folder:
PORT=3001
API_KEY=mysecretkey123

frontend:
cd frontend
npm install
npm run dev

the frontend reads from .env.local in the frontend folder:
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=mysecretkey123

backend runs on http://localhost:3001, frontend on http://localhost:3000.
hit http://localhost:3001/health to confirm the backend is up.


## how the files connect to each other

a request goes through these layers in order:

client (browser) -> server.js -> app.js -> requestId middleware -> routes -> auth middleware -> validate middleware -> controller -> service -> store -> response util -> back to client

on the frontend side:

page mounts -> useEffect calls api.ts function -> fetch to backend -> parse response -> setState -> component re-renders

here is every file and what it does:

backend/server.js — entry point. loads dotenv, imports app.js, calls app.listen on PORT. this is the file you run.

backend/src/app.js — creates the express app. registers middleware in order: cors, json parser, requestId, routes, 404 handler, error handler. middleware order matters because express runs them top to bottom. also has the /health endpoint which doesnt need auth.

backend/src/routes/index.routes.js — central router. mounts /workorders routes under /api. if you add more resource types later, you add one line here.

backend/src/routes/workorders.routes.js — maps HTTP methods + paths to controller functions. applies auth middleware to all routes. sets up multer for CSV upload (memory storage, 2MB max, .csv only). bulk-upload route is registered before /:id so express doesnt confuse "bulk-upload" as an id param.

backend/src/controllers/workorders.controller.js — thin layer between routes and service. reads from req.body, req.params, req.query, calls the right service function, sends the response. no business logic here. all async handlers are wrapped with asyncHandler so errors reach the error middleware.

backend/src/services/workorders.service.js — all the business logic. list with filters and pagination, create with uuid and timestamps, update allowed fields only, status transition enforcement, delete, and bulk CSV upload with partial acceptance. this is where the rules live.

backend/src/data/workorders.store.js — in-memory storage using a JavaScript Map. getAll, getById, save, delete. data is lost when the server restarts. phase 2 replaces this with mongodb.

backend/src/middleware/requestId.middleware.js — generates a uuid for every request and stores it in res.locals.requestId. all responses include this id so errors are traceable.

backend/src/middleware/auth.middleware.js — checks x-api-key header against process.env.API_KEY. throws 401 UNAUTHORIZED if missing or wrong. applied at route level, not globally, so /health works without a key.

backend/src/middleware/validate.middleware.js — validates request body before it reaches the controller. three validators: validateCreate (all required fields), validateUpdate (only checks fields that were sent), validateStatus (known status string). collects all errors into an array so the user sees everything wrong at once.

backend/src/middleware/notfound.middleware.js — catches any request that didnt match a route. throws 404 NOT_FOUND.

backend/src/middleware/error.middleware.js — central error handler. must be registered last in app.js. handles three error types: AppError (our custom errors), MulterError (file upload errors like too large), and everything else defaults to 500. never exposes stack traces.

backend/src/utils/constants.js — single source of truth for allowed values. departments (FACILITIES, IT, SECURITY, HR), priorities (LOW, MEDIUM, HIGH), statuses (NEW, IN_PROGRESS, BLOCKED, DONE), and the allowed transitions map.

backend/src/utils/errors.util.js — AppError class extending Error. has statusCode, code (machine-readable string), message, and details (array of field errors). every business logic error throws this.

backend/src/utils/response.util.js — sendSuccess and sendError helpers. both read requestId from res.locals so every response has the same shape: { requestId, success, data/error }.

frontend/pages/_app.tsx — wraps every page in the Layout component. imports global CSS.

frontend/pages/index.tsx — immediately redirects to /dashboard.

frontend/pages/dashboard.tsx — loads all work orders on mount and groups them by status. shows KPI summary cards (count per status) and a 4-column board view. each card links to the detail page.

frontend/pages/workorders/index.tsx — list page with FilterBar + WorkOrdersTable + pagination. all filters and page number stored in URL query params so the URL is shareable. re-fetches whenever query changes.

frontend/pages/workorders/create.tsx — create form page. uses WorkOrderForm component, redirects to detail page on success.

frontend/pages/workorders/[id].tsx — detail page. shows read-only info, StatusTransition dropdown, editable form (WorkOrderForm in edit mode), and delete with confirmation dialog.

frontend/pages/data-transfer.tsx — CSV bulk upload page. CsvUpload component handles file selection and upload. UploadResult shows the results after upload completes.

frontend/pages/help.tsx — static reference page. documents CSV format, field requirements, status definitions, and allowed transitions. no API calls.

frontend/components/Layout.tsx — shell layout. sidebar on the left, topbar on top, main content area.

frontend/components/Sidebar.tsx — left nav with links to Dashboard, Work Orders, Create Order, Data Transfer, Help. highlights active page.

frontend/components/Topbar.tsx — top bar showing current page title based on the URL.

frontend/components/WorkOrderForm.tsx — reusable create/edit form. client-side validation mirrors backend rules (min 5 chars title, min 10 chars description, etc). in edit mode, hides department and requesterName because those are immutable after creation.

frontend/components/WorkOrdersTable.tsx — data table with columns for id, title, department, priority, status, assignee, created date, and a View link. shows empty state message when no results. color-coded status and priority badges.

frontend/components/FilterBar.tsx — dropdowns for status, department, priority and text inputs for assignee and title search. updates URL query params on change, resets page to 1.

frontend/components/StatusTransition.tsx — shows current status and a dropdown of only the valid next statuses (from ALLOWED_NEXT_STATUSES in types). submits to the PATCH /status endpoint on button click.

frontend/components/CsvUpload.tsx — file input that only accepts .csv. upload button calls bulkUploadCsv. uses AbortController for cancellation. resets file state after upload so user can pick a new file.

frontend/components/UploadResult.tsx — shows bulk upload summary: total rows, accepted count, rejected count, strategy name, uploadId, requestId, and a table of errors with row number, field, and reason.

frontend/components/ErrorBanner.tsx — red dismissable banner showing an error message and optional requestId.

frontend/components/InlineError.tsx — small component that renders a red field-level error string below a form input.

frontend/services/api.ts — central API client. all fetch calls go through apiFetch() which attaches the x-api-key header and parses the response. returns ApiResult<T> — either { ok: true, data } or { ok: false, error }. all pages check result.ok.

frontend/types/workorder.ts — TypeScript type definitions. WorkOrder interface, Department/Priority/Status union types, BulkUploadResult, PaginatedResult, and ALLOWED_NEXT_STATUSES constant that mirrors the backend transition rules.


## API endpoints

all /api/* routes require the x-api-key header. /health does not.

GET    /health                          no auth — server health check
GET    /api/workorders                  list work orders, supports ?status=&department=&priority=&assignee=&q=&page=&limit=
GET    /api/workorders/:id              get one work order
POST   /api/workorders                  create a work order
PUT    /api/workorders/:id              update title, description, priority, assignee
PATCH  /api/workorders/:id/status       change status (enforces transition rules)
DELETE /api/workorders/:id              delete a work order
POST   /api/workorders/bulk-upload      upload a CSV file to create multiple work orders

every response has this shape:
success: { requestId, success: true, data: { ... } }
error: { requestId, success: false, error: { code, message, details: [] } }


## status lifecycle

NEW -> IN_PROGRESS -> DONE
NEW -> IN_PROGRESS -> BLOCKED -> IN_PROGRESS

NEW: just submitted
IN_PROGRESS: assigned and being worked on
BLOCKED: something is preventing progress
DONE: resolved, terminal state, no more transitions allowed

transitions outside these paths are rejected with 409 INVALID_TRANSITION.


## error codes

400 VALIDATION_ERROR — required fields missing or invalid
401 UNAUTHORIZED — missing or wrong x-api-key header
404 NOT_FOUND — work order id doesnt exist
409 INVALID_TRANSITION — tried to move to a status that isnt allowed from the current one
413 PAYLOAD_TOO_LARGE — uploaded file exceeds the 2MB limit
415 UNSUPPORTED_MEDIA_TYPE — uploaded file is not a .csv
500 INTERNAL_ERROR — unexpected server crash, details hidden


## bulk upload

POST /api/workorders/bulk-upload with multipart/form-data, field name "file", containing a .csv file. max 2MB. file must end in .csv.

CSV format:
title,description,department,priority,requesterName,assignee
Fix HVAC unit,HVAC not working in building 3,FACILITIES,HIGH,John Smith,Jane Doe

template and sample files are in the csv-templates/ folder.

the upload uses a partial acceptance strategy — valid rows get saved, invalid rows get rejected with the row number and what was wrong. a file with 50 rows shouldnt fail completely because of one bad row.


## in-memory storage

this assignment uses in-memory storage (a JavaScript Map) instead of a database. data is lost when the server restarts. this is intentional per the spec. phase 2 replaces this with mongodb.


## what to delete before sharing or submitting

these are generated directories. they are huge and should never be committed to git or included in a zip submission:

frontend/node_modules/ — ~300-600MB. regenerated by npm install.
backend/node_modules/ — ~50-100MB. regenerated by npm install.
frontend/.next/ — ~50-100MB. regenerated by npm run dev or npm run build.
frontend/.git/ — delete if you are using a root-level git repo instead.

your actual source code is around 50KB. the rest is all generated packages.
to clean up before zipping: delete all three folders above, then zip the project.
anyone who receives it just runs npm install in both backend and frontend.



## team division for 6 people

divide by folder so each person works on their own files and merge conflicts are minimal. each person commits only to their area. if two people need to touch the same file, they talk first.

Vishal - N01737533 - SESSION B — backend core (routes + controllers + middleware)
files: src/routes/, src/controllers/, src/middleware/
this person owns the request pipeline. these files call each other but rarely change once written. they define what endpoints exist, what middleware runs, and how requests flow from URL to controller.

Christian Kiyimba - N01707975 - SESSION A — backend logic (services + store + utils)
files: src/services/, src/data/, src/utils/
this person owns all business logic. the service layer is where filtering, validation, status transitions, and bulk upload happen. store is the in-memory database. utils are shared helpers. this person can work independently from person 1.

Denzel Mbaki - N01700856 - SESSION B — frontend pages (pages/)
files: pages/dashboard.tsx, pages/workorders/*, pages/data-transfer.tsx, pages/help.tsx
this person assembles the pages. pages import components and call api.ts. they wire everything together but dont define the components themselves.

Silas Kajinaki - N01703372 - SESSION B — frontend components (components/)
files: components/WorkOrderForm.tsx, components/WorkOrdersTable.tsx, components/FilterBar.tsx, components/StatusTransition.tsx, components/CsvUpload.tsx, components/UploadResult.tsx
these are self-contained UI pieces. they receive props and render. person 4 builds the building blocks, person 3 puts them on pages.

Jayden Clark - N01510051 - SESSION B — frontend foundation (layout, api client, types)
files: components/Layout.tsx, components/Sidebar.tsx, components/Topbar.tsx, components/ErrorBanner.tsx, components/InlineError.tsx, services/api.ts, types/workorder.ts
this person sets up the shell (layout + nav) and the api client. api.ts and types are shared by everyone but they are set up once and rarely change. this person should finish first because others depend on these files.

Quang Hung Tran - N01650970 - SESSION A — config, docs, testing, screenshots
files: .env, .env.local, .gitignore, README.md, csv-templates/, postman/, screenshots/
this person runs the app end to end, takes all the screenshots, tests all endpoints in postman, writes the README, and makes sure the CSV templates are correct. this is the last person to finish because they need the app working first.

dependency order: person 5 finishes first (foundation) -> person 2 and person 1 work in parallel (backend) -> person 4 works in parallel (components) -> person 3 wires pages -> person 6 tests and documents everything.


## postman collection

a postman collection is included at postman/WorkOrderHub.postman_collection.json. import it and set BASE_URL=http://localhost:3001 and API_KEY=mysecretkey123 in the postman environment.
