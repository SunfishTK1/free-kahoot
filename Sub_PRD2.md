## 1. Problem Statement & Goals

### 1.1 Problem Statement

Teachers, trainers, and course creators typically start with dense materials: textbook chapters, PDFs of slide decks, or long-form web articles. Turning these into engaging, well-structured quizzes is:

* Time-consuming (often 30–60 minutes+ per quiz).
* Mentally taxing (must parse key ideas, balance difficulty, write plausible distractors).
* Repetitive (similar workflow week after week).

We want to let them go from **content → playable quiz** in a few minutes with minimal friction, using AI to produce a high-quality first draft.

### 1.2 Goals

* Allow hosts to generate a **draft quiz from a PDF or URL** in one short flow.
* Minimize editing required so AI quizzes are “good enough” for real use with light tweaks.
* Make AI generation **predictable and controllable** (question count, difficulty, type).
* Ensure **safety and reliability** (no obviously inappropriate or off-topic content).
* Keep **costs bounded** via limits, chunking, and rate controls.

### 1.3 Success Metrics (initial targets)

* **Adoption**

  * G1: ≥ 40% of new hosts use AI quiz generation at least once in their first week.
* **Engagement**

  * G2: ≥ 2 AI-generated quizzes per active host per month (active = hosted at least 1 game).
* **Quality**

  * G3: Average quiz quality satisfaction ≥ 3.8 / 5 in in-product survey (e.g. “How useful was this AI-generated quiz?”).
  * G4: ≥ 60% of AI-generated quizzes are used in at least one live game (proxy for usefulness).

---

## 2. User Personas & Use Cases

### 2.1 Personas

1. **Teacher (K–12 / Higher Ed)**

   * Has textbook chapters, worksheets, and PDFs provided by publisher.
   * Limited time; wants formative assessments quickly.
   * Needs difficulty aligned with student level.

2. **Corporate Trainer**

   * Uses slide decks (exported to PDF) and internal PDFs for onboarding, compliance, or skills training.
   * Needs quizzes that reinforce key learning objectives.
   * Careful about confidential content.

3. **Online Course Creator**

   * Works with long-form blog posts, documentation, or course pages.
   * Wants engagement and retention checks.
   * Often iterates content and quizzes over time.

### 2.2 Key Use Cases

1. **U1: Generate quiz from PDF chapter**

   * “Generate 10 multiple-choice questions from chapter 3 of this PDF.”
   * Controls: 10 questions, medium difficulty.
   * Output: Draft quiz sent straight into the editor.

2. **U2: Generate quiz from slide deck (PDF)**

   * “Create a 15-question quiz from this training PDF, focusing on policy details.”
   * Controls: 15 questions, easy/medium difficulty.
   * Output: Balanced coverage across slides.

3. **U3: Generate quiz from URL**

   * “Create a 15-question quiz from this URL focused on key concepts.”
   * Controls: 15 questions, mixed difficulty (“Quick quiz”).
   * Output: Questions covering main headings/sections.

4. **U4: Regenerate / Adjust difficulty**

   * “Regenerate questions because the first attempt was too easy/hard.”
   * Uses same source and parameters, with difficulty adjusted.

5. **U5: Partial success**

   * Source too short or narrow; system can only generate 6 questions for a requested 10.
   * Host can accept 6, or request more (possibly with relaxed constraints).

---

## 3. Functional Requirements

> IDs: AIQ-1, AIQ-2, … for traceability.

### 3.1 General

* **AIQ-1**: System MUST support AI quiz generation from **PDF file upload** and **webpage URL** as distinct entry flows.
* **AIQ-2**: Generated quizzes MUST be represented as structured quiz objects compatible with existing Quiz Creation & Management.
* **AIQ-3**: All AI generation operations MUST be logged with metadata (user, timestamp, model, parameters).
* **AIQ-4**: System MUST expose clear, user-facing status states: `Uploading`, `Extracting`, `Analyzing`, `Generating`, `Completed`, `Failed`.

---

### 3.2 Input Sources

#### 3.2.1 PDF

