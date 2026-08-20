# SIDRAHSOFT-REPOSITORY-HYGIENE-AUDIT-001-REPORT

**Task ID:** `SIDRAHSOFT-REPOSITORY-HYGIENE-AUDIT-001`
**Date:** 2026-08-20
**Repository:** `F:\What_i_Made\New\sidrah_web`
**HEAD at time of audit:** `48ffdc0 (main, origin/main) feat: add Sidrah Soft favicon`
**Mode:** READ-ONLY AUDIT — no files were deleted, moved, renamed, modified, committed, or pushed.

---

## A. Executive Summary

The repository is functional and `main` is currently deployable, but it carries a significant amount of **local-only, generated, experimental, and diagnostic material** that should never have been committed. Three classes of problems were confirmed:

1. **Repository bloat from an abandoned hero-frame system.** `src/assets/hero/frames/`, `src/assets/hero/frames-mobile/`, `src/assets/hero/frames-kf05kf06/`, `src/assets/hero/frames-kf05kf06-mobile/`, and `src/assets/hero/clips/` total **1,021 tracked files and ~136 MB**, and are **not referenced by any current `.jsx`/`.js` source file**. The current Hero (`CinematicHero.jsx` + `background.css`) uses a CSS-only grid, not these frame sequences. This is the single largest hygiene issue in the repository and a major contributor to the `.git` directory's **202 MB** size.
2. **Confirmed accidental commit of local/dev-only artifacts** in commit `29a2e87` (`fix: update Arabic hero RTL layout`): two SQLite databases, a stray file named `truction]` (a captured shell/diff transcript), and an abandoned `newstyle/` reference folder. These are still present on `main` today — a prior audit (`SIDRAHSOFT-PRODUCTION-READINESS-SECURITY-AUDIT-001-REPORT.md`) already flagged them, but no cleanup has been executed since.
3. **A real local development secret (PostgreSQL password) is committed in plaintext** inside three tracked Markdown evidence reports, including **one pushed to `origin/main` in this session** (commit `1d3fbbe`). This requires a security decision (rotate vs. redact/history-scrub) before the repository is treated as public-safe.

No production secrets (`SECRET_KEY`, `DATABASE_URL`, API tokens, session cookies) were found in the current working tree. `.env` files are correctly excluded from Git via `.gitignore` and confirmed absent from tracking.

---

## B. Definitely Safe to Keep

| Path | Reason |
|---|---|
| `index.html`, `vite.config.js`, `package.json`, `package-lock.json` | Required by the Vite build. |
| `railway.frontend.toml` | Railway frontend deploy config, referenced by the frontend service. |
| `start.sh` | Backend Railway start command (migrate/collectstatic/gunicorn). |
| `.env.example`, `backend/.env.example` | Clean, secret-free templates; required onboarding documentation. |
| `.gitignore` | Required. |
| `backend/requirements.txt`, `backend/runtime.txt` | Required for backend build/runtime pinning. |
| `.agents/skills/**`, `.devin/workflows/RULES.md` | **KEEP — development tooling intentionally versioned.** These are agent/skill documentation, not runtime code; they do not affect the frontend or backend build. `.devin/workflows/RULES.md` is stale in places (mentions Next.js / MySQL, not the current React+Vite / PostgreSQL stack) — see Section D.
| `project-memory/00-*.md` … numbered planning docs (non-evidence) | Project documentation intentionally versioned as the team's single source of truth. |
| `src/assets/partiners/*`, `src/assets/training_images/*`, `src/assets/logo.png`, `src/assets/logo.svg` | Actively imported by current components (`PartnersTrustSection.jsx`, `courses.js`, `Header.jsx`, `HeroContent.jsx`). |

---

## C. Definitely Should Be Removed From Git

All items below are **currently Git-tracked** (confirmed via `git ls-files`) and have **no runtime/build/import reference** anywhere in the frontend, backend, Railway config, or CI.

