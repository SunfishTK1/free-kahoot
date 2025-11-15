## Product Requirements Document: User Management

Product Area: User Management
Owner: Associate PM – User Management
Surfaces: Web (desktop + mobile browsers)
Scope: Hosts + Players + foundational plan/limits, no full billing yet

---

### 1. Problem Statement & Goals

**Problem**

* Hosts (teachers, trainers, organizers) need persistent accounts to:

  * Create and manage quizzes.
  * Host live games.
  * Track performance and AI usage over time.
* We need a scalable way to:

  * Control access (who can create/host).
  * Enforce limits (e.g., max players, AI quota, quiz count) per plan.
  * Provide a foundation for future monetization and organizations (schools, companies).
* Players should be able to join games quickly, ideally as guests, without friction.

**Goals**

* UM-GOAL-1: Provide low-friction signup for hosts (minimal fields, fast auth).
* UM-GOAL-2: Clearly separate host vs player capabilities while allowing guest play.
* UM-GOAL-3: Build a user and plan model that can support:

  * Plan-based limits.
  * Organizations and team accounts later.
* UM-GOAL-4: Ensure basic security and abuse protection for auth and AI usage.

**Key Metrics**

* UM-METRIC-1: Host signup conversion rate (e.g., % of visitors who sign up as host).
* UM-METRIC-2: Host activation rate:

  * % of new host accounts that create at least 1 quiz within 3 days.
  * % of new host accounts that host at least 1 game within 7 days.
* UM-METRIC-3: Average # of games hosted per active host per month.
* UM-METRIC-4: Distribution of hosts by plan_type (Free vs future paid).
* UM-METRIC-5: Password reset success rate (started vs completed).

---

### 2. User Types & Roles

#### Roles

1. **Host user**
2. **Player user (guest or registered)**
3. **Admin (internal)**

#### Role Definitions (Requirements)

* **Host user**

  * UM-ROLE-1: A host user can create, edit, and delete their own quizzes.
  * UM-ROLE-2: A host user can create and host game sessions based on their quizzes.
  * UM-ROLE-3: A host user owns AI generation quotas and usage is tracked against their user_id.
  * UM-ROLE-4: A host user can view game results and player performance for sessions they host.
  * UM-ROLE-5: A host user has an associated plan_type and limits that constrain:

    * Max players per game.
    * Max AI-generated quizzes per period.
    * Max stored quizzes.

* **Player user**

  * UM-ROLE-6: A player can join a game via a game code/link and choose a nickname.
  * UM-ROLE-7: A player can join as:

    * Guest (no account required).
    * Registered player (future): optional account for history/stats.
  * UM-ROLE-8: A player cannot create quizzes or host games.
  * UM-ROLE-9: Player participation data (answers, scores) is associated with a game session and not directly tied to a persistent identity for guests.

* **Admin (internal)**

  * UM-ROLE-10: Admins can view user accounts, plans, usage, and status (active/suspended).
  * UM-ROLE-11: Admins can suspend or reinstate user accounts.
  * UM-ROLE-12: Admins can override plan_type and limits for specific users (e.g., for support or pilots).
  * UM-ROLE-13: Admin tools and UI are out of scope for MVP front-end but need backend capabilities (secured, internal-only).

---

### 3. Authentication & Registration (UM-AUTH-*)

#### Sign Up

* UM-AUTH-1: MVP supports signup via **email + password** for hosts.
* UM-AUTH-2: Signup form minimal fields:

  * Required: email, password.
  * Optional: name, organization/school/company.
* UM-AUTH-3: Design for future SSO/OAuth providers (Phase 2):

  * Google OAuth.
  * Microsoft OAuth.
  * Model impact:

    * User record must support multiple auth providers.
    * Handle account linking (same email across providers).

#### Login

* UM-AUTH-4: MVP supports login via email + password.
* UM-AUTH-5: System must allow future login via OAuth providers in addition to email/password.
* UM-AUTH-6: If both password and OAuth exist for same email, both flows should be supported.

#### Session Management

* UM-AUTH-7: Use secure sessions (e.g., HTTP-only cookies or secure tokens) to keep hosts logged in.
* UM-AUTH-8: “Remember me” option:

  * Default session duration: e.g., 7 days of inactivity.
  * Without “remember me”: e.g., 24 hours of inactivity.
