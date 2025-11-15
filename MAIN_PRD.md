## Master PRD — Real-Time Quiz Platform (Umbrella Document)

**Product**: Real-time Quiz Platform (Kahoot-style, AI-augmented)
**Scope**: End-to-end product across:

1. Quiz Creation & Management (QC-*)
2. AI-Powered Quiz Generation from PDF/Web (AIQ-*)
3. Review & Editing of AI-Generated Quizzes (RE-*)
4. Game Hosting & Playing (GH-*)
5. User Management, Plans & Limits (UM-*)

This master PRD defines the **overall product strategy, architecture, data model, cross-cutting contracts, and flows**. Where this doc conflicts with a sub-PRD, **this umbrella PRD wins**.

---

# 1. PRODUCT OVERVIEW & STRATEGY

## 1.1 Product Vision

We are building a **web-based live quiz platform** where:

* **Hosts** (teachers, trainers, facilitators, event organizers) can:

  * Create quizzes manually or via AI from PDFs and webpages.
  * Manage a personal quiz library.
  * Host real-time games in classrooms, workshops, and events.

* **Players** (students, employees, attendees) can:

  * Join live games via short code, link, or QR.
  * Play as guests without creating accounts.
  * See their scores and rank in real time.

Differentiation vs. incumbents (e.g., Kahoot):

* **More generous free tier**:

  * Target: free hosts can reliably run games with **~50 players** (configurable), where competitors typically cap at ~10 in free plans.
  * Absolute technical cap: **300 concurrent players per game session** in v1 (GH-RT-15). Plan tiers decide how much of that is exposed.

* **Deep AI integration**:

  * Generate quizzes directly from **PDFs** (chapters, slides) and **webpages** (articles, documentation) (AIQ-*).
  * Tight integration with quiz editor and review tools (RE-*) so AI output is editable and reusable in one place.

* **Host-centric UX**:

  * Fast, keyboard-friendly editor and library management (QC-*).
  * Clear game controls with stable, low-latency real-time play (GH-*).

Long term, the platform becomes a **live learning and engagement layer** with reusable content, recurring sessions, and rich analytics, not just one-off games.

* **Initial wedge**: classroom teachers and corporate trainers running formative assessments, onboarding, and workshops.
* **Expansion**: community events, conferences, online courses, and eventually organizations (schools/companies) with shared libraries, advanced analytics, and LMS/SSO integrations.

---

## 1.2 Goals & Non-Goals (v1)

### Goals (MVP+)

1. **Fast path from content → live game**

   * A new host can go from **“I have a PDF or article”** to **“I’m running a 10–15 question live game”**:

     * Under **60 minutes** the first time.
     * Under **10 minutes** once familiar.
   * Supported end-to-end by AI generation (AIQ-*), review (RE-*), quiz management (QC-*), hosting (GH-*), user management & plans (UM-*).

2. **Reliable real-time games at classroom/workshop scale**

   * Stable, low-latency play for **up to 300 concurrent players** per game (technical cap).
   * Host can control game without worrying about desyncs or crashes (GH-*).

3. **Free tier that obviously beats Kahoot’s free tier**

   * Concrete target: **FREE plan** allows **~50 players per game** (UM-PLAN-3) and a meaningful amount of AI usage (e.g., ~10 AI quizzes/month to start).
   * Behavior when limits are reached is clear, non-spammy, and upgrade-friendly.

4. **Foundation for monetization & org features**

   * Data model and service boundaries anticipate:

     * Paid tiers (higher limits, more AI, advanced analytics).
     * Organizations (schools/companies) and SSO in future phases.

### Non-Goals (v1)

* No full **LMS**:

  * No deep course structures, graded assignments, or curriculum sequencing.
* No **gradebook-quality tracking**:

  * We’ll record per-game results and basic stats, but not full longitudinal student histories or standards mapping.
* No **complex org hierarchy or SSO** in v1:

  * We design for future org_id, roles, and SSO, but only implement **single-user ownership** in v1 (UM-*).
* No exotic question types beyond:

  * Single-answer **multiple choice** and **true/false** (QC-32, GH-S-1). Architecture must support more types later.

---

## 1.3 Success Metrics

### North Star Metric (product-level)

**NSM**: **“Weekly successful live games hosted”**
A **successful live game** is defined as:

* Created by a host account.
* Started (GAME_STARTED).
* At least **5 players** join.
* At least **one question completed**.

This ties directly to:

* Quiz creation & AI generation (you need content).
* Real-time infra (game must run reliably).
* Host activation and retention (hosts keep returning to run sessions).

### Supporting Metrics

1. **Host activation velocity**

   * Median time from **signup → first hosted game** (UM-METRIC-2, GH-A-*).
   * Target: < 7 days for majority of new hosts.

2. **AI feature adoption**

   * % of active hosts (hosted ≥1 game in last 30 days) who:

     * Use AI quiz generation at least once (G1 / AIQ-*).
   * Target: ≥ 40% in first month of use.

3. **Quiz library engagement**

   * Average **quizzes created per active host per month** (QC-1.3).
   * % of quizzes that are used in at least one game within 30 days.

4. **Game scale metrics**

   * Average players per game.
   * Distribution of game sizes (e.g., 1–20, 20–50, 50–300).
   * Error rate for joins and answer submissions.

5. **Host retention**

   * Monthly host retention cohorts (30-day).
   * % of hosts who host **≥1 game in a given month** after their first month.

### Mapping to Sub-PRDs

* **Quiz Creation & Management** drives:

  * Quizzes created & published → increases content available for hosting.
* **AI Generation** drives:

  * Faster creation, more quizzes per host, higher adoption of the platform.
* **Review & Editing** drives:

  * Quality and trust → more AI quizzes actually used in games.
* **Game Hosting** drives:

  * Conversion from content to NSM (games hosted).
* **User Management** drives:

  * Acquisition, activation, limits, and monetization paths.

---

# 2. TARGET USERS, PERSONAS & TOP USE CASES

## 2.1 Personas (Standardized)

We normalize personas across sub-PRDs to avoid conflicting assumptions.

### Persona A — High School Teacher (“Alex”)

* **Goals**

  * Quickly create or adapt quizzes for 4–5 classes/day.
  * Use games for formative checks and review.
* **Context**

  * Uses a school laptop (Chromebook/Windows).
  * Projects host view to a classroom display.
  * Works in 10–20 minute gaps between classes.
* **Devices**

  * Host: desktop/laptop (required for creation & hosting).
  * Players: smartphones or school-issued Chromebooks.
* **Usage frequency**

  * Creates quizzes 1–3 times/week.
  * Hosts games several times per week.

