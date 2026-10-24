# `sevenx_ui` Plugin Guide

## Identity

- **Plugin:** `sevenx`
- **Project:** `sevenx_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sevenx_ui`
- **Last synchronized:** `2026-10-24`

## Scope

### Owns

- The supervisor (erxes team member) UI of the 7x training-center plugin: dashboard, classes with schedule and conflict check, class detail (students, attendance heatmap, assignments, class announcements), weekly schedule calendar, teachers and students lists with invites, locations with rooms, and announcements.
- Its own GraphQL documents, hooks, Zod schemas, `en` / `mn` dictionaries, navigation and routes under `/sevenx/*`.

### Does not own

- `sevenx_api` resolvers, models or permissions (contract: `docs/sevenx-graphql-contract.graphql`).
- The teacher/student portal (`apps/sevenx-portal`), core UI, `erxes-ui`, `ui-modules`, or any other plugin.
- Gateway locale files (`backend/gateway/src/locales/*/sevenx.json`): the host tries to load that namespace, but this plugin ships its own dictionaries.

## Current Capabilities

- Runs as the `sevenx_ui` Module Federation remote on port `3012`; display name "7x", icon `IconSchool`.
- `/sevenx` redirects to `/sevenx/dashboard`: counts (teachers, students, classes, locations), weekly attendance rate, pending invites, today's sessions and the five most recent announcements (`sevenxDashboardStats`, `sevenxAnnouncements(limit: 5)`).
- Every 7x RecordTable (classes, teachers, students, locations) follows core's client-portal-users table: first column is the horizontal "…" `RecordTable.MoreButton` whose menu only has Edit (header = column selector), then `RecordTable.checkboxColumn`; selected rows show the floating `CommandBar` "N selected · Delete" (typed `delete` confirmation via `useConfirm`, runs the single-id remove mutation per row, toasts success/failures, clears the selection). There is no per-row Remove.
- `/sevenx/classes`: RecordTable of `sevenxClasses` filtered by location and teacher (URL query `locationId`, `teacherId`) and a debounced search; the name links to the class page, Edit opens the create/edit Sheet (name, description, teacher from `sevenxMembers(role: teacher)`, location + room from `sevenxLocations`, days-of-week checkboxes, start/end time, start/end date). While the form is complete, `sevenxScheduleConflicts` runs debounced (500 ms) and conflicts are shown inline; Save is disabled while conflicts exist. Remove with confirmation.
- `/sevenx/classes/:id`: header with teacher, location, schedule and period, Edit sheet, and tabs: Students (table, add via multi-select of unenrolled `sevenxMembers(role: student)` → `sevenxClassAddStudents`, remove → `sevenxClassRemoveStudent`), Attendance (student × session heatmap from `sevenxClassSessions` + `sevenxAttendanceReport` for a selectable date range, falling back to sessions computed from the schedule when the server returns none; per-student summary from `sevenxClassAttendanceSummary`), Assignments (read-only `sevenxAssignments`), Announcements (class-scoped list and create).
- `/sevenx/schedule`: Monday–Sunday weekly grid of active classes placed by time, week navigation, filter by location (`locationId` query). Without a location, blocks and legend chips are colored per location and clicking one opens that location; with a location, they are colored per class, link to the class, and a back button returns to all locations. Classes that overlap in time on the same day sit side by side (calendar-style columns with a small gap, expanding into free columns to the right); short blocks show name and time on one line, tall ones add location/teacher/room, and the hover tooltip shows the full details.
- `/sevenx/teachers` and `/sevenx/students`: RecordTable of `sevenxMembers(role)` with search, Invite Sheet (`sevenxInviteCreate`: email, last/first name, classes) that shows the returned invite `url` with a copy button, pending invites table (`sevenxInvites`, copy link, remove). Clicking a name or Edit sets `?memberId=` and opens the member detail `FocusSheet` (deep-linkable, closes with Esc/✕): avatar, name, role/status/portal-link badges and Delete; first name, last name and phone are inline `TextField`s saved through `sevenxMemberEdit` after Zod validation; email, classes (links; teacher = classes it teaches, student = `classIds`) and created date are read-only because the contract has no mutation for them.
- `/sevenx/locations`: RecordTable (with a Check-in column: radius badge or Off); clicking a name or Edit sets `?locationId=` and opens the Sheet form (name, address, rooms as a tag input, and a check-in point: latitude, longitude, radius 20–2000 m, "use my current location" via `navigator.geolocation`) → `sevenxLocationAdd/Edit/Remove`. Coordinates are both-or-neither (Zod); empty coordinates turn student self check-in off for that location.
- `/sevenx/announcements`: card list (not a RecordTable; the contract has no announcement edit, so it keeps per-card remove) with read count, attachments (image thumbnails, file and link chips) and remove; create Sheet with audience (everyone / one class), class select, title, body and attachments (files/images uploaded through `useUpload` to `/upload-file`, links stored with `type: 'link'`) → `sevenxAnnouncementAdd`.
- Language switch (EN / MN) is passed as the `AppLayout` `footer`, so it is pinned to the bottom of the sidebar; it calls the host `i18n.changeLanguage`, so the choice persists for the whole host.
- Phone layout (< `sm`/`md`): the overlay sidebar closes after navigation; page headers truncate the title, hide the favorite toggle and show icon-only action buttons; filters wrap to full width; class form fields stack; class detail tabs scroll horizontally; the schedule shows a Monday–Sunday day picker with that day's classes as a list instead of the week grid.
- Every list has loading skeletons, an empty state with a primary action, and a retryable error state; every mutation shows a success or error toast.