| Path | Tracked? | Referenced by build/runtime? | Contains sensitive data? | Classification |
|---|---|---|---|---|
| `db_check.sqlite3` | YES | NO | Empty (0 bytes) — no data | REMOVE FROM GIT |
| `db_test.sqlite3` | YES | NO | Django migration/permission scaffolding only; 1 `site_settings_sitesetting` row, 0 user/lead rows. No secrets, but it is a **local database file** that should never be tracked. | REMOVE FROM GIT |
| `newstyle/index.html`, `newstyle/styles.css` | YES | NO (only mentioned in a design-inspiration code comment in `src/styles/background.css`, not imported) | No | REMOVE FROM GIT |
| `truction]` | YES | NO | Contains a captured shell transcript showing a diff of `backend/.env.example` and `backend/config/settings.py` (cookie SameSite change). No live secret values, but it is an accidental artifact (looks like the output of a mistyped redirect, e.g. `git diff > ...\truction]`). | REMOVE FROM GIT |
| `hero-progress-84.png`, `hero-progress-92.png`, `hero-progress-100.png` | YES | NO | Local validation screenshots (Hero motion progress states) | REMOVE FROM GIT |
| `api_partners_list.txt` | YES | NO | Empty file (0 bytes) | REMOVE FROM PROJECT |
| `build_output.txt` | YES | NO | Captured `npm run build` stdout, ~225 KB, stale | REMOVE FROM GIT |
| `higgsfield_error.txt` | YES | NO | Captured PowerShell/Higgsfield CLI error. UTF-16 encoded. Contains a local file-system path revealing the developer's Windows username (`C:\Users\C.m\...`). Minor internal-path disclosure, not a credential. | REMOVE FROM GIT |
| `query` | YES | NO | Single line: `MySQL57` — an accidental stray output/paste, unrelated to the current PostgreSQL stack | REMOVE FROM PROJECT |
| `screenshot-hero.mjs` | YES | NO (not referenced by `package.json` scripts or any import) | No | INVESTIGATE (see Section D — could be a useful one-off dev script; confirm before deleting) |
| `seedance_model.json`, `seedance_params.txt` | YES | NO | Local Higgsfield/Seedance experiment artifacts, not used by any component or script | REMOVE FROM PROJECT |
| `skills-lock.json` | YES | NO (not read by any build tool; it is a Devin/agent skill-install lock file) | No | KEEP — development tooling intentionally versioned (agent skill integrity, not a production artifact, but harmless to keep) |
| `version.txt` | YES | NO | UTF-16 file containing a captured `python --version` output (`3.14.2 ...`). Stray, no runtime use. | REMOVE FROM PROJECT |
| `backend/media/uploads/**` (46 files) | YES | NO at build time; served only when `DEBUG=True` per `backend/apps/core/cms_urls.py`/`config/urls.py`. Production requires object storage (S3/R2), not Git. | User-uploaded CMS media (product/partner/course images). Not secret, but should not live in Git. | REMOVE FROM GIT (migrate to object storage first) |
| `backend/staticfiles/**` (154 files) | YES | NO — regenerated by `python manage.py collectstatic` in `start.sh` on every deploy | No | REMOVE FROM GIT |
| `project-memory/evidence/*.png` (16 files) | YES | NO | Validation/evidence screenshots | INVESTIGATE — keep only if the team wants a visual audit trail; otherwise remove |
| `src/assets/hero/frames/**`, `src/assets/hero/frames-mobile/**`, `src/assets/hero/frames-kf05kf06/**`, `src/assets/hero/frames-kf05kf06-mobile/**`, `src/assets/hero/clips/**` (1,021 files, ~136 MB) | YES | **NO** — confirmed via repository-wide search: no `.jsx`/`.js` file imports or references `assets/hero/frames`, `assets/hero/clips`, or any `hero_manifest.json`. The only references are in `project-memory/` documentation and a couple of one-off Python tools (`project-memory/tools/extract_kf05kf06_frames.py`). The current Hero (`CinematicHero.jsx`) uses `HeroAura`, `HeroMotes`, `HeroSheen` (CSS/SVG) and the CSS-only grid described in `background.css`, not these frame sequences or video clips. | REMOVE FROM GIT (largest single hygiene win; requires history rewrite to reclaim space — see Section H) |

---

## D. Requires Investigation

