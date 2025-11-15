## PRD: Quiz Creation & Management

Product: Real-time Quiz Platform (Kahoot-style, AI-augmented)
Feature Area: Quiz Creation & Management
Owner: Associate PM – Quiz Creation & Management

---

## 1. Problem Statement & Goals

### 1.1 Problem Statement

Hosts (teachers, trainers, facilitators) struggle with existing quiz tools (e.g., Kahoot, Mentimeter) because:

* **Creation is slow and clunky**

  * Many steps, poor keyboard workflows, frequent context switches.
  * Hard to quickly duplicate/modify existing content for new sessions.
* **Management at scale is painful**

  * Once a user has dozens or hundreds of quizzes, they become hard to find, organize, and maintain.
  * Limited metadata, weak search and filtering, no real lifecycle states (draft/published/archived).
* **Free tiers are restrictive**

  * Tools like Kahoot impose tight player caps on free plans, discouraging experimentation and frequent quiz creation.
* **Modern AI capabilities aren’t integrated cleanly**

  * AI-generated quizzes from PDFs/webpages often land in separate tools or are hard to refine within the main quiz builder.

Our platform aims to make quiz creation and management **fast, predictable, and scalable** so hosts can spend time on content and facilitation, not tools.

---

### 1.2 Goals

What “great” looks like for Quiz Creation & Management:

* **Fast creation**

  * A host can build a **10–20 question quiz from scratch in under 10 minutes**.
  * AI-generated quizzes arrive in a consistent quiz model and can be refined just like manually created quizzes.
* **Confidence & predictability**

  * Editing and cloning quizzes feels **safe**:

    * No accidental overwrites of quizzes already used in past games.
    * Clear state (Draft / Published / Archived).
* **Scalable library management**

  * Hosts with **100+ quizzes** can still quickly:

    * Find relevant quizzes.
    * See what’s been used recently.
    * Archive or organize older content.

---

### 1.3 Success Metrics

Product-level success metrics for this feature:

* **Time-to-first-published-quiz**

  * Median time from account creation to first published quiz: **≤ 24 hours**.
  * Median elapsed UI time in quiz editor for first published quiz: **≤ 10 minutes**.
* **Creation velocity**

  * Average **quizzes created per active host per month**: target **≥ 3** within 3 months of launch.
* **Reuse & maintenance**

  * Target **≥ 50%** of quizzes used in at least one game within 30 days of creation.
  * Target **≥ 25%** of active hosts use **duplicate/clone** feature at least once per month (proxy for efficient reuse).
* **Organization effectiveness**

  * Search/filter usage: at least **30%** of sessions involving the quiz list use a filter or search within 90 days of launch.
* **Reliability**

  * **Autosave-related data loss incidents** (user reports of losing work) < 0.1% of quiz edit sessions.

---

## 2. User Personas & Use Cases

### 2.1 Personas

#### Persona 1: High School Teacher (“Alex”)

* **Context**

  * Teaches 4–5 classes daily.
  * Uses a school laptop (Windows/Chromebook), often projecting to a screen.
* **Discovery of quiz builder**

  * Signs up from marketing or word-of-mouth.
  * Lands on dashboard → “Create new quiz” primary CTA.
* **Creation vs reuse**

  * Creates **1–3 new quizzes per week**.
  * Reuses quizzes for multiple classes; tweaks questions for difficulty or timing.
* **Constraints**

  * **Time-poor**: often has 10–15 minutes between classes.
  * Medium technical comfort.
  * Works mostly on **desktop**; rarely on mobile for quiz creation.

#### Persona 2: Corporate Trainer (“Jordan”)

* **Context**

  * Runs onboarding, sales enablement, and compliance training.
  * Uses company laptop; sometimes large screens, sometimes Zoom/Teams.
* **Discovery**

  * Through internal pilot or training tools evaluation.
  * Integrated from LMS or link from email → lands on dashboard.
* **Creation vs reuse**

  * Builds a few “master” quizzes per topic, then **duplicates** and modifies for specific audiences (region, role).
* **Constraints**

  * Needs **polished, error-free** content.
  * Higher tech comfort but expects professional UX.
  * Requires easy **organization**: topics, programs, clients.

#### Persona 3: Event Organizer / Community Facilitator (“Sam”)

* **Context**

  * Runs community events, pub quizzes, meetups.
  * Uses personal laptop, but sometimes tablet.
* **Discovery**

  * Via social media or link from event platforms.
* **Creation vs reuse**

  * Creates quizzes **ad hoc** for specific events.
  * Sometimes reuses rounds (sections) from older quizzes.
* **Constraints**

  * Very time-bound (event starting soon).
  * Needs to spin up a quiz in **minutes**, often combining AI + quick edits.