* **AIQ-10**: MVP supports **.pdf** file type only for AI generation.
* **AIQ-11**: Maximum PDF file size for upload MUST initially be set (MVP suggestion: 25 MB). Requests exceeding this MUST fail with a clear error: “File is too large. Please upload a smaller PDF or split it.”
* **AIQ-12**: System MUST validate file extension client-side and server-side. Non-PDF uploads MUST be rejected with error: “Only PDF files are supported for AI quiz generation at this time.”
* **AIQ-13**: System MUST detect **encrypted/password-protected PDFs** (via PDF library). If detected, generation MUST fail with: “This PDF is encrypted and cannot be processed. Please provide an unprotected version.”
* **AIQ-14**: MVP behavior for **scanned PDFs / image-only PDFs**:

  * If extracted text length is below a configurable threshold (e.g., < 1,000 characters), system MUST treat file as “not processable” and show: “This PDF appears to be scanned or image-based and cannot be processed for AI quiz generation.”
  * No OCR in MVP.
* **AIQ-15**: System MUST support multi-page PDFs up to a global **content-size limit** (see Content Size below).

#### 3.2.2 Webpage (URL)

* **AIQ-20**: A dedicated input field MUST accept a URL string.
* **AIQ-21**: URL MUST pass basic validation (scheme http/https, syntactically valid). Invalid URLs MUST show: “This doesn’t look like a valid URL. Please check and try again.”
* **AIQ-22**: System MUST perform a server-side HTTP fetch. On non-2xx responses, it MUST fail with: “We couldn’t reach this page (status: xxx). Please verify the URL or try another page.”
* **AIQ-23**: If the request times out or fails to connect, user MUST see: “We couldn’t load this page. Please check your connection or try another URL.”
* **AIQ-24**: System MUST handle **redirects** (follow standard HTTP redirects) and continue extraction on final URL.
* **AIQ-25**: If main content extracted is below a minimal threshold (e.g., < 1,000 characters), system MUST show: “There’s not enough readable content on this page to generate a quiz.”

---

### 3.3 Content Extraction & Preprocessing

#### 3.3.1 PDF Extraction

* **AIQ-30**: System MUST use a server-side PDF parsing library capable of text extraction from each page.
* **AIQ-31**: Extraction MUST preserve **basic ordering** (page-by-page) but does not need exact layout fidelity.
* **AIQ-32**: System SHOULD attempt to remove common **headers/footers**:

  * Implement heuristic: repeated text at top/bottom of many pages (e.g., > 50% pages) is removed.
* **AIQ-33**: System SHOULD remove page numbers where clearly distinguishable (e.g., standalone numbers at bottom).
* **AIQ-34**: Multi-column layouts:

  * MVP: Accept that some ordering may be off; no advanced column detection required.
  * System MUST document this limitation in internal docs and may show a generic disclaimer for PDFs (“Complex multi-column layouts may be imperfectly processed.”).
* **AIQ-35**: Whitespace normalization:

  * Collapsing multiple spaces/newlines into single spaces.
  * Preserving paragraph breaks as single newline markers where possible.

#### 3.3.2 Webpage Extraction

* **AIQ-40**: System MUST use an algorithm or library to extract the **main article body**:

  * Prioritize `<article>`, main content area, headings, paragraphs.
  * Exclude navigation menus, sidebars, ads, comments where possible.
* **AIQ-41**: All HTML tags MUST be stripped from extracted content. Only plain text is passed downstream.
* **AIQ-42**: System MUST normalize whitespace similarly to PDF: collapse multiple spaces, remove extraneous line breaks.
* **AIQ-43**: Non-text elements (images, videos, iframes) are ignored in MVP; alt text is not required.

#### 3.3.3 Content Size Limit & Chunking

* **AIQ-50**: System MUST define a **maximum content size per AI call** based on model context (e.g., target <= 10,000 tokens effective, configurable).
* **AIQ-51**: Pre-AI pipeline MUST estimate token count from characters (e.g., heuristic 4 chars/token) and decide whether chunking is necessary.
* **AIQ-52**: If extracted content exceeds the **per-call token budget**, system MUST:

  * Split content into **logical chunks** on paragraph or section boundaries (e.g., by headings or large paragraph breaks).
  * Ensure each chunk is <= max chunk token limit (configurable).
