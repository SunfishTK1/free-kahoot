## PRD: Review & Editing Experience for AI-Generated Quizzes

---

### 0. Overview

This PRD defines the **review & editing layer** that sits on top of the existing quiz editor, optimized for AI-generated quizzes but applicable to all quizzes.

Assumptions:

* Base quiz editor already supports:

  * Quiz creation, basic question editing, saving, and state transitions (DRAFT → PUBLISHED).
  * Basic metadata (title, description, category, etc.).
* AI generation service already:

  * Takes a source (PDF/webpage) + parameters and returns a set of questions.
  * Can be called again with question context for per-question operations.

This PRD focuses on:

* How AI drafts are presented and reviewed.
* Tools to fix/improve AI content quickly.
* How AI assistance is integrated into editing without overwhelming users.

---

## 1. Problem Statement & Goals

### 1.1 Problem Statement

AI-generated quizzes are **not production-ready**. They may:

* Contain factual errors or misinterpret the source.
* Misalign with the teacher’s syllabus or trainer’s objectives.
* Have poor phrasing, inappropriate difficulty, or ambiguous answer choices.

Hosts must review & adjust AI output. Today:

* It’s unclear what was AI-generated vs manually edited.
* Editing multiple questions is slow and repetitive.
* AI assistance during editing is limited or non-existent.

We need a **fast, guided review & edit experience** that helps hosts get from AI draft → “ready to host” within 5–10 minutes.

### 1.2 Goals

* **G1: Reduce friction** from AI generation to hosting a game.

  * Make the next steps after generation obvious and focused.
* **G2: Make it obvious what to check and how to fix it.**

  * Clear labeling of AI content and confidence.
  * Question-level review status.
* **G3: Enable fast correction at scale.**

  * Bulk operations for common changes.
  * Per-question AI helpers that are easy to try and easy to undo.
* **G4: Maintain control and trust.**

  * Users always confirm AI changes.
  * No content silently replaced.

### 1.3 Success Metrics

**Primary**

* **M1: Time to ready**

  * Median time from “AI generation completed” → quiz marked “Ready to host”.
* **M2: Editing completion**

  * % of AI-generated quizzes that are marked “Ready to host” within the same session.
* **M3: User satisfaction**

  * CSAT/NPS specific to editing & review flow (in-product survey, e.g., 1–5 rating).

**Secondary**

* **M4: % of AI-generated quizzes with at least one manual edit**

  * Expect high initially; overtime may drop as AI improves.
* **M5: Avg edits per AI-generated question**

  * Includes text edits, delete, regenerate, rephrase.
* **M6: Usage of AI helpers**

  * % of questions where regenerate/rephrase is used at least once.

---

## 2. User Scenarios

### 2.1 Teacher – Quick Cleanup

* Teacher uploads a PDF of a chapter and generates a 15-question quiz.
* Needs to:

  * Delete 3 obviously bad/off-syllabus questions.
  * Edit wording on 5 questions (clarify, fix typos, adjust language to student level).
  * Shuffle question order to vary difficulty across the quiz.
* Wants to be done in ~5–10 minutes.

### 2.2 Trainer – Difficulty & Consolidation

* Corporate trainer generates a quiz on a policy document.
* Needs to:

  * Increase difficulty of some questions for advanced learners (e.g., add more nuanced distractors).
  * Merge two similar questions into one stronger question.
* Uses:

  * Manual editing + points/time adjustments.
  * Possibly AI “rephrase” or (future) “increase difficulty” helper.

### 2.3 Host – Fix Weak Questions with AI

* Host runs recurring trivia games.
* They generate a quiz from a sports news webpage.
* Some questions are weak, repetitive, or slightly off-topic.
* For specific questions, host wants to:

  * Try “Regenerate question” a couple of times until it’s acceptable.
  * Or manually tweak wording.
* They want clear **before/after** and easy “Accept” vs “Discard”.

---

## 3. Functional Requirements

Requirement IDs: **RE-#**

### 3.a Presentation of AI-Generated Quiz

**RE-1** After AI generation completes, user is redirected to a **“Review AI-Generated Quiz”** screen rather than the generic quiz list.

* The screen shows:

  * Quiz title (editable if base editor supports it).
  * **Source summary**:

    * Source type (PDF / URL).
    * Truncated source name (e.g., file name, page title).
  * Generation summary:

    * Requested number of questions.
    * Generated number of questions.
    * Time of generation.

**RE-2** The quiz is labeled clearly as an **“AI-generated draft”** until the user marks it as ready.