* UM-AUTH-9: Logout:

  * Invalidates server-side session/token.
  * Redirects to landing or login page.
* UM-AUTH-10: Support “force logout everywhere” from account settings (future), to invalidate all active sessions.

#### Password Reset

* UM-AUTH-11: Provide “Forgot password” flow:

  * User enters email.
  * System sends time-limited reset link.
  * User can set new password.
* UM-AUTH-12: Reset tokens must be single-use and expire (e.g., after 1 hour).
* UM-AUTH-13: Password reset should result in invalidation of existing sessions (current + optional all sessions, decision left to engineering).

#### Password Rules & Security

* UM-AUTH-14: Password policy (MVP):

  * Minimum length: 8 characters.
  * No composition complexity required for MVP (document expectation to tighten later).
* UM-AUTH-15: Passwords must be stored hashed using a strong algorithm (e.g., bcrypt, Argon2).
* UM-AUTH-16: All auth-related traffic must be over HTTPS.

#### Rate Limiting & Brute Force Protection

* UM-AUTH-17: Rate limit login attempts per IP and per account (e.g., 5 failures per minute then escalating delays).
* UM-AUTH-18: Rate limit signup attempts per IP and per email domain to reduce abuse.
* UM-AUTH-19: Lockout or step-up (CAPTCHA or similar) after repeated failed login attempts for a given account.

---

### 4. Profile Management

#### Profile Fields

* UM-PROFILE-1: User profile must include:

  * id (internal).
  * name (string, optional at signup but encouraged).
  * email (primary unique identifier for host account).
  * avatar_url (optional).
  * organization / school / company (optional string).
  * preferred_language (optional, default to en-US).
  * email_verified (boolean).
  * plan_type (enum, see Plans section).
  * created_at, updated_at (timestamps).

#### Profile Flows

* UM-PROFILE-2: Host can view their profile (“Account” or “Profile” screen).
* UM-PROFILE-3: Host can edit:

  * name.
  * avatar.
  * organization.
  * preferred_language.
* UM-PROFILE-4: Host can change email (optional for MVP; if supported, requires re-verification).
* UM-PROFILE-5: Host can change password via:

  * “Change password” within profile (requires current password).
  * “Forgot password” flow.

#### Email Verification

* UM-PROFILE-6: On signup, send verification email with unique link.
* UM-PROFILE-7: MVP behavior:

  * Email verification **not required** to create quizzes and host small games (to keep friction low).
  * Email verification **required** to:

    * Upgrade plan (once payment exists).
    * Access higher limits (e.g., >50 players per game – future).
* UM-PROFILE-8: UI must clearly indicate verification status and provide a “Resend verification email” action.

---

### 5. Plans, Tiers & Limits

#### Plan Types

* UM-PLAN-1: Supported plan_type enum:

  * FREE (MVP).
  * PRO (future).
  * EDU (future, school-focused).
  * ENTERPRISE (future).
* UM-PLAN-2: MVP: all new host users default to plan_type = FREE.

#### Limits per Plan (Design Targets)

*(Exact numbers can be tuned; provide representative defaults for engineering.)*

* UM-PLAN-3: FREE plan baseline:

  * Max players per game: 50.
  * Max active (stored) quizzes: 20.
  * Max AI-generated quizzes per month: 10.
* UM-PLAN-4: PRO (future example):

  * Max players per game: 300.
  * Max active quizzes: 200.
  * Max AI-generated quizzes per month: 200.
* UM-PLAN-5: EDU/ENTERPRISE (future example):

  * Higher or custom limits, potentially organization-level.

#### Data Model for Plans & Limits

* UM-PLAN-6: User entity must include:

  * plan_type (enum).
* UM-PLAN-7: System must have a plan_limits reference model:

  * plan_type (enum).
  * limits:

    * max_players_per_game.
    * max_quizzes.
    * max_ai_quizzes_per_month.
* UM-PLAN-8: System must track usage_counters per user:

  * user_id.
  * period (e.g., month, defined by UTC calendar month).
  * metrics:

    * ai_quizzes_generated_count.
    * quizzes_created_count (if needed).
    * games_hosted_count (for analytics and rate control, not necessarily enforced limit).

#### Enforcement