| Path | Why it needs investigation |
|---|---|
| `cinematic-landing-kit-main/` (14 files: `CLAUDE.md`, `README.md`, `memory/*.md`, `templates/*`) | Confirmed Git-tracked. No `.jsx`/`.js`/build-config references found — only mentioned in `project-memory/` evidence reports and planning docs as a **reference/pattern kit** the team drew inspiration from. Per instructions, a reference/template directory should not be removed until proven unused in a decision-making sense (i.e., is it still consulted during development?). Needs a decision from the team: keep as a permanent reference library, or move it out of the repository (e.g., to internal docs/wiki) since it is not part of the shipped product. |
| `.devin/workflows/RULES.md` | Intentionally versioned agent/project rules file, but its content is **stale**: it describes a Next.js frontend and MySQL database, while the actual shipped stack is React + Vite and PostgreSQL. Keeping outdated "constitution" documents risks misleading future contributors or agents. Recommend a content review/update, not deletion. |
| `screenshot-hero.mjs` | A Playwright-style script (project has `playwright` as a devDependency) but it is not wired into any `package.json` script and is not referenced elsewhere. Confirm with the team whether it is an actively used manual QA tool before removing. |
| `project-memory/evidence/*.png` (16 files) | Could be intentional audit evidence (screenshots proving a fix) or stale validation artifacts. Recommend the team decide a retention policy (e.g., keep only the most recent N per feature, or move to external storage) rather than deleting blindly. |
| `project-memory/evidence/*.md` (184 files total under `project-memory/`) | Not flagged as unsafe, but the sheer volume (184 tracked files) of historical task reports suggests this directory should have a retention/archival policy. Not urgent, but worth a team decision on whether very old reports (e.g., from completed, superseded phases) should be pruned or moved to a separate low-churn location. |
| `db_test.sqlite3` — `site_settings_sitesetting` row | The one populated row was not decoded further (out of scope for a read-only hygiene pass) but should be spot-checked by the team for any local contact/PII values before final disposal, even though the file is confirmed non-production. |

---

## E. Sensitive-Risk Findings

**No production secrets were found.** Specifically confirmed absent from the tracked tree: `SECRET_KEY` values, `DATABASE_URL` connection strings, `EMAIL_HOST_PASSWORD` values, API keys/bearer tokens, session/CSRF cookie values, and cloud provider credentials. `.env` and `backend/.env` are correctly excluded from tracking (`git check-ignore` confirms `.gitignore:9:**/.env` matches both).

**Confirmed findings requiring attention:**

1. **Local PostgreSQL development password committed in plaintext.** A local-only dev DB password literal (referred to here as `[REDACTED_LOCAL_DEV_PASSWORD]`) is present in the working tree in:
   - `project-memory/evidence/NAVIGATION-CMS-IMPLEMENTATION-001-REPORT.md` (since commit `20986d8`, "Initial production-ready SidrahSoft website")
   - `project-memory/evidence/POSTGRES-FINAL-BLOCKER-ANALYSIS-001.md` (since commit `20986d8`)
   - `project-memory/evidence/SIDRAHSOFT-PRODUCTION-READINESS-SECURITY-AUDIT-001-REPORT.md` (this occurrence was **re-introduced in commit `1d3fbbe`**, pushed to `origin/main` earlier in this session, because that report quotes the original finding verbatim)

   All three are currently on `origin/main`. If this password was ever reused for a non-throwaway environment (shared staging DB, any Railway/production Postgres instance), **it must be rotated immediately**, independent of any Git cleanup. If it was strictly local-only and already abandoned, it should still be redacted from the tracked files and scrubbed from history before the repository is treated as safe to make public (see Section H).

2. **Local developer file-system path disclosure.** `higgsfield_error.txt` contains the Windows path `C:\Users\C.m\AppData\Roaming\npm\higgsfield.ps1`, revealing the local developer's Windows username (`C.m`). Low severity, but unnecessary internal information.

3. **Internal diff/config transcript in `truction]`.** Shows a diff of `backend/.env.example` and `backend/config/settings.py` (a SameSite cookie policy change). No secret values are present, but it is an unintentional file that discloses internal working notes/diffs that were never meant to be committed.