* Badge near title, e.g., “AI-generated draft”.
* Tooltip explaining that content is a first draft and requires review.

**RE-3** Each question card in the question list must display:

* Question index (Q1, Q2, …).
* First line of question text (truncated).
* Difficulty tag (if available: e.g., Easy/Medium/Hard).
* Correct answer indicator (e.g., a small “Correct: A” snippet).
* Status chip: **Not reviewed / Reviewed / Invalid**.
* AI badge (e.g., icon + “AI”).

**RE-4** In the detailed question pane, show:

* Full question text.
* Answer options (for MCQ).
* Correct answer(s) clearly marked.
* Explanation (if present).
* Difficulty tag (if present).
* Time limit, points.
* AI provenance:

  * `is_ai_generated` flag icon with tooltip.
  * If available, a **confidence score** badge (Low/Med/High); see data model requirements.

### 3.b Editing Tools

**Per-question core actions**

**RE-5** Users can:

* Edit question text (rich text or plain text depending on base editor).
* Edit options (add, remove, modify text).
* Change which options are correct.
* Change time limit.
* Change points value.
* Change difficulty tag (if editable in base model).
* Mark question as “Reviewed” (checkbox/toggle).

**RE-6** Users can:

* **Reorder questions** via drag & drop in the left question list.
* **Duplicate a question** (creates new question with “Not reviewed” status, AI badge is optional – defined as non-AI, but with provenance pointing to original).
* **Delete a question**:

  * Immediate removal from list (with optional 1-step undo, see change tracking).

**Bulk actions**

**RE-7** In the question list, users can multi-select questions via:

* Checkbox per question row.
* “Select all” for current filtered view.

**RE-8** Available bulk operations:

* Delete selected questions.
* Change points for selected questions.
* Change time limit for selected questions.
* Mark selected as “Reviewed” / “Not reviewed”.

**Validation**

**RE-9** Quiz structure validation rules:

* Every question must have at least one correct answer.
* A quiz must have at least 1 question to be marked “Ready to host”.
* Time limit and points must be within configured bounds (configurable).

**RE-10** Invalid questions must be flagged:

* Inline error state in question card and detail pane.
* Status chip shows “Invalid”.
* Quiz-level status must show there are unresolved validation errors.

### 3.c AI-Assisted Editing (Per-Question)

**AI Helper Actions**

**RE-11** Per-question AI actions (buttons) in the question detail pane:

* “Regenerate question”
* “Rephrase question”
* (Future) “Simplify question”
* (Future) “Increase difficulty”

For this PRD, only **Regenerate** and **Rephrase** are in scope MVP; simplifying/difficulty adjustments are future.

**RE-12** When “Regenerate question” is triggered:

* The system calls the AI service with:

  * Question ID.
  * Original question text.
  * Source document identifier and scope (e.g., source section, page).
  * Quiz metadata (e.g., topic, difficulty if available).

**RE-13** When “Rephrase question” is triggered:

* The system calls the AI service with:

  * Original question text + options.
  * Constraints: keep meaning and correct answer(s) unchanged.
  * Optional parameters (e.g., reading level) may be added later.

**Before/After and Acceptance**

**RE-14** AI operations must **never overwrite** the existing question without explicit user confirmation.

* After AI response, show a **comparison view** in the right pane:

  * Left: Current question (read-only snapshot).
  * Right: AI-proposed version (editable before confirming is optional; MVP can keep it read-only).

* Controls:

  * Primary button: “Replace with this version”.
  * Secondary button: “Discard”.

**RE-15** On “Replace with this version”:

* The current question text and options are replaced with AI output.
* Status is set to **Not reviewed** (question must be re-reviewed).
* `is_ai_modified` flag (or similar) is set for analytics.
* Original AI version may be stored (see data model).

**RE-16** On “Discard”:

* No change to the current question.
* The comparison view is dismissed.

**Rate Limiting & Constraints**

**RE-17** To limit costs:

* Enforce per-quiz rate limits for AI helper actions, configurable by environment (e.g., 50 AI calls per quiz per day).
* Enforce per-session rate limits if needed (e.g., 10 AI operations per minute).

**RE-18** If user hits a rate limit:

* Show non-blocking toast: “AI edits temporarily unavailable. Please try again soon.”
* Disable AI buttons with tooltip explaining the limit until window resets.

**AI Provenance of Edits**

**RE-19** Any question modified through AI helper must show:

* Visual indicator “AI-edited” (e.g., small lightning icon).
* Tooltip: “This question was modified by AI on [timestamp].”