* **AIQ-53**: Each chunk MUST be processed independently (see AI & chunking strategy).
* **AIQ-54**: System MUST maintain a **mapping** of chunk index → source metadata (e.g., page ranges for PDF, section headings for URL) for potential future enhancements (e.g., references).
* **AIQ-55**: If content is extremely large (e.g., still > max total allowed tokens even with chunking), system MAY:

  * Limit processing to the first N chunks or first N tokens.
  * Show warning: “Your document is very long. We generated a quiz from the first part of the content.”

#### 3.3.4 Error Messaging & Progress States

* **AIQ-60**: Whenever extraction fails (PDF or URL), user must see a concise, human-readable error message and an option to:

  * Go back and choose another source.
  * Adjust parameters (if relevant).
* **AIQ-61**: Frontend MUST reflect the following states:

  * `Uploading` (for PDFs).
  * `Extracting content`.
  * `Analyzing & generating quiz`.
  * `Finalizing quiz`.
* **AIQ-62**: These states MUST be driven by backend job status fields (see Architecture).

---

### 3.4 AI Quiz Generation Parameters

* **AIQ-70**: MVP host-configurable parameters:

  * **Number of questions**: integer, allowed range [5, 25] (configurable).
  * **Question type**: MVP supports `multiple_choice` only. System SHOULD be designed to support additional types later (true/false, short answer).
  * **Difficulty**: `easy`, `medium`, `hard`, or `mixed`.
* **AIQ-71**: Default preset “Quick quiz”:

  * 10 questions, `multiple_choice`, `mixed` difficulty.
* **AIQ-72**: System MUST validate question count and difficulty before starting generation. Invalid inputs MUST be blocked client-side and server-side.
* **AIQ-73**: User-selected parameters MUST be included in AI prompts explicitly:

  * Example instructions:

    * “Generate exactly N multiple-choice questions…”
    * “Difficulty: [easy/medium/hard/mixed]…”
* **AIQ-74**: When difficulty is `mixed`, the model MUST be instructed to balance difficulty roughly across easy/medium/hard (e.g., 40/40/20 split).

---

### 3.5 Azure OpenAI & Function Calling

#### 3.5.1 Model & Deployment

* **AIQ-80**: System MUST use an Azure OpenAI deployment (e.g., `gpt-4.1` family) that:

  * Supports function calling.
  * Has a sufficiently large context window for our chunk size.
* **AIQ-81**: Model deployment name and base URL MUST be configurable per environment.

#### 3.5.2 Function Schema

The AI call MUST define a function (tool) for structured quiz output, e.g.:

```json
{
  "name": "create_quiz",
  "description": "Create a multiple-choice quiz from source content.",
  "parameters": {
    "type": "object",
    "properties": {
      "quiz_title": {
        "type": "string",
        "description": "Short descriptive title for the quiz."
      },
      "questions": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["question", "options", "correct_index", "difficulty"],
          "properties": {
            "question": { "type": "string" },
            "options": {
              "type": "array",
              "items": { "type": "string" },
              "minItems": 4,
              "maxItems": 4
            },
            "correct_index": {
              "type": "integer",
              "description": "0-based index into options array."
            },
            "explanation": {
              "type": "string",
              "description": "Optional brief explanation of the correct answer."
            },
            "difficulty": {
              "type": "string",
              "enum": ["easy", "medium", "hard"]
            }
          }
        }
      }
    },
    "required": ["quiz_title", "questions"]
  }
}
```

* **AIQ-82**: Model MUST be invoked with function calling such that it **always** returns via `create_quiz`.
* **AIQ-83**: System MUST validate the returned JSON against the schema (server-side). Invalid responses MUST be handled gracefully (see Error Handling).

#### 3.5.3 Prompting

* **AIQ-90**: System prompt MUST:

  * Instruct the model to strictly base questions on provided content.
  * Instruct avoidance of harmful or inappropriate content.
  * Define tone and style (clear, age-appropriate if possible).