4. **CMS-uploaded media in Git (`backend/media/uploads/`, 46 files).** These are real, user/CMS-uploaded image assets rather than developer secrets, but committing user-generated content directly into the application's Git history is a data-hygiene and scaling risk (repository bloat, no CDN/object-storage lifecycle, harder GDPR-style deletion later).

5. **No `.pem`/`.key`/`credentials.json`/`service-account*.json` files were found tracked** — the `.gitignore` rules for these patterns appear to be effective so far.

---

## F. Missing .gitignore Rules

The current `.gitignore` is reasonably strong (env files, Python artifacts, Django media/static, Node/Vite build output, OS/IDE files) but has the following gaps, confirmed against the current tracked file list:

| Gap | Current rule | Needed addition |
|---|---|---|
| SQLite variants | Only `db.sqlite3`, `db.sqlite3-journal` are ignored | Add `db_*.sqlite3`, `*.sqlite3` (broad) or explicitly `db_check.sqlite3`, `db_test.sqlite3` |
| Root-level diagnostic/log captures | `*.log` is ignored, but `.txt` captures are not | Add explicit ignores or a `diagnostics/` convention: `build_output.txt`, `higgsfield_error.txt`, `*_error.txt`, `version.txt` |
| Stray/mis-redirected files | No pattern | No generic pattern can safely catch `truction]`, `query`, `api_partners_list.txt` — these should be deleted outright and their creation habit (accidental shell redirects) addressed procedurally, not via `.gitignore` |
| Root validation screenshots | `screenshots/` (subdirectory) is ignored, but root-level loose files are not | Add `hero-progress-*.png` or a convention to always place ad-hoc screenshots under an already-ignored `screenshots/` directory |
| Experimental/reference directories | Not covered | If the team decides `newstyle/` and/or `cinematic-landing-kit-main/` should not live in the product repo, add explicit path ignores (after removal) so they cannot be re-added accidentally |
| Higgsfield/Seedance experiment artifacts | Not covered | Add `seedance_*.json`, `seedance_*.txt`, `higgsfield_*.txt` if this tooling continues to generate local files |
| Large generated hero frame sequences | Not covered | If a frame-sequence hero pipeline is reinstated in the future, add a rule such as `src/assets/hero/frames*/` and `src/assets/hero/clips/` (or better, keep such large generated binaries out of Git entirely and load them from object storage/CDN) |
| CMS media/static (tracked despite existing rules) | `backend/media/`, `backend/staticfiles/` are already listed | No new rule needed — the fix here is `git rm --cached`, since the files were tracked **before** these rules were added; `.gitignore` cannot retroactively untrack them |

---

## G. Proposed Cleanup Plan (Dependency-Safe Order, Not Executed)

This is a **plan only** — nothing below was performed in this task.

1. **Secret handling first (independent of file deletion):** Decide whether the local dev DB password needs rotation. If yes, rotate it in any environment where it is still valid, before touching Git history.
2. **Untrack regenerable/build-output artifacts** (safe, zero functional risk):
   - `git rm --cached backend/staticfiles/**` (regenerated by `collectstatic` in `start.sh`)
   - `git rm --cached db_check.sqlite3 db_test.sqlite3`
3. **Untrack confirmed local/dev-only diagnostic files** (safe, zero functional risk):
   - `truction]`, `query`, `version.txt`, `api_partners_list.txt`, `build_output.txt`, `higgsfield_error.txt`, `seedance_model.json`, `seedance_params.txt`, `hero-progress-84.png`, `hero-progress-92.png`, `hero-progress-100.png`