### Persona B — Corporate Trainer / L&D Specialist (“Jordan”)

* **Goals**

  * Run onboarding, compliance, and skills sessions.
  * Reuse and adapt master quizzes for different audiences (role, region).
* **Context**

  * Uses company laptop + projector or screen share (Zoom/Teams).
  * Needs polished, accurate content; cannot tolerate obvious AI mistakes.
* **Devices**

  * Host: laptop.
  * Players: laptops, work phones, sometimes remote participants.
* **Usage frequency**

  * Builds or adapts quizzes weekly.
  * Hosts games for trainings/workshops monthly or more.

### Persona C — Event/Community Organizer (“Sam”)

* **Goals**

  * Spin up fun, engaging quizzes for events quickly.
  * Run large games (50–300 players) for meetups, pub quizzes, conferences.
* **Context**

  * Time-constrained before events.
  * Sometimes limited or patchy internet at venues.
* **Devices**

  * Host: laptop or sometimes tablet.
  * Players: mostly phones.
* **Usage frequency**

  * Heavy burst usage around events, then idle periods.

---

## 2.2 Core End-to-End Use Cases (Cross-System)

### Use Case 1 — AI-Driven Classroom Game from PDF

**Narrative** (Alex, teacher):

1. Logs in (User Management, UM-AUTH-*).
2. Uploads a PDF chapter and selects AI quiz generation (AI Generation, AIQ-*).
3. System generates a 15-question quiz (AIQ → Quiz Service via QC-* model).
4. Alex reviews and edits AI questions (Review & Editing, RE-*; Quiz Creation, QC-*).
5. Marks quiz as ready/published.
6. Creates a live game with that quiz (Game Hosting, GH-H-*).
7. Students join using code/QR as guests (Game Hosting, GH-P-*; User Management: guest player model).
8. Game runs; results recorded for later viewing (Game Hosting + Analytics).

Subsystems in play (in order):
**User Management → AI Generation → Quiz Service → Review & Editing → Game Hosting → Analytics**

---

### Use Case 2 — Trainer Reuses and Tweaks Existing Quiz

**Narrative** (Jordan, corporate trainer):

1. Logs in, goes to **Quizzes**.
2. Filters by tags to find “Onboarding – General” (Quiz Management, QC-39–46).
3. Duplicates the quiz and renames to “Onboarding – Sales Edition” (QC-52).
4. Uses AI helpers to rephrase some questions and tweak difficulty (Review & Editing, RE-11–RE-19).
5. Publishes quiz.
6. Hosts a game for a live training group (Game Hosting).
7. Later checks results in basic game summary (Game Hosting + Analytics).

Subsystems:
**User Management → Quiz Creation & Management → Review & Editing (AI helpers) → Game Hosting**

---

### Use Case 3 — Organizer Creates Manual Quiz for Event

**Narrative** (Sam, event organizer):

1. Signs up quickly as host (User Management, UM-AUTH-*).
2. Creates a quiz manually from scratch using the editor (Quiz Creation, QC-9–QC-20, QC-32–38).
3. Publishes the quiz.
4. At event time, starts a game with the quiz and sets max players to 300 (within plan limits, UM-PLAN-*; GH-H-2).
5. Attendees join by scanning QR code (GH-H-4, GH-P-*).
6. Sam runs through questions, shows leaderboard, ends game (GH-*).
7. May replay same quiz in multiple sessions (re-hosting same quiz with different GameSessions).

Subsystems:
**User Management → Quiz Creation → Game Hosting**

---

# 3. HIGH-LEVEL SYSTEM ARCHITECTURE

## 3.1 System Components

### Frontend

* **Host Web App**

  * Dashboard.
  * Quiz list & editor.
  * AI generation flows.
  * Review & editing tooling.
  * Game host & presentation views.
  * Account & usage pages.

* **Player Web App**

  * Join screen (code/nickname).
  * Question/answer views.
  * Result & leaderboard view.

Both are likely implemented as a single SPA with route-based separation, but conceptually we treat them as two primary UX modes.

### Backend Services

1. **User Service**

   * Auth (signup/login/password reset).
   * Profiles & plan info.
   * Limits and usage counters (max players, AI quota, quiz count).

2. **Quiz Service**

   * CRUD for quizzes and questions.
   * Quiz lifecycle states (DRAFT/PUBLISHED/ARCHIVED).
   * Handles autosave and versioning (QC-*).

3. **AI Generation Service**

   * Ingestion of PDFs and URLs.
   * Content extraction and chunking.
   * Azure OpenAI integration (function calling).
   * AIJob orchestration and creation of AI-generated quizzes (AIQ-*).

4. **AI Edit Service (can be part of AI Generation Service)**

   * Per-question AI helpers: regenerate/rephrase (RE-37–RE-39).

5. **Game Service**

   * GameSession lifecycle (LOBBY → IN_PROGRESS → COMPLETED/ABORTED).
   * Real-time messaging & state machine (GH-STATE-*, GH-RT-*).
   * Scoring & leaderboard (GH-S-*).
   * PlayerSession management.

6. **Analytics/Logging Service**

   * Event ingestion.
   * Storage of per-game and per-question stats.
   * Foundation for future dashboards and exports.

### Supporting Infrastructure

* **Real-time messaging layer**

  * WebSocket gateway / hub for:

    * `game:{game_id}` channels.
    * Potentially AI job status push (optional; polling is acceptable v1).
* **Primary DB**

  * Likely relational (Postgres/MySQL) for users, quizzes, games, AIJobs, usage counters.
* **Cache**

  * Redis or similar for:

    * Hot game state.
    * Rate limits.
    * Usage counters for quotas.
* **File storage**

  * Blob storage for:

    * Uploaded PDFs.
    * Optional images/media in questions (future).
* **Monitoring & logging stack**

  * Centralized logs and metrics per service.

---

## 3.2 Component Responsibilities & Boundaries

### User Service (Authoritative for Identity & Limits)

* **Owns**

  * User accounts, authentication, plan_type, account status (active/suspended).
  * Plan limits and usage counters (UM-PLAN-*).
* **Depends on**

  * Email provider (verification/reset).
  * No direct dependency on Quiz/Game/AI; instead they call it.
* **Exposes**

  * `GET /me` for frontend.
  * `GET /users/{id}/limits` for backend services (Quiz, AI, Game) to enforce limits.
  * `POST /usage/*` or internal RPC to update usage counters (AI generation, quiz count, games hosted).

### Quiz Service (Authoritative for Quiz Definitions)