---

### 3.d Quiz-Level Review & Finalization

**Checklist & Ready State**

**RE-20** Quiz-level header area shows:

* Total questions count.
* Reviewed questions count.
* Invalid questions count.
* Progress indicator: e.g., “9/15 questions reviewed”.

**RE-21** Provide a clear quiz-level action:

* Button: **“Mark as ready to host”** (or “Publish quiz” based on global terminology).

**RE-22** Criteria for allowing “Ready to host”:

* At least 1 valid question.
* No invalid questions.
* Quiz is in DRAFT state.

**RE-23** On click “Mark as ready to host”:

* Perform final validation; if failures:

  * Show modal summarizing issues (e.g., “2 questions are invalid: Q4, Q7”).
  * Provide direct links to problematic questions.
* If validation passes:

  * Change quiz state: DRAFT → PUBLISHED (or READY).
  * Show confirmation toast and update labels/badges.

**RE-24** Questions do **not** need to be individually marked as reviewed for publication (for MVP); quiz can be published with some questions still flagged as “Not reviewed”. We will reevaluate this later (see open questions).

---

### 3.e Change Tracking & Undo

**Undo & Autosave**

**RE-25** Provide **single-step undo** for destructive/question-level operations within the current session:

* Deleting a question.
* Bulk delete.
* Replacing a question via AI regenerate/rephrase.
* Possibly reorder changes (optional for MVP).

**RE-26** Undo UX:

* After supported action, show an inline toast at bottom of screen:

  * “Question deleted.” with “Undo” link.
* Undo is available for ~10 seconds, or until next conflicting action.

**RE-27** Autosave behavior:

* Edits to question text/options/time/points should autosave.
* Show “Saving…” inline indicator, followed by “All changes saved” on success.
* Avoid manual “Save” button for each edit.

**Versioning**

**RE-28 (MVP)** Persist only the **current** version of question.

* Keep a single snapshot of the **original AI-generated version** in a separate field (e.g., `original_ai_text`) for comparison and analytics.
* No full multi-version history in MVP.

**RE-29 (Future)** Full version history per question (beyond MVP, not in this release).

---

### 3.f Error Handling

**AI Failure**

**RE-30** If an AI-assisted edit fails (e.g., API error, timeout):

* Do not change the current question content.
* Show:

  * Inline message near AI button (e.g., “Couldn’t regenerate. Please try again.”), and/or
  * Toast message at the bottom.
* Provide a “Retry” affordance if appropriate.

**Network / Save Failure**

**RE-31** If network issues occur during autosave:

* Show non-blocking error banner: “We’re having trouble saving your changes. Your latest edits may not be saved.”
* Continue to buffer edits locally if possible (implementation detail).
* Provide a “Retry save” action.

**RE-32** If user attempts to navigate away with unsaved changes:

* Show confirmation modal: “You have unsaved changes. Leave without saving?” [Leave] / [Stay].
* If autosave retries succeed before they leave, modal should not appear.

---

## 4. User Flows (Detailed)

### 4.1 Flow: Review AI-Generated Quiz and Mark as Ready

**Actors:** Teacher/Trainer/Host

1. **AI generation completes**

   * System redirects user to the **Review AI-Generated Quiz** screen for the new quiz.
2. **Quiz Overview**

   * Header:

     * Title (editable), AI-generated draft badge.
     * Source: “PDF: Chapter_5_Ecosystems.pdf”.
     * Summary: “Requested: 15 questions, Generated: 15”.
   * Bulk status:

     * Progress: “0/15 questions reviewed”.
3. **User scans question list (left pane)**

   * Each question shows AI badge, “Not reviewed” status.
   * User clicks Q1.
4. **Review Q1 in detail (right pane)**

   * User reads question text, options, correct answer.
   * Makes minor edits (e.g., fix wording).
   * System autosaves.
   * User toggles “Mark as reviewed”.
   * Status updates: Q1 now shows “Reviewed”.
   * Progress updates: “1/15 questions reviewed”.
5. **Repeat for other questions**

   * The user:

     * Edits Q2, Q3.
     * Deletes Q4 (bad question).

       * Toast: “Question deleted. Undo.”
     * Edits Q5 and duplicates it to create Q6 with slightly different options.
6. **Bulk actions**

   * User selects Q7–Q10 in list.
   * Bulk action: Change points from 100 → 200.
   * Bulk action: Mark selected as “Reviewed”.