* **AIQ-91**: User/content prompt MUST include:

  * Extracted chunk text (or subset).
  * Host parameters: number of questions, difficulty, type.
  * High-level instructions: e.g., focus on key concepts, not trivial details.

Example pseudo-prompt (for implementation guidance):

> “You are an assistant that generates multiple-choice quiz questions strictly from the provided source text. Do not use external knowledge. Generate EXACTLY {N} questions, {type}, difficulty {difficulty}. Each question must have 4 options with one correct answer. Avoid offensive or inappropriate content.”

#### 3.5.4 Token Limits & Chunking Strategy

* **AIQ-100**: For each chunk, system MUST ensure:

  * `tokens(source content) + tokens(prompt) + tokens(expected output)` <= model context window – safety margin.
* **AIQ-101**: When multiple chunks are used:

  * Total question target N MUST be split across chunks (e.g., proportional to chunk length).
  * Example: 3 chunks, N=15 → 5 questions per chunk.
* **AIQ-102**: If a chunk fails to produce its allocated number of questions, remaining questions MAY be requested from other chunks if available or overall question count is reduced (with explanation to user).
* **AIQ-103**: System MUST combine questions from all chunks into a single quiz, ensuring:

  * Deduplication (no near-identical questions).
  * Enforced total count <= requested N.

#### 3.5.5 Error Handling

* **AIQ-110**: For Azure OpenAI errors (network, 5xx, timeouts):

  * Job MUST transition to `FAILED` status with `reason = "ai_error"`.
  * Frontend MUST show: “Something went wrong while generating your quiz. Please try again.”
* **AIQ-111**: For rate limit errors:

  * Job MUST transition to `FAILED` status with `reason = "rate_limited"`.
  * User message: “We’re getting a lot of AI requests right now. Please try again in a few minutes.”
* **AIQ-112**: For invalid function responses:

  * System MUST attempt a **single automatic retry** with slightly adjusted prompt / stricter schema instructions.
  * If still invalid, job MUST fail with `reason = "invalid_ai_output"`.
* **AIQ-113**: Failures MUST not leave partial quizzes “half-created” in Quiz service; no quiz object created unless we have a valid structured result.

---

### 3.6 Safety & Quality Control

#### 3.6.1 Content Safety

* **AIQ-120**: System prompt MUST explicitly instruct model to avoid:

  * Hate, self-harm, sexual content involving minors, explicit sexual content, graphic violence, etc.
* **AIQ-121**: After quiz generation, the combined quiz text MUST be passed through:

  * Option A (MVP): Azure content filters / moderation endpoint.
* **AIQ-122**: If unsafe content is detected:

  * Job MUST fail with `reason = "safety_violation"`.
  * User sees: “We detected potentially inappropriate content in the generated quiz and couldn’t complete it. Please try a different source or adjust your content.”
  * No unsafe quiz is created.

#### 3.6.2 Quality Constraints

* **AIQ-130**: System MUST validate each question:

  * Non-empty `question` text.
  * Exactly 4 non-empty `options`.
  * `correct_index` in [0, 3].
* **AIQ-131**: System MUST ensure unique options per question (trim + case-insensitive comparison); if duplicates exist, question is discarded or AI is re-asked (MVP: discard).
* **AIQ-132**: System MUST implement a simple **duplicate question check**:

  * Compare question texts using normalized text and similarity (e.g., Levenshtein or cosine on embeddings is a future enhancement; MVP can be normalized exact/near-exact string comparison).
  * Discard near-duplicates; if resulting total < requested N, final count may be lower.
* **AIQ-133**: System SHOULD discourage trivial copy-paste questions via prompt:

  * “Avoid questions that simply ask to recall exact sentences; focus on understanding of concepts.”
* **AIQ-134**: Questions MUST be answerable from the source text:

  * Emphasized in prompt: “Do not invent facts not supported by the source.”
* **AIQ-135**: System MAY optionally ask the model to output a brief `explanation` for each answer (MVP: included as optional; editor can use or ignore).