* **Owns**

  * Quiz entity and Questions (QC-1–QC-7).
  * Quiz lifecycle state, tagging, search, duplication.
* **Depends on**

  * User Service (for owner_id validity and plan limits on max_quizzes).
* **Exposes**

  * CRUD APIs (`/quizzes`, `/quizzes/{id}`, `/quizzes/{id}/questions/*`).
  * Query APIs for quiz list & search.
* **Interaction**

  * AI Generation Service calls `POST /quizzes` to create AI quizzes in the same schema.
  * Game Service calls `GET /quizzes/{id}` to load quiz snapshot at game creation.

### AI Generation & AI Edit Service

* **Owns**

  * AIJob entity and job lifecycle.
  * PDF/URL ingestion pipeline.
  * Interaction with Azure OpenAI.
  * Structured quiz outputs & per-question proposals.
* **Depends on**

  * Quiz Service (to create DRAFT AI-generated quizzes).
  * User Service (plan limits and quotas).
  * File storage (PDF uploads).
* **Exposes**

  * `/ai-quizzes/from-pdf`, `/ai-quizzes/from-url`, `/ai-quizzes/status/{job_id}`.
  * `/ai-edit/regenerate-question`, `/ai-edit/rephrase-question`.

### Game Service

* **Owns**

  * GameSession entity (game state, code, settings).
  * PlayerSession entity (nickname, score, status).
  * Answer submissions and scoring.
* **Depends on**

  * User Service (host user and plan limits: max_players_per_game).
  * Quiz Service (for quiz snapshot on game create).
  * Real-time layer.
* **Exposes**

  * `/games` (create/start/next/end).
  * `/games/{id}/answer`.
  * `/games/{id}/state` for reconnects.

### Analytics/Logging

* **Owns**

  * Event taxonomy and storage.
* **Depends on**

  * Event producers: User, Quiz, AI, Game.
* **Exposes**

  * Internal APIs or data warehouse tables; no v1 host UI required beyond minimal metrics.

---

## 3.3 Key Interaction Flows (Textual)

### Flow: AI Quiz from PDF → Edit → Host Game

1. **Host logs in**

   * Frontend: Host app.
   * Backend: User Service (`POST /login`, session established).

2. **Host uploads PDF & configures AI**

   * Frontend: AI wizard view.
   * Backend:

     * Upload PDF to file storage → returns `file_id`.
     * Call AI Generation Service `/ai-quizzes/from-pdf` with `file_id`, `question_count`, `difficulty`, `user_id`.
     * AI Service validates plan & usage via User Service (`GET /users/{id}/limits`).

3. **AIJob runs & creates quiz**

   * AI Service:

     * Extracts text from PDF.
     * Chunks content and calls Azure OpenAI (function calling) per chunk (AIQ-*).
     * Validates questions, runs safety checks.
     * On success, calls Quiz Service `POST /quizzes` with `source=AI_GENERATED` and creates linked Questions.
     * Stores `quiz_id` in AIJob, sets status COMPLETED.

4. **Frontend polls AIJob**

   * Frontend polls `/ai-quizzes/status/{job_id}`.
   * On COMPLETED, receives `quiz_id`.
   * Redirects to quiz editor at `/quizzes/{quiz_id}/edit`.

5. **Host reviews & edits quiz**

   * Frontend: Review & edit UI (RE-1–RE-24) layered on top of base quiz editor (QC-*).
   * Backend:

     * Quiz Service handles autosave and question updates via `PATCH /quizzes/{id}` and question sub-APIs.
     * Optional per-question AI helpers use AI Edit Service.

6. **Host publishes quiz**

   * `POST /quizzes/{id}/publish` or `PATCH` status to PUBLISHED.
   * Quiz now visible in host’s “Host a game” quiz selector.

7. **Host creates game from quiz**

   * Frontend: host selects quiz and configures game (GH-H-2).
   * Backend:

     * Game Service `POST /games` with `quiz_id`, host user_id and settings.
     * Game Service calls User Service for plan limits, ensures `max_players` allowed.
     * Game Service calls Quiz Service `GET /quizzes/{id}` and stores a snapshot of quiz in GameSession.

8. **Players join & play**

   * Player frontend connects to join endpoint with `game_code`, nickname.
   * Game Service validates capacity and returns `player_session_id`.
   * Real-time events broadcast QUESTION_STARTED, QUESTION_ENDED, LEADERBOARD_UPDATED.

9. **Game completes & analytics recorded**

   * Game Service stores summary stats (per question, per player_session).
   * Analytics pipeline logs key events for reporting.

---

### Flow: Player Joining & Answering

1. Player opens `/join` or `/join/{game_code}`.
2. Player enters game code + nickname (GH-P-2).
3. Frontend calls Game Service `POST /games/join`:

   * Validates game exists and is in LOBBY/IN_PROGRESS.
   * Checks host’s plan limits & current player_count.
   * Creates PlayerSession, returns `player_session_id`, initial game state.
   * Subscribes to `game:{game_id}` WebSocket channel.
4. On `GAME_STARTED` / `QUESTION_STARTED` events:

   * Player shows question and options (or only options if host-only mode).
5. Player taps an answer:

   * Frontend sends `POST /games/{id}/answer` with `player_session_id`, `question_id`, `selected_option_id`.
   * Game Service validates:

     * Player is part of game.
     * Question is active.
     * Player hasn’t answered.
   * Records answer and returns `RECORDED` or `TOO_LATE`.
6. On `QUESTION_ENDED`:

   * Player sees correctness and optionally points gained.
7. On `GAME_ENDED`:

   * Player sees final rank and score.

---

# 4. CROSS-SYSTEM DATA MODEL & CONTRACTS

We define canonical entities used across services. Sub-PRDs must rely on these shapes.

## 4.1 Core Entities

### User

* `id` (UUID)
* `email` (unique, nullable for future non-email auth)
* `password_hash` (if password auth)
* `name` (string)
* `avatar_url` (optional)
* `organization` (optional string; future org_id will be separate)
* `preferred_language` (e.g., `en-US`)
* `email_verified` (bool)
* `plan_type` (enum: `FREE`, `PRO`, `EDU`, `ENTERPRISE`)
* `status` (enum: `ACTIVE`, `SUSPENDED`)
* `created_at`, `updated_at`

### Plan / PlanLimits

Not per-user row; global reference.

* `plan_type`
* `max_players_per_game`
* `max_quizzes`
* `max_ai_quizzes_per_month`
* (Future) `max_org_members`, etc.

### UsageCounters

* `id`
* `user_id`
* `period_start` (e.g., first day of month, UTC)
* `period_end`
* `ai_quizzes_generated_count`
* `games_hosted_count`
* `quizzes_created_count` (optional)
* `created_at`, `updated_at`