7. **Handle invalid question**

   * System flags Q11 as invalid (no correct answer).
   * In header, “1 invalid question”.
   * User clicks the header warning; it scrolls to Q11.
   * User fixes correct answer; status becomes “Not reviewed”; user then marks as “Reviewed”.
8. **Finalize**

   * All questions valid, some may still be “Not reviewed” (allowed).
   * User clicks “Mark as ready to host”.
   * Final validation passes; quiz transitions to PUBLISHED / READY.
   * Confirmation toast: “Quiz is ready to host.”

### 4.2 Flow: Fix a Bad Question – AI Regenerate vs Manual Edit

**Starting point:** User has identified Q4 as weak/off-topic.

**Branch A: AI Regenerate**

1. User selects Q4 from list.
2. In question detail, clicks **“Regenerate question”**.
3. System:

   * Disables AI buttons for this question while call is in progress.
   * Shows spinner and text: “Regenerating question…”.
4. AI response arrives with new question/answers.
5. **Comparison view** opens:

   * Left panel: current Q4 (read-only).
   * Right panel: AI-proposed Q4′.
   * Buttons: “Replace with this version” (primary), “Discard” (secondary).
6. User reviews Q4′.
7. If user clicks “Replace with this version”:

   * System updates Q4 text/options.
   * Marks Q4 as “Not reviewed” (even if it was previously reviewed).
   * Q4 card shows AI-edited badge.
   * Comparison view closes.
8. User may now tweak wording manually and then mark as “Reviewed”.

**Branch B: Manual Edit**

1. User selects Q4.
2. Instead of AI, user directly edits:

   * Question text.
   * Options, correct answer.
3. Autosave occurs.
4. User toggles “Mark as reviewed”.
5. Q4 card updates status; no AI-edited badge (unless it was previously AI-modified).

### 4.3 Flow: Bulk Clean-up of Quiz

**Starting point:** Quiz has 25 questions; user wants to reduce to 18 and normalize settings.

1. User opens quiz in Review screen.
2. In question list, user scans for low-quality/duplicated questions.
3. User checks boxes for Q3, Q7, Q9, Q14, Q21, Q23, Q24.
4. Bulk action dropdown → **“Delete selected (7)”**.
5. Confirmation modal:

   * “Delete 7 questions? This can’t be undone.” (We still have temporary Undo via toast).
   * User confirms.
6. Questions removed; toast appears: “7 questions deleted. Undo”.
7. User now selects all remaining questions via header checkbox.
8. Bulk action → “Set time limit” → enters “30 seconds”.
9. Bulk action → “Set points” → enters “200 points”.
10. Optional: user uses “Sort by status” or “Filter to show Not reviewed” to quickly inspect remaining items.
11. After reviewing a few, user hits “Mark as ready to host”.

---

## 5. Product Design & UX Direction

### 5.1 Overall Layout (Desktop)

* **Header bar:**

  * Quiz title (editable).
  * AI-generated badge.
  * Source summary (icon + filename/URL).
  * Quiz-level status: DRAFT / Ready / Published.
  * Progress pill: “12/15 reviewed • 0 invalid”.
  * Primary action: “Mark as ready to host”.

* **Main body: 2-pane layout**

  * **Left pane: Question list**

    * Scrollable list of question rows.
    * Each row shows:

      * Checkbox (for bulk actions).
      * Q number (Q1).
      * Truncated question text.
      * Small pill for difficulty (E/M/H).
      * Status chip (Not reviewed/Reviewed/Invalid).
      * AI icon.
    * Sorting/filter controls:

      * Filter by status (All/Not reviewed/Reviewed/Invalid).
      * Filter by difficulty (optional).
  * **Right pane: Question detail**

    * Top: Question number, AI badge, review toggle.
    * Question text editor.
    * Answer options editor.
    * Correct answer markers.
    * Explanation field (if supported).
    * Settings: time limit, points, difficulty.
    * AI helper section:

      * Buttons: “Regenerate question”, “Rephrase question”.
      * Helper info text explaining that user must accept to apply changes.

### 5.2 Visual Language

* AI provenance:

  * Use a small, consistent AI icon (e.g., a sparkle/bolt).
  * Tooltip: “Generated by AI” / “Edited by AI”.
* Confidence:

  * Optional badge with label (e.g., “Confidence: Medium”).
  * Use non-alarmist colors; low confidence should draw attention but not panic.
* Validation & errors:

  * Invalid questions use warning color and exclamation icon.
  * Inline error messages next to the field (e.g., “At least one correct answer is required”).

### 5.3 Review Status UX