---

### 3.7 Integration with Quiz Creation & Management

* **AIQ-140**: On successful AI generation, system MUST create a **Quiz** object in the Quiz service with:

  * `state = DRAFT`
  * `source = "ai"`
  * `ai_source_type = "pdf" | "url"`
  * `ai_source_ref = uploaded_file_id | url`
  * `title = quiz_title` from AI (editable later).
* **AIQ-141**: Each AI-generated question MUST be inserted into Quiz service as standard question records:

  * `type = MULTIPLE_CHOICE`
  * `text = question`
  * `options = [ ... ]`
  * `correct_option_index = correct_index`
  * `explanation = explanation` (if present).
  * `difficulty = difficulty` (stored if Quiz service supports; otherwise kept in metadata).
* **AIQ-142**: After quiz creation, frontend MUST redirect host to the existing **quiz editor** with this quiz loaded.
* **AIQ-143**: If AI returns fewer valid questions than requested:

  * System MUST still create the quiz with the available questions.
  * UI MUST display: “We generated X questions instead of the requested Y, based on the available content.”
  * User MUST have clear options:

    * Proceed to editor.
    * Request more questions (new generation attempt, if allowed).
* **AIQ-144**: AI-generated quizzes MUST be clearly marked in internal data for analytics and in UI (e.g., “AI-generated” tag).

---

## 4. End-to-End User Flows

### 4.1 Flow: Generate Quiz from PDF

**Narrative**: Host wants a quiz from a PDF chapter.

**Steps (frontend + backend)**

1. Host clicks **“Create quiz” → “Create from PDF (AI)”**.
2. System shows a **PDF upload screen**:

   * Drag-and-drop area + file picker.
   * Info about supported type and size.
3. Host selects a PDF file.
4. Frontend validates extension and size (rough check) and transitions to `Uploading`.
5. File is uploaded to backend storage; backend returns `file_id`.
6. Backend creates an **AI generation job** with:

   * `job_id`
   * `source_type = "pdf"`
   * `source_ref = file_id`
   * `status = PENDING`
7. UI shows step 2: parameter selection:

   * Question count, difficulty, optional preset.
8. Host sets parameters and clicks **“Generate quiz”**.
9. Backend updates job with parameters and enqueues it for processing.
10. Job processor:

    * Status → `EXTRACTING`.
    * Parse PDF → extract text.
    * If extraction fails, status → `FAILED` (`reason` accordingly).
    * Else, preprocess text (cleanup, chunking).
11. Status → `GENERATING`.

    * For each chunk, call Azure OpenAI with function calling, distributing question count.
    * Collect and validate questions.
    * Run safety checks.
12. On success:

    * Create Quiz in Quiz service (`DRAFT`, `source=AI`, linked to file_id).
    * Attach questions.
    * Status → `COMPLETED`, with `quiz_id`.
13. Frontend polls or receives push update:

    * On `COMPLETED`, redirect to quiz editor with `quiz_id`.
    * Show inline message: “Generated {X} questions from {filename}.”
14. If `FAILED`, UI shows a clear error with:

    * High-level reason (e.g., “PDF encrypted”, “Unable to extract text”, “AI generation failed”).
    * CTA to go back and adjust (choose another file, fewer questions, etc.).

### 4.2 Flow: Generate Quiz from URL

1. Host clicks **“Create quiz” → “Create from webpage (AI)”**.
2. UI displays URL input screen.
3. Host pastes URL and clicks **“Continue”**.
4. Backend validates URL, creates job with:

   * `source_type = "url"`
   * `source_ref = raw_url`
   * `status = PENDING`.
5. UI shows parameter selection (same as PDF flow).
6. Host selects question count/difficulty, clicks **“Generate quiz”**.
7. Job processor:

   * Status → `EXTRACTING`.
   * Fetch webpage, handle redirects, HTTP errors.
   * Extract main content and clean.
   * If insufficient content, status → `FAILED`.
8. Status → `GENERATING`.

   * Same AI and validation pipeline as PDF.