* UM-PLAN-9: Game Hosting integration:

  * When starting a game, check host’s plan_type and enforce max_players_per_game.
  * If a join attempt would exceed the limit, block and show message to host and player.
* UM-PLAN-10: Quiz Creation:

  * When creating a new quiz, enforce max_quizzes based on plan.
  * If limit exceeded, block creation and show clear message.
* UM-PLAN-11: AI Generation:

  * On each AI-generated quiz request, increment ai_quizzes_generated_count (per user, per month).
  * If usage >= max_ai_quizzes_per_month, block further AI generation for that period and show upgrade messaging.

#### UX for Limits & Upgrades

* UM-PLAN-12: In profile/account settings, show:

  * Current plan_type.
  * Key limits relevant to the host (e.g., “Max 50 players per game, 10 AI-generated quizzes per month.”).
  * Current usage vs limit (e.g., “3/10 AI-generated quizzes used this month.”).
* UM-PLAN-13: When approaching limits (e.g., 80% of AI quota), show inline warnings:

  * e.g., “You’ve used 8/10 AI-generated quizzes this month.”
* UM-PLAN-14: When limits are reached, show upgrade prompt:

  * Include a CTA (“Upgrade plan”, can be placeholder page or coming soon).
  * Do not block access to existing content, only actions governed by limits.

---

### 6. Permissions & Ownership Model

#### Ownership

* UM-PERM-1: Every quiz must have an owner user_id (host).
* UM-PERM-2: Every game session must have a host user_id.
* UM-PERM-3: AI-generated assets (quizzes, question suggestions, etc.) must be associated to the host user_id and counted toward their quotas.

#### Access & Editing

* UM-PERM-4: Only the quiz owner can:

  * Edit the quiz content.
  * Delete the quiz.
* UM-PERM-5: Only the game session owner (host) can:

  * Start, pause, resume, and end the game session.
  * View detailed game results (scores, answers).
* UM-PERM-6: A quiz owner can host multiple game sessions from the same quiz.

#### Future Organization/Sharing (Design)

* UM-PERM-7 (Future): Support quiz sharing within an organization:

  * Shared quizzes might be editable by multiple users with specific permissions (owner, editor, viewer).
* UM-PERM-8 (Future): Support organization-level ownership where quizzes belong to org_id and users in org can have roles.

#### Player Data Visibility

* UM-PERM-9: Player participation data (scores, answers) is tied to:

  * game_session_id.
  * player_nickname (and optional player_id if registered).
* UM-PERM-10: Only the host of that session can view aggregated player results within the app.
* UM-PERM-11: Player-specific data is not exposed publicly in a way that identifies players beyond nickname.

---

### 7. Integration Points with Other Subsystems

#### Quiz Creation & Management

* UM-INTEG-1: Quiz service must require a valid host user_id for quiz creation.
* UM-INTEG-2: Quiz service must query user’s plan limits to:

  * Enforce max_quizzes.
* UM-INTEG-3: Quiz list/search APIs must be scoped to the current host user_id.

#### AI Generation

* UM-INTEG-4: AI generation service must:

  * Accept host user_id as a required parameter.
  * Check user’s plan limits and usage before generating.
* UM-INTEG-5: After successful AI generation, increment:

  * ai_quizzes_generated_count for that user.
* UM-INTEG-6: If user has no remaining AI quota, API returns a clear error for front-end to show upgrade/limit messaging.

#### Game Hosting

* UM-INTEG-7: Game hosting service must:

  * Validate the host user_id and plan_type when starting a game.
  * Enforce max_players_per_game on join attempts.
* UM-INTEG-8: Game session records should include host user_id for analytics and permissions.

#### Analytics

* UM-INTEG-9: Event tracking should include user_id (when available) and user role for:

  * quiz_created.
  * game_started.
  * game_completed.
  * ai_quiz_generated.
* UM-INTEG-10: Usage counters can be derived from or cross-validated with analytics events.

---

### 8. Abuse Prevention Basics

#### Rate Limiting

* UM-ABUSE-1: Implement rate limits on:

  * Account creation per IP (e.g., N per hour).
  * Account creation per email domain (especially disposable domains).