---

### 2.2 Key Use Cases

1. **Create a quiz from scratch**
2. **Create a quiz from AI-generated content** (quiz already exists in this subsystem; user just edits and saves).
3. **Duplicate an existing quiz and modify**
4. **Organize quizzes using tags and filters**
5. **Archive/delete old or irrelevant quizzes**
6. **Prepare a quiz for a live game**

   * Ensure status is PUBLISHED
   * Confirm questions, time limits, points
7. **Quickly find an existing quiz**

   * By title, tags, or “last used” date
8. **Update outdated questions in an existing quiz**

   * Without impacting past game sessions

---

## 3. Functional Requirements

IDs follow `QC-<number>` for Quiz Creation (global, not per section).

---

### 3.a Quiz Object Model

#### Quiz-level schema

* **QC-1**: Each quiz must have:

  * `id` (UUID/string; server-generated)
  * `title` (string, 1–200 chars)
  * `description` (string, 0–2000 chars, optional)
  * `language` (ISO 639-1 code + optional region, e.g. `en`, `en-US`)
  * `tags` (array of strings, each 1–50 chars; max 20 tags per quiz)
  * `owner_id` (foreign key to User)
  * `organization_id` (nullable; for future org-level sharing)
  * `created_at` (timestamp, server-generated)
  * `updated_at` (timestamp, server-generated)
  * `status` (enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`)
  * `is_archived` (boolean; redundant with `status=ARCHIVED` but acceptable for index; or we omit if using only status)
  * `source` (enum: `MANUAL`, `AI_GENERATED`, `IMPORTED`)
  * `last_used_at` (nullable timestamp; updated when used in game)
  * `estimated_duration_seconds` (computed or optional; not required MVP)
  * `version` (integer, auto-increment; for optimistic concurrency)
  * `default_question_time_limit_seconds` (nullable; default time limit for questions)
  * `default_question_points` (nullable; default points per question)

* **QC-2**: Quizzes must support **multi-language content** conceptually via `language` metadata but **not** enforce any specific content language in text.

#### Question-level schema

* **QC-3**: Each question must have:

  * `id` (UUID/string; server-generated)
  * `quiz_id` (foreign key to Quiz)
  * `order_index` (integer; 0-based or 1-based index; defines display order)
  * `type` (enum: `MULTIPLE_CHOICE_SINGLE`, `TRUE_FALSE` for MVP; extensible)
  * `text` (string, 1–500 chars; MVP; later consider rich text)
  * `options` (array of option objects; see below)
  * `correct_option_ids` (array of option IDs; for MVP single-answer MCQ, exactly 1; for TRUE_FALSE, exactly 1)
  * `time_limit_seconds` (nullable; overrides quiz default; allowed range e.g. 5–240 seconds)
  * `points` (nullable; overrides quiz default; allowed range e.g. 0–2000)
  * `explanation` (optional string, 0–500 chars)
  * `media` (optional array of media refs; e.g. `{ id, type: IMAGE/VIDEO/AUDIO, url, alt_text }`)
  * `created_at`, `updated_at`

* **QC-4**: Question options schema:

  * `id` (UUID/string; server-generated)
  * `text` (string, 1–200 chars)
  * `media` (optional media ref, same shape as above)
  * `order_index` (integer; 0-based or 1-based index)

* **QC-5**: The schema must be **extensible** to support future `type` values:

  * e.g., `MULTIPLE_CHOICE_MULTI`, `NUMERIC`, `MATCHING`, etc.
  * Backend must not assume only the 2 MVP types beyond validation logic.

#### Relationships

* **QC-6**: Quiz–Question:

  * One Quiz **has many** Questions (1:N).
  * Questions are uniquely associated to a single quiz; no sharing of question objects across quizzes in MVP.
* **QC-7**: Quiz–Owner:

  * Quiz `owner_id` must correspond to an existing user in User Management.
  * Only the owner (and future org members with rights) may edit.
* **QC-8**: Quiz–Organization (future-ready):

  * `organization_id` is optional; for now, no org-level sharing logic in MVP but the field must exist for future use.

---

### 3.b Quiz Creation UX

#### Entry points

* **QC-9**: Entry points to create quizzes:

  * “Create new quiz” primary CTA on dashboard and quiz list page.
  * “Create quiz from AI result” CTA in AI-generation flow will also land in the same editor with a pre-populated quiz object.
* **QC-10**: Entry to duplicate:

  * “Duplicate” action available in quiz list row actions and quiz detail page.

#### Initial metadata step

* **QC-11**: When creating a new quiz from scratch:

  * Show a **minimal metadata dialog or panel** with:

    * Required: title (with default placeholder “Untitled quiz”).
    * Optional: description, language (default from user profile), tags.
  * Quiz is created as a **DRAFT** immediately after user confirms or starts editing (autosave kicks in).
* **QC-12**: The user must be able to change metadata at any time from within the editor (e.g., top of screen).

#### Question creation workflow

* **QC-13**: In the quiz editor, user must be able to:

  * Add a question via prominent “+ Add question” button.
  * Default new questions to type `MULTIPLE_CHOICE_SINGLE` with:

    * 4 empty option fields.
    * Default time limit using quiz’s default (e.g., 30 seconds).
    * Default points using quiz’s default (e.g., 1000 points).

* **QC-14**: Question editor must support:

  * Selecting question type (dropdown).
  * Entering question text.
  * Adding/removing options (within min/max constraints).
  * Marking correct option.
  * Setting question-specific time limit and points (optional).
  * Adding optional media (image upload or URL; details out-of-scope, but UI placeholder must exist).
  * Adding explanation.

* **QC-15**: Reordering questions:

  * Users must be able to reorder questions via drag-and-drop in the question list.
  * Order changes must be reflected in `order_index` and autosaved.

#### Autosave behavior

* **QC-16**: Autosave must:

  * Trigger:

    * On any field change with debounce (e.g., ~1–2 seconds after last keystroke).
    * On discrete actions (add/delete/reorder questions, change correct answer) without long delay.
  * Persist:

    * Quiz metadata.
    * All question and option changes.
  * Require no explicit “Save” click for data persistence.
* **QC-17**: Autosave indicator:

  * A small status text (e.g., “Saving…”, “Saved just now”) visible in the editor header.
  * Shows errors if save fails (e.g., “Autosave failed. Retrying…”).
* **QC-18**: Manual Save/Publish:

  * “Publish” button sets quiz status to `PUBLISHED` (validations must pass).
  * Optional “Save as draft” button (if needed) but autosave already persists; published vs draft is about status, not unsaved vs saved.

#### Empty states & defaults

* **QC-19**: For a new quiz with no questions:

  * Show an empty state in the question list: “No questions yet” + CTA “Add your first question”.
  * Provide sample text placeholder for first question (e.g., “Type your question here…”).
* **QC-20**: Defaults:

  * Default time limit, points, and question type as above.
  * Default language from user profile or browser locale.

---

### 3.c Quiz Editing

#### Editing existing quizzes

* **QC-21**: Any `DRAFT` or `PUBLISHED` quiz can be opened in the editor from the quiz list or detail view.
* **QC-22**: Editing a `PUBLISHED` quiz:

  * Allowed at any time.
  * Changes affect **future game sessions** that use that quiz.
  * Past game sessions must remain tied to the quiz version used at the time of game start (handled via game snapshot, see integration).

#### Versioning & games

* **QC-23**: When a quiz is used to start a game:

  * Game Hosting must store a **snapshot** of the quiz (quiz + questions) for that session.
  * Later edits to the quiz must **not** alter historical game data.
* **QC-24**: For MVP, no explicit version browsing UI is required, but:

  * The quiz record must include an incrementing `version` field updated on each successful save.
* **QC-25**: Scheduled/pending games:

  * If Game Hosting supports scheduled games, those should always read the **latest** published version at game start (not at scheduling time), unless a future requirement changes this.

#### Editing restrictions by state

* **QC-26**: `DRAFT` quiz:

  * Fully editable (metadata & questions).
* **QC-27**: `PUBLISHED` quiz:

  * Fully editable in MVP.
  * Changes may alter how future games play.
* **QC-28**: `ARCHIVED` quiz:

  * Not editable in MVP.
  * Must be restored (un-archived → status to `DRAFT` or `PUBLISHED`) before editing.

#### Safeguards against losing work

* **QC-29**: If autosave fails for >X attempts (configurable; e.g., after 3 retries / 30 seconds):

  * Show inline error banner with option “Copy content” and suggestion to check connection.
* **QC-30**: Browser/tab close:

  * If there are unsynced changes (dirty state detected), prompt the user with standard “You have unsaved changes” dialog.
    Note: This is a last resort; autosave should keep actual data safe.
* **QC-31**: Undo/redo:

  * For MVP, **global undo/redo across all fields is out-of-scope**.
  * Minimal safeguard:

    * Deleted questions should be confirmable (dialog).
    * “Undo delete” toast for a short period (e.g., 5–10 seconds) is desirable; if not implemented, this should be explicit as a V2 enhancement.

---

### 3.d Question Types & Validation

#### Supported types (MVP)

* **QC-32**: MVP question types:

  * `MULTIPLE_CHOICE_SINGLE`: one correct answer out of multiple options.
  * `TRUE_FALSE`: exactly two options (True, False) with one marked correct.
* **QC-33**: Future types (not implemented in MVP but design must be compatible):

  * `MULTIPLE_CHOICE_MULTI` (multi-select).
  * `NUMERIC` (exact or ranged).
  * `MATCHING`, `ORDERING`, etc.

#### Validation rules

* **QC-34**: General validation:

  * `title` non-empty when publishing.
  * At least 1 question required to publish.
* **QC-35**: Question text validation:

  * Required.
  * Length: 1–500 chars; show soft warning after ~300 chars (for readability).
* **QC-36**: Options validation:

  * For `MULTIPLE_CHOICE_SINGLE`:

    * Min 2 options, max 8 options.
    * At least 1 option marked correct (exactly 1).
  * For `TRUE_FALSE`:

    * 2 fixed options: “True” and “False” (or localized equivalents).
    * Exactly 1 correct.
* **QC-37**: Additional checks (soft warnings, not hard blockers for MVP):

  * Detect duplicate option texts (case-insensitive); show indicator/warning icon.
  * Warn if question text or options exceed recommended length.
* **QC-38**: Time limit & points:

  * Time limit per question: min 5s, max 240s (configurable; consistent across product).
  * Points per question: 0–2000 (configurable). 0 allowed for “survey” style questions later.

---

### 3.e Quiz Organization & Search

#### Listing & pagination

* **QC-39**: Quiz list view:

  * Shows quizzes owned by the current user (MVP; org/shared later).
  * Columns/fields:

    * Title, status, last updated, last used, source, tag chips, number of questions.
  * Pagination:

    * Page size default 20–50, with navigation controls.
* **QC-40**: Sorting:

  * Sort by:

    * Last updated (default, desc).
    * Title (asc).
    * Last used (desc; nulls last).
    * Created date (desc).

#### Filtering & search

* **QC-41**: Filter controls:

  * Filter by:

    * Status (DRAFT/PUBLISHED/ARCHIVED).
    * Source (MANUAL/AI_GENERATED/IMPORTED).
    * Created date range.
    * Last used date range.
    * Tags (multi-select).
* **QC-42**: Search:

  * Text search across:

    * Title.
    * Description.
  * Search box always available above list; updates results on submit.
* **QC-43**: Performance:

  * Search and filter should return results within ~300–500ms for typical user libraries (< 5k quizzes).

#### Organization model: Tags, not folders

* **QC-44**: Primary organization mechanism is **tags**, not nested folders.

  * Rationale:

    * Quizzes often belong to multiple logical categories (e.g., “Biology”, “Exam Review”, “Grade 10”).
    * Tags allow flexible, multi-dimensional organization and scale better than rigid folder trees.
* **QC-45**: Tag behavior:

  * Tags are free-form per user (no global tag taxonomy in MVP).
  * Tag suggestions:

    * Suggest recently used tags as user types.
  * Max 20 tags per quiz (QC-1).
* **QC-46**: Future (not MVP):

  * Collections or “playlists” to group quizzes into sets (e.g., for a course or program).

---

### 3.f Quiz Lifecycle

#### States

* **QC-47**: State enum:

  * `DRAFT`
  * `PUBLISHED`
  * `ARCHIVED`
* **QC-48**: Semantics:

  * `DRAFT`:

    * Editable.
    * **Not** visible/selectable in game hosting UI.
  * `PUBLISHED`:

    * Editable.
    * Visible/selectable in game hosting UI.
  * `ARCHIVED`:

    * Hidden by default from main quiz list (accessed via filter).
    * Not editable (MVP).
    * Not selectable for game hosting.
    * Can be restored.

#### Transitions

* **QC-49**: Allowed transitions:

  * `DRAFT → PUBLISHED` (via “Publish”).
  * `PUBLISHED → DRAFT` (if we support “Unpublish”; recommended for flexibility).
  * `DRAFT → ARCHIVED` (via “Archive” action).
  * `PUBLISHED → ARCHIVED` (via “Archive” action; must show confirmation that it will be unavailable for new games).
  * `ARCHIVED → DRAFT` (via “Restore” action).
* **QC-50**: Restrictions:

  * Deleting a quiz (hard delete) is **MVP out-of-scope** from UI; we rely on ARCHIVED state as soft delete. Backend may support hard delete for compliance/admin.

---

## 4. Detailed User Flows

### 4.1 Flow: Create New Quiz from Scratch

**Narrative**: Alex (teacher) logs in before class and wants to create a new 10-question quiz.

**Steps:**

1. From dashboard, Alex clicks **“Create new quiz”**.
2. A “New quiz” screen opens:

   * Minimal metadata section at top (title, description, language, tags).
   * Title auto-filled as “Untitled quiz” and focused.
3. Alex types title and optionally description; autosave creates a DRAFT quiz (QC-16).
4. Question list on the left shows empty state: “No questions yet” + “Add your first question”.
5. Alex clicks “+ Add question”.
6. Right pane opens question editor:

   * Default type: Multiple choice (single answer).
   * 4 empty options.
   * Correct answer not yet selected.
   * Default time limit and points pre-filled.
7. Alex enters question text and options; sets correct option.
8. Autosave triggers after a short debounce; “Saved” indicator appears.
9. Alex repeats steps 5–8 to add ~10 questions.
10. (Optional) Reorders questions via drag-and-drop if needed.
11. When done, Alex clicks **“Publish”**:

    * Client validates quiz:

      * All questions valid.
      * At least one question exists.
      * Title non-empty.
12. If validation passes:

    * Quiz `status` set to `PUBLISHED`.
    * Success toast: “Quiz published and ready to host.”
13. Quiz is now visible in Hosting UI’s quiz selection.

Edge conditions in this flow:

* Validation errors (e.g., a question with no correct answer) show inline messages and block publishing until fixed.
* If the connection drops mid-edit:

  * Autosave errors appear; Alex is notified.
  * Local in-memory state is not lost; once the connection returns, autosave resumes.

---

### 4.2 Flow: Duplicate an Existing Quiz and Adapt It

**Narrative**: Jordan has a standard onboarding quiz and wants a version tailored to the Sales team.

**Steps:**

1. Jordan navigates to the quiz list.
2. Uses search (“Onboarding”) and filters (tags) to locate the master quiz.
3. In the row actions, selects **“Duplicate”**.
4. Backend creates a new quiz:

   * Copies all quiz fields except:

     * `id` (new).
     * `created_at` (now).
     * `updated_at` (now).
     * `title` (e.g., original title + “(Copy)” or prompt user).
     * `status` set to `DRAFT`.
     * `source` might be set to `MANUAL` or `COPIED` (if we extend enum).
5. New quiz opens in editor.
6. Jordan edits title (e.g., “Onboarding – Sales Edition”).
7. Adjusts 2–3 questions, changing text/points/time.
8. Clicks “Publish”.
9. New quiz is available separately in Hosting UI; original remains unchanged.

Requirements:

* **QC-51**: Duplicate must be a **deep copy** of quiz and questions; no shared mutable references.
* **QC-52**: Duplicated quiz must inherit tags and language by default (user can change).

---

### 4.3 Flow: Find a Quiz and Update Outdated Questions

**Narrative**: Alex wants to update a curriculum quiz with new information.

**Steps:**

1. Alex opens quiz list.
2. Uses search box to type a keyword from the quiz title.
3. Optionally filters by tag (“Biology”) or “Last used within 6 months”.
4. Finds the desired quiz and opens it.
5. Editor shows full quiz; state is `PUBLISHED`.
6. Alex updates 2 questions to correct outdated facts.
7. Autosave persists changes.
8. The quiz remains `PUBLISHED` and future games use the updated questions.
9. Past games retain old data because Game Hosting uses snapshots.

---

### 4.4 Flow: Archive Old Quizzes and Find Them Later

**Narrative**: Jordan wants to clean up old one-off training quizzes.

**Steps:**

1. In quiz list, Jordan sorts by “Last used” (ascending) to see old quizzes.
2. Selects a quiz row and chooses “Archive”.
3. A confirmation dialog appears:

   * “This quiz will be removed from your main list and won’t be available for new games. You can restore it later.”
4. Jordan confirms.
5. Quiz `status` becomes `ARCHIVED` and disappears from default list.
6. Later, Jordan needs to reuse an archived quiz:

   * Opens filters and sets status filter to include ARCHIVED.
   * Locates the quiz and clicks row action “Restore”.
7. Status becomes `DRAFT` or `PUBLISHED` (MVP decision: restore to `DRAFT` to force review).
8. Jordan edits and publishes again.

Requirements:

* **QC-53**: “Archive” and “Restore” must be explicit actions with confirmation for Archive.
* **QC-54**: Default list must exclude `ARCHIVED` quizzes unless filter explicitly changed.

---

### 4.5 Edge Cases

#### Host loses connection mid-edit

* Autosave calls fail → show banner and error state (QC-29).
* Editor remains usable; changes held in memory.
* Once connection is detected again:

  * Autosave resumes and sends full current quiz state (or diff) to backend.
* If user closes the tab before reconnection and saves:

  * Worst case: last autosaved state is preserved; any unsynced changes since last successful save may be lost.

#### Host closes browser tab without saving

* If dirty state detected (unsynced changes):

  * Use browser “beforeunload” to warn.
* Autosave should minimize risk of actual data loss; this is a backup.

#### Conflicting updates (future collaboration)

* MVP assumption:

  * Single editor per quiz (no real-time collaboration).
* If multiple sessions occur (same user in two tabs):

  * Use optimistic concurrency (version field):

    * If backend detects `version` mismatch, respond with conflict error.
    * UI can show: “This quiz was updated in another tab. Please refresh.”
  * For MVP, we **do not** attempt to auto-merge changes.

---

## 5. Product Design & UX Direction

### 5.1 Visual Hierarchy (Editor Layout)

* **Top bar:**

  * Quiz title (editable inline).
  * Status badge (DRAFT/PUBLISHED/ARCHIVED).
  * Autosave indicator.
  * Primary actions: Publish / Unpublish, Archive.
* **Upper metadata area (beneath top bar):**

  * Fields for description, language, tags.
  * Editable but visually less prominent than title.
* **Left pane: Question list**

  * Vertical list of questions:

    * Question number (1, 2, 3…)
    * Truncated question text.
    * Status indicator if invalid (e.g., missing correct answer).
  * Supports:

    * Click to select question to edit.
    * Drag-and-drop reorder (handle icon).
    * “Add question” button at bottom (always visible).
* **Right pane: Question editor**

  * For selected question:

    * Type selector at top.
    * Question text input (large, multi-line).
    * Options list:

      * Option text fields.
      * Radio buttons / toggles to mark correct answer.
      * Add/remove option controls.
    * Advanced settings (collapsible section):

      * Time limit.
      * Points.
      * Explanation.
      * Media attachment control.
  * Clear separation between main content (text/options) and advanced settings.

### 5.2 Interaction Patterns

* Clear CTAs:

  * “Create new quiz” on dashboard.
  * “+ Add question” in editor.
  * “Publish” as primary action when in DRAFT.
* Autosave:

  * Always on; small, unobtrusive indicator (e.g., near top-right: “Saved” / “Saving…” / “Error”).
* Destructive actions:

  * Deleting a question:

    * Ask for confirmation: “Delete this question? This can’t be undone.” (or include temporary undo if implemented).
  * Archiving a quiz:

    * Confirmation dialog as described above.
* Inline validation messages:

  * Next to fields with errors (e.g., “Please select a correct answer”).

### 5.3 Accessibility

* Keyboard navigation:

  * Tab order must be logical within the editor.
  * Keyboard shortcuts (optional in MVP, but support Tab/Shift+Tab and Enter/Esc for dialogs).
  * Question list:

    * Up/down arrow keys to move selection (nice-to-have).
* Screen readers:

  * All form inputs must have programmatically associated labels (e.g., “Question text”, “Option 1 text”).
  * Radio buttons/controls for marking correct answers must have accessible labels (e.g., “Mark option 1 as correct”).
  * Buttons like “Add question”, “Delete question”, “Archive quiz” need accessible names.
* Contrast & text size:

  * Respect standard WCAG AA contrast for text and interactive elements.

### 5.4 Responsive Design

* Target:

  * **Desktop-first**: Editor optimized for laptops/monitors.
  * **Tablet** (landscape) should remain usable.
* Behavior:

  * On smaller widths:

    * Question list may collapse into a horizontal bar or toggle-able drawer.
    * Right pane may expand to full width when editing.
* Mobile:

  * Building quizzes on phones is not primary; ensure layout doesn’t break, but full optimization for phone creation can be deferred.

---

## 6. Technical Architecture & Integration Points

### 6.1 Quiz Service APIs (High-Level)

Assume a REST-like API; shape described at a high level.

* **Create quiz**

  * `POST /quizzes`
  * Request body:

    * `title`, `description`, `language`, `tags`, optional defaults.
  * Response:

    * Full quiz object (including `id`, `status=DRAFT`).
* **Get quiz**

  * `GET /quizzes/{quiz_id}`
  * Response:

    * Quiz object + array of questions.
* **Update quiz**

  * `PATCH /quizzes/{quiz_id}`
  * Request:

    * Partial updates for metadata (title, description, tags, language, status).
    * Include `version` for optimistic concurrency.
  * Response:

    * Updated quiz object with new `version`.
* **List quizzes**

  * `GET /quizzes`
  * Query params:

    * Pagination: `page`, `page_size`.
    * Filters: `status`, `source`, `tag`, `created_from`, `created_to`, `last_used_from`, `last_used_to`.
    * Search: `q` for title/description.
    * Sort: `sort_by`, `sort_order`.
  * Response:

    * `items: [quiz_summary...]`, `total`, `page`, `page_size`.
* **Archive quiz**

  * `POST /quizzes/{quiz_id}/archive`
  * Sets `status=ARCHIVED`.
* **Restore quiz**

  * `POST /quizzes/{quiz_id}/restore`
  * Sets `status=DRAFT` (or `PUBLISHED` per final product decision).
* **Duplicate quiz**

  * `POST /quizzes/{quiz_id}/duplicate`
  * Response:

    * New quiz object (status=DRAFT, new id).
* **Delete quiz (optional for admin)**

  * `DELETE /quizzes/{quiz_id}`
  * MVP UI won’t expose this.

#### Question APIs

* For simplicity and performance, operations can be grouped under `PATCH /quizzes/{id}` with full question list, but explicit question APIs can help.

* **Create question**

  * `POST /quizzes/{quiz_id}/questions`
  * Body: question payload (type, text, options, etc.).

* **Update question**

  * `PATCH /quizzes/{quiz_id}/questions/{question_id}`

* **Delete question**

  * `DELETE /quizzes/{quiz_id}/questions/{question_id}`

* **Reorder questions**

  * `POST /quizzes/{quiz_id}/questions/reorder`
  * Body: ordered array of question IDs (or objects with new indices).

Implementation can choose between **fine-grained** question APIs vs a **bulk update** approach; PRD leaves final decision to engineering, but UX expects near-real-time saves.

### 6.2 Data Storage & Versioning

* **Storage**

  * Relational DB or document store; must support queries by owner, tags, status, etc.
* **Versioning**

  * Each quiz has `version` integer.
  * Increment on each successful update.
  * Used for optimistic concurrency (detect conflicting edits).
* **Audit Logs (MVP optional)**

  * At minimum, log:

    * Quiz created.
    * Quiz published/unpublished.
    * Quiz archived/restored.
  * Full field-level history is nice-to-have, not MVP.

### 6.3 Performance Requirements

* Max quiz size:

  * Up to **100 questions per quiz** (MVP).
  * Each question text up to 500 chars; option text up to 200 chars.
* Latency:

  * Loading quiz list (typical user): < 500ms server time.
  * Loading a single quiz (with up to 100 questions): < 700ms server time.
  * Autosave requests: < 300ms server time.

### 6.4 Integration with Other Subsystems

* **AI Quiz Generation**

  * AI subsystem generates quizzes in the **same data model**:

    * Either directly via `POST /quizzes` with `source=AI_GENERATED`.
    * Or via internal service call.
  * Once created, AI-generated quizzes appear in quiz list as DRAFT with `source=AI_GENERATED`.
* **Game Hosting**

  * Game hosting service:

    * Uses `GET /quizzes/{quiz_id}` to fetch quiz for hosting.
    * On game start, it should:

      * Create a **snapshot** of the quiz+questions for that game.
      * Or store full quiz structure in game session record.
  * On game end, quiz’s `last_used_at` should be updated via `PATCH /quizzes/{id}`.
* **User Management**

  * `owner_id` derived from authenticated user.
  * Access control for list/get/update operations:

    * Only owner can interact with their quizzes in MVP.

### 6.5 Concurrency

* MVP assumption:

  * Only a single user edits a quiz at a time.
* Handling:

  * Use optimistic concurrency via `version` (QC-24).
  * If `PATCH` includes outdated `version`, return 409 Conflict.
* Collaborative editing (multiple users, real-time):

  * Explicitly **out of scope** for MVP.
  * PRD notes that future support will require:

    * Real-time sync.
    * Operational transforms or CRDTs.
    * More sophisticated locking or access patterns.

---

## 7. Permissions & Security

### 7.1 Who Can Do What (MVP)

* **Owner (individual user)**

  * Create quizzes.
  * View/edit their own quizzes (all states).
  * Publish/unpublish.
  * Archive/restore.
  * Duplicate.
* **Other users**

  * No access to others’ quizzes in MVP (no sharing).
* **Admin (future)**

  * View & moderate flagged quizzes (see abuse).

### 7.2 Future Organization Features (Not in MVP but Considered)

* `organization_id` allows:

  * Shared quizzes within a school/company.
  * Permission levels: Owner, Editor, Viewer.
* API and data schema should be compatible but actual sharing controls not implemented yet.

### 7.3 Abuse & Reporting

* MVP requirement:

  * Store enough metadata (owner_id, timestamps) to trace problematic content.
* Future:

  * Hook to allow “Report quiz” flag from game or library:

    * `POST /quizzes/{id}/flag`
  * Admin dashboard to moderate.

### 7.4 Security

* Quizzes accessible only with valid authentication tokens.
* Ensure no leakage of another user’s quizzes via list/search endpoints (scoped by owner_id or org permissions in future).

---

## 8. Analytics & Instrumentation

### 8.1 Events to Log

At minimum:

* `quiz_created`

  * Properties: quiz_id, owner_id, source, timestamp.
* `quiz_updated`

  * Properties: quiz_id, owner_id, fields_changed (if practical), timestamp.
* `quiz_published`

  * Properties: quiz_id, owner_id, question_count, time_since_creation.
* `quiz_archived`

  * Properties: quiz_id, owner_id.
* `quiz_restored`

  * Properties: quiz_id, owner_id.
* `quiz_used_in_game`

  * Triggered when game starts with quiz.
  * Properties: quiz_id, game_id, owner_id, timestamp.
* `question_added`, `question_deleted`

  * Optional, but helpful to understand complexity.

### 8.2 Metrics

From events, derive:

* Average number of quizzes created per active host per month.
* Median number of questions per quiz.
* Distribution of question types (MCQ vs True/False).
* % of created quizzes that become `PUBLISHED`.
* % of quizzes that are used in at least one game within 30 days.
* Time from:

  * Account creation → first quiz created.
  * Quiz created → quiz first published.
* Usage of features:

  * Duplicates per user per month.
  * Archive/restore usage.
  * Search/filter usage in quiz list.

---

## 9. Non-Functional Requirements

### 9.1 Reliability

* Autosave:

  * Must handle intermittent network failures gracefully.
  * Retry mechanism with exponential backoff.
  * Clear error state if failures persist.
* Data integrity:

  * No partial quiz states that break hosting (e.g., allow DRAFT with invalid questions, but PUBLISHED must be valid).

### 9.2 Performance

* UI feedback (loading spinners/skeletons) for quiz load and list.
* Target server response times already specified (Section 6.3).

### 9.3 Scalability

* System should handle:

  * **Thousands of quizzes per user** over time.
  * Query patterns optimized for owner_id + status + tags.
* Design DB schema and indices accordingly (owner_id, status, last_updated_at, last_used_at, tags).

### 9.4 Internationalization

* Quiz content:

  * Free text; no restrictions imposed.
* Metadata:

  * `language` field recorded at quiz level.
* UI:

  * Prepared for localization (string externalization), but MVP may launch in English only.

---

## 10. Dependencies, Risks, Open Questions

### 10.1 Dependencies

* **User Management**

  * Authenticated user identity (`owner_id`).
  * (Future) organization membership for `organization_id`.
* **AI Generation Service**

  * Must produce quiz objects compatible with this model.
  * Integration path: direct service call or API call to `/quizzes`.
* **Game Hosting**

  * Must:

    * Read quiz data via the Quiz service.
    * Implement snapshotting on game start.
    * Update `last_used_at`.

### 10.2 Key Risks

1. **Versioning & Game Consistency**

   * Risk: Edits to `PUBLISHED` quiz impacting scheduled or ongoing games.
   * Mitigation:

     * Game snapshots immutable at game start.
     * For scheduled games, clarify spec that they read quiz at game start.
2. **Autosave complexity**

   * Risk: Data loss or conflicting updates if autosave not robust.
   * Mitigation:

     * Extensive testing of offline/online scenarios.
     * Clear UX around errors.
3. **Scaling quiz libraries**

   * Risk: Querying large libraries (thousands per user) could become slow.
   * Mitigation:

     * Proper indexing.
     * Pagination and server-side filtering.

### 10.3 Open Questions (to be resolved in design/implementation)

1. **Unpublish semantics**

   * Do we allow `PUBLISHED → DRAFT` (unpublish)?
   * Recommended: yes, to allow temporary hiding from hosting.
2. **Restore target state**

   * When restoring from ARCHIVED, should quiz return to last state or always to DRAFT?
   * Recommended: restore to DRAFT to force review; final decision with UX.
3. **Hard delete**

   * Do we expose permanent delete in UI (beyond ARCHIVE)?
   * MVP suggestion: no; ARCHIVE is sufficient.
4. **Organization sharing model**

   * Detailed permission roles and sharing UI are out of scope; confirm timeline for when org features will be needed and design backward-compatible model now.
5. **Rich text & media**

   * MVP uses plain text; when do we add rich text (bold, bullet points) and richer media types (video/audio embedded) in questions and options?

---

This PRD defines the behavior, data model, UX expectations, and integration requirements for Quiz Creation & Management so that engineering can implement the quiz service, APIs, and editor UI with minimal further clarification.