### Quiz

(from QC-1 with minor generalization)

* `id` (UUID)
* `owner_id` (User.id)
* `organization_id` (nullable, reserved for future)
* `title` (1–200 chars)
* `description` (0–2000 chars)
* `language` (e.g., `en`, `en-US`)
* `tags` (array of strings; max 20)
* `status` (enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`)
* `source` (enum: `MANUAL`, `AI_GENERATED`, `IMPORTED`, `COPIED`)
* `ai_source_type` (nullable enum: `pdf`, `url`, `null`)
* `ai_source_ref` (nullable: file_id or URL)
* `created_at`, `updated_at`
* `last_used_at` (nullable)
* `version` (int, increments on each write; optimistic concurrency)
* `default_question_time_limit_seconds` (nullable)
* `default_question_points` (nullable)

Relationships:

* `Quiz` **has many** `Question` (1:N).

### Question

(QC-3/4 + AI/Review extensions)

* `id` (UUID)
* `quiz_id` (Quiz.id)
* `order_index` (int)
* `type` (enum; v1 uses `MULTIPLE_CHOICE_SINGLE`, `TRUE_FALSE`)
* `text` (1–500 chars)
* `options` (array of `QuestionOption`)
* `correct_option_ids` (array of option IDs; size 1 for v1)
* `time_limit_seconds` (nullable; override quiz default)
* `points` (nullable; override quiz default)
* `explanation` (optional, 0–500 chars)
* `media` (optional array of media refs for future)
* **AI/Review fields**:

  * `is_ai_generated` (bool)
  * `ai_confidence` (nullable float 0–1 or discrete mapped)
  * `review_status` (enum: `NOT_REVIEWED`, `REVIEWED`)
  * `original_ai_payload` (JSON string; initial AI version for comparison)
  * `ai_modified_count` (int)
* `created_at`, `updated_at`

`QuestionOption`:

* `id` (UUID)
* `text` (1–200 chars)
* `order_index` (int)
* `media` (optional)
* (No `is_correct` here; correct IDs kept in `correct_option_ids` to allow multi-correct in future.)

### GameSession

(Game Service’s main entity)

* `id` (UUID)

* `quiz_id` (Quiz.id)

* `quiz_snapshot` (JSON; immutable copy of quiz & questions at game start)

* `host_id` (User.id)

* `code` (string, short alphanumeric)

* `state` (enum: `LOBBY`, `IN_PROGRESS`, `COMPLETED`, `ABORTED`)

* `current_question_index` (int, -1 in lobby)

* `settings` (JSON):

  * `max_players`
  * `default_question_time_seconds`
  * `question_visibility_mode` (`host_and_player` or `host_only`)

* `player_count` (int; denormalized for fast display)

* `created_at`, `started_at`, `ended_at`, `updated_at`

### PlayerSession

* `id` (UUID)
* `game_id` (GameSession.id)
* `user_id` (nullable for guest; filled if registered player later)
* `nickname` (string)
* `score` (int)
* `correct_answers` (int)
* `last_seen_at` (timestamp; for connection status)
* `connection_status` (enum: `CONNECTED`, `DISCONNECTED`)
* `created_at`, `updated_at`

### Answer (per-player per-question)

* `id` (UUID)
* `game_id`
* `player_session_id`
* `question_id` (from `quiz_snapshot`)
* `selected_option_id` (option from snapshot)
* `submitted_at` (timestamp)
* `is_correct` (bool)
* `points_awarded` (int)
* `processed` (bool; for idempotent scoring)
* `created_at`, `updated_at`

### AIJob

(from AIQ-6.5)

* `id` (UUID)
* `user_id` (User.id)
* `source_type` (`pdf` | `url`)
* `source_ref` (file_id or URL)
* `question_count_requested` (int)
* `difficulty` (`easy` | `medium` | `hard` | `mixed`)
* `status` (`PENDING`, `EXTRACTING`, `GENERATING`, `FAILED`, `COMPLETED`)
* `failure_reason` (nullable enum; `ai_error`, `safety_violation`, etc.)
* `failure_message` (nullable, user-facing)
* `quiz_id` (nullable; set on COMPLETED)
* `created_at`, `updated_at`

---

## 4.2 Versioning Strategy

Key rule: **Game sessions must be stable even if the underlying quiz changes later.**

* Quiz service maintains a **single mutable quiz record** with `version` int.
* On **any update** via editor (manual or AI edit), `version` increments.
* Game Service, when creating a game:

  * Fetches full quiz (metadata + questions).
  * Stores a full **snapshot** in `GameSession.quiz_snapshot`.
  * Uses this snapshot for all question text/options, scoring, and analytics for this game.
* Later edits to the quiz **do not affect past games**, because:

  * Game Analytics reference quiz content from `quiz_snapshot`.

Implications:

* **Analytics**:

  * Per-game analytics should always be computed from `quiz_snapshot` to avoid inconsistent stats if quiz text changes later.
* **Replays**:

  * If we add “replay game” later, we can either:

    * Run again from `quiz_snapshot`, or
    * Use latest quiz version; we must be explicit in design.
* **Reusing quizzes**:

  * Duplicate (`/quizzes/{id}/duplicate`) is a deep copy; new quiz + new question IDs.
  * Edit-once-use-many is supported by editing the base quiz then starting new games from it.

No explicit `QuizVersion` entity in v1; snapshot approach is simpler and aligns with sub-PRDs.

---

## 4.3 High-Level API Contracts (Cross-Service)

### User Service APIs (conceptual)

* `GET /me`

  * **Used by**: Frontend (host app).
  * **Returns**: User profile, plan_type, plan limits & current usage.

* `GET /users/{id}/limits`

  * **Used by**: Quiz Service, AI Service, Game Service.
  * **Returns**: `plan_type`, `max_players_per_game`, `max_quizzes`, `max_ai_quizzes_per_month`, `usage`.

* `POST /usage/ai-quiz-generated`

  * **Used by**: AI Generation Service on successful quiz creation.
  * **Input**: `user_id`, `job_id`, `quiz_id`.
  * **Effect**: increments `ai_quizzes_generated_count`.

* `POST /usage/quiz-created`

  * **Used by**: Quiz Service on new quiz creation.
  * **Effect**: increments `quizzes_created_count`.

* `POST /usage/game-hosted`

  * **Used by**: Game Service when game starts.
  * **Effect**: increments `games_hosted_count`.

### Quiz Service APIs

* `POST /quizzes`

  * Used by frontend (manual create) and AI service (AI create).
  * Input: quiz metadata; optional initial questions.
  * Output: quiz object (QC-1, QC-3).

* `GET /quizzes/{quiz_id}`

  * Used by editor (frontend) and Game Service.
  * Output: quiz + questions.

* `PATCH /quizzes/{quiz_id}`

  * Used by editor for metadata and bulk updates; includes `version` for optimistic concurrency.

* `GET /quizzes` (list with filters/search)

  * Used by host dashboard.

* `POST /quizzes/{quiz_id}/publish`

  * Used by editor to set status=PUBLISHED; performs validation.

* `POST /quizzes/{quiz_id}/duplicate`

  * Used by UI to clone a quiz.

* `POST /quizzes/{quiz_id}/archive` / `/restore`

  * State transitions for quiz lifecycle.

### AI Service APIs

* `POST /ai-quizzes/from-pdf`

  * Input: `file_id`, `question_count`, `difficulty`.
  * Output: `job_id`.

* `POST /ai-quizzes/from-url`

  * Input: `url`, `question_count`, `difficulty`.
  * Output: `job_id`.

* `GET /ai-quizzes/status/{job_id}`

  * Output: `status`, `failure_reason`, `failure_message`, `quiz_id`, `generated_question_count`.

* `POST /ai-edit/regenerate-question`

  * Input: `quiz_id`, `question_id`, source context, current question content.
  * Output: `proposed_question` payload.

* `POST /ai-edit/rephrase-question`

  * Similar, with constraints on preserving correctness.

AI service will internally call:

* Quiz Service: to create quiz on `COMPLETED`.
* User Service: to check & update AI usage.

### Game Service APIs

* `POST /games`

  * Input: `quiz_id`, `settings` (max_players, default_question_time, visibility).
  * Behavior:

    * Check host plan type and usage with User Service.
    * Load quiz and store `quiz_snapshot`.
  * Output: `game_id`, `game_code`, `join_url`, initial state.

* `POST /games/{id}/start`

  * Starts game from LOBBY; emits `GAME_STARTED` + `QUESTION_STARTED`.

* `POST /games/{id}/next-question`

  * Moves to next question or completes game.

* `POST /games/{id}/end` / `/abort`

  * Ends or cancels game.

* `POST /games/{id}/join`

  * Input: `game_code`, `nickname`.
  * Behavior:

    * Enforces `max_players` (plan-specific).
    * Creates PlayerSession.
  * Output: `player_session_id`, `initial_game_state`.

* `POST /games/{id}/answer`

  * Input: `player_session_id`, `question_id`, `selected_option_id`.
  * Output: status `RECORDED` / `TOO_LATE` / `INVALID`.

* `GET /games/{id}/state`

  * Used for reconnect; returns full game state snapshot for host/player.

### AIJob/Analytics APIs

* Only internal; they provide job status and event emitting. No host-facing UI in v1 beyond simple usage counts.

---

# 5. END-TO-END USER FLOWS (CROSS-FEATURE)

## 5.1 Flow A – “AI-Driven Game from PDF”

**Goal**: Host starts from a PDF and ends with a completed game.

### Step 1 – Host signs up or logs in (User Management)

* **UI**: Login/Signup page.
* **Backend**:

  * `POST /signup` or `POST /login`.
  * User Service creates/returns session.
* **Data**:

  * New `User` with `plan_type=FREE`.
  * Session cookie/token established.

### Step 2 – Host uploads PDF & configures AI settings (AI Generation)

* **UI**: “Create quiz → From PDF (AI)” wizard (AIQ-70–AIQ-74).
* **Backend**:

  * File upload → file storage returns `file_id`.
  * Host chooses `question_count` (5–25), `difficulty`.
  * Frontend calls `POST /ai-quizzes/from-pdf`.
  * AI Service:

    * Checks limits via User Service (`max_ai_quizzes_per_month`, usage).
    * Creates `AIJob` in DB with `status=PENDING`.
* **Data transitions**:

  * `AIJob` created with reference to `user_id` and `file_id`.

### Step 3 – AIJob runs, generates quiz, stores it (AI Service + Quiz Service)

* **Backend (AI worker)**:

  * `AIJob.status` → `EXTRACTING` → `GENERATING` → `COMPLETED/FAILED`.
  * Extracts text, chunks, calls Azure OpenAI (function calling) (AIQ-80–AIQ-113).
  * Validates and filters questions; ensures safe content (AIQ-120–AIQ-135).
  * Creates new `Quiz` via `POST /quizzes` with:

    * `status=DRAFT`, `source=AI_GENERATED`, `ai_source_type=pdf`, `ai_source_ref=file_id`.
    * Questions with `is_ai_generated=true`, `review_status=NOT_REVIEWED`.
  * On success:

    * `AIJob.quiz_id` set.
    * `AIJob.status=COMPLETED`.
    * Calls User Service `POST /usage/ai-quiz-generated`.
* **Data transitions**:

  * New `Quiz + Questions` in Quiz Service.
  * AI usage counters incremented.

### Step 4 – Host reviews & edits AI quiz (Review & Editing + Quiz Creation)

* **UI**:

  * Frontend polls `/ai-quizzes/status/{job_id}`.
  * On `COMPLETED`, redirect to `/quizzes/{quiz_id}/review`.
  * Review UI as per RE-*:

    * Question list with AI badges.
    * Detail pane with AI helper buttons.
    * Bulk operations.
* **Backend**:

  * Quiz Service handles all edits via `PATCH` and question operations.
  * AI Edit Service handles per-question regenerate/rephrase.
* **Data transitions**:

  * Same `Quiz` record updated.
  * `review_status` fields change.
  * Optionally `is_ai_generated` stays true but `ai_modified_count` increments.

### Step 5 – Host publishes quiz (Ready to host)

* **UI**:

  * Host clicks “Mark as ready to host” / “Publish”.
* **Backend**:

  * `POST /quizzes/{id}/publish` or `PATCH status=PUBLISHED`.
  * Validation: at least one valid question; no invalid questions.
* **Data transitions**:

  * `Quiz.status` goes from `DRAFT` to `PUBLISHED`.

### Step 6 – Host creates & starts live game (Game Hosting)

* **UI**:

  * Host chooses “Host game” on quiz card, configures:

    * `max_players` (<= plan limit).
    * `default_question_time`.
    * Visibility mode.
* **Backend**:

  * `POST /games` with `quiz_id` and settings.
  * Game Service:

    * Validates host plan via User Service.
    * Fetches quiz with `GET /quizzes/{id}`.
    * Stores `quiz_snapshot`.
    * Generates `code` and `join_url`.
  * Host sees lobby (code/QR, joined player count).
* **Data transitions**:

  * `GameSession` created with `state=LOBBY`.

### Step 7 – Players join and play (Game Hosting + Player Client)

* **UI**:

  * Players go to `/join` or `/join/{code}`.
  * Enter `nickname` and join.
* **Backend**:

  * `POST /games/{id}/join`:

    * Validates `code`.
    * Checks `max_players` vs `player_count`.
    * Creates `PlayerSession` and returns `player_session_id`.
    * Emits `PLAYER_JOINED`.
  * Host starts game:

    * `POST /games/{id}/start`.
    * `state` → `IN_PROGRESS`.
    * Emits `GAME_STARTED` + `QUESTION_STARTED`.
  * Players answer via `POST /games/{id}/answer`.
* **Data transitions**:

  * `PlayerSession` records accumulate.
  * `Answer` records created per submission.

### Step 8 – Host sees final leaderboard and stats (Game + Analytics)

* **UI**:

  * At end, host sees leaderboard view and basic stats (top players, number of correct answers).
* **Backend**:

  * Game Service calculates final scores and ranks.
  * Emits `GAME_ENDED` + `LEADERBOARD_UPDATED`.
  * Writes summary analytics rows:

    * Per question stats.
    * Per player stats.
* **Data transitions**:

  * `GameSession.state` → `COMPLETED`.
  * Analytics data ready for future dashboards/exports.

---

## 5.2 Flow B – “Manual Quiz Creation & Game”

1. Host logs in (User Service).
2. Dashboard → “Create new quiz” (QC-9–QC-14).
3. Editor opens with DRAFT quiz.
4. Host manually adds questions, options, correct answers (QC-13–QC-18).
5. Publishes quiz (`status=PUBLISHED`).
6. Hosts game from quiz as in Flow A Step 6–8.
7. Analytics as usual.

Key cross-cutting points:

* **User limits**:

  * Quiz creation counts toward `max_quizzes` (UM-PLAN-9/10).
* **Versioning**:

  * Game uses snapshot; later edits to quiz don’t affect game results.

---

## 5.3 Flow C – “Reusing and Updating an Existing Quiz”

1. Host logs in and goes to **Quizzes**.
2. Filters/searches to find an existing quiz (QC-39–QC-43).
3. Chooses:

   * **Option A**: Reuse directly

     * Open quiz (PUBLISHED), optionally edit minor things.
     * Host game; GameService takes snapshot at game creation.
   * **Option B**: Duplicate and adapt

     * Click “Duplicate” → new DRAFT quiz (QC-51–QC-52).
     * Use AI helpers per question to adjust difficulty/phrasing (RE-11–RE-19).
     * Publish and host.
4. User limits:

   * Duplicate counts as new quiz: enforce `max_quizzes` (UM-PLAN-3).
5. Game & analytics behavior identical to other flows.

Permissions & limits:

* Only quiz owner can duplicate/edit (UM-PERM-4).
* Game start enforces plan’s `max_players_per_game` (UM-PLAN-9).

---

# 6. EXPERIENCE PRINCIPLES & UX FRAMEWORK

## 6.1 Experience Principles

1. **Fast to first game**

   * Minimize steps from signup to first live game.
   * Default flows: “Create quiz” and “Host game” as primary dashboard CTAs.
   * AI flows should lead directly into review then hosting.

2. **Host in control, AI assists**

   * AI generation and AI edits are always **proposals**, never auto-applied silently.
   * Hosts must explicitly accept AI-generated quizzes and per-question AI edits.

3. **Players focus on answering**

   * Player UI is minimal, mobile-first, and distraction-free.
   * Only essential elements: question (or answer choices), timer, clear feedback.

4. **Predictable states**

   * Clear statuses for:

     * Quizzes: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
     * Games: `LOBBY`, `IN_PROGRESS`, `COMPLETED`, `ABORTED`.
   * Clear transitions and UI mapping to these states.

5. **Safe, professional defaults**

   * Avoid surprising AI content (safety filters, clear warnings).
   * Avoid unexpected data loss (autosave everywhere).

---

## 6.2 Cross-Product UI Structure

### IA for Host

Main navigation:

1. **Dashboard**

   * Overview of recent quizzes and games.
   * “Create quiz” and “Host a game” CTAs.

2. **Quizzes**

   * List view with search, filters, tags (QC-39–QC-46).
   * Actions: create, edit, duplicate, archive.
   * AI-generated and manual quizzes in the same list, with badges.

3. **AI (optional separate section or integrated)**

   * Shortcuts to:

     * “Create from PDF (AI)”
     * “Create from webpage (AI)”
   * Could also be entry points from “Create quiz” dropdown.

4. **Games**

   * Active/Recent games (basic history).
   * In v1, only minimal list; detailed analytics dashboards are Phase 2.

5. **Account**

   * Profile details.
   * Plan & limits.
   * Usage counters (AI quota, quiz count).
   * Security (password, email verification).

### Patterns

* **Lists + detail views**:

  * Quizzes: list → editor.
  * Games: list → basic detail.
* **Two-pane layout** for:

  * Quiz editor (question list + detail).
  * AI review screen (same editor with extra controls).
* **Consistent modals**:

  * Confirmations (delete/archive, end game).
  * Validation errors.

---

## 6.3 Visual & Interaction Direction

* **Style**

  * Bold but simple; high-contrast for classroom projection.
  * Minimal text in game screens.
* **Color usage**

  * State colors:

    * Active game, completed, archived.
  * Correct vs incorrect answers:

    * Must use both color and icon/text (✓ / ✗, “Correct/Incorrect”).
* **Interaction pattern consistency**

  * Save: autosave everywhere with consistent status indicator.
  * Destructive actions: confirm dialogs + undo toast where appropriate (RE-25–27, QC-29–31).
  * Error handling: inline messages plus non-blocking banners; never silent failures.

Accessibility:

* WCAG AA contrast.
* Keyboard navigation for host flows.
* Large touch targets for answers.

---

# 7. PLATFORM CAPABILITIES, PERFORMANCE & SCALE

## 7.1 Real-Time & Concurrency Requirements

* **Max concurrent players per game**: 300 (GH-RT-15).

* **Simultaneous games (early phase target)**:

  * At least 10 games at full capacity (300 players each).
  * Architecture should scale beyond this with additional infra; we design data model and code assuming more.

* **Latency targets**:

  * Question broadcast (server → clients): median < 300ms, 95th percentile ≤ 500ms (GH-RT-13).
  * Answer recording: server response ≤ 300ms for typical load.
  * Leaderboard update after question end: ≤ 3 seconds (GH-RT-14).

---

## 7.2 AI Usage & Cost Constraints

* **Per-user AI budgets** (initial, subject to tuning):

  * FREE plan:

    * `max_ai_quizzes_per_month` ≈ 10 (UM-PLAN-3).
  * PRO/EDU/ENT:

    * Higher quotas (e.g., 50–200), TBD.

* **Rate limits**:

  * Burst limit: e.g., 5 AI generations per minute per user.
  * Per-question AI helpers (regenerate/rephrase):

    * e.g., 50 AI calls per quiz per day (RE-17).

* **Timeouts**:

  * AIJob overall timeout: e.g., 2–3 minutes; on timeout, mark as FAILED (AIQ-110–113).
  * Per-chunk Azure call: e.g., 30–60 seconds.

* **Behavior when quota exhausted**:

  * AI Generation:

    * Block new AI job creation; show messaging:

      * “You’ve reached your AI quiz limit for this month on the Free plan.”
      * CTA: see plan & upgrade path.
  * AI Edit:

    * Disable AI helper buttons with tooltip about usage limits.
  * Manual quiz creation remains unrestricted (except max_quizzes).

---

## 7.3 Performance Targets for Key Actions

* **Dashboard load**:

  * ≤ 1 second server-side processing for typical host (quizzes < 100, games < 50 recent).
* **Quiz editor open** (quiz <= 50 questions):

  * ≤ 700ms server response.
* **AI job status polling**:

  * Poll interval: 2–3 seconds.
  * Expect most jobs to complete in < 60 seconds for typical documents.
* **Game join**:

  * From hitting “Join” to being in LOBBY: ≤ 1 second server time.
* **Game transitions**:

  * LOBBY → first question: ≤ 2 seconds end-to-end (M1 in GH).

These are internal guidance, not user-facing SLAs.

---

# 8. SECURITY, PRIVACY & COMPLIANCE EXPECTATIONS

## 8.1 Security Expectations

* **Transport security**

  * All endpoints served over HTTPS.
* **Credential handling**

  * Passwords hashed with strong algorithm (UM-AUTH-15).
  * Reset tokens and verification tokens time-limited and single-use.
* **Secrets**

  * Azure OpenAI keys, DB credentials kept server-side only; never exposed to clients.
* **Service-to-service auth**

  * Internal services must authenticate to each other (e.g., via service tokens).
* **Access control**

  * Quiz and Game endpoints must enforce owner-based access:

    * Only `owner_id` can edit/host their quiz.
    * Only host of a game can control or view detailed results.

---

## 8.2 Privacy & Data Handling

* **User content**

  * PDFs, quizzes, game logs are private to the host (and their future org).
* **Retention expectations (v1)**

  * Uploaded PDFs:

    * Stored in blob storage; retention at least for the life of the quiz that references them.
  * Quizzes & game logs:

    * Retain for at least 6–12 months minimum (exact policy TBD) to enable reuse and analytics.
* **AI Training**

  * Default: **we do not use user content for training models** (must be documented in product copy).
  * If changed later, requires explicit opt-in at org/user level.
* **Player data**

  * Only nickname and game performance; no PII required for players in v1.
* **Compliance**

  * The design should not assume sensitive PII; if used in schools, we may need data processing addendum, but that’s outside v1 feature scope.

---

# 9. ANALYTICS, LOGGING & ADMIN VISIBILITY

## 9.1 Analytics Requirements

**Event taxonomy (non-exhaustive but required)**

* Auth & account:

  * `user_signed_up`, `user_logged_in`.
* Quiz lifecycle:

  * `quiz_created`, `quiz_published`, `quiz_archived`, `quiz_restored`.
  * `quiz_ai_generated` (AIQ-*).
* AI editing:

  * `question_ai_regenerate_triggered/accepted/discarded`.
  * `question_ai_rephrase_triggered/accepted/discarded`.
* Game lifecycle:

  * `game_created`, `game_started`, `game_completed`, `game_aborted`.
* Game participation:

  * `player_joined_game`, `player_answered_question`.
* Plan/limits:

  * `ai_quota_warning`, `ai_quota_exhausted`, `max_players_exceeded`.

**Funnels**

* Signup → first quiz created → first game hosted.
* AI quiz generated → AI quiz edited → AI quiz published → game hosted with AI quiz.

---

## 9.2 Logging & Debugging

* **AI pipeline**

  * Log AIJob transitions and reasons for failures:

    * `ai_error`, `safety_violation`, `invalid_ai_output`, etc.
  * Store limited prompt and output metadata in AI logs table with retention (e.g., 30 days max).

* **Game issues**

  * Log:

    * `QUESTION_STARTED` and `QUESTION_ENDED` with timestamps.
    * Number of answers received vs player_count per question.
    * Disconnection bursts.

* **Admin visibility (minimal v1)**

  * Internal tooling (doesn’t need polished UI):

    * View AIJob by id and status.
    * View basic game session stats by id.

---

# 10. PLANS, TIERS & MONETIZATION FRAMEWORK

## 10.1 Plan Strategy Overview

* **FREE plan (v1)**:

  * Intended to be clearly more capable than competitor free tiers:

    * Max players per game: ~50 (configurable).
    * AI quota: ~10 AI quizzes/month.
    * Reasonable quiz storage: ~20 quizzes.
* **Future paid tiers (PRO, EDU, ENTERPRISE)**:

  * Higher player caps (up to 300 players per game).
  * More AI quota (tens to hundreds of AI generations).
  * Larger quiz libraries.
  * Potential advanced analytics and org features.

The master PRD doesn’t fix exact pricing; it defines **where limits apply** and **how enforcement works**.

---

## 10.2 Limits & Flags (Cross-System Requirements)

**Where limits apply**

1. **Max players per game**

   * Enforced in Game Service:

     * When host creates a game, `settings.max_players` must be <= their plan’s `max_players_per_game`.
     * On join, if current `player_count` >= `max_players`, join is rejected.

2. **AI generations per month**

   * Enforced in AI Service:

     * Before creating new AIJob, check `ai_quizzes_generated_count` vs plan’s `max_ai_quizzes_per_month`.
     * On success, increment usage via User Service.

3. **Max quizzes stored**

   * Enforced in Quiz Service:

     * On `POST /quizzes`, check host’s `quizzes_created_count` or active quizzes vs plan’s `max_quizzes`.
     * “Active” defined as non-ARCHIVED or all quizzes depending on final decision (we recommend counting non-ARCHIVED; archived count may be unlimited or higher cap).

**Behavior when limits reached**

* **In-context messaging**:

  * Example for AI:

    * On AI generation button click:

      * “You’ve reached your Free plan AI quiz limit for this month. Upgrade to generate more quizzes.”
  * Example for game capacity:

    * Host: “Your plan allows up to 50 players per game. Upgrade to host larger sessions.”
    * Player: “This game is full (50 players). Ask your host to start a new game.”

* **Upsell surfaces**:

  * From:

    * AI wizard when blocked.
    * Game lobby when hitting player cap.
    * Account → Plan section.
  * No spammy modals; just clear CTAs to learn more or upgrade.

---

# 11. RISK REGISTER & CROSS-CUTTING OPEN QUESTIONS

## 11.1 Major Risks

1. **Real-time infra doesn’t scale to 300 players gracefully**

   * Symptoms: high latency, dropped connections, inconsistent state.
2. **AI quality is too low**

   * Hosts must heavily edit AI output, reducing perceived value.
3. **AI inference costs exceed revenue**

   * Overuse of AI features on free plans.
4. **Abuse/misuse**

   * Inappropriate AI content slipping through filters.
   * Offensive player nicknames and trolling.
5. **Onboarding friction**

   * Too strict limits or verification hurdles reduce signups and first games.

---

## 11.2 Mitigations

1. **Real-time scaling**

   * Load testing at target concurrency (300 players * 10 games).
   * Limit per-game features that are expensive (e.g., avoid sending full leaderboard to every player every second).
   * Use snapshot-based reconnection to reduce state complexity.

2. **AI quality**

   * Strong prompts restricting to source content.
   * Safety filter on all output.
   * Encourage human review (RE-1–RE-3; AI badges, “AI-generated” messaging).
   * Incremental improvement via prompt tuning and model selection.

3. **AI cost**

   * Aggressive, monitored limits on AI usage per plan.
   * Short bursts and monthly quotas.
   * Logging of prompt/completion tokens for cost analysis.

4. **Abuse/misuse**

   * Basic nickname filters + error feedback.
   * Store owner_id, quiz_id for moderation.
   * Ability to suspend user accounts (UM-ABUSE-6–UM-ABUSE-9).

5. **Onboarding friction**

   * Allow hosting games with small limits without email verification.
   * Defer SSO and complex org flows to later; keep v1 simple.

---

## 11.3 Open Questions (Cross-Subsystem)

These need product/leadership decisions; architecture should not block either answer.

1. **Exact free-tier limits at launch**

   * Are we comfortable with 50 max players and 10 AI quizzes/month for FREE? Or start slightly lower/higher?

2. **Email verification gating**

   * Do we require verified email to:

     * Host bigger games (e.g., >50 players)?
     * Use AI at all?
   * Current assumption: **not required** for small-scale use; required for upgrades.

3. **Player identity persistence**

   * Do we want optional player accounts for tracking performance over time?
   * v1: **no**; all players are guest or ephemeral.

4. **Handling of archived quizzes in limits**

   * Do archived quizzes count toward plan’s `max_quizzes`?
   * Recommendation: count only non-ARCHIVED quizzes for enforcement.

5. **Retention of game analytics**

   * For how long do we keep detailed per-question/player stats?

---

# 12. ROADMAP & PHASED DELIVERY

## 12.1 MVP / v1 Scope (IN vs OUT)

### In Scope (v1)

* **Quiz Creation & Management**

  * Manual quiz creation and editing.
  * Basic question types: multiple-choice (single answer), true/false.
  * Quiz lifecycle: DRAFT, PUBLISHED, ARCHIVED.
  * Quiz search & tagging.
  * Duplicating and reusing quizzes.

* **AI from PDF/Web**

  * Generate quizzes from PDFs and URLs with configurable question count and difficulty (AIQ-*).
  * Async job model with status polling.
  * Safety filter and quality validation.
  * AI-generated quizzes stored in same quiz schema.

* **Review & Editing**

  * Review view for AI-generated quizzes with:

    * Per-question review status.
    * Basic AI helpers (regenerate, rephrase).
    * Bulk operations and validation.

* **Game Hosting & Playing**

  * Single-host game sessions.
  * Up to 300 players per game (technical cap, plan-limited).
  * Lobby, question, results, and final leaderboard views.
  * Real-time WebSocket-based updates.
  * Simple equal-weight scoring model (1000 per correct answer).

* **User Management**

  * Email/password auth for host accounts.
  * Basic profile & plan display.
  * Free plan with limits on:

    * Max players per game (e.g., 50).
    * Max AI quizzes per month.
    * Max stored quizzes.
  * Guest players (no login) via game code.

* **Analytics & Logging**

  * Instrumentation for key events (creation, AI, games).
  * Minimal internal views for debugging AI jobs & game issues.

### Out of Scope (v1)

* Organizations & team accounts (shared quizzes, org roles).
* SSO (Google/Microsoft) and enterprise auth.
* Advanced analytics dashboards and exports UI (data model should support later).
* Additional question types (multi-select, numeric, matching, etc.).
* Complex game modes (team play, streak bonuses, advanced scoring).
* Rich media, videos, and complex content in questions.

---

## 12.2 Phase 2+ Epics (Future)

1. **More question types & game modes**

   * Multi-select, numeric, ordering, image-based questions.
   * Team-based games, “fastest finger first”, etc.
   * Depends on flexible `Question.type` and GameService scoring abstractions defined now.

2. **Organizations & Multi-Host**

   * org_id on users/quizzes/games.
   * Permissions model (Owner/Editor/Viewer).
   * Shared quiz libraries.
   * Multi-host/co-hosting for large events.

3. **Rich analytics & exports**

   * Web dashboards per game, per quiz, per host.
   * CSV/JSON exports.
   * Trends over time per host/quiz.

4. **SSO, Payments & Plans UI**

   * SSO for EDU/Enterprise.
   * Payments integration for PRO plans.
   * Full upgrade flows and plan management.

5. **Deeper AI integrations**

   * OCR for scanned PDFs.
   * AI difficulty adjustment and explanation generation improvements.
   * AI assistance during live games (e.g., hint generation).

All of these are supported by:

* Entity model with `organization_id` placeholders.
* Snapshot-based versioning (quiz snapshot in game).
* Plan & usage counters linked to User Service.
* Extensible `Question.type` and `Question.options` structure.

---

**This master PRD should be treated as the canonical reference for v1 architecture, data model, and cross-system behavior.**
Sub-PRDs (Quiz Creation & Management, AI Generation, Review & Editing, Game Hosting & Playing, User Management) define deeper details inside each domain and must align with this document’s contracts and constraints.
