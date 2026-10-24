# `sevenx_api` Plugin Guide

## Identity

- **Plugin:** `sevenx` (product name "7x")
- **Project:** `sevenx_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sevenx_api`
- **Last synchronized:** `2026-10-24`

## Scope

### Owns

- Training-center domain: locations/rooms, classes with a weekly recurring
  schedule, teacher and student members, invites, attendance, assignments,
  submissions and grading, announcements with read tracking, and a per-class
  group chat (teacher + students).
- Authorization rules for three actors: supervisor (erxes team member),
  teacher and student (both erxes client-portal users linked to a
  `SevenxMember` by `cpUserId`).
- Demo seed (`scripts/seed.ts`).

### Does not own

- Client-portal authentication (register/login/password) — core `clientportal`
  module. The plugin only reads `context.cpUser` and `context.user`.
- File storage — attachments are `{url,name,size,type}` produced by core
  file upload.
- Any UI: supervisor UI lives in `frontend/plugins/sevenx_ui`, the
  teacher/student portal in `apps/sevenx-portal`.

## Current Capabilities

- Full GraphQL API defined in `docs/sevenx-graphql-contract.graphql`
  (repository root) and mirrored in `src/apollo/schema/schema.ts`.
- Schedule conflict detection (same teacher, or same location+room, with
  overlapping weekday/time/date range) on class create/edit and via
  `sevenxScheduleConflicts`.
- Sessions are computed from the schedule at runtime (no session collection);
  attendance rows are keyed by `classId + date (YYYY-MM-DD) + studentId`.
- Attendance summaries count a session once it is in the past or once anyone
  in the class was marked for that date; unmarked sessions count as absent.
- Invite flow: `sevenxInviteCreate` (supervisor, or teacher for own classes)
  creates an `invited` member + token; `sevenxInviteCheck` is public;
  `sevenxInviteAccept` links the calling cpUser and activates the member.