## Architecture

| Area              | Path                                                        | Responsibility                                                                    |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Federation config | `frontend/plugins/sevenx_ui/module-federation.config.ts`   | Exposes `./config` and `./sevenx`.                                                |
| Plugin config     | `frontend/plugins/sevenx_ui/src/config.tsx`                 | `IUIConfig` (`name: 'sevenx'`, `i18n: true`, modules) and registers dictionaries. |
| Entry             | `frontend/plugins/sevenx_ui/src/modules/SevenxMain.tsx`     | `AppLayout` with the plugin sidebar, language-switch footer and lazy routes under `/sevenx/*`. |
| Navigation        | `frontend/plugins/sevenx_ui/src/modules/SevenxNavigation.tsx` | Sidebar links for the seven routes; closes the mobile sidebar on navigation.   |
| i18n              | `frontend/plugins/sevenx_ui/src/i18n`                       | `en.ts`, `mn.ts` and `registerSevenxLocales()` (adds the `sevenx` namespace).     |
| Shared            | `frontend/plugins/sevenx_ui/src/modules/shared`             | Contract types, schedule/date and attachment helpers, page header, empty/error states, confirm dialog, record-table parts (`sevenxMoreColumn`, `SevenxBulkDeleteBar`), attachment list, language switch, toast hook. |
| Features          | `frontend/plugins/sevenx_ui/src/modules/<feature>`          | `graphql/`, `hooks/`, `components/` per feature: `classes`, `members`, `locations`, `announcements`, `dashboard`, `schedule`. |
| Pages             | `frontend/plugins/sevenx_ui/src/pages`                      | One route component per page.                                                     |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./sevenx`.
- Routes: `/sevenx` (redirect), `/sevenx/dashboard`, `/sevenx/classes`, `/sevenx/classes/:id`, `/sevenx/schedule`, `/sevenx/teachers`, `/sevenx/students`, `/sevenx/locations`, `/sevenx/announcements`.
- i18next namespace `sevenx` (keys in `src/i18n`), including the navigation label key `sevenx` = "7x".

### Consumes

- `sevenx_api` GraphQL per `docs/sevenx-graphql-contract.graphql`: queries `sevenxDashboardStats`, `sevenxLocations`, `sevenxMembers`, `sevenxClasses`, `sevenxClassDetail`, `sevenxScheduleConflicts`, `sevenxAttendanceReport`, `sevenxInvites`, `sevenxAnnouncements`, `sevenxClassSessions`, `sevenxClassAttendanceSummary`, `sevenxAssignments`; mutations `sevenxLocationAdd/Edit/Remove`, `sevenxClassAdd/Edit/Remove`, `sevenxClassAddStudents`, `sevenxClassRemoveStudent`, `sevenxMemberEdit`, `sevenxMemberRemove`, `sevenxInviteCreate`, `sevenxInviteRemove`, `sevenxAnnouncementAdd`, `sevenxAnnouncementRemove`.
- Public `erxes-ui` (RecordTable, CommandBar, FocusSheet, TextField, useConfirm, Command/Combobox/Popover, Sheet, Form, Select, DatePicker, MultipleSelector, StringArrayInput, Tabs, Table, Card, Alert, Empty, ToggleGroup, toast, `useUpload`, `readImage`, `REACT_APP_API_URL`) and `ui-modules` (`PageHeader`).
- Host `react-i18next` instance (shared singleton) for the `sevenx` namespace.

## Data and State

- Apollo Client owns all server state. `sevenxMemberEdit` returns the full member, so normalized cache entries update every list in place. Other mutations evict `ROOT_QUERY` fields they affect (`sevenxClasses`, `sevenxMembers`, `sevenxInvites`, `sevenxAnnouncements`, `sevenxDashboardStats`) or refetch `sevenxLocationsList`, so lists update without a manual refresh.
- React Hook Form + Zod own form state; filters and the open record (`memberId` on teachers/students, `locationId` on locations) live in URL query params (`useQueryState` / `useMultiQueryState`) or local state. No Jotai atoms.

## Local Invariants

- `SevenxMain` renders a `<style>` that sets form fields to 16px below 768px while the app is mounted; iOS Safari otherwise zooms in on focus of the 13px erxes-ui fields and leaves the page zoomed. Keep it unless core-ui adopts the same rule globally.
- Page-level vertical scrollers (`overflow-y-auto` panes and Sheet contents) also set `overflow-x-hidden`; otherwise any slightly wide child lets the pane pan sideways on phones. Deliberate horizontal scrollers (tables, tab lists) keep their own `overflow-x-auto`.
- GraphQL operation names are prefixed `sevenx` and unique (`sevenxClassesList`, `sevenxClassAddMutation`, …); documents stay in `src/modules/<feature>/graphql/`.
- All user-visible strings go through `useTranslation('sevenx')` with keys present in both `en.ts` and `mn.ts`.
- `registerSevenxLocales()` must be called from both `config.tsx` (so the navigation label resolves) and `SevenxMain.tsx`; it never overwrites keys already loaded.
- Class form: `partialValuesToInput` returns `null` until every schedule field is valid; the conflict query is skipped until then and Save is blocked while conflicts exist.
- `WEEK_DAYS` is Monday-first (`[1,2,3,4,5,6,0]`); `daysOfWeek` values follow the contract (0 = Sunday).
- Every sidebar link has its own sub-path: `NavigationMenuLinkItem` treats `isActive={false}` as unset and falls back to a prefix match, so a link to bare `/sevenx` would stay highlighted on every page.
- Attachment `url` is either an absolute http(s) URL (links) or an upload key resolved through `/read-file`; link attachments use `type: 'link'`.
- Schedule week grid and phone agenda share `classesOn` / `renderBlock`; keep both views in sync when changing block content.
- Week-grid block positions come from `layoutOverlaps` in `modules/shared/utils/schedule.ts` (overlap clusters, greedy columns by start time, right expansion; touching times do not overlap); keep it pure and covered by `schedule.test.ts`.
- Schedule colors come from golden-angle hues over all listed classes sorted by name, so colors stay stable while paging weeks.
- New RecordTables use `sevenxMoreColumn` + `RecordTable.checkboxColumn` with `stickyColumns={['more', 'checkbox', 'name']}` and render `SevenxBulkDeleteBar` inside `RecordTable.Provider`; the "…" menu holds Edit only.
- Pages render the shared `SevenxPageHeader` with a favorite breadcrumb and a Tabler icon name.
- No direct `radix-ui` imports, no `any`, no default exports outside tool configs.

## Validation

- `pnpm nx lint sevenx_ui`
- `pnpm nx build sevenx_ui`
- `pnpm nx test sevenx_ui` (schedule helper and overlap layout unit tests; `tsconfig.spec.json` sets `esModuleInterop` for `dayjs`)
- Smoke: with `sevenx_api` running, open `/sevenx/classes`, create a class whose teacher or room overlaps an existing one and confirm the inline conflict list blocks Save; fix the time and save; open the class, add a student and check the Students tab and `/sevenx/students` update without reload. On `/sevenx/teachers`, click a name: the URL gets `?memberId=` and the detail sheet opens; edit the phone and see the table update; select rows and confirm the "N selected · Delete" bar. On `/sevenx/schedule`, classes with overlapping times on one day must render side by side without covering each other.
