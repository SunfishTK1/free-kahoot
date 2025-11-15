## Product Requirements Document — Game Hosting & Playing

**Product area:** Live Game Experience (host & player real-time game loop)
**Version:** v1 (supports up to ~300 concurrent players per game)

---

## 1. Problem Statement & Goals

### 1.1 Problem Statement

Our platform lets users create quizzes and run live games. The core value is realized during the **live session**: a host projects the game, and players participate on their own devices in real time. If this experience is laggy, confusing, or brittle under load, the product fails at its main job.

We need a **stable, low-friction** game loop that:

* Hosts can easily start and control in front of a class/workshop.
* Players can quickly join and understand, regardless of login status.
* Performs reliably with up to ~300 concurrent players.

### 1.2 Goals

* **G1 – Easy join experience**

  * Player can join via short game code or direct URL/QR.
  * Minimal required fields (code + nickname).
  * No login required for players in MVP (guest play allowed).

* **G2 – Low-friction host control**

  * Host can start, pause/skip, and end games with minimal clicks.
  * Clear visibility into current state, question number, player participation.

* **G3 – Real-time clarity**

  * All players see questions and timers in sync.
  * Host sees live progress (how many answered, distribution).
  * Leaderboard and per-question results update quickly.

### 1.3 Metrics

* **M1 – Start-to-question latency**

  * Median time from host clicking “Start game” to players seeing the first question: **≤ 2 seconds**.

* **M2 – Join & participation conversion**

  * % of players who:

    * Enter a valid game code and nickname, **and**
    * Successfully answer at least one question.
  * Target: **≥ 90%**.

* **M3 – Real-time quality**

  * % of games with any user-reported lag/disconnect issues: **≤ 5%**.
  * Median question broadcast latency (host → all clients): **≤ 500ms**.

---

## 2. User Roles & Scenarios

### 2.1 Roles

* **Host**

  * Teacher/trainer/facilitator.
  * Has an account and is logged in.
  * Selects quiz, configures session settings, and controls game flow.
  * Typically uses desktop/laptop, connected to projector or shared screen.

* **Player**

  * Participant in the game session.
  * Device: primarily mobile (phones), but also tablets/laptops.
  * **MVP:** can play as guest (no login required).
  * May optionally be logged in (future: tracking stats, achievements).

### 2.2 Scenarios

1. **S1 – Standard classroom game (30–40 players)**

   * Host selects quiz, sets 20s per question.
   * Students join via projected game code & QR.
   * All answer questions; host shows leaderboard and exports results later.

2. **S2 – Large workshop (up to 300 players)**

   * Host sets max players = 300.
   * Many people join within 2–3 minutes.
   * Host starts game once they have a quorum; some late joiners join mid-game.

3. **S3 – Late joiners**

   * Players join after game has started.
   * By default in MVP, late joiners:

     * Join current or next question.
     * Cannot answer past questions.

4. **S4 – Host control mid-game**

   * Host notices confusion; pauses game between questions or ends early.
   * Host skips a question if it’s problematic.

5. **S5 – Connection issues**

   * A subset of players briefly lose connectivity.
   * On reconnection, they’re restored to current game state (current question or results) if the game is still ongoing.
   * Host briefly disconnects; game continues for a grace period, and host can resume control.

---

## 3. Game Lifecycle & States

### 3.1 Game State IDs

* **GH-STATE-1: LOBBY**

  * Game session created.
  * Players can join.
  * Host has not yet started the game.

* **GH-STATE-2: IN_PROGRESS**

  * Game has started.

  * Contains nested per-question states:

  * **GH-STATE-2A: QUESTION_INTRO (optional)**

    * Question is announced on host view; timer not yet started.
    * Players see “Get ready” / question preview if host setting allows.

  * **GH-STATE-2B: QUESTION_ACTIVE**

    * Timer running.
    * Players can submit answers.
    * Host sees live answer counts.

  * **GH-STATE-2C: QUESTION_RESULTS**

    * Question closed for answers.
    * Correct answer revealed.
    * Answer distribution and per-player correctness calculated.
    * Leaderboard may be updated and shown.