* Per-question **“Reviewed”** toggle:

  * Checkbox/slider near question title: “Mark as reviewed”.
  * Changing any content after marking “Reviewed” auto-sets status back to “Not reviewed”.
* Progress indicator:

  * Header shows a simple fraction.
  * Optionally a thin progress bar under the header.
* Filter:

  * Ability to quickly switch view to “Not reviewed” to focus on remaining work.

### 5.4 Mobile UX

* Layout shifts to **stacked views**:

  * First screen: list of questions (scroll list).
  * Tapping a question opens a full-screen question detail editor.
  * Back navigation returns to list.
* Limitations:

  * Bulk operations may be limited (select via long-press, then multi-select).
  * Drag & drop reorder should still be possible but can be lower priority for MVP.
* Priority:

  * Ensure core operations (edit text/options, delete, mark reviewed, AI regenerate/rephrase) function correctly.
  * Full parity of advanced bulk/edit features can be incremental.

---

## 6. Technical Requirements & Integration Points

### 6.1 APIs

**Note:** Endpoint names are illustrative; actual naming must align with existing backend.

#### 6.1.1 Quiz & Question Updates

**RE-33** API to update question data:

* `PATCH /quizzes/{quiz_id}/questions/{question_id}`
* Payload (example):

```json
{
  "text": "string",
  "options": [
    { "id": "opt_1", "text": "string", "is_correct": true },
    { "id": "opt_2", "text": "string", "is_correct": false }
  ],
  "time_limit_seconds": 30,
  "points": 200,
  "difficulty": "medium",
  "review_status": "reviewed", 
  "is_ai_generated": true,
  "ai_confidence": 0.78
}
```

**RE-34** API for bulk updates:

* `POST /quizzes/{quiz_id}/questions/bulk-update`
* Payload includes list of question IDs + fields to update.

```json
{
  "question_ids": ["q1", "q2", "q3"],
  "time_limit_seconds": 30,
  "points": 200,
  "review_status": "reviewed"
}
```

**RE-35** API to reorder questions:

* `POST /quizzes/{quiz_id}/questions/reorder`
* Payload:

```json
{
  "order": ["q3", "q1", "q2", "q4"]
}
```

**RE-36** API to mark quiz as ready/published:

* `POST /quizzes/{quiz_id}/publish`
* Backend must handle validation and state transition.

#### 6.1.2 AI Edit Operations

**RE-37** Per-question AI regenerate:

* `POST /ai-edit/regenerate-question`
* Payload:

```json
{
  "quiz_id": "quiz_123",
  "question_id": "q4",
  "source_id": "src_456",
  "source_context": {
    "page_range": [5, 6],
    "section_id": "sec_789"
  },
  "current_question": {
    "text": "string",
    "options": [
      { "text": "A", "is_correct": false },
      { "text": "B", "is_correct": true }
    ]
  }
}
```

* Response:

```json
{
  "proposed_question": {
    "text": "new question text",
    "options": [
      { "text": "A1", "is_correct": false },
      { "text": "B1", "is_correct": true }
    ],
    "difficulty": "medium",
    "ai_confidence": 0.81
  }
}
```

**RE-38** Per-question AI rephrase:

* `POST /ai-edit/rephrase-question`
* Payload:

```json
{
  "quiz_id": "quiz_123",
  "question_id": "q4",
  "current_question": {
    "text": "original text",
    "options": [
      { "text": "A", "is_correct": false },
      { "text": "B", "is_correct": true }
    ]
  },
  "constraints": {
    "preserve_correct_answer": true
  }
}
```

* Response similar to regenerate, but with the same correct answer semantics maintained.

**RE-39** AI endpoints must return errors with clear error codes (rate_limit, validation_error, system_error) for the client to show appropriate messages.

### 6.2 Data Model

Extend existing question & quiz models.

**Question fields:**