* UM-ABUSE-2: Implement rate limits on login attempts (see UM-AUTH-17).
* UM-ABUSE-3: Implement rate limits on AI generation requests per user:

  * Short-term burst limit (e.g., X requests per minute).
  * Monthly quota via plan limits.

#### Nickname Moderation (Players)

* UM-ABUSE-4: When joining a game, player nickname must pass a basic profanity/offensive language filter.
* UM-ABUSE-5: If nickname is rejected, prompt the player to choose another nickname.

#### Account Suspension

* UM-ABUSE-6: User entity must support a status field:

  * active.
  * suspended.
* UM-ABUSE-7: When a user is suspended:

  * They cannot log in.
  * They cannot host new games.
  * They cannot generate new AI content.
  * Their existing quizzes remain stored but may be hidden from players (decision product/ops).
* UM-ABUSE-8: Suspended users attempting actions see clear messaging (“Your account is suspended. Contact support.”).
* UM-ABUSE-9: Admins can set status and optionally attach a suspension_reason (internal).

---

### 9. Product Design & UX Direction

#### Signup/Login Screens

* UM-UX-1: Clean, minimal forms with:

  * Email, password, CTA: “Create host account” (avoid confusion with player join).
  * Link to “Log in” for existing users.
* UM-UX-2: Highlight value proposition for hosts near the signup form:

  * e.g., “Create quizzes, host live games, track results.”
* UM-UX-3: Provide a clear path for players to join games without needing a host account:

  * “Join game” entry on home, separate from host signup.

#### Profile / Account Settings

* UM-UX-4: Account/Profile screen includes:

  * Profile section: name, email, organization, avatar, language.
  * Security section: change password, email verification status.
  * Plan & Usage section: current plan, key limits, usage summary.
* UM-UX-5: Show email verification status with clear call to action if unverified.

#### Plan/Limit Display

* UM-UX-6: Within the Plan & Usage section:

  * Show the current plan (“Free”) with simple description.
  * Show key limits in human language:

    * “You can host up to 50 players per game on the Free plan.”
    * “You can create up to 20 quizzes.”
    * “You’ve used 3/10 AI-generated quizzes this month.”
* UM-UX-7: Inline warnings/errors:

  * When limits are approached or exceeded, show messages closest to where the action happens (quiz creation, AI generate button, game lobby).
* UM-UX-8: Upgrade CTA can link to:

  * A simple “Plans coming soon” page (MVP) or future upgrade flow.

---

### 10. Technical Requirements & API Contracts

#### User Service Responsibilities

* UM-TECH-1: User service must:

  * Create, read, update user accounts.
  * Manage auth (signup/login/logout/password reset).
  * Store and expose plan_type and related usage.
  * Expose user’s current limits and usage to other services.

#### Core Endpoints (Example)

*(Exact URLs/methods can be adjusted; this is requirements-level.)*

* UM-TECH-2: `POST /signup`

  * Request: { email, password, optional: name, organization }
  * Response: user object (without password), auth token/session.
* UM-TECH-3: `POST /login`

  * Request: { email, password }
  * Response: user object, auth token/session.
* UM-TECH-4: `POST /logout`

  * Request: (auth context).
  * Response: 200 on success, invalidates session.
* UM-TECH-5: `POST /password-reset/request`

  * Request: { email }
  * Response: 200 even if email is not found (avoid enumeration).
* UM-TECH-6: `POST /password-reset/confirm`

  * Request: { token, new_password }
  * Response: 200 on success.
* UM-TECH-7: `GET /me`

  * Returns current authenticated user profile and plan metadata.
* UM-TECH-8: `PUT /me`

  * Update profile fields (name, avatar, organization, preferred_language).
* UM-TECH-9: `PUT /me/password`

  * Change password, requires current_password and new_password.
* UM-TECH-10: `GET /usage`

  * Returns usage and limits for current user:

    * { plan_type, limits, usage_counters }.

#### Data Model (High-Level)

* **user**

  * id (UUID or numeric).
  * email (unique).
  * password_hash.
  * name.
  * avatar_url.
  * organization.
  * preferred_language.
  * email_verified (bool).
  * plan_type (enum: FREE, PRO, EDU, ENTERPRISE).
  * status (enum: active, suspended).
  * created_at, updated_at.

* **plan_limits**

  * plan_type (enum).
  * max_players_per_game (int).
  * max_quizzes (int).
  * max_ai_quizzes_per_month (int).
  * created_at, updated_at.