* **GH-STATE-3: COMPLETED**

  * All questions completed OR host ends game early.
  * Final leaderboard is shown to host and players.

* **GH-STATE-4: ABORTED**

  * Host cancels game before completion (e.g., from LOBBY or IN_PROGRESS).
  * Players see a “Game cancelled” message and cannot submit further answers.

### 3.2 State Transitions

* **GH-STATE-1 → GH-STATE-2 (LOBBY → IN_PROGRESS)**

  * Trigger: Host clicks “Start game”.
  * Initial per-question state: either QUESTION_INTRO or directly QUESTION_ACTIVE depending on settings.

* **GH-STATE-2A → GH-STATE-2B (INTRO → ACTIVE)**

  * Trigger: Host clicks “Start question” or auto-advance after short delay (e.g. 2–3 seconds).
  * Timer starts for the question.

* **GH-STATE-2B → GH-STATE-2C (ACTIVE → RESULTS)**

  * Trigger: Timer expires OR host clicks “End question now”.
  * New answers no longer accepted.

* **GH-STATE-2C → GH-STATE-2A or GH-STATE-2B (RESULTS → next question)**

  * Trigger: Host clicks “Next question”.
  * If last question completed:

    * GH-STATE-2C → GH-STATE-3 (COMPLETED).

* **GH-STATE-2 or GH-STATE-1 → GH-STATE-4 (ABORTED)**

  * Trigger: Host clicks “End & cancel game”.
  * All clients show cancelled message; channel remains read-only.

* **GH-STATE-2 → GH-STATE-3 (IN_PROGRESS → COMPLETED)**

  * Trigger: Host clicks “End game now” (early end) or final question completed.

---

## 4. Host Experience – Detailed Requirements

Requirement IDs: **GH-H-***.

### 4.1 Starting a Game

* **GH-H-1**
  Host can select a quiz from:

  * “My Quizzes” list.
  * AI-generated quizzes.
  * System passes `quiz_id` to game service.

* **GH-H-2**
  Host can open a “New Game” setup screen where they configure:

  * **Max players**

    * Input: integer.
    * Default: 100.
    * Hard max: 300 (enforced by backend; additional join attempts are rejected with clear error).

  * **Default question time (seconds)**

    * Options: 10, 20, 30, 45, 60 (dropdown).
    * Default: 20 seconds.
    * If quiz has per-question overrides, those take precedence.

  * **Question visibility mode**

    * Option A (default): Questions appear on both host and player devices.
    * Option B: Questions appear only on the host’s “presentation” screen; players see answer options only.
    * Stored as a game setting (`question_visibility_mode`).

* **GH-H-3**
  On game creation:

  * System creates unique `game_id`.
  * Generates:

    * Short **game code** (e.g., 6 characters, alphanumeric).
    * **Join URL**: `https://app.example.com/join/{game_code}`.
  * Game state initialized to **GH-STATE-1 (LOBBY)**.

* **GH-H-4**
  Host LOBBY view must include:

  * Large **game code** (high contrast).
  * QR code that encodes join URL.
  * Live count of joined players (e.g., “23 players joined”).
  * Scrollable list or summarized list of player nicknames:

    * List ordered by join time.
    * For large groups, show first N (e.g. 20) plus “+X more”.

* **GH-H-5**
  Host can access basic game settings summary in LOBBY:

  * Quiz title, number of questions.
  * Default question time (and note if quiz-specific times exist).
  * Max players.
  * Question visibility mode.

### 4.2 Controlling the Game

* **GH-H-6**
  From LOBBY, host can:

  * Click “Start game” → transitions to **GH-STATE-2A or 2B**.
  * Click “End & cancel game” → transitions to **GH-STATE-4 (ABORTED)**; all players see cancellation.