4. **Remove the abandoned `newstyle/` reference directory** (confirmed unused by imports; only mentioned in a code comment, which can be preserved as-is since it doesn't require the files to exist).
5. **Migrate `backend/media/uploads/` to object storage**, then `git rm --cached` the tracked copies. This step has a real dependency: production media serving must be reconfigured (S3/R2 + `django-storages` or equivalent) **before** removing the tracked files, or existing CMS-referenced images will 404 in any environment relying on the Git-tracked copies.
6. **Remove the unused hero frame/clip system** (`src/assets/hero/frames/`, `frames-mobile/`, `frames-kf05kf06/`, `frames-kf05kf06-mobile/`, `clips/`) after a final confirmation that no branch other than `main` still uses them, since this is the highest-impact size reduction (~136 MB).
7. **Team decision required before touching:** `cinematic-landing-kit-main/`, `.devin/workflows/RULES.md` content refresh, `project-memory/evidence/*.png`, and `screenshot-hero.mjs`. These are classified as INVESTIGATE, not REMOVE, until the team confirms they are no longer needed as references.
8. **Update `.gitignore`** with the rules in Section F, so cleaned-up file types cannot silently return.
9. **Re-run `npm run build` and backend `python manage.py check`** after each removal batch to confirm no functional regression, given none of the removed paths were found to be referenced by build/runtime code.

---

## H. Git-History Cleanup Requirements

- **Local dev DB password in evidence reports:** present in history since `20986d8` and re-introduced in `1d3fbbe`. If this password is ever/still valid anywhere, rotating it makes history exposure moot from a security standpoint (the old value becomes worthless), which is simpler and safer than rewriting history on a shared `main` branch. If the repository is ever made public, a `git filter-repo` (preferred over `filter-branch`) pass targeting these three files' content would still be advisable to remove the string from history, but this **must not be done on `main` without explicit team sign-off**, since it rewrites commit hashes and breaks any existing clones/forks/PRs.
- **Large binary bloat (`src/assets/hero/frames*/`, `clips/`, `backend/media/uploads/`, `backend/staticfiles/`):** these were committed at various points and remain in history at full size even after a future `git rm`. Reclaiming the ~136 MB (hero frames) and associated `.git` bloat (currently 202 MB total) requires a history rewrite (`git filter-repo --path ... --invert-paths` or BFG Repo-Cleaner) plus a forced push and a coordinated re-clone by any collaborators. This should be scheduled as a deliberate, separate maintenance operation, not bundled with routine feature work.
- **`db_check.sqlite3` / `db_test.sqlite3` / `truction]` / `newstyle/`:** introduced together in commit `29a2e87`. A simple `git rm` on `main` stops future propagation; a history rewrite is optional here since they contain no real secrets, only local scaffolding/dev output — recommend deprioritizing this relative to the two items above unless the team wants a fully clean history for an external audit.

**No history rewrite was performed in this task.** Any rewrite must be a separate, explicitly approved task given the impact on collaborators and the Railway-linked `main` branch.

---

## I. Exact Files That Would Change in a Future Cleanup Task

### Removed from Git tracking (working tree unaffected unless explicitly deleted)

```
db_check.sqlite3
db_test.sqlite3
truction]
query
version.txt
api_partners_list.txt
build_output.txt
higgsfield_error.txt
seedance_model.json
seedance_params.txt
hero-progress-84.png
hero-progress-92.png
hero-progress-100.png
newstyle/index.html
newstyle/styles.css
backend/staticfiles/**            (154 files)
backend/media/uploads/**          (46 files — only after object-storage migration)
src/assets/hero/frames/**                    (367 files)
src/assets/hero/frames-mobile/**             (367 files)
src/assets/hero/frames-kf05kf06/**           (122 files)
src/assets/hero/frames-kf05kf06-mobile/**    (122 files)
src/assets/hero/clips/**                     (31 files)
```

### Requires a team decision before any change

```
cinematic-landing-kit-main/**      (14 files)
.devin/workflows/RULES.md          (content refresh, not removal)
project-memory/evidence/*.png      (16 files)
screenshot-hero.mjs
```

### `.gitignore` additions (new lines only, no existing rules removed)

```
db_*.sqlite3
build_output.txt
higgsfield_error.txt
higgsfield_*.txt
seedance_*.json
seedance_*.txt
version.txt
hero-progress-*.png
```

---

## Confirmation

This task performed **read-only analysis only**. No files were deleted, moved, renamed, modified, staged, committed, or pushed. `git status` at the start and end of this audit was clean (`nothing to commit, working tree clean`), and `HEAD` (`48ffdc0`) was not advanced by this task.