* `is_ai_generated: boolean`
* `ai_confidence: number | null` (0–1, optional)
* `review_status: enum("not_reviewed", "reviewed")`
* `is_valid: boolean` (or derived from validation)
* `original_ai_text: string | null` (JSON string storing initial AI version – text + options)
* `ai_last_modified_at: datetime | null`
* `ai_modified_count: integer` (# AI helper operations applied)

**Quiz fields:**

* `generation_source_type: enum("pdf", "url", "manual", ...)`
* `generation_source_id: string | null`
* `ai_generated: boolean`
* `status: enum("draft", "ready", "published", ...)`

### 6.3 Integration Points

* **AI Generation Service**

  * Already used for initial quiz generation.
  * Must expose per-question operations `/ai-edit/*`.
* **Quiz Service**

  * Single source of truth for quiz and question data.
  * Manages state transitions and validation.
* **Auth/Rate Limit**

  * AI calls may be throttled by user/account.

---

## 7. Performance & Non-Functional Considerations

**RE-40** Editing UI must feel responsive:

* Local edits applied instantly.
* Autosave operations must not block typing or reordering.

**RE-41** AI operations latency expectations:

* Target p95 latency for regenerate/rephrase: ≤ 5 seconds.
* Show clear loading state; if >5 seconds, persist spinner and allow cancel if possible.

**RE-42** Optimistic UI for non-critical operations:

* For reorder, delete, bulk changes: update UI immediately, reconcile with server response.
* On server error, revert visually and show error message.

**RE-43** Scalability:

* UI must handle at least 100 questions per quiz without significant lag in list scrolling or reordering.

**RE-44** Accessibility:

* All key actions (edit, delete, review toggle, AI helpers) must be keyboard accessible.
* Screen reader labels for AI badges and review status.

---

## 8. Analytics & Instrumentation

**Question-level events:**

* `question_edit`:

  * Fields: quiz_id, question_id, field_changed (text/options/time/points), source (manual/ai).
* `question_delete`
* `question_duplicate`
* `question_review_status_change`:

  * from_status → to_status.
* `question_ai_regenerate_triggered`
* `question_ai_regenerate_accepted`
* `question_ai_regenerate_discarded`
* `question_ai_rephrase_triggered`
* `question_ai_rephrase_accepted`
* `question_ai_rephrase_discarded`

**Quiz-level events:**

* `quiz_ai_generated` (existing).
* `quiz_open_review_screen`
* `quiz_publish_from_ai_draft`
* `quiz_publish_validation_failed`:

  * Reason: invalid_questions, no_questions, etc.

**Metrics derived:**

* Ratio of AI-generated questions **kept vs deleted**:

  * `kept = total_ai_questions - deleted_ai_questions`.
* Average number of question edits per quiz.
* AI helper adoption:

  * % of quizzes where regenerate/rephrase used.
  * Mean AI calls per quiz.
* Time-to-ready:

  * Duration from `quiz_ai_generated` → `quiz_publish_from_ai_draft`.

---

## 9. Risks & Open Questions

### 9.1 Risks

* **R1: Overcomplicated UI**

  * Too many controls (review status, AI badges, confidence, bulk actions) could overwhelm teachers, especially non-technical users.
  * Mitigation: Progressive disclosure; hide advanced controls behind “more” menus where possible.

* **R2: AI cost overrun**

  * Overuse of regenerate/rephrase can drive up costs.
  * Mitigation: Rate limits, clear usage rules, and default to manual edits for small tweaks.

* **R3: Misinterpretation of AI confidence**

  * Users may treat “High confidence” as “definitely correct”.
  * Mitigation: Tooltips emphasizing that all questions should be reviewed, confidence is heuristic.

* **R4: Performance issues with large quizzes**

  * Many questions with complex UI components may slow rendering.
  * Mitigation: Virtualized lists, lightweight components, debounced saves.

### 9.2 Open Questions

* **Q1: Version history depth**

  * Do we need multiple revision steps (original AI, several AI regenerations, multiple manual edits)? For now we store only original AI and current.
* **Q2: Review status enforcement**

  * Should we require all questions be marked as “Reviewed” before publish in some environments (e.g., schools with compliance needs)?
* **Q3: Confidence source**

  * Do we store numeric AI confidence or derive discrete levels (Low/Med/High) server-side?
* **Q4: Per-role behavior**

  * Should trainers vs teachers see different defaults (e.g., trainers see more advanced AI helpers)?
* **Q5: Merge questions**

  * This PRD expects merging to be manual (copy/paste and delete); do we want explicit “merge questions” tools or AI merging in future?

---

## 10. Out of Scope / Future Enhancements

* Full version history with rollback to any previous state.
* Advanced AI helpers:

  * “Simplify question” with reading level controls.
  * “Increase difficulty” by changing question structure.
  * Automatic detection & highlighting of potentially incorrect answers.
* Collaborative review (multiple reviewers with comments).
* Per-user review assignments and approvals.

---

This PRD defines the end-to-end review & editing UX for AI-generated quizzes: how AI drafts are presented, how users fix them quickly with both manual tools and AI assistance, and how they confidently move to a “ready to host” state.