* **GH-H-7**
  During **IN_PROGRESS**, host has access to a persistent control bar:

  * “Previous question” (optional – v1 can omit; default: NO previous for simplicity).
  * “Next question.”
  * “End game.”
  * For QUESTION_ACTIVE:

    * “Pause timer” (optional in MVP; see GH-H-8).
    * “End question now” (force-close).

* **GH-H-8** (Optional for MVP; can be deferred)
  If implemented, **Pause timer** behavior:

  * Pauses countdown.
  * Players cannot change answers once paused (still locked).
  * Host can resume timer or end question.

* **GH-H-9**
  Host UI must display current question context:

  * “Question X / N” clearly visible.
  * Question text preview.
  * Timer countdown (seconds remaining) during QUESTION_ACTIVE.
  * “Waiting for next question” during QUESTION_INTRO and RESULTS.

* **GH-H-10**
  Host UI must display real-time response metrics in QUESTION_ACTIVE:

  * Number of players who have submitted answers / total players in game.
  * Percentage answered.
  * Optional: per-option answer counts (live or only after question ends; for v1, after question ends is sufficient).

* **GH-H-11**
  Host can **skip a question**:

  * When triggered:

    * Immediately ends current question (if active).
    * Moves to next question’s INTRO/ACTIVE without awarding points.
  * In RESULTS for skipped questions:

    * Indicate “Question skipped – no points awarded.”

* **GH-H-12**
  Host can **end game early** from any point in IN_PROGRESS:

  * Transitions to **GH-STATE-3 (COMPLETED)**.
  * Leaderboard is calculated based on completed questions only.

### 4.3 Viewing Results & Leaderboard

* **GH-H-13**
  After QUESTION_ACTIVE ends, host enters QUESTION_RESULTS state for that question:

  * See correct answer highlighted.
  * See aggregated answer distribution:

    * Counts and percentages per option.
    * Minimal chart (bar chart) on host’s presentation view.

* **GH-H-14**
  Host has toggle to “Show results on projector”:

  * When on:

    * Presentation view shows results chart and correct answer.
  * When off:

    * Host sees results only in a control panel; projector can show next question preview or neutral screen.

* **GH-H-15**
  After final question or early end, host sees **Final leaderboard**:

  * At least top 5 players (configurable N; default 5; max 10).
  * For each displayed player:

    * Rank.
    * Nickname.
    * Total score.
  * Host can scroll to see more if needed (optional in v1; full list may be a separate “View all” screen).

* **GH-H-16**
  From COMPLETED state, host can:

  * Click “Play again with same quiz”:

    * Creates new game session with same quiz and settings (new game code).
  * Click “Return to dashboard”:

    * Game session remains viewable in history (for analytics/export in future).

---

## 5. Player Experience – Detailed Requirements

Requirement IDs: **GH-P-***.

### 5.1 Joining a Game

* **GH-P-1**
  Player can navigate to join page via:

  * Direct join URL with code prefilled (`/join/{game_code}`).
  * Generic `/join` page with a “Game Code” input field.

* **GH-P-2**
  Join form (mobile-first) requires:

  * **Game code** input (required).
  * **Nickname** input (required).

    * Length constraints: 2–20 characters.
    * Block empty and whitespace-only names.

* **GH-P-3**
  Basic nickname moderation:

  * Client-side profanity filter where possible (simple list).
  * Backend will also validate and reject nicknames with inappropriate words, returning error `INVALID_NICKNAME`.
  * On error:

    * Player sees “Nickname not allowed. Try another name.”