9. On success:

   * Create quiz in Quiz service; link `ai_source_type="url"`, `ai_source_ref=url`.
   * Status → `COMPLETED`, with `quiz_id`.
10. UI redirects to editor on completion; shows “Generated {X} questions from {domain}”.

### 4.3 Error / Edge Cases

#### Bad PDF (encrypted, scanned)

* Extraction step detects:

  * Encrypted → `FAILED` with `reason="encrypted_pdf"`.
  * Very low text content → `FAILED` with `reason="image_only_pdf"`.
* UI message instructs to provide non-encrypted / text-based PDF.

#### Unreachable URL

* HTTP fetch fails or times out:

  * `FAILED` with `reason="url_unreachable"`.
  * UI: “We couldn’t load this page. Please check the URL or use a different page.”

#### Azure OpenAI Failure

* API error or invalid output:

  * Automatic retry once.
  * If still failing, `FAILED` with `reason="ai_error"` or `reason="invalid_ai_output"`.
  * UI: “Something went wrong while generating your quiz. Please try again.”

#### Content Too Short

* Extracted text below threshold or insufficient to support question count:

  * AI might return fewer questions.
  * After pipeline, we have < requested questions.
  * System:

    * Creates quiz with available questions.
    * Notifies user: “We only found enough content for X questions.”

---

## 5. Product Design & UX Direction

### 5.1 Entry Points

* **Create Quiz menu** options:

  * “Create manually”
  * “Create from PDF (AI)”
  * “Create from webpage (AI)”

### 5.2 Upload / URL Screens

* Single-purpose, minimal screens:

  * Step indicator (1/3: Source → 2/3: Settings → 3/3: Generating).
  * Clear description: “Upload a PDF and we’ll create a draft quiz for you.”

### 5.3 Parameter Selection Screen

* Controls grouped clearly:

  * Question count slider/input (5–25).
  * Difficulty dropdown (Easy, Medium, Hard, Mixed).
  * Optional preset button “Quick quiz” (auto-fills values).
* Primary CTA: “Generate quiz”.

### 5.4 Progress Indicators

* Progress view showing:

  * Current step and spinner:

    * “Uploading PDF…”
    * “Extracting content…”
    * “Analyzing and generating quiz…”
  * Informational text: “This usually takes under a minute for typical documents.” (wording can be tuned).

### 5.5 Result Screen

* Once quiz is ready, either:

  * Auto-redirect to editor with a toast: “Generated 12 questions from ‘Chapter_3.pdf’.”
  * Or intermediate summary screen with:

    * Title: “Your quiz is ready”
    * Subtitle: “Generated 12 questions from [source].”
    * Primary CTA: “Review & edit quiz”.
* Tag in editor header: “AI-generated from [filename/URL]”.

### 5.6 Empty / Error States

* Friendly but direct copy:

  * “We couldn’t extract enough content from this file to create a quiz.”
  * Suggestions:

    * “Try a different file or URL.”
    * “Try fewer questions.”
    * “Ensure your PDF contains selectable text, not just images.”

---

## 6. Technical Architecture & Contracts

### 6.1 High-Level Components

1. **Frontend (Web app)**

   * Handles PDF uploads and URL input.
   * Displays progress states via status polling or subscriptions.
   * Redirects to quiz editor when done.

2. **AI Generation Service** (new backend service)

   * Public API to create generation jobs.
   * Orchestrates:

     * PDF/URL content extraction.
     * Preprocessing and chunking.
     * Azure OpenAI calls with function calling.
     * Safety and quality validation.
     * Creation of quiz in Quiz service.
   * Stores job status and metadata.

3. **Quiz Service** (existing)

   * Stores quiz and questions.
   * Provides quiz editor and game integration.

4. **Storage**

   * Blob storage for PDFs.
   * Database for AI jobs, prompts, responses metadata (short-term).

### 6.2 APIs (High-Level)

#### POST /ai-quizzes/from-pdf

* **Purpose**: Create AI generation job from a previously uploaded PDF.
* **Payload** (JSON):

  * `file_id` (string, required)
  * `question_count` (int, required)
  * `difficulty` (string: easy|medium|hard|mixed, required)