* **usage**

  * id.
  * user_id.
  * period_start (e.g., first day of month).
  * period_end.
  * ai_quizzes_generated_count.
  * games_hosted_count.
  * quizzes_created_count (optional).
  * created_at, updated_at.

* Optional additional tables for OAuth identities (future):

  * **user_auth_provider**

    * user_id.
    * provider (google, microsoft).
    * provider_user_id.

---

### 11. Analytics & Instrumentation

#### Events to Track

* UM-ANALYTICS-1: Auth and onboarding events:

  * user_signed_up (with plan_type, source).
  * user_logged_in.
  * password_reset_started/completed.
* UM-ANALYTICS-2: Activation events:

  * quiz_created_first_time.
  * game_hosted_first_time.
* UM-ANALYTICS-3: Engagement events:

  * quiz_created.
  * game_started.
  * game_completed.
  * ai_quiz_generated.
* UM-ANALYTICS-4: Plan/limit events:

  * limit_warning_shown (e.g., ai_quota_80_percent).
  * limit_reached (e.g., ai_quota_exhausted, max_players_exceeded).

#### KPIs for Leadership

* UM-ANALYTICS-5: New host signups per day/week/month.
* UM-ANALYTICS-6: Activation:

  * % of new hosts who create at least 1 quiz within 3 days.
  * % of new hosts who host at least 1 game within 7 days.
* UM-ANALYTICS-7: Retention:

  * 7-day and 30-day active hosts (by plan_type).
* UM-ANALYTICS-8: Usage:

  * Avg games hosted per active host per month.
  * Avg AI-generated quizzes per active host per month.
* UM-ANALYTICS-9: Plan:

  * Count of active hosts by plan_type.
  * % of hosts hitting any limits (indicates upgrade pressure).

---

### 12. Non-Functional Requirements

#### Security

* UM-NFR-1: All auth flows and APIs must use HTTPS.
* UM-NFR-2: Passwords must never be stored in plain text; use strong hashing algorithms.
* UM-NFR-3: Sensitive tokens (reset, verification) must be time-limited and single-use.
* UM-NFR-4: Implement basic protections against common web attacks (CSRF for state-changing operations, XSS prevention, etc.).

#### Reliability

* UM-NFR-5: Auth service should have high availability; if auth is down, hosts cannot log in or host new games.
* UM-NFR-6: If user service is temporarily unavailable:

  * Show user-friendly error messages.
  * Ensure existing logged-in sessions fail gracefully (e.g., show retry, not blank screens).
* UM-NFR-7: Rate limiting failures should return clear error codes/messages for UI to handle.

#### Scalability

* UM-NFR-8: Design user service and storage to support at least tens of thousands of users without fundamental redesign.
* UM-NFR-9: Plan limits and usage calculations should be efficient (e.g., not scanning entire event history each time; use counters).

---

### 13. Risks & Open Questions

#### Risks

* UM-RISK-1: Overly complex plan logic early on may slow development and confuse users if pricing is not yet available.
* UM-RISK-2: Not designing for organizations/teams might force data model changes later (org_id, shared ownership).
* UM-RISK-3: Too strict rate limiting or verification requirements may hurt host onboarding and early growth.
* UM-RISK-4: Weak abuse controls could allow automated abuse of AI quotas and inflate costs.

#### Open Questions (to resolve with stakeholders)

* UM-Q-1: Do we require email verification before hosting **larger** games (e.g., >50 players) once those limits exist?
* UM-Q-2: What exact initial limits do we want for FREE (numbers above are placeholders):

  * Max players per game?
  * Max AI-generated quizzes per month?
  * Max stored quizzes?
* UM-Q-3: Do we want to support player registration in MVP, or defer until we have compelling use cases (stats, history)?
* UM-Q-4: How soon are we planning to introduce paid plans? This impacts how aggressively we surface “Upgrade” messaging.
* UM-Q-5: Do we allow suspended users to export their quiz data or request deletion (compliance and UX consideration)?

---

This PRD should be enough for engineering to design the user service, auth flows, basic plan-aware behavior, and the necessary hooks for Quiz Creation, AI Generation, and Game Hosting, while leaving room for future organizations and monetization.