- Dashboard stats (counts, today's sessions, 7-day attendance rate).
- Class group chat: `sevenxChatMessages` returns the latest `limit` messages
  (default 100, max 200) oldest first; `sevenxChatMessageSend` posts as the
  caller with text and/or up to 10 attachments (images, videos, voice notes,
  any file, uploaded beforehand through core `/upload-file`). Both are `shared` and require class access (teacher/student of the
  class, or supervisor). No subscription — the portal polls.
- Student self check-in (`sevenxCheckInStatus`, `sevenxAttendanceCheckIn`):
  status from the server-time window — present `[start-30, start+10]`, late
  `(start+10, end-20)`, absent `[end-20, end]`, otherwise rejected — and only
  within `location.checkInRadius` meters (haversine) of the location's
  `latitude/longitude`. Locations without coordinates cannot be checked in to.

## Architecture

| Area            | Path                                              | Responsibility                                   |
| --------------- | ------------------------------------------------- | ------------------------------------------------ |
| Entry           | `src/main.ts`                                     | `startPlugin({ name: 'sevenx', port: 3315 })`    |
| Models registry | `src/connectionResolvers.ts`                      | `IModels`, `IContext`, `generateModels`          |
| Schema          | `src/apollo/schema/schema.ts`                     | All `Sevenx*` types, queries, mutations          |
| Resolver wiring | `src/apollo/resolvers/*.ts`                       | Merges module queries/mutations/custom resolvers |
| Auth helpers    | `src/modules/common/auth.ts`                      | `getActor`, `requireClassAccess`, wrappers       |
| Schedule utils  | `src/modules/common/schedule.ts`                  | Session expansion, overlap, next session         |
| Check-in rules  | `src/modules/common/checkIn.ts`                   | Window phases, distance, coordinate validation   |
| Tests           | `src/modules/**/__tests__/*.test.ts`              | Check-in windows, distance, model rules (Jest)   |
| Locations       | `src/modules/locations/**`                        | `sevenx_locations`                               |
| Members/Invites | `src/modules/members/**`                          | `sevenx_members`, `sevenx_invites`               |
| Classes         | `src/modules/classes/**`                          | `sevenx_classes`, conflicts, dashboard stats     |
| Attendance      | `src/modules/attendance/**`                       | `sevenx_attendances`, summaries                  |
| Assignments     | `src/modules/assignments/**`                      | `sevenx_assignments`, `sevenx_submissions`       |
| Announcements   | `src/modules/announcements/**`                    | `sevenx_announcements`                           |
| Chat            | `src/modules/chat/**`                             | `sevenx_chat_messages`                           |
| Seed            | `scripts/seed.ts`                                 | Demo portal, users, classes, data                |

Each module follows `@types/`, `db/definitions/`, `db/models/`,
`graphql/resolvers/{queries,mutations,customResolvers}/`. Business rules and
validation live in the model classes; resolvers only check the actor and
delegate.

## Contracts

### Provides

- GraphQL (gateway, prefix `sevenx`): see `docs/sevenx-graphql-contract.graphql`.
  Three access tiers, chosen per resolver in `src/modules/common/auth.ts`:
  - default wrapper → supervisor (team member login) only;
  - `shared(...)` → `skipPermission`, actor resolved inside (`getActor`);
  - `portal(...)` → `forClientPortal + cpUserRequired` (portal cookie + `x-app-token`);
  - `publicResolver(...)` → no login (`sevenxInviteCheck`).
- tRPC: generated `sevenx.hello` placeholder only.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `createGenerateModels`,
  `mongooseStringRandomId`, `ExpectedError`, `randomAlphanumeric`.
- `erxes-api-shared/core-types`: `IMainContext`, `Resolver`.
- Core client portal: `context.cpUser` / `context.clientPortal` headers set by
  the gateway; seed writes `client_portals` and `client_portal_users`
  documents directly (dev only).

## Data and State

- Collections (tenant db via `generateModels(subdomain)`): `sevenx_locations`
  (optional `latitude`/`longitude`, `checkInRadius` default 150 m),
  `sevenx_members` (unique `email+role`), `sevenx_invites` (unique `token`),
  `sevenx_classes`, `sevenx_attendances` (unique `classId+date+studentId`;
  `checkedInAt`/`checkInDistance` set only by self check-in),
  `sevenx_assignments`, `sevenx_submissions` (unique `assignmentId+studentId`),
  `sevenx_announcements`, `sevenx_chat_messages` (index `classId+createdAt`).
- Env: `SEVENX_PORTAL_URL` (invite link base, default `http://localhost:3000`),
  `SEVENX_SEED_PASSWORD` (seed only), `JWT_TOKEN_SECRET` (seed signs the
  portal app token with the same secret the gateway verifies).

## Local Invariants

- `getActor` resolves `context.cpUser` before `context.user`: browsers send the
  team member's `auth-token` cookie to every localhost port, so a portal
  request (app token + client-portal user) must not be shadowed by it.
- Every model operation goes through `models` from `generateModels(subdomain)`.
- Teacher-only mutations check `isTeacherOf`; student data queries check
  `canAccessClass`; teachers may only invite students into their own classes
  and post announcements scoped to their own class.
- A class has exactly one teacher and one recurring weekly schedule;
  `validateSchedule` + `findConflicts` run on every create/edit.
- Removing a class cascades to attendance, assignments, submissions,
  announcements, chat messages and invite class references; removing a location with
  classes is rejected.
- A chat message needs a trimmed body (≤ 2000 characters) or at least one
  attachment (≤ 10); sender name and role are stored on the message at send
  time. `SevenxChatMessage.attachments` falls back to `[]` for older rows.
- Graded submissions cannot be re-submitted; scores are bounded by
  `assignment.maxScore`.
- Contract changes go to `docs/sevenx-graphql-contract.graphql` first.
- Self check-in uses server time only; the client never supplies a time. A
  student checks in once per session (guarded by `checkedInAt` + the unique
  index), cannot override `excused`, and may replace a teacher's default
  `absent`. `sevenxAttendanceMark` never clears `checkedInAt`, so a teacher can
  still change the status afterwards.
- Location coordinates are both-or-neither; radius is 20–2000 m.

## Validation

- `pnpm nx build sevenx_api`
- `pnpm nx test sevenx_api` (Jest; pure rules plus model statics with mocked models)
- `pnpm --filter sevenx_api seed` (needs local Mongo; prints portal token and demo logins)
- Smoke: with `ENABLED_PLUGINS=sevenx`, run core-api + gateway + `pnpm nx serve sevenx_api`;
  `sevenxDashboardStats` as a team member returns 3 classes; portal login as
  `sarnai@7x.demo` then `sevenxMe` returns a `teacher` member.