* **Response**:

  * `job_id` (string)
  * `status` (string: PENDING/QUEUED)

*(File upload itself can be a separate endpoint: `POST /files` → `file_id`.)*

#### POST /ai-quizzes/from-url

* **Payload**:

  * `url` (string, required)
  * `question_count` (int)
  * `difficulty` (string)
* **Response**:

  * `job_id`
  * `status`

#### GET /ai-quizzes/status/{job_id}

* **Response**:

  * `job_id`
  * `status` (PENDING, EXTRACTING, GENERATING, FAILED, COMPLETED)
  * `progress_step` (uploading/extracting/generating/finalizing)
  * `failure_reason` (nullable: ai_error, safety_violation, etc.)
  * `failure_message` (human-readable)
  * `quiz_id` (present if COMPLETED)
  * `generated_question_count` (optional)

### 6.3 Async vs Sync

* For robustness, ALL AI generations MUST be treated as async jobs:

  * Job status persisted.
  * Frontend polls `GET /ai-quizzes/status/{job_id}` every few seconds (or uses WebSockets later).
* Target: most jobs complete quickly, but architecture MUST support longer operations.

### 6.4 Internal Job Processing

* Worker process picks up job:

  1. Load job record.
  2. Set status to `EXTRACTING`.
  3. Extract content (PDF or URL).
  4. Preprocess and chunk; if errors, mark `FAILED`.
  5. Set status to `GENERATING`.
  6. For each chunk, call Azure OpenAI and collect results.
  7. Validate and merge questions.
  8. Run safety checks.
  9. If OK, create quiz via Quiz Service API.
  10. Set job status to `COMPLETED` and store `quiz_id`.

### 6.5 Data Storage

* **AI Jobs table**:

  * `job_id`
  * `user_id`
  * `source_type`
  * `source_ref`
  * `question_count_requested`
  * `difficulty`
  * `status`
  * `failure_reason`
  * `quiz_id`
  * `created_at`, `updated_at`
* **Optional AI Logs table** (for debugging/improvement):

  * `job_id`
  * `chunk_index`
  * `prompt_hash` or truncated prompt
  * `model_name`
  * `token_usage_prompt`, `token_usage_completion`
  * `raw_function_output` (with retention limit, e.g., 30 days)

---

## 7. Performance, Cost & Limits

### 7.1 Input Limits

* **PDF**

  * Max size: 25 MB (configurable).
  * Max pages: soft limit (e.g., 500 pages) — beyond which we only process first subset.
* **URL Content**

  * Max extracted text size: e.g., ~200,000 characters (before chunking or trimming).

### 7.2 Question Limits

* Max questions per generation: 25 (MVP).
* Larger quizzes can be created by multiple generations (future UX pattern).

### 7.3 Token Usage

* Aim for **moderate token budgets**:

  * Per chunk: ~3–5k tokens.
  * Entire job: ≤ ~20k tokens typical.
* Back-of-envelope:

  * If cost/token from provider is known internally, we can estimate cost per generation and set policies (not detailed here for external doc).

### 7.4 Rate Limiting

* Per-user:

  * Soft limit: e.g., 20 AI generations/day.
  * Beyond that, return a friendly error: “You’ve reached today’s AI generation limit.”
* Global:

  * Global concurrency caps and per-minute request limits to Azure OpenAI.
  * Backpressure: job queue may delay processing; UI should indicate “In queue” if backlog grows.

---

## 8. Permissions, Privacy & Compliance

* **Ownership**

  * Generated quizzes belong to the host’s account, same as manually created quizzes.
* **Model Training**

  * System MUST NOT use user documents or quiz content to train models unless we explicitly add consent flows in future. Default: no training use.
* **Data Handling**

  * PDFs and fetched webpage content may contain sensitive info (e.g., internal corporate training).
  * Storage:

    * PDFs retained as per general file storage policy.
    * Extracted text and AI prompts/responses retained only as long as necessary for debugging/improvement (e.g., 30 days), if allowed by policy.