* **GH-P-4**
  On successful join into LOBBY:

  * Player sees:

    * “Waiting for host to start.”
    * Count of players joined (e.g., “You’re #23 to join! 23 players in the game.”).
    * Optional meta:

      * Host name (if available).
      * Quiz title.

* **GH-P-5**
  If max players reached:

  * Player gets clear error: “This game is full (300 players). Ask your host for a new game.”
  * Must not join the game session.

### 5.2 During the Game

* **GH-P-6**
  When host starts the game:

  * Player automatically transitions from LOBBY to either:

    * QUESTION_INTRO view (if used), or
    * QUESTION_ACTIVE view.
  * No reload required; via real-time event.

* **GH-P-7**
  Player **question view** must include:

  * Question text (unless game is configured “host screen only”; then show only answer options and minimal prompt).
  * Answer options (for multiple choice).
  * Visual countdown timer.
  * Clear submission CTA.

* **GH-P-8**
  Answer submission behavior (MVP):

  * Player can tap exactly **one** option.
  * First tap **locks in** the answer; they cannot change it.
  * Immediately send `ANSWER_SUBMITTED` to backend.
  * UI feedback:

    * Option is visually highlighted.
    * Text: “Answer submitted!” or equivalent.

* **GH-P-9**
  If due to latency the server already has closed the question when answer arrives:

  * Backend returns “ANSWER_TOO_LATE”.
  * Player sees message: “Too late – time’s up.”
  * No points awarded.

* **GH-P-10**
  Late joiners during IN_PROGRESS:

  * By default, they join the **current game state**.
  * If joined mid-question:

    * If remaining time > X seconds (e.g. >3 seconds), player can answer.
    * If remaining time ≤ X seconds, they see time ticking but may not have enough time; no special behavior.
  * They cannot answer past questions.

* **GH-P-11**
  After QUESTION_ACTIVE ends, in QUESTION_RESULTS:

  * Player sees:

    * If their answer was correct or incorrect.
    * Points gained for that question (if scoring is per-question visible; see scoring section).
    * Optional: their current rank.

* **GH-P-12**
  Navigating between questions:

  * Players should experience smooth transitions:

    * Short fade/slide animation when going to next question.
    * No manual navigation; it’s driven by events from server.

### 5.3 End of Game

* **GH-P-13**
  On **COMPLETED** state:

  * Player sees:

    * Final rank (e.g., “You placed 7th!”).
    * Total score.
    * Contextual feedback: e.g., “You’re in the top 20%!” or “You answered 6/10 questions correctly.”

* **GH-P-14**
  Post-game options:

  * Button: “Join another game” → goes back to join code screen.
  * Secondary CTA (non-blocking): “Sign up to track your progress” (future, optional for v1).

* **GH-P-15**
  On **ABORTED** state:

  * Player sees:

    * “This game was cancelled by the host.”
    * “You can join another game” button.

---

## 6. Real-Time Behavior & Requirements

Requirement IDs: **GH-RT-***.

### 6.1 Real-Time Transport

* **GH-RT-1**
  Use WebSockets (or equivalent full-duplex protocol) for:

  * Broadcasting game state changes from server to host/players.
  * Receiving answer submissions from players (or answers may be via REST but confirmation via WebSocket).

* **GH-RT-2**
  Real-time channel organization:

  * One **channel per game session**: `game:{game_id}`.
  * All host and player clients subscribe to this channel upon join.

### 6.2 Event Definitions

(Conceptual; actual transport format can be JSON.)

* **GH-RT-3 – GAME_CREATED**

  * Emitted to host client after POST `/games`.
  * Payload (subset):

    * `game_id`
    * `game_code`
    * `quiz_id`
    * `state: "LOBBY"`

* **GH-RT-4 – PLAYER_JOINED**

  * Emitted to:

    * Host.
    * All players in LOBBY & IN_PROGRESS.
  * Payload:

    * `game_id`
    * `player_id`
    * `nickname`
    * `player_count`

* **GH-RT-5 – PLAYER_LEFT**

  * Emitted when a player disconnects and doesn’t reconnect within a timeout or leaves explicitly.
  * Payload:

    * `game_id`
    * `player_id`
    * `player_count`

* **GH-RT-6 – GAME_STARTED**

  * Emitted when host starts the game.
  * Payload:

    * `game_id`
    * `state: "IN_PROGRESS"`
    * `current_question_index`

* **GH-RT-7 – QUESTION_STARTED**

  * Emitted on each new question.
  * Payload:

    * `game_id`
    * `current_question_index`
    * `question_id`
    * `question_text` (or minimal data if host-only mode).
    * `options` (answer choices).
    * `time_limit_seconds`
    * `started_at` (timestamp).

* **GH-RT-8 – QUESTION_ENDED**

  * Emitted when question closes.
  * Payload:

    * `game_id`
    * `question_id`
    * `ended_at`
    * `correct_option_id`
    * `answer_counts` (aggregated per option).
    * Optional: `player_answer_summary` for each client (limited to that player).

* **GH-RT-9 – ANSWER_SUBMITTED (ACK)**

  * Server → player ACK event (client may send via REST or WS).
  * Payload:

    * `game_id`
    * `question_id`
    * `player_id`
    * `status`: `"RECORDED"` | `"TOO_LATE"` | `"INVALID"`
    * Optional: `points_awarded` (if per-question visible).

* **GH-RT-10 – LEADERBOARD_UPDATED**

  * Emitted after scoring is updated (typically after each question and at end).
  * Payload:

    * `game_id`
    * `leaderboard`: array of `{ rank, player_id, nickname, score }`
    * For performance, may send top N only by default.

* **GH-RT-11 – GAME_ENDED**

  * Emitted when game transitions to COMPLETED.
  * Payload:

    * `game_id`
    * `reason`: `"COMPLETED"` | `"ENDED_EARLY"`
    * `final_leaderboard` (top N; possibly truncated).

* **GH-RT-12 – GAME_ABORTED**

  * Emitted when host cancels game.
  * Payload:

    * `game_id`
    * `reason: "ABORTED_BY_HOST"`

### 6.3 Latency & Concurrency Requirements

* **GH-RT-13**
  Target broadcast latency:

  * From server sending `QUESTION_STARTED` to 95th percentile of players rendering the question:

    * ≤ 500ms.

* **GH-RT-14**
  Leaderboard update latency:

  * From question end to leaderboard visible on host and players:

    * ≤ 3 seconds for up to 300 players.

* **GH-RT-15**
  Concurrency:

  * Support up to **300 concurrent players** per game session connected to the same channel.
  * Support at least **10 simultaneous games** at this scale in production (non-functional capacity target).

### 6.4 Disconnections & Reconnections

* **GH-RT-16 – Player disconnect**

  * Backend tracks `last_seen` and heartbeat.
  * If player disconnects:

    * Keep their game session for at least **5 minutes**.
    * If reconnection happens within that window:

      * Reattach to same `player_session` and `game_id`.

* **GH-RT-17 – Player reconnect**

  * On reconnect, client calls `GET /games/{id}/state?player_session_id=...`.
  * Backend responds with current game state snapshot:

    * Game state (LOBBY / IN_PROGRESS / COMPLETED / ABORTED).
    * Current question index and question state.
    * Whether this player already answered current question.
    * Current score and rank (if applicable).
  * Client re-subscribes to the game channel and renders appropriate view.

* **GH-RT-18 – Host disconnect**

  * If host disconnects during IN_PROGRESS:

    * Game continues running with the server controlling question timers.
    * If host fails to reconnect within **10 minutes**, game auto-ends:

      * Transition to COMPLETED.
      * Broadcast `GAME_ENDED` (reason: `HOST_TIMEOUT`).
  * Host reconnect:

    * Same flow as players using `GET /games/{id}/state`, but with host privileges restored.

---

## 7. Scoring & Leaderboard

Requirement IDs: **GH-S-***.

### 7.1 Scoring Model (MVP)

* **GH-S-1**
  Base scoring:

  * Each correct answer is awarded **1000 points**.
  * Incorrect or no answer: **0 points**.
  * No time-based bonus in v1 (keep scoring simple and predictable).

* **GH-S-2**
  Questions may optionally have different weights in future (out of scope for v1). For now, all questions have equal value.

* **GH-S-3**
  Points are awarded at QUESTION_RESULTS (after question ends), not at submission time, to avoid inconsistencies if answers are invalidated.

### 7.2 Ties & Ranking

* **GH-S-4**
  Ranking rules:

  1. Higher total score ranks higher.
  2. If scores are equal:

     * Player with more correct answers ranks higher.
  3. If still tied:

     * Player who reached that score **earlier** (based on timestamp of last score update) ranks higher.

### 7.3 Leaderboard Behavior

* **GH-S-5**
  Per-question leaderboard refresh:

  * After each question’s scoring event:

    * Update leaderboard.
    * Emit `LEADERBOARD_UPDATED` event.

* **GH-S-6**
  Leaderboard views:

  * Host view:

    * Can show full leaderboard (scrollable).
    * Default to top 10 players for projector presentation.
  * Player view:

    * Show top N players (e.g. top 5 or 10).
    * Always show **player’s own rank and score** (even if not in top N).

* **GH-S-7**
  Performance constraint:

  * For 300 players, leaderboard calculations must complete within **2 seconds** of question end.
  * Event payloads can be optimized (e.g. send full leaderboard only to host, truncated to players).

---

## 8. Product Design & UX Direction

Requirement IDs: **GH-UX-***.

### 8.1 Host Views (Desktop-First)

* **GH-UX-1**
  Layout separates:

  * **Control panel (left or sidebar):**

    * Start/Next/End/Skip controls.
    * Current question info.
    * Player counts and answer stats.
  * **Presentation area (central/primary):**

    * Question and answer options with high visibility.
    * Results charts and leaderboards.

* **GH-UX-2**
  Presentation area is optimized for projectors:

  * Large fonts, high contrast.
  * Limited text per screen.
  * No small UI elements.

* **GH-UX-3**
  Controls are safe:

  * Confirm dialog for “End game” and “Cancel game.”
  * “Skip question” less prominent than “Next question.”

### 8.2 Player Views (Mobile-First)

* **GH-UX-4**
  Layout:

  * Question text at top (where applicable).
  * Timer near top center.
  * Answer options as large tappable cards (full-width or 2 columns on larger screens).
  * Minimal navigation; no back button within game.

* **GH-UX-5**
  Visual feedback:

  * Clear pressed state when an answer is tapped.
  * After submission:

    * Show “Answer submitted” and lock state.

* **GH-UX-6**
  Use concise text, limited UI noise:

  * Avoid extraneous icons or controls that may confuse.

### 8.3 Branding & Visual Style

* **GH-UX-7**
  Visual direction:

  * Bold, simple color palette suitable for classrooms.
  * Light and dark theme support (future), but v1 can use default theme.

* **GH-UX-8**
  Feedback & delight:

  * Small animations:

    * Correct answer → subtle positive animation (e.g., confetti burst).
    * Incorrect → subtle shake or neutral animation.
  * Smooth transitions between questions and results.

### 8.4 Accessibility

* **GH-UX-9**
  Accessibility requirements:

  * High contrast text and background.
  * Minimum font sizes for mobile.
  * Buttons and options with large touch targets (≥ 44x44 px).

* **GH-UX-10**
  Colorblind-friendly:

  * Correct vs incorrect must not rely solely on color:

    * Use icons (✓ / ✗), labels (“Correct”, “Incorrect”), or patterns.
  * Charts should be legible in monochrome.

* **GH-UX-11**
  Keyboard navigation (host):

  * Host controls accessible via keyboard shortcuts (e.g., Space = next question, Escape = end game modal).

---

## 9. Technical Integration & APIs

Requirement IDs: **GH-API-***.

### 9.1 Core REST Endpoints (Conceptual)

#### 9.1.1 Create Game

* **GH-API-1**
  `POST /games`

  * Request body:

    * `quiz_id` (string, required)
    * `host_id` (string, required – from auth context)
    * `settings`:

      * `max_players` (int ≤ 300)
      * `default_question_time` (int seconds)
      * `question_visibility_mode` (`"host_and_player"` | `"host_only"`)

  * Response:

    * `game_id`
    * `game_code`
    * `join_url`
    * `state: "LOBBY"`

#### 9.1.2 Start Game

* **GH-API-2**
  `POST /games/{id}/start`

  * Auth: host only.
  * Valid only in LOBBY state.
  * Side effects:

    * Set state to IN_PROGRESS.
    * Set `current_question_index = 0`.
    * Emit `GAME_STARTED` and first `QUESTION_STARTED`.

#### 9.1.3 Next Question

* **GH-API-3**
  `POST /games/{id}/next-question`

  * Auth: host only.
  * Valid in QUESTION_RESULTS (or after skip).
  * Side effects:

    * Increment `current_question_index`.
    * If within range:

      * Emit `QUESTION_STARTED` for next question.
    * Else:

      * Transition to COMPLETED and emit `GAME_ENDED`.

#### 9.1.4 End Game

* **GH-API-4**
  `POST /games/{id}/end`

  * Auth: host only.
  * Valid in any active state (LOBBY or IN_PROGRESS).
  * Request can specify:

    * `type`: `"END"` | `"ABORT"`.
  * If `END`:

    * State → COMPLETED.
    * Emit `GAME_ENDED`.
  * If `ABORT`:

    * State → ABORTED.
    * Emit `GAME_ABORTED`.

#### 9.1.5 Submit Answer

* **GH-API-5**
  `POST /games/{id}/answer`

  * Auth: player session token or anonymous with `player_session_id`.

  * Request body:

    * `player_session_id`
    * `question_id`
    * `selected_option_id`
    * Optional: client timestamp.

  * Response:

    * `status`: `"RECORDED"` | `"TOO_LATE"` | `"INVALID"`
    * Optional: `message`

  * Side effects:

    * If state is QUESTION_ACTIVE for that question and player hasn’t answered yet:

      * Record answer.
      * Emit `ANSWER_SUBMITTED` ACK event to that player.
    * Otherwise, respond `TOO_LATE` or `INVALID`.

#### 9.1.6 Get Game State (for reconnect)

* **GH-API-6**
  `GET /games/{id}/state`

  * Query params:

    * `player_session_id` (optional).
  * Response:

    * `game_id`
    * `state` (LOBBY / IN_PROGRESS / COMPLETED / ABORTED)
    * `current_question_index`
    * `question_state` (INTRO / ACTIVE / RESULTS)
    * `question` (current question payload, sanitized based on visibility mode)
    * `time_remaining` (if ACTIVE)
    * `player` (if `player_session_id` provided):

      * `score`
      * `has_answered_current_question`
      * `rank` (optional)
    * `settings`
    * `player_count`

### 9.2 Data Structures

* **GH-API-7 – Game Session**

  ```json
  {
    "id": "game_123",
    "quiz_id": "quiz_456",
    "host_id": "user_789",
    "code": "AB12CD",
    "state": "LOBBY", // or IN_PROGRESS, COMPLETED, ABORTED
    "current_question_index": 0,
    "settings": {
      "max_players": 300,
      "default_question_time": 20,
      "question_visibility_mode": "host_and_player"
    },
    "created_at": "...",
    "updated_at": "..."
  }
  ```

* **GH-API-8 – Player Session**

  ```json
  {
    "id": "player_session_1",
    "game_id": "game_123",
    "user_id": null, // or "user_foo" if logged in
    "nickname": "CoolCat42",
    "score": 3000,
    "correct_answers": 3,
    "last_seen_at": "...",
    "connection_status": "CONNECTED" // or DISCONNECTED
  }
  ```

---

## 10. Non-Functional Requirements

Requirement IDs: **GH-NF-***.

* **GH-NF-1 – Performance**

  * Game creation:

    * `POST /games` median latency ≤ 500ms.
  * Player join:

    * `POST /join` + subscription setup median time ≤ 1s (excluding network).
  * Question-to-client distribution:

    * See GH-RT-13.

* **GH-NF-2 – Reliability**

  * The system must tolerate intermittent client connectivity:

    * No server-side crash if many disconnects/reconnects happen simultaneously.
  * Game state is authoritative on the server and must be persisted so that:

    * A brief backend restart does not lose game state for ongoing games (optional for v1, but strongly preferred).

* **GH-NF-3 – Observability**

  * Log key events:

    * GAME_CREATED, GAME_STARTED, GAME_ENDED, GAME_ABORTED.
    * PLAYER_JOINED, PLAYER_LEFT.
    * QUESTION_STARTED, QUESTION_ENDED.
  * Collect timing metrics:

    * Time from QUESTION_STARTED to QUESTION_ENDED.
    * Time from GAME_STARTED to GAME_ENDED.
  * Enable tracing of a single game session across services.

---

## 11. Analytics & Reporting Hooks

Requirement IDs: **GH-A-***.

* **GH-A-1**
  Store per-game analytics:

  * `game_id`
  * `host_id`
  * `player_count`
  * Start and end timestamps.
  * Number of questions played.

* **GH-A-2**
  Store per-question stats for each game:

  * `game_id`, `question_id`, `question_index`.
  * `num_players_joined`.
  * `num_players_answered`.
  * `num_correct`.
  * Distribution across options.

* **GH-A-3**
  Store high-level per-player stats in each game:

  * `player_session_id`
  * `nickname`
  * `final_score`
  * `correct_answers`
  * `rank` (final rank)

* **GH-A-4 (Future)**
  Support export of results per game (CSV/JSON):

  * By question and by player.
  * Out of scope for v1 UI, but API/data model should make it feasible.

---

## 12. Risks & Open Questions

### 12.1 Risks

* **R1 – Real-time scaling / infra limits**

  * Handling bursts of connections (e.g., 300 players joining within 60 seconds).
  * Need capacity planning and load testing for WebSocket channels.

* **R2 – Misbehavior / inappropriate nicknames**

  * Simple profanity filters may miss edge cases.
  * Hosts currently lack moderation tools for nicknames (e.g., kick/mute). This is a v2 consideration.

* **R3 – Network quality in real classrooms**

  * School or corporate Wi-Fi might be unreliable, causing noticeable lag or disconnects.
  * We mitigate via reconnection logic and state snapshots, but UX may still suffer.

### 12.2 Open Questions

These should be resolved before or during implementation, but v1 can make temporary assumptions:

1. **Anonymous hosts**

   * Do we allow truly anonymous hosts (no account) to run a game?
   * Recommendation for v1: require host login for better analytics and abuse control.

2. **Late joiner behavior**

   * Current assumption: they join current state and can answer only remaining questions.
   * Question: Do we expose a setting for hosts to disallow late joiners after X questions?

3. **Per-question customization**

   * Quizzes may define per-question time limits and scoring options in the future.
   * For v1 implement default time + optional per-question overrides if already in Quiz service.

4. **Multiple hosts / co-hosts**

   * Do we support multiple host clients controlling the same game (e.g., co-teachers)?
   * For v1, only the creator (host) controls; others can only spectate.

5. **Persistence of completed games**

   * How long do we retain game results and analytics?
   * Impacts storage and export features.

---

This PRD defines the full host and player flows, state machine, real-time event model, and API-level integration needed for engineers to implement the **Game Hosting & Playing** experience with up to ~300 concurrent players per game.