* **Compliance**

  * For education and corporate use, we must ensure:

    * No unauthorized sharing of PDFs/URLs.
    * Clear UI text: “Your content is processed by our AI provider to generate quiz questions. Quizzes belong to you.”

---

## 9. Analytics & Instrumentation

### 9.1 Events

At minimum, the following events MUST be tracked (with user_id, timestamp, and relevant metadata):

1. `ai_quiz_generation_requested`

   * Properties: `source_type`, `question_count`, `difficulty`.
2. `ai_quiz_generation_succeeded`

   * Properties: `job_id`, `source_type`, `question_count_requested`, `question_count_generated`, `duration_ms`.
3. `ai_quiz_generation_failed`

   * Properties: `job_id`, `source_type`, `failure_reason`.
4. `ai_quiz_opened_in_editor`

   * Properties: `quiz_id`, `source=ai`.
5. `ai_quiz_edited`

   * Properties: `quiz_id`, `num_questions_changed` (if feasible to compute).
6. `ai_quiz_used_in_game`

   * Properties: `quiz_id`, `game_id`.

### 9.2 Metrics

* **Conversion**:

  * `% of AI-generated quizzes that are used in at least one game`.
* **Time to use**:

  * `median time from quiz generation → first game hosted`.
* **Usage per host**:

  * `avg AI generations per active host per month`.
* **Quality (via survey)**

  * Event-based or UI-based rating: `ai_quiz_quality_rating` (1–5).

---

## 10. Risks, Tradeoffs & Open Questions

### 10.1 Technical Risks

1. **Hallucinations / Off-topic questions**

   * Mitigation:

     * Strong instruction in system prompt to only use provided content.
     * Content-limited prompts (no external tools).
     * Internal QA checks (e.g., manual review for early adopters).

2. **Poor question quality from certain content types**

   * Dense math formulas, code-heavy docs, or very short pages may produce weak questions.
   * Mitigation:

     * Threshold for minimal content length.
     * Specific messaging recommending more suitable content.

3. **Long-running jobs / timeouts**

   * Large PDFs/URLs can be slow to parse and process.
   * Mitigation:

     * Chunking and early cut-offs for extremely long content.
     * Reasonable job timeout and status updates.
     * Async job with retry support.

4. **Rate limits / cost spikes**

   * Heavy use could hit Azure rate limits or increase costs unexpectedly.
   * Mitigation:

     * Per-user and global rate limits.
     * Monitoring of token usage and generation frequency.
     * Internal alerts for anomalies.

### 10.2 Product Risks

1. **Over-trust in AI**

   * Teachers/trainers might use quizzes without review.
   * Mitigation:

     * UI nudges: “Please review questions before using in class.”
     * Clear “AI-generated” tagging.

2. **User frustration from imperfect extraction**

   * Complex PDFs or messy webpages may produce subpar quizzes.
   * Mitigation:

     * Clear communication of limitations.
     * Suggestions on better content (clean PDFs, main article pages).

3. **Privacy concerns**

   * Users may worry about uploading sensitive documents to AI.
   * Mitigation:

     * Clear privacy messaging.
     * Optional toggle in org settings to disable AI features.

### 10.3 Open Questions (Needs Stakeholder Input)

1. **Exact model choice and context window**:

   * Which Azure OpenAI deployment (gpt-4.1 vs other) and how often can we change it?
2. **Retention policy for prompts/responses**:

   * How long can we store AI logs for debugging? 7 days vs 30 vs none?
3. **Future OCR support**:

   * Do we want to invest in OCR to handle scanned PDFs? If yes, which phase?
4. **Org-level controls**:

   * Should admins be able to disable AI features for their org?
5. **Localization**:

   * MVP is likely English-only. When/how do we support other languages (both content and questions)?

---

This PRD defines the full scope of **AI-Powered Quiz Generation from PDF or Webpage**: inputs, extraction, Azure OpenAI integration with function calling, chunking strategy, safety, and integration into the existing Quiz Creation & Management system. It should be sufficient for engineering to design and implement the service, APIs, and UI flows end-to-end.
